export type NodeType = 'trigger' | 'action' | 'condition' | 'delay'

export interface FlowNode {
  id: string
  type: NodeType
  title: string
  description?: string
  status?: 'active' | 'draft' | 'error'
  children?: FlowNode[]
  config?: any
}

export interface AutomationFlow {
  id: string
  name: string
  isActive: boolean
  nodes: FlowNode[]
}
