import pb from '@/lib/pocketbase/client'

export const CFM_PRESCRIPTION_URL = 'https://prescricao.cfm.org.br/'
export const CFM_SERVICES_URL = 'https://portalservicos.cfm.org.br/portal/login/pessoa-fisica'
export const CFM_SERVICES_PF_URL = 'https://portalservicos.cfm.org.br/portal/login/pessoa-fisica'
export const CFM_SERVICES_PJ_URL = 'https://portalservicos.cfm.org.br/portal/login/pessoa-juridica'
export const CFM_SUPPORT_URL = 'https://sistemas.cfm.org.br/contatoprescricaoeletronica/br'
export const CFM_RDC1000_URL = 'https://prescricaoeletronica.cfm.org.br/rdc-1000.html'

export const CLINICA_PJ_DADOS = {
  cnpj: '13.548.058/0001-16',
  cnpjNumeros: '13548058000116',
  razaoSocial: 'Mattos Delgado Clínica Médica LTDA',
  diretorTecnico: 'Daniel de Mattos Delgado',
  diretorTecnicoCrm: 'CRM-MG 37525',
  crmNumero: '37525',
  crmUf: 'MG',
} as const

export interface IntegrationAccessLog {
  id: string
  user?: string
  user_name?: string
  action: string
  integration_name: string
  target_url?: string
  ip_address?: string
  details?: string
  created: string
  updated: string
}

export interface UserDoctorProfile {
  id: string
  name: string
  email: string
  crm_numero?: string
  crm_uf?: string
  last_cfm_access?: string
}

/**
 * Obtém dados do usuário autenticado (incluindo CRM, UF e último acesso ao CFM)
 */
export async function getDoctorProfile(): Promise<UserDoctorProfile | null> {
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return null
  }
  const currentId = pb.authStore.model.id
  try {
    const user = await pb.collection('users').getOne(currentId)
    return {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      crm_numero: user.crm_numero || '',
      crm_uf: user.crm_uf || '',
      last_cfm_access: user.last_cfm_access || '',
    }
  } catch (err) {
    console.warn('Erro ao obter perfil do médico:', err)
    return {
      id: pb.authStore.model.id,
      name: pb.authStore.model.name || pb.authStore.model.email,
      email: pb.authStore.model.email,
      crm_numero: (pb.authStore.model as any).crm_numero || '',
      crm_uf: (pb.authStore.model as any).crm_uf || '',
      last_cfm_access: (pb.authStore.model as any).last_cfm_access || '',
    }
  }
}

/**
 * Atualiza número e UF do CRM no perfil do usuário no PocketBase
 * NUNCA armazena senha ou CPF.
 */
export async function updateDoctorCrm(crmNumero: string, crmUf: string): Promise<boolean> {
  if (!pb.authStore.isValid || !pb.authStore.model) {
    throw new Error('Usuário não autenticado.')
  }
  const currentId = pb.authStore.model.id
  const cleanNumero = crmNumero.trim().replace(/[^0-9]/g, '')
  const cleanUf = crmUf.trim().toUpperCase().slice(0, 2)

  await pb.collection('users').update(currentId, {
    crm_numero: cleanNumero,
    crm_uf: cleanUf,
  })

  return true
}

/**
 * Registra o acesso direcionado à prescrição do CFM:
 * 1. Atualiza `last_cfm_access` no registro do usuário;
 * 2. Cria registro de auditoria na coleção `integration_access_logs`.
 * Nenhum dado clínico, CID ou medicamento é transmitido ou gravado.
 */
export type CfmAccessAction = 'open_cfm_prescription' | 'open_cfm_services' | 'open_cfm_services_pj'

/**
 * Registra o acesso direcionado à prescrição do CFM ou aos portais de serviços PF/PJ:
 * 1. Atualiza `last_cfm_access` no registro do usuário;
 * 2. Cria registro de auditoria na coleção `integration_access_logs`.
 * Nenhum dado clínico, CID ou medicamento é transmitido ou gravado.
 */
