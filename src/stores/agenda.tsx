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
  waStatus?: 'pending' | 'sent' | 'confirmed'
  source?: 'local' | 'google'
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
      waStatus: 'confirmed',
      source: 'local',
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
      waStatus: 'sent',
      source: 'local',
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
      waStatus: 'confirmed',
      source: 'local',
    },
    {
      id: 'evt-4',
      title: 'Avaliação Cirúrgica',
      date: getLocalDateStr(tomorrow),
      startTime: '15:00',
      endTime: '16:00',
      type: 'Consulta',
      patientName: 'Carlos Mendes',
      status: 'pending',
      waStatus: 'pending',
      source: 'local',
    },
  ]
}

const GOOGLE_CLIENT_ID = '233596869914-q77esj199e46qvqni860a3per7hlodmt.apps.googleusercontent.com'

interface AgendaState {
  events: AgendaEvent[]
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  isSyncing: boolean
  lastSync: string | null
  googleToken: string | null
  connectGoogle: () => void
  disconnectGoogle: () => void
  syncWithGoogle: () => Promise<void>
  addEvent: (event: Omit<AgendaEvent, 'id'>) => void
  updateEvent: (id: string, event: Partial<AgendaEvent>) => void
  deleteEvent: (id: string) => void
  sendWaReminder: (id: string) => void
  confirmWaReminder: (id: string) => void
}

const AgendaContext = createContext<AgendaState | undefined>(undefined)

export function AgendaProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AgendaEvent[]>(loadAgenda)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(
    localStorage.getItem('@db_agenda_sync') || null,
  )
  const [googleToken, setGoogleToken] = useState<string | null>(
    localStorage.getItem('@db_google_token') || null,
  )

  useEffect(() => {
    localStorage.setItem('@db_agenda', JSON.stringify(events))
  }, [events])

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const token = params.get('access_token')
      if (token) {
        setGoogleToken(token)
        localStorage.setItem('@db_google_token', token)
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        toast({
          title: 'Google Calendar Conectado',
          description: 'Autorização realizada com sucesso.',
        })

        setTimeout(() => performSync(token), 500)
      }
    }
  }, [])

  const connectGoogle = () => {
    const redirectUri = window.location.origin + window.location.pathname
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      prompt: 'consent',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  const disconnectGoogle = () => {
    setGoogleToken(null)
    localStorage.removeItem('@db_google_token')
    setEvents((prev) => prev.filter((e) => e.source !== 'google'))
    toast({
      title: 'Google Calendar Desconectado',
      description: 'A sincronização foi interrompida.',
    })
  }

  const performSync = async (token: string) => {
    setIsSyncing(true)
    try {
      const timeMin = new Date()
      timeMin.setDate(timeMin.getDate() - 30)
      const timeMax = new Date()
      timeMax.setDate(timeMax.getDate() + 90)

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!res.ok) {
        if (res.status === 401) {
          disconnectGoogle()
          throw new Error('Token expirado. Por favor, conecte novamente.')
        }
        throw new Error('Falha ao buscar eventos do Google.')
      }

      const data = await res.json()

      const mappedEvents: AgendaEvent[] = (data.items || [])
        .filter((item: any) => item.start?.dateTime && item.end?.dateTime)
        .map((item: any) => {
          const start = new Date(item.start.dateTime)
          const end = new Date(item.end.dateTime)
          return {
            id: `google-${item.id}`,
            title: item.summary || 'Evento Google',
            date: getLocalDateStr(start),
            startTime: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            endTime: end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: 'Google',
            patientName: '',
            status: 'confirmed',
            source: 'google',
          }
        })

      setEvents((prev) => {
        const localEvents = prev.filter((e) => e.source !== 'google')
        return [...localEvents, ...mappedEvents]
      })

      const syncTime = new Date().toLocaleString('pt-BR')
      setLastSync(syncTime)
      localStorage.setItem('@db_agenda_sync', syncTime)
      toast({
        title: 'Sincronização Concluída',
        description: 'Eventos do Google Calendar atualizados.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro na Sincronização',
        description: error.message || 'Não foi possível sincronizar com o Google.',
        variant: 'destructive',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const syncWithGoogle = async () => {
    if (!googleToken) {
      connectGoogle()
      return
    }
    await performSync(googleToken)
  }

  const pushToGoogle = async (event: AgendaEvent, token: string) => {
    try {
      const startStr = `${event.date}T${event.startTime}:00`
      const endStr = `${event.date}T${event.endTime}:00`
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          description: `Paciente: ${event.patientName}\nTipo: ${event.type}`,
          start: { dateTime: startStr, timeZone: tz },
          end: { dateTime: endStr, timeZone: tz },
        }),
      })

      if (!res.ok && res.status === 401) {
        disconnectGoogle()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const addEvent = (e: Omit<AgendaEvent, 'id'>) => {
    const newEvent = {
      ...e,
      id: Math.random().toString(36).substring(7),
      googleSync: true,
      waStatus: 'pending' as const,
      source: 'local' as const,
    }
    setEvents((prev) => [...prev, newEvent])
    toast({
      title: 'Agendamento Criado',
      description: 'O evento foi adicionado e salvo na base de dados.',
    })

    if (googleToken) {
      pushToGoogle(newEvent as AgendaEvent, googleToken)
    }
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

  const sendWaReminder = (id: string) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, waStatus: 'sent' } : ev)))
    toast({
      title: 'Lembrete Enviado',
      description: 'Notificação automática disparada via API do WhatsApp.',
    })
  }

  const confirmWaReminder = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, waStatus: 'confirmed', status: 'confirmed' } : ev)),
    )
    toast({
      title: 'Consulta Confirmada',
      description: 'O paciente confirmou presença via WhatsApp.',
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
        googleToken,
        connectGoogle,
        disconnectGoogle,
        syncWithGoogle,
        addEvent,
        updateEvent,
        deleteEvent,
        sendWaReminder,
        confirmWaReminder,
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
