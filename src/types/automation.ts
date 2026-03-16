export type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'ab_test'

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

export type MetricDataPoint = {
  date: string
  a?: number
  b?: number
}

export interface FlowMetrics {
  entries: number
  conversions: number
  conversionRate: number
  abTest?: {
    a: { entries: number; conversions: number; name: string }
    b: { entries: number; conversions: number; name: string }
  }
  chartData?: MetricDataPoint[]
}

export interface Flow {
  id: string
  name: string
  isActive: boolean
  triggerType: string
  rootId: string
  metrics?: FlowMetrics
  nodes: Record<string, any>
}
