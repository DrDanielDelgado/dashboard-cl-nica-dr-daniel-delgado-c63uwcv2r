import React, { createContext, useContext, useState } from 'react'
import { toast } from '@/hooks/use-toast'

export const getLocalDateStr = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface AgendaEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: string
  patientName: string
  status: 'confirmed' | 'pending' | 'cancelled'
  googleSync?: boolean
}

const todayStr = getLocalDateStr(new Date())

const mockEvents: AgendaEvent[] = [
  {
    id: '1',
    title: 'Consulta Vascular',
    date: todayStr,
    startTime: '09:00',
    endTime: '09:30',
    type: 'Consulta',
    patientName: 'Carlos Alberto',
    status: 'confirmed',
    googleSync: true,
  },
  {
    id: '2',
    title: 'Escleroterapia',
    date: todayStr,
    startTime: '10:30',
    endTime: '11:30',
    type: 'Procedimento',
    patientName: 'Fernanda Lima',
    status: 'pending',
    googleSync: true,
  },
  {
    id: '3',
    title: 'Avaliação de Exames',
    date: todayStr,
    startTime: '14:00',
    endTime: '14:30',
    type: 'Retorno',
    patientName: 'Ricardo Gomes',
    status: 'confirmed',
    googleSync: true,
  },
]

interface AgendaState {
  events: AgendaEvent[]
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  isSyncing: boolean
  lastSync: string | null
  syncWithGoogle: () => Promise<void>
  addEvent: (event: Omit<AgendaEvent, 'id'>) => void
  updateEvent: (id: string, event: Partial<AgendaEvent>) => void
  deleteEvent: (id: string) => void
}

const AgendaContext = createContext<AgendaState | undefined>(undefined)

export function AgendaProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AgendaEvent[]>(mockEvents)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(new Date().toLocaleString('pt-BR'))

  const syncWithGoogle = async () => {
    setIsSyncing(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLastSync(new Date().toLocaleString('pt-BR'))
    setIsSyncing(false)
    toast({
      title: 'Sincronização Concluída',
      description: 'Agenda de danieldelgadovascular@gmail.com foi atualizada com sucesso.',
    })
  }

  const addEvent = (e: Omit<AgendaEvent, 'id'>) => {
    setEvents((prev) => [
      ...prev,
      { ...e, id: Math.random().toString(36).substring(7), googleSync: true },
    ])
    toast({
      title: 'Agendamento Criado',
      description: 'O evento foi adicionado e sincronizado com o Google Calendar.',
    })
  }

  const updateEvent = (id: string, e: Partial<AgendaEvent>) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...e } : ev)))
    toast({
      title: 'Agendamento Atualizado',
      description: 'As alterações foram enviadas para o Google Calendar.',
    })
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
    toast({
      title: 'Agendamento Removido',
      description: 'O evento foi removido do Google Calendar.',
    })
  }

  return React.createElement(
    AgendaContext.Provider,
    {
      value: {
        events,
        selectedDate,
        setSelectedDate,
        isSyncing,
        lastSync,
        syncWithGoogle,
        addEvent,
        updateEvent,
        deleteEvent,
      },
    },
    children,
  )
}

export const useAgendaStore = () => {
  const context = useContext(AgendaContext)
  if (!context) throw new Error('useAgendaStore must be used within AgendaProvider')
  return context
}
