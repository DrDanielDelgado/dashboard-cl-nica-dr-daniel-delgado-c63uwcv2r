import pb from '@/lib/pocketbase/client'
import { Patient } from '@/types/paciente'

export interface HiDoctorConnectionTestResult {
  status: 'connected' | 'unauthorized' | 'server_error' | 'unreachable' | 'failed'
  target_url: string
  response_code: number
  duration_ms: number
  message: string
  technical_detail: string
  diagnostic: {
    is_online: boolean
    auth_valid: boolean
    action_recommendation: string
  }
}

export interface HiDoctorSettingsRecord {
  id: string
  name: string
  serial: string
  crm: string
  password?: string
  api_url: string
  is_active: boolean
  last_sync_status: 'never' | 'success' | 'warning' | 'failed' | 'running'
  last_sync_at: string | null
  last_sync_message: string
  synced_patients_count: number
  connection_test_details?: any
  created: string
  updated: string
}

export interface HiDoctorSyncLogRecord {
  id: string
  trigger_type: 'manual' | 'scheduled' | 'file_import' | 'test'
  status: 'success' | 'failed' | 'partial'
  records_imported: number
  records_updated: number
  duration_seconds: number
  message: string
  error_details: string
  created: string
}

export interface BatchImportResult {
  success: boolean
  imported: number
  updated: number
  total_processed: number
  duration_seconds: number
  errors_count: number
  sample_errors: Array<{ name: string; error: string }>
}

/**
 * Busca as configurações da integração HiDoctor salvas no PocketBase.
 */
export const getHiDoctorSettings = async (): Promise<HiDoctorSettingsRecord | null> => {
  try {
    const records = await pb.collection('hidoctor_settings').getList<HiDoctorSettingsRecord>(1, 1, {
      filter: 'name = "HiDoctor Clinica"',
    })
    return records.items[0] || null
  } catch (err) {
    console.error('Erro ao buscar configurações do HiDoctor:', err)
    return null
  }
}

/**
 * Salva ou atualiza as configurações da integração HiDoctor no PocketBase.
 */
export const saveHiDoctorSettings = async (
  data: Partial<HiDoctorSettingsRecord>,
): Promise<HiDoctorSettingsRecord> => {
  const existing = await getHiDoctorSettings()
  if (existing) {
    return await pb
      .collection('hidoctor_settings')
      .update<HiDoctorSettingsRecord>(existing.id, data)
  }
  return await pb.collection('hidoctor_settings').create<HiDoctorSettingsRecord>({
    name: 'HiDoctor Clinica',
    serial: data.serial || 'H80ARQW43',
    crm: data.crm || '37525',
    password: data.password || 'CPV2406',
    api_url: data.api_url || 'https://api.hinetx.com.br/v2/prontuarios/sync',
    is_active: false,
    last_sync_status: 'never',
    synced_patients_count: 0,
    ...data,
  })
}

/**
 * Busca os logs recentes de auditoria de sincronização HiDoctor.
 */
export const getHiDoctorSyncLogs = async (limit = 10): Promise<HiDoctorSyncLogRecord[]> => {
  try {
    const records = await pb
      .collection('hidoctor_sync_logs')
      .getList<HiDoctorSyncLogRecord>(1, limit, {
        sort: '-created',
      })
    return records.items
  } catch (err) {
    console.error('Erro ao buscar logs de sincronização HiDoctor:', err)
    return []
  }
}

/**
 * Testa a conectividade com o endpoint HiDoctor e retorna diagnóstico técnico real.
 */
export const testHiDoctorConnection = async (params?: {
  serial?: string
  crm?: string
  password?: string
  url?: string
}): Promise<HiDoctorConnectionTestResult> => {
  return await pb.send<HiDoctorConnectionTestResult>('/backend/v1/hidoctor/test', {
    method: 'POST',
    body: params || {},
  })
}

/**
 * Tenta sincronizar prontuários diretamente da API externa da HiDoctor via Proxy Backend.
 */
