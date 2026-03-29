import { useAgendaStore, AgendaEvent, getLocalDateStr } from '@/stores/agenda'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { EventDialog } from './EventDialog'
import { CheckCheck, MessageSquare, Calendar as CalendarIcon } from 'lucide-react'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7)

export function WeeklyView() {
  const { events, selectedDate } = useAgendaStore()
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null)
  const [creatingSlot, setCreatingSlot] = useState<{ date: string; time: string } | null>(null)

  const startOfWeek = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate() - selectedDate.getDay(),
  )

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <>
      <div className="flex border-b border-slate-200 bg-white">
        <div className="w-16 shrink-0 border-r border-slate-200" />
        {weekDays.map((date, i) => (
          <div key={i} className="flex-1 text-center py-2 border-r border-slate-200 last:border-0">
            <div className="text-xs text-slate-500 font-medium uppercase">
              {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
            </div>
            <div
              className={`text-lg font-semibold ${
                date.toDateString() === new Date().toDateString()
                  ? 'text-brand-blue'
                  : 'text-slate-800'
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>
      <ScrollArea className="flex-1 bg-white">
        <div className="flex min-w-[800px] relative">
          <div className="w-16 shrink-0 border-r border-slate-200">
            {HOURS.map((h) => (
              <div
                key={h}
                className="h-24 text-right pr-2 pt-2 text-xs font-medium text-slate-500 border-b border-slate-200"
              >
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          <div className="flex-1 flex relative">
            {weekDays.map((date, i) => {
              const dateStr = getLocalDateStr(date)
              const dayEvents = events.filter((e) => e.date === dateStr)

              return (
                <div key={i} className="flex-1 border-r border-slate-200 last:border-0 relative">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="h-24 border-b border-slate-100 cursor-pointer hover:bg-brand-blue/5 transition-colors"
                      onClick={() =>
                        setCreatingSlot({
                          date: dateStr,
                          time: h.toString().padStart(2, '0') + ':00',
                        })
                      }
                    />
                  ))}
                  {dayEvents.map((event) => {
                    const startH = parseInt(event.startTime.split(':')[0])
                    const startM = parseInt(event.startTime.split(':')[1])
                    const endH = parseInt(event.endTime.split(':')[0])
                    const endM = parseInt(event.endTime.split(':')[1])
                    const top = (startH - 7) * 96 + (startM / 60) * 96
                    const height = (endH - startH) * 96 + ((endM - startM) / 60) * 96

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingEvent(event)
                        }}
                        className="absolute left-1 right-1 rounded md shadow-sm p-1 overflow-hidden text-[10px] leading-tight cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor:
                            event.source === 'google'
                              ? '#e0e7ff'
                              : event.type === 'Consulta'
                                ? '#eff6ff'
                                : event.type === 'Procedimento'
                                  ? '#ecfdf5'
                                  : '#fffbeb',
                          borderLeft: `3px solid ${
                            event.source === 'google'
                              ? '#6366f1'
                              : event.type === 'Consulta'
                                ? '#3b82f6'
                                : event.type === 'Procedimento'
                                  ? '#10b981'
                                  : '#f59e0b'
                          }`,
                        }}
                      >
                        <div className="font-semibold truncate text-slate-800 flex items-center gap-1">
                          {event.source === 'google' && (
                            <CalendarIcon className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                          )}
                          <span className="truncate">{event.title}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="truncate text-slate-600">{event.startTime}</span>
                          {event.waStatus === 'confirmed' && (
                            <CheckCheck className="w-3 h-3 text-green-600" />
                          )}
                          {event.waStatus === 'sent' && (
                            <MessageSquare className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
      {editingEvent && (
        <EventDialog
          open={!!editingEvent}
          onOpenChange={(v) => !v && setEditingEvent(null)}
          event={editingEvent}
        />
      )}
      {creatingSlot && (
        <EventDialog
          open={!!creatingSlot}
          onOpenChange={(v) => !v && setCreatingSlot(null)}
          defaultDate={creatingSlot.date}
          defaultStartTime={creatingSlot.time}
        />
      )}
    </>
  )
}
