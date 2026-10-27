import pb from '@/lib/pocketbase/client'

export type CaptureConsentType = 'camera' | 'audio'

export interface LogCaptureConsentParams {
  patientId?: string
  patientName?: string
  captureType: CaptureConsentType
  operatorName?: string
  operatorEmail?: string
}

const SESSION_STORAGE_KEY_PREFIX = '@clinic_capture_consent:'

/**
 * Monta chave única de sessão por paciente e tipo de captura (ou combinada)
 */
function getSessionKey(patientId: string, captureType: CaptureConsentType): string {
  return `${SESSION_STORAGE_KEY_PREFIX}${patientId || 'anonymous'}:${captureType}`
}

/**
 * Verifica se já existe consentimento LGPD concedido nesta sessão para o paciente e tipo
 */
export function hasSessionConsent(patientId: string, captureType: CaptureConsentType): boolean {
  try {
    if (!patientId) return false
    const key = getSessionKey(patientId, captureType)
    const val = sessionStorage.getItem(key)
    return Boolean(val && val.length > 0)
  } catch {
    return false
  }
}

/**
 * Salva o consentimento nesta sessão para o paciente e tipo especificado
 */
export function setSessionConsent(patientId: string, captureType: CaptureConsentType): void {
  try {
    if (!patientId) return
    const key = getSessionKey(patientId, captureType)
    sessionStorage.setItem(
      key,
      JSON.stringify({
        acceptedAt: new Date().toISOString(),
        patientId,
        captureType,
      }),
    )
  } catch (err) {
    console.warn('Erro ao salvar consentimento em sessionStorage:', err)
  }
}

/**
 * Registra o aceite do termo de consentimento na trilha de auditoria do PocketBase (`integration_access_logs`).
 * O registro contém: data/hora, operador responsável, identificação do paciente, tipo (imagem/câmera ou áudio),
 * base legal LGPD (Art. 7º I / Art. 11 II f) e menção à Política de Privacidade.
 */
export async function logCaptureConsentAudit({
  patientId,
  patientName,
  captureType,
  operatorName,
  operatorEmail,
}: LogCaptureConsentParams): Promise<boolean> {
  const isAuth = pb.authStore.isValid && pb.authStore.model
  const currentUserId = isAuth ? pb.authStore.model?.id : undefined
  const currentUserName =
    operatorName ||
    (isAuth ? pb.authStore.model?.name || pb.authStore.model?.email : 'Operador Clínico')
  const currentUserEmail =
    operatorEmail || (isAuth ? pb.authStore.model?.email : 'operador@clinicadelgado.com.br')

  const actionName =
    captureType === 'camera' ? 'lgpd_consent_camera_capture' : 'lgpd_consent_audio_record'

  const integrationName =
    captureType === 'camera'
      ? 'Prontuário 360 — Consentimento de Imagem Clínica'
      : 'Prontuário 360 — Consentimento de Áudio Clínico'

  const mediaLabel = captureType === 'camera' ? 'fotografia/câmera' : 'áudio/microfone'
  const details = `Aceite do Termo de Consentimento LGPD para captura ao vivo de ${mediaLabel}. Paciente: "${patientName || 'Não informado'}" (ID: ${patientId || 'N/A'}). Operador: ${currentUserName} (${currentUserEmail}). Finalidade: Anexo clínico ao prontuário médico. Base legal: Tutela da saúde e consentimento expresso.`

  try {
    // Grava na coleção integration_access_logs existente
    await pb.collection('integration_access_logs').create({
      user: currentUserId,
      user_name: currentUserName,
      action: actionName,
      integration_name: integrationName,
      target_url: '/politica-privacidade',
      details,
    })
    return true
  } catch (err) {
    console.warn('Erro ao gravar log de auditoria LGPD no PocketBase:', err)
    return false
  }
}
