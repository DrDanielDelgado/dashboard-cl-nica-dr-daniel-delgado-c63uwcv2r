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
  sendWaReminder: (
    id: string,
    options?: { patientName?: string; patientPhone?: string; date?: string; time?: string },
  ) => Promise<void>
  confirmWaReminder: (id: string) => void
}

export const useAgendaStore = create<AgendaState>((set, get) => ({
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
  sendWaReminder: async (
    id: string,
    options?: { patientName?: string; patientPhone?: string; date?: string; time?: string },
  ) => {
    const current = get().events.find((e) => e.id === id)
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, waStatus: 'sending' } : e)),
    }))

    try {
      const { sendWhatsAppMessage } = await import('@/services/whatsapp')
      const pName = options?.patientName || current?.patientName || 'Paciente'
      const apptDate = options?.date || current?.date || ''
      const apptTime = options?.time || current?.startTime || ''

      const res = await sendWhatsAppMessage({
        appointmentId: id,
        patientId: current?.patientId,
        to: options?.patientPhone,
        recipientName: pName,
        type: 'reminder',
        text: `Olá ${pName}, lembramos de sua consulta na Clínica Dr. Daniel Delgado agendada para ${apptDate} às ${apptTime}. Responda SIM para confirmar sua presença.`,
      })

      const finalStatus = res.success ? 'sent' : res.pendingConfig ? 'pending' : 'failed'
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, waStatus: finalStatus } : e)),
      }))
    } catch (_) {
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, waStatus: 'pending' } : e)),
      }))
    }
  },
  confirmWaReminder: (id: string) => {
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, waStatus: 'confirmed', status: 'confirmed' } : e,
      ),
    }))
  },
}))
