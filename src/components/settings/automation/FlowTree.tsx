import { FlowNode, NodeType } from '@/types/automation'
import { Plus, MessageSquare, Clock, GitBranch, Zap } from 'lucide-react'

const getTypeIcon = (type: NodeType) => {
  switch (type) {
    case 'trigger':
      return <Zap className="w-4 h-4 text-yellow-500" />
    case 'message':
      return <MessageSquare className="w-4 h-4 text-blue-500" />
    case 'template':
      return <MessageSquare className="w-4 h-4 text-green-500" />
    case 'delay':
      return <Clock className="w-4 h-4 text-orange-500" />
    case 'condition':
      return <GitBranch className="w-4 h-4 text-purple-500" />
  }
}

interface FlowTreeProps {
  nodeId?: string | null
  nodes: Record<string, FlowNode>
  onEdit: (id: string) => void
  onAdd: (parentId: string, branch: string) => void
  parentId: string
  branch: string
}

export function FlowTree({ nodeId, nodes, onEdit, onAdd, parentId, branch }: FlowTreeProps) {
  if (!nodeId || !nodes[nodeId]) {
    return (
      <div className="flex flex-col items-center py-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAdd(parentId, branch)
          }}
          className="w-8 h-8 rounded-full bg-background border shadow-sm text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const node = nodes[nodeId]

  return (
    <div className="flex flex-col items-center relative">
      {parentId !== 'root' && <div className="w-px h-8 bg-border" />}

      <div
        className="w-64 bg-card border-2 shadow-sm rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors z-10"
        style={{ borderColor: 'hsl(var(--border))' }}
        onClick={(e) => {
          e.stopPropagation()
          onEdit(node.id)
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-muted/50">{getTypeIcon(node.type)}</div>
          <span className="font-semibold text-sm truncate">{node.title}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
          {node.type === 'message'
            ? node.config.content || 'Nenhuma mensagem...'
            : node.type === 'trigger'
              ? 'Início do fluxo'
              : node.type === 'delay'
                ? `Aguardar ${node.config.amount || ''} ${node.config.unit || ''}`
                : node.type === 'condition'
                  ? `Se ${node.config.field || '...'} = ${node.config.value || '...'}`
                  : 'Configurar...'}
        </p>
      </div>

      {node.type === 'condition' ? (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="flex relative w-full pt-6 justify-center">
            <div className="absolute top-0 left-[25%] right-[25%] h-px bg-border" />
            <div className="absolute top-0 left-[25%] w-px h-6 bg-border" />
            <div className="absolute top-0 right-[25%] w-px h-6 bg-border" />

            <div className="flex flex-col items-center w-1/2 min-w-[240px]">
              <span className="text-[10px] font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full mb-2 z-10">
                SIM
              </span>
              <FlowTree
                nodeId={node.nextTrueId}
                nodes={nodes}
                onEdit={onEdit}
                onAdd={onAdd}
                parentId={node.id}
                branch="nextTrueId"
              />
            </div>
            <div className="flex flex-col items-center w-1/2 min-w-[240px]">
              <span className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full mb-2 z-10">
                NÃO
              </span>
              <FlowTree
                nodeId={node.nextFalseId}
                nodes={nodes}
                onEdit={onEdit}
                onAdd={onAdd}
                parentId={node.id}
                branch="nextFalseId"
              />
            </div>
          </div>
        </>
      ) : (
        <FlowTree
          nodeId={node.nextId}
          nodes={nodes}
          onEdit={onEdit}
          onAdd={onAdd}
          parentId={node.id}
          branch="nextId"
        />
      )}
    </div>
  )
}
