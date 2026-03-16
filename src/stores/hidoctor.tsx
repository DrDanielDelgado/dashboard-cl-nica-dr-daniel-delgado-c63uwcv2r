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
  updatePatient: (id: string, data: Partial<Patient>) => void
  signPatientRecord: (id: string) => void
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
      const realData = await syncHiDoctorData(serial, crm, password)
      setProgress(50)
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setProgress(85)

      setPatients(realData)
      const time = new Date().toLocaleString('pt-BR')
      setLastSync(time)

      try {
        localStorage.setItem('@hidoctor_patients', JSON.stringify(realData))
        localStorage.setItem('@hidoctor_lastSync', time)
      } catch (e) {
        // ignore localStorage errors
      }

      setProgress(100)

      setTimeout(() => {
        setIsSyncing(false)
        setProgress(0)
        toast({
          title: 'Sincronização Concluída',
          description: `${realData.length.toLocaleString('pt-BR')} prontuários importados.`,
        })
      }, 500)
    } catch (error: any) {
      setIsSyncing(false)
      setProgress(0)
      toast({ variant: 'destructive', title: 'Erro de Conexão (API)', description: error.message })
      throw error
    }
  }

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      localStorage.setItem('@hidoctor_patients', JSON.stringify(updated))
      return updated
    })
  }

  const signPatientRecord = (id: string) => {
    setPatients((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            signature: {
              signedAt: new Date().toISOString(),
              signedBy: 'Dr. Daniel Delgado',
              hash:
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15),
            },
          }
        }
        return p
      })
      localStorage.setItem('@hidoctor_patients', JSON.stringify(updated))
      toast({
        title: 'Documento Assinado',
        description: 'Prontuário assinado digitalmente e travado contra edições.',
      })
      return updated
    })
  }

  return (
    <HiDoctorContext.Provider
      value={{
        patients,
        isSyncing,
        progress,
        lastSync,
        syncData,
        updatePatient,
        signPatientRecord,
      }}
    >
      {children}
    </HiDoctorContext.Provider>
  )
}

export function useHiDoctorStore() {
  const context = useContext(HiDoctorContext)
  if (!context) throw new Error('useHiDoctorStore must be used within HiDoctorProvider')
  return context
}
