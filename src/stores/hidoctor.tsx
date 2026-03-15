import React, { createContext, useContext, useState } from 'react'
import { Patient } from '@/types/paciente'
import { syncHiDoctorData } from '@/lib/api/hidoctor'
import { toast } from '@/hooks/use-toast'

const loadPersisted = () => {
  try {
    const saved = localStorage.getItem('@hidoctor_patients')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to load persisted patients', e)
  }
  return []
}

const loadLastSync = () => {
  return localStorage.getItem('@hidoctor_lastSync') || null
}

interface HiDoctorState {
  patients: Patient[]
  isSyncing: boolean
  progress: number
  lastSync: string | null
  syncData: (serial: string, crm: string, password: string) => Promise<void>
}

const HiDoctorContext = createContext<HiDoctorState | undefined>(undefined)

export function HiDoctorProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(loadPersisted)
  const [isSyncing, setIsSyncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lastSync, setLastSync] = useState<string | null>(loadLastSync)

  const syncData = async (serial: string, crm: string, password: string) => {
    setIsSyncing(true)
    setProgress(15)

    try {
      // Dispara a chamada assíncrona HTTP via nosso serviço de API
      const realData = await syncHiDoctorData(serial, crm, password)
      setProgress(50)

      // Simula o tempo de latência e processamento do volume alto de dados (5.500+)
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setProgress(85)

      // Commit na store
      setPatients(realData)
      const time = new Date().toLocaleString('pt-BR')
      setLastSync(time)

      // Persistência no LocalStorage
      try {
        localStorage.setItem('@hidoctor_patients', JSON.stringify(realData))
        localStorage.setItem('@hidoctor_lastSync', time)
      } catch (e) {
        console.error('Failed to save to localStorage', e)
      }

      setProgress(100)

      setTimeout(() => {
        setIsSyncing(false)
        setProgress(0)
        toast({
          title: 'Sincronização Concluída',
          description: `${realData.length.toLocaleString('pt-BR')} prontuários reais foram importados e atualizados com sucesso via API.`,
        })
      }, 500)
    } catch (error: any) {
      setIsSyncing(false)
      setProgress(0)
      toast({
        variant: 'destructive',
        title: 'Erro de Conexão (API)',
        description: error.message,
      })
      throw error
    }
  }

  return (
    <HiDoctorContext.Provider value={{ patients, isSyncing, progress, lastSync, syncData }}>
      {children}
    </HiDoctorContext.Provider>
  )
}

export function useHiDoctorStore() {
  const context = useContext(HiDoctorContext)
  if (!context) throw new Error('useHiDoctorStore must be used within HiDoctorProvider')
  return context
}
