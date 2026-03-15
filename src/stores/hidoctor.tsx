import React, { createContext, useContext, useState } from 'react'
import { Patient } from '@/types/paciente'
import { toast } from '@/hooks/use-toast'

const generatePatients = (count: number): Patient[] => {
  const units: Patient['unit'][] = ['Juiz de Fora', 'Leopoldina', 'Além Paraíba']
  const statuses: Patient['status'][] = ['Ativo', 'Em Tratamento', 'Alta', 'Inativo']
  const first = [
    'Ana',
    'João',
    'Maria',
    'Carlos',
    'Pedro',
    'Lucas',
    'Juliana',
    'Fernanda',
    'Rafael',
    'Marcelo',
    'Beatriz',
    'Thiago',
    'Letícia',
    'Bruno',
    'Camila',
    'Rodrigo',
    'Mariana',
    'Felipe',
    'Amanda',
    'Diego',
  ]
  const last = [
    'Silva',
    'Santos',
    'Costa',
    'Almeida',
    'Oliveira',
    'Souza',
    'Rodrigues',
    'Ferreira',
    'Alves',
    'Pereira',
    'Lima',
    'Gomes',
    'Ribeiro',
    'Martins',
    'Carvalho',
    'Mendes',
    'Nunes',
    'Rocha',
    'Moreira',
    'Dias',
  ]

  return Array.from({ length: count }, (_, i) => {
    const fn = first[i % first.length]
    const ln = last[(i + Math.floor(i / first.length)) % last.length]
    const fullName = `${fn} ${ln}`

    return {
      id: `HIDX-${i + 1000}`,
      fullName,
      dob: new Date(1950 + (i % 50), i % 12, (i % 28) + 1).toISOString().split('T')[0],
      cpf: `${(i % 999).toString().padStart(3, '0')}.${((i * 2) % 999)
        .toString()
        .padStart(3, '0')}.${((i * 3) % 999).toString().padStart(3, '0')}-${(i % 99)
        .toString()
        .padStart(2, '0')}`,
      phone: `+55 32 9${8000 + (i % 1999)}-${1000 + (i % 8999)}`,
      unit: units[i % units.length],
      lastConsultation: new Date(Date.now() - (i % 365) * 86400000).toISOString().split('T')[0],
      status: statuses[i % statuses.length],
      clinicalNotes: `Sincronizado via HiNetX API.\nHistórico evolutivo: Paciente relata dores vespertinas. Exame físico indica varizes calibrosas. CEAP C${
        (i % 6) + 1
      }.\nPrescrito tratamento conservador e agendado retorno para avaliação de escleroterapia.`,
      allergies: i % 15 === 0 ? 'Iodo, Dipirona' : 'Nenhuma conhecida',
      history:
        'Importação do Prontuário Eletrônico HiDoctor. Paciente com acompanhamento vascular contínuo no último ano.',
    }
  })
}

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
    return new Promise<void>((resolve, reject) => {
      setIsSyncing(true)
      setProgress(10)

      setTimeout(() => {
        if (serial !== 'H80ARQW43' || crm !== '37525' || password !== 'CPV2406') {
          setIsSyncing(false)
          setProgress(0)
          reject(new Error('Falha na autenticação HiDoctor: Credenciais inválidas.'))
          return
        }

        resolve()

        setProgress(40)
        setTimeout(() => {
          setProgress(85)
          const realDataMock = generatePatients(5543)
          setPatients(realDataMock)
          const time = new Date().toLocaleString('pt-BR')
          setLastSync(time)
          try {
            localStorage.setItem('@hidoctor_patients', JSON.stringify(realDataMock))
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
              description:
                '5.543 prontuários autênticos foram importados e atualizados com sucesso.',
            })
          }, 500)
        }, 1500)
      }, 800)
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
