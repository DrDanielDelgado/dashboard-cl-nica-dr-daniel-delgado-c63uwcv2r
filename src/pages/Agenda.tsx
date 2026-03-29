import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { RefreshCcw, Plus, Calendar as CalendarIcon, FileDown } from 'lucide-react'
import { useAgendaStore } from '@/stores/agenda'
import { useAppStore } from '@/stores/app'
import { DailyView } from '@/components/agenda/DailyView'
import { WeeklyView } from '@/components/agenda/WeeklyView'
import { MonthlyView } from '@/components/agenda/MonthlyView'
import { EventDialog } from '@/components/agenda/EventDialog'
import { RelatoriosAgendaDialog } from '@/components/agenda/RelatoriosAgendaDialog'

export default function Agenda() {
  const { location } = useAppStore()
  const {
    selectedDate,
    setSelectedDate,
    isSyncing,
    lastSync,
    syncWithGoogle,
    googleToken,
    connectGoogle,
    disconnectGoogle,
  } = useAgendaStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-brand-red" />
            Agenda Integrada - {location}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {googleToken ? (
              <Badge variant="outline" className="bg-blue-50 text-brand-blue border-blue-200">
                Google Calendar Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                Google Calendar Desconectado
              </Badge>
            )}
            {lastSync && (
              <span className="text-xs text-muted-foreground font-medium">
                Última sync: {lastSync}
              </span>
            )}
            {googleToken && (
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectGoogle}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                Desconectar
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <Button
            variant="outline"
            onClick={() => setExportOpen(true)}
            className="flex-1 md:flex-none border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5"
          >
            <FileDown className="w-4 h-4 mr-2" /> Exportar
          </Button>
          {googleToken ? (
            <Button
              variant="outline"
              onClick={syncWithGoogle}
              disabled={isSyncing}
              className="flex-1 md:flex-none border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={connectGoogle}
              className="flex-1 md:flex-none border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5"
            >
              <CalendarIcon className="w-4 h-4 mr-2" /> Conectar Google
            </Button>
          )}
          <Button
            onClick={() => setDialogOpen(true)}
            className="flex-1 md:flex-none bg-brand-red hover:bg-brand-red/90 text-white shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-3 border-none shadow-sm bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-brand-blue">Navegação</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="rounded-md border bg-white shadow-sm w-full flex justify-center"
            />
            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-semibold text-slate-700">Legenda</h4>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-blue ring-2 ring-brand-blue/20" />{' '}
                  Consulta
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />{' '}
                  Procedimento
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />{' '}
                  Retorno
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20" />{' '}
                  Google Calendar
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-9 flex flex-col h-[700px] shadow-sm border-slate-200 overflow-hidden">
          <Tabs defaultValue="dia" className="w-full flex flex-col h-full">
            <CardHeader className="border-b bg-white py-3 px-4 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-xl text-slate-800 capitalize">
                  {selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </CardTitle>
                <TabsList className="bg-slate-100 self-start sm:self-auto">
                  <TabsTrigger value="dia">Dia</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="mes">Mês</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/50 relative min-h-0">
              <TabsContent value="dia" className="m-0 h-full data-[state=active]:flex flex-col">
                <DailyView />
              </TabsContent>
              <TabsContent value="semana" className="m-0 h-full data-[state=active]:flex flex-col">
                <WeeklyView />
              </TabsContent>
              <TabsContent value="mes" className="m-0 h-full data-[state=active]:flex flex-col">
                <MonthlyView />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <EventDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <RelatoriosAgendaDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
