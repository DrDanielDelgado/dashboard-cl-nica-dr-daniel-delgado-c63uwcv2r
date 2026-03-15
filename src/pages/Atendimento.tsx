import { MOCK_APPOINTMENTS } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, FileText, Plus, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app'
import { Link } from 'react-router-dom'

export default function Atendimento() {
  const { location } = useAppStore()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Atendimento</h1>
          <p className="text-muted-foreground">Recepção e agendamentos da unidade {location}.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/agenda">Ver Agenda Completa</Link>
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Pacientes Esperando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground mt-1">Na recepção</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground mt-1">4 já finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmações Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">5</div>
            <p className="text-xs text-muted-foreground mt-1">Para os próximos dias</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Atendimentos (Hoje)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_APPOINTMENTS.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/30 p-4 rounded-lg border gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-background border rounded-md p-2 text-center min-w-16 shadow-sm">
                    <span className="block text-xs text-muted-foreground font-semibold">HORA</span>
                    <span className="block text-lg font-bold text-primary">{apt.time}</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" /> {apt.patient}
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="w-3 h-3" /> {apt.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Badge
                    variant={
                      apt.status === 'confirmed'
                        ? 'default'
                        : apt.status === 'cancelled'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="w-fit"
                  >
                    {apt.status === 'confirmed'
                      ? 'Confirmado'
                      : apt.status === 'cancelled'
                        ? 'Cancelado'
                        : 'Pendente'}
                  </Badge>
                  {apt.status === 'pending' && (
                    <Button size="sm" variant="outline" className="ml-auto sm:ml-0">
                      <PhoneCall className="w-3 h-3 mr-2" /> Confirmar
                    </Button>
                  )}
                  {apt.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="ml-auto sm:ml-0 bg-success/10 text-success hover:bg-success/20"
                    >
                      Marcar Chegada
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
