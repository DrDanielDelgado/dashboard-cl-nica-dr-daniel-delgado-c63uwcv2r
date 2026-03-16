import React, { createContext, useContext, useState, useEffect } from 'react'

type Location = 'Juiz de Fora' | 'Leopoldina' | 'Além Paraíba'
type Role =
  | 'Médico'
  | 'Secretária'
  | 'Gerenciador'
  | 'Enfermeira'
  | 'Contador'
  | 'Administrador'
  | 'Gerente'

interface AppState {
  location: Location
  setLocation: (loc: Location) => void
  role: Role
  setRole: (role: Role) => void
}

const loadApp = () => {
  try {
    const stored = localStorage.getItem('@db_app')
    return stored ? JSON.parse(stored) : { location: 'Juiz de Fora', role: 'Gerenciador' }
  } catch {
    return { location: 'Juiz de Fora', role: 'Gerenciador' }
  }
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initApp = loadApp()
  const [location, setLocation] = useState<Location>(initApp.location)
  const [role, setRole] = useState<Role>(initApp.role)

  useEffect(() => {
    localStorage.setItem('@db_app', JSON.stringify({ location, role }))
  }, [location, role])

  return React.createElement(
    AppContext.Provider,
    { value: { location, setLocation, role, setRole } },
    children,
  )
}

export function useAppStore() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider')
  }
  return context
}
