import React, { createContext, useContext, useState } from 'react'
import { Patient } from '@/types/paciente'
import { toast } from '@/hooks/use-toast'

const MOCK_HIDOCTOR_DB: Patient[] = [
  {
    id: 'P1',
    fullName: 'Ana Costa',
    dob: '1985-04-12',
    cpf: '111.222.333-44',
    phone: '+55 32 99999-1111',
    unit: 'Juiz de Fora',
    lastConsultation: '2023-10-01',
    status: 'Em Tratamento',
    clinicalNotes:
      'Paciente apresenta varizes de membros inferiores (CEAP C3). Indicado laser intravascular.',
    allergies: 'Dipirona',
    history: 'Histórico familiar de TVP.',
  },
  {
    id: 'P2',
    fullName: 'João Santos',
    dob: '1970-08-25',
    cpf: '222.333.444-55',
    phone: '+55 32 98888-2222',
    unit: 'Leopoldina',
    lastConsultation: '2023-09-15',
    status: 'Alta',
    clinicalNotes:
      'Pós-operatório de escleroterapia com espuma sem intercorrências. Retorno anual.',
    allergies: 'Nenhuma conhecida',
    history: 'Hipertensão controlada com losartana.',
  },
  {
    id: 'P3',
    fullName: 'Maria Silva',
    dob: '1992-01-30',
    cpf: '333.444.555-66',
    phone: '+55 32 97777-3333',
    unit: 'Além Paraíba',
    lastConsultation: '2023-10-20',
    status: 'Ativo',
    clinicalNotes: 'Avaliação inicial para check-up vascular. Doppler venoso normal.',
    allergies: 'Iodo',
    history: 'Nega comorbidades prévias.',
  },
  {
    id: 'P4',
    fullName: 'Carlos Almeida',
    dob: '1965-11-05',
    cpf: '444.555.666-77',
    phone: '+55 32 96666-4444',
    unit: 'Juiz de Fora',
    lastConsultation: '2023-10-25',
    status: 'Em Tratamento',
    clinicalNotes: 'Tratamento de pé diabético. Curativo trocado, sinais de granulação presentes.',
    allergies: 'Nenhuma conhecida',
    history: 'Diabetes Mellitus tipo 2 há 15 anos. Dislipidemia.',
  },
]

interface HiDoctorState {
  patients: Patient[]
  isSyncing: boolean
  progress: number
  lastSync: string | null
  syncData: () => Promise<void>
}

const HiDoctorContext = createContext<HiDoctorState | undefined>(undefined)

export function HiDoctorProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const syncData = async () => {
    setIsSyncing(true)
    setProgress(10)
    await new Promise((r) => setTimeout(r, 600))
    setProgress(40)
    await new Promise((r) => setTimeout(r, 600))
    setProgress(80)
    await new Promise((r) => setTimeout(r, 600))
    setPatients(MOCK_HIDOCTOR_DB)
    setLastSync(new Date().toLocaleString('pt-BR'))
    setProgress(100)

    setTimeout(() => {
      setIsSyncing(false)
      setProgress(0)
    }, 500)

    toast({
      title: 'Sincronização Concluída',
      description: 'Todos os registros de pacientes do HiDoctor foram importados.',
    })
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
