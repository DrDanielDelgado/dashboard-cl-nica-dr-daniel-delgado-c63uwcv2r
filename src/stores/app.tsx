import React, { createContext, useContext, useState } from 'react'

type Location = 'Sete Lagoas' | 'Curvelo' | 'Pompéu' | 'Abaeté'
type Role = 'Médico' | 'Secretária' | 'Gerenciador' | 'Enfermeira' | 'Contador'

interface AppState {
  location: Location
  setLocation: (loc: Location) => void
  role: Role
  setRole: (role: Role) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location>('Sete Lagoas')
  const [role, setRole] = useState<Role>('Gerenciador')

  return (
    <AppContext.Provider value={{ location, setLocation, role, setRole }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within AppProvider')
  return context
}
