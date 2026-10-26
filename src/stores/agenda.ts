import { create } from 'zustand'
import { toast } from '@/hooks/use-toast'
import { createAppointment } from '@/services/api'

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

const GOOGLE_CLIENT_ID = '233596869914-q77esj199e46qvqni860a3per7hlodmt.apps.googleusercontent.com'
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.events'

const buildGoogleAuthUrl = (redirectUri: string) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: GOOGLE_SCOPES,
    include_granted_scopes: 'true',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export const useAgendaStore = create<AgendaState>((set, get) => ({
  events: [],
  setEvents: (events) => set({ events }),
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  isSyncing: false,
  lastSync: localStorage.getItem('@db_agenda_sync') || null,
  googleToken: localStorage.getItem('@db_google_token') || null,
  syncWithGoogle: async () => {
    const token = get().googleToken
    if (!token) {
      get().connectGoogle()
      return
    }
    set({ isSyncing: true })
    try {
      const timeMin = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
      const timeMax = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString()
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.status === 401) {
        get().disconnectGoogle()
        throw new Error('Sessão do Google expirada. Conecte novamente.')
      }
      if (!res.ok) throw new Error('Falha ao buscar eventos do Google.')
      const data = await res.json()
      const googleEvents: AgendaEvent[] = (data.items || [])
        .filter((item: any) => item.start?.dateTime && item.end?.dateTime)
        .map((item: any) => {
          const start = new Date(item.start.dateTime)
          const end = new Date(item.end.dateTime)
          return {
            id: `google-${item.id}`,
            title: item.summary || 'Evento Google',
            date: start.toISOString().split('T')[0],
            startTime: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            endTime: end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: 'Google',
            patientName: '',
            status: 'confirmed',
            waStatus: 'pending',
            source: 'google',
          }
        })
      set((state) => ({
        events: [...state.events.filter((e) => e.source !== 'google'), ...googleEvents],
        lastSync: new Date().toLocaleString('pt-BR'),
      }))
      localStorage.setItem('@db_agenda_sync', get().lastSync || '')
      toast({
        title: 'Sincronização concluída',
        description: 'Eventos do Google Calendar atualizados.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro na sincronização',
        description: err.message || 'Não foi possível sincronizar com o Google.',
        variant: 'destructive',
      })
    } finally {
      set({ isSyncing: false })
    }
  },
  connectGoogle: () => {
    const redirectUri = window.location.origin + '/agenda'
    window.location.href = buildGoogleAuthUrl(redirectUri)
  },
  disconnectGoogle: () => {
    set({ googleToken: null, lastSync: null })
    localStorage.removeItem('@db_google_token')
    localStorage.removeItem('@db_agenda_sync')
    set((state) => ({ events: state.events.filter((e) => e.source !== 'google') }))
    toast({
      title: 'Google Calendar desconectado',
      description: 'A sincronização foi interrompida.',
    })
  },
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

// Captura o token do Google no retorno do OAuth (#access_token=...)
if (typeof window !== 'undefined') {
  const hash = window.location.hash
  if (hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.replace('#', '?'))
    const token = params.get('access_token')
    if (token) {
      localStorage.setItem('@db_google_token', token)
      const store = useAgendaStore.getState()
      store.syncWithGoogle()
      window.history.replaceState(null, '', window.location.pathname)
    }
  }
}
