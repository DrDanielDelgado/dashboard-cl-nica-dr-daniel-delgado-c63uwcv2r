import { useAgendaStore, AgendaEvent, getLocalDateStr } from '@/stores/agenda'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { User, Clock, MessageSquare, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { EventDialog } from './EventDialog'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7)

export function DailyView() {
  const { events, selectedDate } = useAgendaStore()
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null)
  const [creatingHour, setCreatingHour] = useState<string | null>(null)

  const dateStr = getLocalDateStr(selectedDate)
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <>
      <ScrollArea className="h-full">
        <div className="relative p-4 min-w-[600px]">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex border-b border-slate-200 h-24 relative group cursor-pointer"
              onClick={() => setCreatingHour(hour.toString().padStart(2, '0') + ':00')}
            >
              <div className="w-16 text-right pr-4 pt-2 text-sm font-medium text-slate-500 group-hover:text-brand-blue transition-colors">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 relative border-l border-slate-200 group-hover:bg-brand-blue/5 transition-colors" />
            </div>
          ))}

          {dayEvents.map((event) => {
            const startHour = parseInt(event.startTime.split(':')[0])
            const startMin = parseInt(event.startTime.split(':')[1])
            const endHour = parseInt(event.endTime.split(':')[0])
            const endMin = parseInt(event.endTime.split(':')[1])

            const top = (startHour - 7) * 96 + (startMin / 60) * 96
            const height = (endHour - startHour) * 96 + ((endMin - startMin) / 60) * 96

            return (
              <div
                key={event.id}
                className="absolute left-20 right-4 rounded-md border p-2 shadow-sm flex flex-col gap-1 overflow-hidden transition-all hover:shadow-md hover:z-10 group cursor-pointer"
                style={{
                  top: `${top + 16}px`,
                  height: `${height}px`,
                  backgroundColor:
                    event.type === 'Consulta'
                      ? '#eff6ff'
                      : event.type === 'Procedimento'
                        ? '#ecfdf5'
                        : '#fffbeb',
                  borderColor:
                    event.type === 'Consulta'
                      ? '#bfdbfe'
                      : event.type === 'Procedimento'
                        ? '#a7f3d0'
                        : '#fde68a',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingEvent(event)
                }}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                    {event.title}
                    {event.waStatus === 'confirmed' && (
                      <CheckCheck
                        className="w-3.5 h-3.5 text-green-600"
                        title="Confirmado via WA"
                      />
                    )}
                    {event.waStatus === 'sent' && (
                      <MessageSquare
                        className="w-3.5 h-3.5 text-blue-500"
                        title="Lembrete Enviado"
                      />
                    )}
                  </h4>
                  <Badge variant="outline" className="text-[10px] bg-white/50">
                    {event.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {event.startTime} - {event.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {event.patientName}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      {editingEvent && (
        <EventDialog
          open={!!editingEvent}
          onOpenChange={(v) => !v && setEditingEvent(null)}
          event={editingEvent}
        />
      )}
      {creatingHour && (
        <EventDialog
          open={!!creatingHour}
          onOpenChange={(v) => !v && setCreatingHour(null)}
          defaultDate={dateStr}
          defaultStartTime={creatingHour}
        />
      )}
    </>
  )
}
