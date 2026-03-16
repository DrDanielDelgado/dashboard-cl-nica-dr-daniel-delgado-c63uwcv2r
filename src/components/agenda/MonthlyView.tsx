import { useAgendaStore, AgendaEvent, getLocalDateStr } from '@/stores/agenda'
import { useState } from 'react'
import { EventDialog } from './EventDialog'

export function MonthlyView() {
  const { events, selectedDate, setSelectedDate } = useAgendaStore()
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null)
  const [creatingDate, setCreatingDate] = useState<string | null>(null)

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startOffset = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const calendarDays = []
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i))
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null)
  }

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <>
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 shrink-0">
          {weekDayNames.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-slate-500 uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-200 gap-[1px] min-h-0">
          {calendarDays.map((date, i) => {
            if (!date) return <div key={i} className="bg-slate-50/50" />
            const dateStr = getLocalDateStr(date)
            const dayEvents = events.filter((e) => e.date === dateStr)
            const isSelected = date.toDateString() === selectedDate.toDateString()
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <div
                key={i}
                className={`bg-white p-1 md:p-2 overflow-hidden flex flex-col transition-colors hover:bg-slate-50 cursor-pointer ${
                  isSelected ? 'ring-2 ring-brand-blue ring-inset z-10' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDate(date)
                  setCreatingDate(dateStr)
                }}
              >
                <div className="flex justify-between items-start mb-1 shrink-0">
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-700'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      onClick={(evt) => {
                        evt.stopPropagation()
                        setEditingEvent(e)
                      }}
                      className="text-[10px] truncate px-1.5 py-0.5 rounded border border-transparent hover:border-slate-300 transition-colors cursor-pointer shrink-0"
                      style={{
                        backgroundColor:
                          e.type === 'Consulta'
                            ? '#eff6ff'
                            : e.type === 'Procedimento'
                              ? '#ecfdf5'
                              : '#fffbeb',
                        color:
                          e.type === 'Consulta'
                            ? '#1d4ed8'
                            : e.type === 'Procedimento'
                              ? '#047857'
                              : '#b45309',
                      }}
                    >
                      <span className="font-semibold">{e.startTime}</span> - {e.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {editingEvent && (
        <EventDialog
          open={!!editingEvent}
          onOpenChange={(v) => !v && setEditingEvent(null)}
          event={editingEvent}
        />
      )}
      {creatingDate && (
        <EventDialog
          open={!!creatingDate}
          onOpenChange={(v) => !v && setCreatingDate(null)}
          defaultDate={creatingDate}
        />
      )}
    </>
  )
}
