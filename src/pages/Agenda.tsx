import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MOCK_APPOINTMENTS } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Clock, User, FileText } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Agenda() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Integrada</h1>
          <p className="text-muted-foreground">Gerencie agendamentos e horários online.</p>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 py-1">
          Agenda Online: Sincronizada
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <Card className="md:col-span-4 lg:col-span-3 border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Navegação</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border bg-background"
            />
            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-semibold">Legenda</h4>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" /> Consulta
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" /> Procedimento
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" /> Retorno
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-8 lg:col-span-9 h-[600px] flex flex-col">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle>Hoje, {new Date().toLocaleDateString('pt-BR')}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">Dia</Badge>
                <Badge variant="outline">Semana</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4 relative">
                {/* Timeline guides */}
                <div className="absolute left-16 top-0 bottom-0 w-px bg-border z-0" />

                {MOCK_APPOINTMENTS.map((apt) => (
                  <div key={apt.id} className="flex items-start gap-4 relative z-10 group">
                    <div className="w-12 text-right pt-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {apt.time}
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-primary border-2 border-background mt-2.5 z-10 -ml-[23px]" />
                    <div className="flex-1 bg-background border rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold">{apt.patient}</h4>
                        </div>
                        <Badge
                          variant={
                            apt.status === 'confirmed'
                              ? 'default'
                              : apt.status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {apt.status === 'confirmed'
                            ? 'Confirmado'
                            : apt.status === 'cancelled'
                              ? 'Cancelado'
                              : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {apt.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 30 min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
