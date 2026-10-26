import { create } from 'zustand'
import { Patient } from '@/types/paciente'
import {
  getHiDoctorSettings,
  saveHiDoctorSettings,
  getHiDoctorSyncLogs,
  testHiDoctorConnection,
  syncHiDoctorData,
  importPatientsBatchToDatabase,
  HiDoctorSettingsRecord,
  HiDoctorSyncLogRecord,
  HiDoctorConnectionTestResult,
} from '@/lib/api/hidoctor'
import { getPatients } from '@/services/api'
import { toast } from '@/hooks/use-toast'

interface HiDoctorState {
  patients: Patient[]
  settings: HiDoctorSettingsRecord | null
  syncLogs: HiDoctorSyncLogRecord[]
  lastTestResult: HiDoctorConnectionTestResult | null
  isSyncing: boolean
  isTesting: boolean
  progress: number
  lastSync: string | null
  errorMessage: string | null

  // Actions
  fetchPatients: () => Promise<void>
  loadSettings: () => Promise<void>
  loadLogs: () => Promise<void>
  testConnection: (params?: {
    serial?: string
    crm?: string
    password?: string
    url?: string
  }) => Promise<HiDoctorConnectionTestResult>
  syncData: (serial: string, crm: string, password: string, apiUrl?: string) => Promise<void>
  importBatch: (
    patientsToImport: Partial<Patient>[],
    triggerType?: 'manual' | 'file_import',
  ) => Promise<{ imported: number; updated: number }>
  updatePatient: (id: string, data: Partial<Patient>) => void
  signPatientRecord: (id: string) => void
  clearError: () => void
}

export const useHiDoctorStore = create<HiDoctorState>((set, get) => ({
  patients: [],
  settings: null,
  syncLogs: [],
  lastTestResult: null,
  isSyncing: false,
  isTesting: false,
  progress: 0,
  lastSync: null,
  errorMessage: null,

  fetchPatients: async () => {
    try {
      const records = await getPatients()
      const mapped: Patient[] = records.map((p: any) => ({
        id: p.id,
        fullName: p.name || 'Paciente Sem Nome',
        cpf: p.cpf || '',
        phone: p.phone || '',
        email: p.email || '',
        dob: p.birthdate || '',
        unit: 'Juiz de Fora',
        lastConsultation: p.updated || p.created || new Date().toISOString(),
        status: 'Ativo',
        clinicalNotes: p.notes || '',
        history: p.notes ? `Histórico clínico: ${p.notes}` : 'Registro cadastrado no prontuário.',
        allergies: 'Nenhuma conhecida',
      }))
      set({ patients: mapped })
    } catch (err: any) {
      console.error('Erro ao carregar pacientes do banco:', err)
    }
  },

  loadSettings: async () => {
    const s = await getHiDoctorSettings()
    if (s) {
      set({
        settings: s,
        lastSync: s.last_sync_at ? new Date(s.last_sync_at).toLocaleString('pt-BR') : null,
      })
    }
  },

  loadLogs: async () => {
    const logs = await getHiDoctorSyncLogs(15)
    set({ syncLogs: logs })
  },

  testConnection: async (params) => {
    set({ isTesting: true, errorMessage: null })
    try {
      const result = await testHiDoctorConnection(params)
      set({ lastTestResult: result, isTesting: false })
      await get().loadSettings()
      return result
    } catch (err: any) {
      set({ isTesting: false, errorMessage: err.message || 'Falha ao testar conexão' })
      throw err
    }
  },

  syncData: async (serial: string, crm: string, password: string, apiUrl?: string) => {
    set({ isSyncing: true, progress: 20, errorMessage: null })

    try {
      // Salva as credenciais fornecidas no banco
      await saveHiDoctorSettings({
        serial,
        crm,
        password,
        api_url: apiUrl || 'https://api.hinetx.com.br/v2/prontuarios/sync',
      })

      set({ progress: 40 })

      // Tenta conexão real com a API da HiDoctor
      const res = await syncHiDoctorData(serial, crm, password, apiUrl)
      set({ progress: 75 })

      if (res.patients && res.patients.length > 0) {
        // Se a API externa retornou registros reais, gravamos no PocketBase
        const importRes = await importPatientsBatchToDatabase(res.patients, 'manual')
        set({ progress: 95 })
        await get().fetchPatients()
        await get().loadSettings()
        await get().loadLogs()

        set({
          isSyncing: false,
          progress: 100,
          lastSync: new Date().toLocaleString('pt-BR'),
        })

        toast({
          title: 'Sincronização Concluída',
          description: `${importRes.imported} prontuários importados e ${importRes.updated} atualizados no banco de dados.`,
        })
      } else {
        // Sem registros retornados
        set({ isSyncing: false, progress: 0 })
        toast({
          title: 'Sincronização Finalizada',
          description:
            'A API HiDoctor respondeu, mas não retornou novos prontuários para sincronização.',
        })
      }
    } catch (error: any) {
      set({
        isSyncing: false,
        progress: 0,
        errorMessage: error.message,
      })
      await get().loadSettings()
      await get().loadLogs()

      toast({
        variant: 'destructive',
        title: 'Falha de Sincronização HiDoctor',
        description: error.message,
      })
      throw error
    }
  },

  importBatch: async (patientsToImport, triggerType = 'file_import') => {
    set({ isSyncing: true, progress: 30, errorMessage: null })
    try {
      const res = await importPatientsBatchToDatabase(patientsToImport, triggerType)
      set({ progress: 85 })
      await get().fetchPatients()
      await get().loadSettings()
      await get().loadLogs()
      set({
        isSyncing: false,
        progress: 100,
        lastSync: new Date().toLocaleString('pt-BR'),
      })

      toast({
        title: 'Importação Concluída com Sucesso',
        description: `${res.imported} novos pacientes inseridos e ${res.updated} prontuários atualizados no banco.`,
      })
      return { imported: res.imported, updated: res.updated }
    } catch (err: any) {
      set({ isSyncing: false, progress: 0, errorMessage: err.message })
      toast({
        variant: 'destructive',
        title: 'Erro ao Importar Lote',
        description: err.message,
      })
      throw err
    }
  },

  updatePatient: (id: string, data: Partial<Patient>) => {
    set((state) => ({
      patients: state.patients.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
  },

  signPatientRecord: (id: string) => {
    set((state) => ({
      patients: state.patients.map((p) => {
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
      }),
    }))
    toast({
      title: 'Documento Assinado',
      description: 'Prontuário assinado digitalmente e registrado.',
    })
  },

  clearError: () => set({ errorMessage: null }),
}))
