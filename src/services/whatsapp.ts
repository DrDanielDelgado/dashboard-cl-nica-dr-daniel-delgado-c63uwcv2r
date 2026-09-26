import pb from '@/lib/pocketbase/client'

export interface WhatsAppMessageRecord {
  id: string
  patient?: string
  appointment?: string
  phone: string
  recipient_name?: string
  message_type: 'text' | 'template' | 'reminder'
  template_name?: string
  content?: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  whatsapp_message_id?: string
  error_details?: string
  sent_at?: string
  delivered_at?: string
  read_at?: string
  created: string
  updated: string
  expand?: {
    patient?: {
      id: string
      name: string
      phone: string
      cpf?: string
    }
    appointment?: {
      id: string
      title: string
      start: string
      status: string
    }
  }
}

export interface MetaConfig {
  bmId: string
  wabaId: string
  phoneId: string
  officialPhone: string
  officialPhoneE164: string
  verifyToken: string
  webhookUrl: string
  hasAccessToken: boolean
}

export interface MetaTestResult {
  success: boolean
  user?: {
    id: string
    name?: string
  }
  waba?: any
  phone?: {
    id: string
    display_phone_number?: string
    verified_name?: string
    code_verification_status?: string
    quality_rating?: string
  }
  configuredWabaId: string
  configuredBmId: string
  configuredPhoneId: string
  verifiedNumber: string
  message?: string
  error?: string
  metaError?: any
  code?: string
}

export interface SendWhatsAppParams {
  patientId?: string
  appointmentId?: string
  to?: string
  recipientName?: string
  type?: 'text' | 'template' | 'reminder'
  text?: string
  templateName?: string
  templateParams?: string[]
  token?: string
  phoneId?: string
}

export interface SendWhatsAppResult {
  success: boolean
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  messageId: string
  whatsappMessageId?: string
  pendingConfig?: boolean
  warning?: string
  error?: string
  metaError?: any
}

// Fetch integration config from backend hook
export async function getMetaConfig(): Promise<MetaConfig> {
  const baseUrl = pb.baseUrl || ''
  const res = await fetch(`${baseUrl}/backend/v1/meta/config`)
  if (!res.ok) {
    throw new Error('Falha ao obter configurações do Meta')
  }
  return await res.json()
}

// Test Meta / WhatsApp Cloud API connection
export async function testMetaConnection(params?: {
  token?: string
  phoneId?: string
  wabaId?: string
  bmId?: string
}): Promise<MetaTestResult> {
  const baseUrl = pb.baseUrl || ''
  const res = await fetch(`${baseUrl}/backend/v1/meta/test-connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {}),
  })
  return await res.json()
}

// Send WhatsApp message (template or direct reminder) via backend hook
export async function sendWhatsAppMessage(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const baseUrl = pb.baseUrl || ''
  const res = await fetch(`${baseUrl}/backend/v1/meta/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return await res.json()
}

// Fetch list of logged WhatsApp messages
export async function getWhatsAppMessages(filter?: string): Promise<WhatsAppMessageRecord[]> {
  try {
    return (await pb.collection('whatsapp_messages').getFullList({
      sort: '-created',
      filter: filter || '',
      expand: 'patient,appointment',
    })) as unknown as WhatsAppMessageRecord[]
  } catch (err) {
    console.warn('Erro ao carregar mensagens do WhatsApp:', err)
    return []
  }
}

// Resend failed message
export async function resendWhatsAppMessage(
  msg: WhatsAppMessageRecord,
): Promise<SendWhatsAppResult> {
  return await sendWhatsAppMessage({
    patientId: msg.patient,
    appointmentId: msg.appointment,
    to: msg.phone,
    recipientName: msg.recipient_name,
    type: msg.message_type,
    text: msg.content,
    templateName: msg.template_name,
  })
}
