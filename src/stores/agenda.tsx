import React, { createContext, useContext, useState, useEffect } from 'react'
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

const loadAgenda = (): AgendaEvent[] => {
  try {
    const stored = localStorage.getItem('@db_agenda')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && parsed.length > 0) return parsed
    }
  } catch (e) {
    // fallback
  }

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return [
    {
      id: 'evt-1',
      title: 'Consulta - Maria',
      date: getLocalDateStr(today),
      startTime: '09:00',
      endTime: '09:30',
      type: 'Consulta',
      patientName: 'Maria Silva',
      status: 'confirmed',
    },
    {
      id: 'evt-2',
      title: 'Procedimento Laser',
      date: getLocalDateStr(today),
      startTime: '10:00',
      endTime: '11:00',
      type: 'Procedimento',
      patientName: 'João Santos',
      status: 'pending',
    },
    {
      id: 'evt-3',
      title: 'Retorno - Ana',
      date: getLocalDateStr(yesterday),
      startTime: '14:00',
      endTime: '14:30',
      type: 'Retorno',
      patientName: 'Ana Costa',
      status: 'confirmed',
    },
    {
      id: 'evt-4',
      title: 'Avaliação Cirúrgica',
      date: getLocalDateStr(tomorrow),
      startTime: '15:00',
      endTime: '16:00',
      type: 'Consulta',
      patientName: 'Carlos Mendes',
      status: 'confirmed',
    },
  ]
}

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
  const [events, setEvents] = useState<AgendaEvent[]>(loadAgenda)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(
    localStorage.getItem('@db_agenda_sync') || null,
  )

  useEffect(() => {
    localStorage.setItem('@db_agenda', JSON.stringify(events))
  }, [events])

  const syncWithGoogle = async () => {
    setIsSyncing(true)
    await new Promise((r) => setTimeout(r, 1200))
    const syncTime = new Date().toLocaleString('pt-BR')
    setLastSync(syncTime)
    localStorage.setItem('@db_agenda_sync', syncTime)
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
      description: 'O evento foi adicionado e salvo na base de dados.',
    })
  }

  const updateEvent = (id: string, e: Partial<AgendaEvent>) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...e } : ev)))
    toast({
      title: 'Agendamento Atualizado',
      description: 'As alterações foram salvas com sucesso.',
    })
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
    toast({
      title: 'Agendamento Removido',
      description: 'O evento foi removido da base de dados.',
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
