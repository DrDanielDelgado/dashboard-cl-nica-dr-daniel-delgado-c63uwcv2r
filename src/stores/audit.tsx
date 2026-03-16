import React, { createContext, useContext, useState, useEffect } from 'react'

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

const loadLogs = (): Log[] => {
  try {
    const stored = localStorage.getItem('@db_audit')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const AuditContext = createContext<AuditState | undefined>(undefined)

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<Log[]>(loadLogs)

  useEffect(() => {
    localStorage.setItem('@db_audit', JSON.stringify(logs))
  }, [logs])

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
