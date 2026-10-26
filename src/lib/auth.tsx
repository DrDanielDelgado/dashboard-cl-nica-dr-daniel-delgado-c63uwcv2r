import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

function readUser(): AuthUser | null {
  if (!pb.authStore.isValid) return null
  const model: any = (pb.authStore as any).record || (pb.authStore as any).model
  if (!model?.id) return null
  return { id: model.id, name: model.name || model.email, email: model.email }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(readUser())
    setLoading(false)
    const unsub = pb.authStore.onChange(() => {
      setUser(readUser())
    })
    return unsub
  }, [])

  const login = async (email: string, password: string) => {
    await pb.collection('users').authWithPassword(email, password)
  }

  const logout = () => {
    pb.authStore.clear()
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, login, logout } },
    children,
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
