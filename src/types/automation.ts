export type NodeType = 'trigger' | 'message' | 'template' | 'delay' | 'condition' | 'ab_test'

export interface FlowMetrics {
  entries: number
  conversions: number
  conversionRate: number
  abTest?: {
    a: { conversions: number; entries: number; name?: string }
    b: { conversions: number; entries: number; name?: string }
  }
  chartData?: any[]
}

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
  metrics?: FlowMetrics
}