export const syncHiDoctorData = async (
  serial: string,
  crm: string,
  password: string,
  apiUrl?: string,
): Promise<{ success: boolean; patients?: Patient[]; message?: string }> => {
  // Chamada ao backend proxy para tentar conexão real com a API da HiDoctor
  try {
    const res = await pb.send<any>('/backend/v1/hidoctor/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serial}-${crm}`,
      },
      body: {
        password,
        api_url: apiUrl || 'https://api.hinetx.com.br/v2/prontuarios/sync',
      },
    })

    if (res && Array.isArray(res.prontuarios || res.patients)) {
      const list = res.prontuarios || res.patients
      return { success: true, patients: list }
    }
    return { success: true, patients: [] }
  } catch (err: any) {
    const technicalDetail =
      err?.data?.message || err?.message || 'Falha ao contatar a API da HiDoctor'
    const reason = err?.data?.reason || 'unreachable'

    let humanMessage = technicalDetail
    if (reason === 'dns_unresolved') {
      humanMessage =
        'O servidor da API HiDoctor (api.hinetx.com.br) não foi localizado no DNS da internet (Host não encontrado/NXDOMAIN).'
    } else if (reason === 'unauthorized') {
      humanMessage =
        'Credenciais recusadas pelo servidor HiDoctor (Serial/CRM ou Senha incorretos).'
    } else if (reason === 'timeout') {
      humanMessage = 'O servidor da HiDoctor demorou muito para responder (Timeout de conexão).'
    }

    const errorToThrow = new Error(humanMessage)
    ;(errorToThrow as any).data = err?.data
    throw errorToThrow
  }
}

/**
 * Importa um lote de pacientes/prontuários e salva permanentemente no banco `patients` do PocketBase.
 */
export const importPatientsBatchToDatabase = async (
  patients: Partial<Patient>[],
  triggerType: 'manual' | 'file_import' = 'file_import',
): Promise<BatchImportResult> => {
  return await pb.send<BatchImportResult>('/backend/v1/hidoctor/import-batch', {
    method: 'POST',
    body: {
      patients,
      trigger_type: triggerType,
    },
  })
}

/**
 * Utilitário para interpretar arquivos exportados pelo HiDoctor (CSV ou JSON).
 */
export const parseHiDoctorExportFile = async (file: File): Promise<Array<Partial<Patient>>> => {
  const text = await file.text()
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.json')) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeParsedPatient)
      } else if (parsed.patients && Array.isArray(parsed.patients)) {
        return parsed.patients.map(normalizeParsedPatient)
      } else if (parsed.prontuarios && Array.isArray(parsed.prontuarios)) {
        return parsed.prontuarios.map(normalizeParsedPatient)
      }
      throw new Error('Formato JSON não reconhecido como lista de prontuários.')
    } catch (e: any) {
      throw new Error(`Falha ao ler arquivo JSON do HiDoctor: ${e.message}`)
    }
  }

  // Se for CSV ou TXT delimitado
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) {
    throw new Error('Arquivo vazio ou com apenas uma linha de cabeçalho.')
  }

  // Detecta delimitador (, ou ;)
  const headerLine = lines[0]
  const separator = headerLine.includes(';') ? ';' : ','
  const headers = headerLine.split(separator).map((h) => h.trim().toLowerCase().replace(/"/g, ''))

  const results: Array<Partial<Patient>> = []

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i]
    if (!rawLine.trim()) continue

    // Divisão simples mantendo campos com aspas
    const cols = splitCsvLine(rawLine, separator)
    const rowObj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      rowObj[h] = (cols[idx] || '').trim().replace(/^"|"$/g, '')
    })

    const patient = normalizeRowToPatient(rowObj)
    if (patient.fullName) {
      results.push(patient)
    }
  }

  return results
}

function splitCsvLine(line: string, separator: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === separator && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }
    current += char
  }
  result.push(current)
  return result
}

function normalizeRowToPatient(row: Record<string, string>): Partial<Patient> {
  const name =
    row['nome'] || row['nome completo'] || row['name'] || row['paciente'] || row['fullname'] || ''
  const cpf = row['cpf'] || row['documento'] || ''
  const phone = row['telefone'] || row['celular'] || row['tel'] || row['phone'] || ''
  const email = row['email'] || row['e-mail'] || ''
  const dob = row['nascimento'] || row['data nascimento'] || row['dob'] || row['aniversario'] || ''
  const notes =
    row['observacoes'] ||
    row['notas'] ||
    row['historico'] ||
    row['anotacoes'] ||
    row['notes'] ||
    row['diagnostico'] ||
    ''

  return {
    fullName: name,
    cpf,
    phone,
    email,
    dob,
    clinicalNotes: notes,
    history: notes,
    unit: 'Juiz de Fora',
    status: 'Ativo',
  }
}

function normalizeParsedPatient(item: any): Partial<Patient> {
  return {
    fullName: item.fullName || item.name || item.nome || item.paciente || '',
    cpf: item.cpf || item.documento || '',
    phone: item.phone || item.telefone || item.celular || '',
    email: item.email || item.e_mail || '',
    dob: item.dob || item.birthdate || item.nascimento || '',
    clinicalNotes: item.clinicalNotes || item.notes || item.observacoes || item.historico || '',
    history: item.history || item.clinicalNotes || item.historico || '',
    unit: item.unit || item.unidade || 'Juiz de Fora',
    status: item.status || 'Ativo',
  }
}
