import React, { createContext, useContext, useState } from 'react'

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

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location>('Juiz de Fora')
  // For validation of Redirect Logic, change this to test
  const [role, setRole] = useState<Role>('Gerenciador')

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
