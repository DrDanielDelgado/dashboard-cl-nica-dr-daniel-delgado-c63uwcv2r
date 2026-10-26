import pb from '@/lib/pocketbase/client'

export interface ApiKeyRecord {
  id: string
  name: string
  key: string
  is_active: boolean
  last_used_at?: string
  created: string
  updated: string
}

export interface CollectionPermissions {
  read: boolean
  write: boolean
}

export interface PartnerPermissions {
  patients: CollectionPermissions
  appointments: CollectionPermissions
  leads: CollectionPermissions
  budgets: CollectionPermissions
}

export interface PartnerApiKeyRecord {
  id: string
  name: string
  description?: string
  key: string
  masked_hint?: string
  is_active: boolean
  permissions: PartnerPermissions | string
  last_used_at?: string
  call_count?: number
  created: string
  updated: string
}

export interface PartnerApiLogRecord {
  id: string
  partner?: string
  partner_name?: string
  collection_accessed: string
  method: string
  status: 'success' | 'error' | 'unauthorized' | 'forbidden'
  status_code?: number
  ip?: string
  endpoint?: string
  error_details?: string
  created: string
  updated: string
}

export const DEFAULT_PARTNER_PERMISSIONS: PartnerPermissions = {
  patients: { read: true, write: false },
  appointments: { read: true, write: true },
  leads: { read: true, write: true },
  budgets: { read: true, write: false },
}

// 1. CHAVE DO DASHBOARD (api_keys)
export async function getDashboardApiKey(): Promise<ApiKeyRecord | null> {
  try {
    const records = await pb.collection('api_keys').getFullList<ApiKeyRecord>({
      filter: 'name = "Dashboard Service Key"',
      sort: '-created',
      requestKey: null,
    })
    if (records.length > 0) return records[0]

    // Se ainda não existir por algum motivo, busca a primeira ativa ou cria
    const all = await pb.collection('api_keys').getFullList<ApiKeyRecord>({
      sort: '-created',
      requestKey: null,
    })
    if (all.length > 0) return all[0]

    // Cria a chave se não houver nenhuma
    const newKey = generateRandomKey('cld_live_')
    const created = await pb.collection('api_keys').create<ApiKeyRecord>({
      name: 'Dashboard Service Key',
      key: newKey,
      is_active: true,
    })
    return created
  } catch (err) {
    console.error('Erro ao buscar chave da API do Dashboard:', err)
    return null
  }
}

export async function regenerateDashboardApiKey(oldId: string): Promise<ApiKeyRecord> {
  const newKey = generateRandomKey('cld_live_')
  return await pb.collection('api_keys').update<ApiKeyRecord>(oldId, {
    key: newKey,
    is_active: true,
    last_used_at: null,
  })
}

// 2. ACESSOS DE PARCEIROS (partner_api_keys)
export async function getPartnerApiKeys(): Promise<PartnerApiKeyRecord[]> {
  try {
    const list = await pb.collection('partner_api_keys').getFullList<PartnerApiKeyRecord>({
      sort: '-created',
      requestKey: null,
    })
    return list.map((item) => {
      let parsedPerms: PartnerPermissions = { ...DEFAULT_PARTNER_PERMISSIONS }
      if (typeof item.permissions === 'string') {
        try {
          parsedPerms = JSON.parse(item.permissions)
        } catch {
          /* intentionally ignored */
        }
      } else if (item.permissions) {
        parsedPerms = item.permissions as PartnerPermissions
      }
      return {
        ...item,
        permissions: parsedPerms,
      }
    })
  } catch (err) {
    console.error('Erro ao listar chaves de parceiros:', err)
    return []
  }
}

export async function createPartnerApiKey(data: {
  name: string
  description?: string
  permissions: PartnerPermissions
}): Promise<{ record: PartnerApiKeyRecord; rawKey: string }> {
  const rawKey = generateRandomKey('ptr_sec_')
  const maskedHint = maskKey(rawKey)

  const created = await pb.collection('partner_api_keys').create<PartnerApiKeyRecord>({
    name: data.name,
    description: data.description || '',
    key: rawKey,
    masked_hint: maskedHint,
    is_active: true,
    permissions: data.permissions,
    call_count: 0,
  })

  return {
    record: {
      ...created,
      permissions: data.permissions,
    },
    rawKey,
  }
}

export async function updatePartnerApiKey(
  id: string,
  data: {
    name?: string
    description?: string
    is_active?: boolean
    permissions?: PartnerPermissions
  },
): Promise<PartnerApiKeyRecord> {
  const updated = await pb.collection('partner_api_keys').update<PartnerApiKeyRecord>(id, data)
  let parsedPerms: PartnerPermissions = { ...DEFAULT_PARTNER_PERMISSIONS }
  if (typeof updated.permissions === 'string') {
    try {
      parsedPerms = JSON.parse(updated.permissions)
    } catch {
      /* intentionally ignored */
    }
  } else if (updated.permissions) {
    parsedPerms = updated.permissions as PartnerPermissions
  }
  return {
    ...updated,
    permissions: parsedPerms,
  }
}

export async function revokePartnerApiKey(id: string): Promise<PartnerApiKeyRecord> {
  return await updatePartnerApiKey(id, { is_active: false })
}

export async function deletePartnerApiKey(id: string): Promise<boolean> {
  try {
    await pb.collection('partner_api_keys').delete(id)
    return true
  } catch (err) {
    console.error('Erro ao deletar chave de parceiro:', err)
    return false
  }
}

// 3. LOGS DE CHAMADAS (partner_api_logs)
export async function getPartnerApiLogs(
  limit = 100,
  partnerId?: string,
): Promise<PartnerApiLogRecord[]> {
  try {
    let filter = ''
    if (partnerId && partnerId !== 'all') {
      filter = `partner = "${partnerId}"`
    }
    const list = await pb.collection('partner_api_logs').getList<PartnerApiLogRecord>(1, limit, {
      filter,
      sort: '-created',
      requestKey: null,
    })
    return list.items
  } catch (err) {
    console.error('Erro ao carregar logs de API de parceiros:', err)
    return []
  }
}

// Utilitários de chave
function generateRandomKey(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix + result
}

export function maskKey(key: string): string {
  if (!key) return ''
  if (key.length <= 12) return '••••••••••••'
  const start = key.slice(0, 8)
  const end = key.slice(-4)
  return `${start}••••••••••••••••${end}`
}
