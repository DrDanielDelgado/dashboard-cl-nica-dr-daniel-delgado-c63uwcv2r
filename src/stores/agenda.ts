import { create } from 'zustand'

export interface AgendaEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: string
  patientName: string
  patientId?: string
  status: string
  waStatus: string
  source?: string
}

export const getLocalDateStr = (date: Date) => {
  return date.toISOString().split('T')[0]
}

interface AgendaState {
  events: AgendaEvent[]
  setEvents: (events: AgendaEvent[]) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  isSyncing: boolean
  lastSync: string | null
  googleToken: string | null
  syncWithGoogle: () => void
  connectGoogle: () => void
  disconnectGoogle: () => void
}

export const useAgendaStore = create<AgendaState>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  isSyncing: false,
  lastSync: null,
  googleToken: null,
  syncWithGoogle: () => {},
  connectGoogle: () => {},
  disconnectGoogle: () => {},
}))