export async function logCfmAccess(
  action: CfmAccessAction = 'open_cfm_prescription',
): Promise<IntegrationAccessLog | null> {
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return null
  }

  const userId = pb.authStore.model.id
  const userName = pb.authStore.model.name || pb.authStore.model.email || 'Usuário Clínico'
  const now = new Date().toISOString()

  let integrationName = 'CFM Prescrição Eletrônica (Estratégia B)'
  let targetUrl = CFM_PRESCRIPTION_URL
  let details = 'Acesso direcionado seguro aberto em nova aba com noopener,noreferrer'

  if (action === 'open_cfm_services') {
    integrationName = 'Portal de Serviços CFM — Pessoa Física'
    targetUrl = CFM_SERVICES_PF_URL
    details =
      'Acesso direcionado seguro ao Portal de Serviços (Pessoa Física) aberto em nova aba com noopener,noreferrer'
  } else if (action === 'open_cfm_services_pj') {
    integrationName = 'Portal de Serviços CFM — Pessoa Jurídica'
    targetUrl = CFM_SERVICES_PJ_URL
    details =
      'Acesso direcionado seguro ao Portal de Serviços (Pessoa Jurídica) aberto em nova aba com noopener,noreferrer'
  }

  // 1. Atualiza last_cfm_access no usuário
  try {
    await pb.collection('users').update(userId, {
      last_cfm_access: now,
    })
  } catch (err) {
    console.warn('Erro ao atualizar last_cfm_access no usuário:', err)
  }

  // 2. Grava log de auditoria na coleção integration_access_logs
  try {
    const logRecord = await pb.collection('integration_access_logs').create({
      user: userId,
      user_name: userName,
      action,
      integration_name: integrationName,
      target_url: targetUrl,
      details,
    })
    return logRecord as unknown as IntegrationAccessLog
  } catch (err) {
    console.warn('Erro ao gravar integration_access_logs:', err)
    return null
  }
}

/**
 * Registra o acesso ao Portal de Serviços CFM (Pessoa Física)
 */
export async function logCfmServicesAccess(): Promise<IntegrationAccessLog | null> {
  return logCfmAccess('open_cfm_services')
}

/**
 * Registra o acesso ao Portal de Serviços CFM (Pessoa Jurídica)
 */
export async function logCfmServicesPjAccess(): Promise<IntegrationAccessLog | null> {
  return logCfmAccess('open_cfm_services_pj')
}

/**
 * Busca histórico de logs de acesso do CFM do usuário atual
 */
export async function getCfmAccessLogs(limit = 10): Promise<IntegrationAccessLog[]> {
  if (!pb.authStore.isValid) return []
  try {
    const records = await pb.collection('integration_access_logs').getList(1, limit, {
      filter:
        'action = "open_cfm_prescription" || action = "open_cfm_services" || action = "open_cfm_services_pj"',
      sort: '-created',
    })
    return records.items as unknown as IntegrationAccessLog[]
  } catch (err) {
    console.warn('Erro ao listar integration_access_logs:', err)
    return []
  }
}

/**
 * Executa a abertura segura direcionada para a Prescrição Eletrônica do CFM:
 * - Registra auditoria
 * - Abre https://prescricao.cfm.org.br/ em nova aba com window.open(..., '_blank', 'noopener,noreferrer')
 */
export async function openCfmPrescriptionWindow(): Promise<boolean> {
  try {
    // Registra log sem bloquear navegação caso falhe
    logCfmAccess('open_cfm_prescription').catch((err) =>
      console.error('Erro de log ao abrir CFM:', err),
    )

    // Abertura segura
    const newWindow = window.open(CFM_PRESCRIPTION_URL, '_blank', 'noopener,noreferrer')
    if (newWindow) {
      newWindow.opener = null
    }
    return true
  } catch (err) {
    console.error('Falha ao abrir janela do CFM:', err)
    return false
  }
}

/**
 * Executa a abertura segura direcionada para o Portal de Serviços do CFM (Pessoa Física):
 * - Registra auditoria
 * - Abre https://portalservicos.cfm.org.br/portal/login/pessoa-fisica em nova aba com window.open(..., '_blank', 'noopener,noreferrer')
 */
export async function openCfmServicesWindow(): Promise<boolean> {
  try {
    logCfmServicesAccess().catch((err) =>
      console.error('Erro de log ao abrir Portal de Serviços CFM (PF):', err),
    )

    const newWindow = window.open(CFM_SERVICES_PF_URL, '_blank', 'noopener,noreferrer')
    if (newWindow) {
      newWindow.opener = null
    }
    return true
  } catch (err) {
    console.error('Falha ao abrir Portal de Serviços CFM (PF):', err)
    return false
  }
}

/**
 * Executa a abertura segura direcionada para o Portal de Serviços do CFM (Pessoa Jurídica):
 * - Registra auditoria
 * - Abre https://portalservicos.cfm.org.br/portal/login/pessoa-juridica em nova aba com window.open(..., '_blank', 'noopener,noreferrer')
 */
export async function openCfmServicesPjWindow(): Promise<boolean> {
  try {
    logCfmServicesPjAccess().catch((err) =>
      console.error('Erro de log ao abrir Portal de Serviços CFM (PJ):', err),
    )

    const newWindow = window.open(CFM_SERVICES_PJ_URL, '_blank', 'noopener,noreferrer')
    if (newWindow) {
      newWindow.opener = null
    }
    return true
  } catch (err) {
    console.error('Falha ao abrir Portal de Serviços CFM (PJ):', err)
    return false
  }
}
