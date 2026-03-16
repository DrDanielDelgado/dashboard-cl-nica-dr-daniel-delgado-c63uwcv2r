import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, FileText, Plus, PhoneCall, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app'
import { useAgendaStore, getLocalDateStr } from '@/stores/agenda'
import { Link } from 'react-router-dom'

export default function Atendimento() {
  const { location } = useAppStore()
  const { events } = useAgendaStore()

  const todayStr = getLocalDateStr(new Date())
  const todayEvents = events
    .filter((e) => e.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const pendingConfirmations = events.filter((e) => e.status === 'pending')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue">
            Painel de Atendimento
          </h1>
          <p className="text-muted-foreground mt-1">
            Recepção e agendamentos da unidade{' '}
            <strong className="text-brand-blue">{location}</strong>.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto text-brand-blue border-brand-blue/20 hover:bg-brand-blue/5"
          >
            <Link to="/agenda">Ver Agenda</Link>
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto bg-brand-red hover:bg-brand-red/90 text-white shadow-md"
          >
            <Link to="/agenda">
              <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-brand-blue text-white shadow-elevation border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80 uppercase tracking-wider">
              Pacientes Esperando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">0</div>
            <p className="text-xs text-white/80 mt-1 font-medium">Na recepção agora</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Consultas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{todayEvents.length}</div>
            <p className="text-xs font-medium text-brand-blue mt-1">Agendadas para hoje</p>
          </CardContent>
        </Card>
        <Card className="border-brand-red/20 shadow-sm bg-brand-red/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-red uppercase tracking-wider">
              Confirmações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-red">{pendingConfirmations.length}</div>
            <p className="text-xs font-medium text-brand-red/70 mt-1">No sistema geral</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg text-brand-blue">Próximos Atendimentos (Hoje)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {todayEvents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center bg-white rounded-b-lg">
              <CalendarIcon className="w-12 h-12 mb-4 text-slate-300" />
              <p className="font-semibold text-slate-600 text-lg">Nenhum atendimento para hoje</p>
              <p className="text-sm mt-1 mb-6 max-w-sm">
                Sua agenda está vazia para o dia de hoje. Os pacientes marcados aparecerão nesta
                lista automaticamente.
              </p>
              <Button asChild className="bg-brand-blue hover:bg-brand-blue/90 text-white">
                <Link to="/agenda">
                  <Plus className="w-4 h-4 mr-2" /> Agendar Paciente
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayEvents.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-5">
                    <div className="bg-white border-2 border-brand-blue/10 rounded-xl p-2 text-center min-w-[72px] shadow-sm">
                      <span className="block text-[10px] text-brand-blue font-bold uppercase tracking-wider mb-0.5">
                        Hora
                      </span>
                      <span className="block text-xl font-black text-slate-800 leading-none">
                        {apt.startTime}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-brand-blue" /> {apt.patientName}
                      </h4>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-red" /> {apt.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto pl-20 sm:pl-0">
                    <Badge
                      variant={
                        apt.status === 'confirmed'
                          ? 'default'
                          : apt.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className={`w-fit px-3 py-1 font-semibold ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : apt.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : ''
                      }`}
                    >
                      {apt.status === 'confirmed'
                        ? 'Confirmado'
                        : apt.status === 'cancelled'
                          ? 'Cancelado'
                          : 'Pendente'}
                    </Badge>
                    {apt.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto sm:ml-0 text-brand-blue border-brand-blue/20"
                      >
                        <PhoneCall className="w-4 h-4 mr-2" /> Contatar
                      </Button>
                    )}
                    {apt.status === 'confirmed' && (
                      <Button
                        size="sm"
                        className="ml-auto sm:ml-0 bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold"
                      >
                        Marcar Chegada
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
