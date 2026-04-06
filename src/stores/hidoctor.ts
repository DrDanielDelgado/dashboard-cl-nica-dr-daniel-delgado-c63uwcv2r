import { create } from 'zustand'

export interface Patient {
  id: string
  fullName: string
  cpf: string
  lastConsultation: string
  unit: string
  status: string
  phone?: string
  email?: string
}

interface HiDoctorState {
  patients: Patient[]
  setPatients: (p: Patient[]) => void
  isSyncing: boolean
  progress: number
  lastSync: string | null
  syncData: (serial: string, crm: string, password: string) => Promise<void>
}

export const useHiDoctorStore = create<HiDoctorState>((set) => ({
  patients: [],
  setPatients: (patients) => set({ patients }),
  isSyncing: false,
  progress: 0,
  lastSync: null,
  syncData: async () => {},
}))
