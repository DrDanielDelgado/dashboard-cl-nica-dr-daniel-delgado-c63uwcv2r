import React, { createContext, useContext, useState } from 'react'

export interface AuditLog {
  id: string
  user: string
  action: string
  resource: string
  timestamp: string
}

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: '1',
    user: 'Dr. Daniel Delgado',
    action: 'Login no Sistema',
    resource: 'Autenticação',
    timestamp: '2026-03-14 08:00:12',
  },
  {
    id: '2',
    user: 'Ana Silva',
    action: 'Agendamento Criado',
    resource: 'Paciente: Carlos Alberto',
    timestamp: '2026-03-14 08:15:45',
  },
  {
    id: '3',
    user: 'Dr. Daniel Delgado',
    action: 'Acesso a Prontuário',
    resource: 'Prontuário: Fernanda Lima',
    timestamp: '2026-03-14 09:30:00',
  },
  {
    id: '4',
    user: 'Carlos Médico',
    action: 'Edição de Dados',
    resource: 'Estoque: Seringa 5ml',
    timestamp: '2026-03-14 10:05:22',
  },
  {
    id: '5',
    user: 'Ana Silva',
    action: 'Convite Enviado',
    resource: 'Usuário: Maria Secretária',
    timestamp: '2026-03-14 11:20:10',
  },
  {
    id: '6',
    user: 'Dr. Daniel Delgado',
    action: 'Emissão de NF-e',
    resource: 'NF-e: 10452',
    timestamp: '2026-03-14 14:45:00',
  },
]

interface AuditState {
  logs: AuditLog[]
  addLog: (action: string, resource: string) => void
}

const AuditContext = createContext<AuditState | undefined>(undefined)

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS)

  const addLog = (action: string, resource: string) => {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

    const newLog = {
      id: Math.random().toString(36).substring(7),
      user: 'Sessão Administrativa',
      action,
      resource,
      timestamp,
    }

    setLogs((prev) => [newLog, ...prev])
  }

  return <AuditContext.Provider value={{ logs, addLog }}>{children}</AuditContext.Provider>
}

export function useAuditStore() {
  const context = useContext(AuditContext)
  if (!context) throw new Error('useAuditStore must be used within AuditProvider')
  return context
}
