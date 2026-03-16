import React, { createContext, useContext, useState } from 'react'

interface Log {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
}

interface AuditState {
  logs: Log[]
  addLog: (action: string, resource: string) => void
}

const AuditContext = createContext<AuditState | undefined>(undefined)

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<Log[]>([])

  const addLog = (action: string, resource: string) => {
    const newLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleString('pt-BR'),
      user: 'Dr. Daniel Delgado',
      action,
      resource,
    }
    setLogs((prev) => [newLog, ...prev])
  }

  return <AuditContext.Provider value={{ logs, addLog }}>{children}</AuditContext.Provider>
}

export function useAuditStore() {
  const context = useContext(AuditContext)
  if (context === undefined) {
    throw new Error('useAuditStore must be used within an AuditProvider')
  }
  return context
}
