import pb from '@/lib/pocketbase/client'

export type FlowStatus = 'draft' | 'active' | 'paused'
export type FlowTriggerType =
  | 'contact_created'
  | 'birthday'
  | 'contact_webhook'
  | 'variable_updated'
  | 'deal_stage_changed'
  | 'custom_event'
  | 'manual'

export type FlowNodeType =
  | 'trigger'
  | 'email'
  | 'whatsapp'
  | 'push'
  | 'chatbot'
  | 'delay'
  | 'condition'
  | 'update_contact'
  | 'update_stage'
  | 'end'

export interface VisualFlowNode {
  id: string
  type: FlowNodeType
  title: string
  description?: string
  position?: { x: number; y: number }
  config?: Record<string, any>
}

export interface VisualFlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  label?: string
  condition?: boolean
}

export interface AutomationFlowDefinition {
  nodes: VisualFlowNode[]
  edges: VisualFlowEdge[]
}

export interface AutomationFlowRecord {
  id: string
  name: string
  description?: string
  status: FlowStatus
  trigger_type: FlowTriggerType
  trigger_config?: Record<string, any>
  webhook_secret?: string
  definition?: AutomationFlowDefinition
  total_entered: number
  total_completed: number
  created: string
  updated: string
}

export interface AutomationFlowRunRecord {
  id: string
  flow: string
  contact_email?: string
  contact_phone?: string
  contact_name?: string
  patient?: string
  lead?: string
  current_node_id?: string
  status: 'running' | 'completed' | 'failed' | 'waiting'
  execution_steps?: Array<{
    nodeId: string
    type: string
    title: string
    status: 'success' | 'failed' | 'waiting'
    timestamp: string
    details?: any
  }>
  wait_until?: string
  error_message?: string
  created: string
  updated: string
  expand?: {
    flow?: AutomationFlowRecord
    patient?: { id: string; name: string; phone?: string; email?: string }
    lead?: { id: string; name: string }
  }
}

export interface AutomationEventRecord {
  id: string
  event_name: string
  contact_email?: string
  contact_phone?: string
  payload?: Record<string, any>
  is_processed: boolean
  processed_at?: string
  created: string
  updated: string
}

// API functions
export async function getAutomationFlows(): Promise<AutomationFlowRecord[]> {
  try {
    const records = await pb.collection('automation_flows').getFullList<AutomationFlowRecord>({
      sort: '-created',
    })
    return records
  } catch (err) {
    console.warn('Erro ao carregar automation_flows:', err)
    return []
  }
}

export async function getAutomationFlowById(id: string): Promise<AutomationFlowRecord> {
  return await pb.collection('automation_flows').getOne<AutomationFlowRecord>(id)
}

export async function createAutomationFlow(
  data: Partial<AutomationFlowRecord>,
): Promise<AutomationFlowRecord> {
  return await pb.collection('automation_flows').create<AutomationFlowRecord>({
    name: data.name || 'Novo Fluxo Automatizado',
    description: data.description || '',
    status: data.status || 'draft',
    trigger_type: data.trigger_type || 'contact_created',
    trigger_config: data.trigger_config || {},
    webhook_secret: data.webhook_secret || Math.random().toString(36).substring(2, 14),
    definition: data.definition || {
      nodes: [
        {
          id: 'n_trigger',
          type: 'trigger',
          title: 'Novo Contato Criado',
          description: 'Inicia automaticamente quando um paciente ou lead é cadastrado.',
          position: { x: 300, y: 60 },
          config: {},
        },
        {
          id: 'n_wa_welcome',
          type: 'whatsapp',
          title: 'WhatsApp de Boas-Vindas',
          description: 'Envia mensagem personalizada acolhedora.',
          position: { x: 300, y: 220 },
          config: {
            text: 'Olá {primeiro_nome}, seja bem-vindo(a) à Clínica Dr. Daniel Delgado! Estamos à disposição para cuidar da sua saúde vascular.',
          },
        },
      ],
      edges: [{ id: 'e1', source: 'n_trigger', target: 'n_wa_welcome' }],
    },
    total_entered: 0,
    total_completed: 0,
  })
}

export async function updateAutomationFlow(
  id: string,
  data: Partial<AutomationFlowRecord>,
): Promise<AutomationFlowRecord> {
  return await pb.collection('automation_flows').update<AutomationFlowRecord>(id, data)
}

export async function deleteAutomationFlow(id: string): Promise<boolean> {
  return await pb.collection('automation_flows').delete(id)
}

export async function getFlowRuns(flowId?: string): Promise<AutomationFlowRunRecord[]> {
  try {
    const filter = flowId ? `flow = "${flowId}"` : ''
    const records = await pb
      .collection('automation_flow_runs')
      .getList<AutomationFlowRunRecord>(1, 50, {
        filter,
        sort: '-created',
        expand: 'flow,patient,lead',
      })
    return records.items
  } catch (err) {
    console.warn('Erro ao carregar flow runs:', err)
    return []
  }
}

export async function getAutomationEvents(): Promise<AutomationEventRecord[]> {
  try {
    const records = await pb.collection('automation_events').getList<AutomationEventRecord>(1, 50, {
      sort: '-created',
    })
    return records.items
  } catch (err) {
    console.warn('Erro ao carregar automation events:', err)
    return []
  }
}

export async function createAutomationEvent(data: {
  event_name: string
  email?: string
  phone?: string
  payload?: Record<string, any>
}) {
  const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/automations/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Falha ao registrar evento.')
  }
  return await res.json()
}

export async function triggerFlowTest(
  flowId: string,
  contact: {
    name?: string
    email?: string
    phone?: string
    patientId?: string
    leadId?: string
  },
) {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/automations/flows/${flowId}/trigger`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
      body: JSON.stringify(contact),
    },
  )
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Falha ao acionar fluxo de teste.')
  }
  return data
}
