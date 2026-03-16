export type NodeType = 'trigger' | 'message' | 'template' | 'delay' | 'condition'

export interface FlowNode {
  id: string
  type: NodeType
  title: string
  config: Record<string, any>
  nextId?: string | null
  nextTrueId?: string | null
  nextFalseId?: string | null
}

export interface Flow {
  id: string
  name: string
  isActive: boolean
  triggerType: string
  rootId: string
  nodes: Record<string, FlowNode>
}
