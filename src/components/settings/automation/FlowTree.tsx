import { FlowNode, NodeType } from '@/types/automation'
import { Plus, MessageSquare, Clock, GitBranch, Zap } from 'lucide-react'

const getVisuals = (type: NodeType) => {
  switch (type) {
    case 'trigger':
      return {
        icon: <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        classes:
          'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100',
      }
    case 'message':
      return {
        icon: <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        classes:
          'border-blue-500 bg-blue-50/90 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100',
      }
    case 'template':
      return {
        icon: <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        classes:
          'border-blue-500 bg-blue-50/90 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100',
      }
    case 'delay':
      return {
        icon: <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
        classes:
          'border-orange-500 bg-orange-50/90 dark:bg-orange-950/40 text-orange-900 dark:text-orange-100',
      }
    case 'condition':
      return {
        icon: <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        classes:
          'border-amber-500 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100',
      }
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
      <div className="flex flex-col items-center py-1 z-10 group">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAdd(parentId, branch)
          }}
          className="w-8 h-8 rounded-full bg-background border-2 border-dashed border-muted-foreground/40 shadow-sm text-muted-foreground group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 flex items-center justify-center transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const node = nodes[nodeId]
  const visuals = getVisuals(node.type)

  return (
    <div className="flex flex-col items-center relative">
      {parentId !== 'root' && <div className="w-0.5 h-8 bg-muted-foreground/30" />}

      <div
        className={`w-64 border-l-4 border-y border-r shadow-md rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all duration-200 z-10 ${visuals.classes}`}
        onClick={(e) => {
          e.stopPropagation()
          onEdit(node.id)
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 rounded-md bg-background/50 shadow-sm">{visuals.icon}</div>
          <span className="font-semibold text-sm truncate">{node.title}</span>
        </div>
        <p className="text-xs opacity-80 line-clamp-2 min-h-[32px] leading-relaxed">
          {node.type === 'message' || node.type === 'template'
            ? node.config.content || 'Nenhuma mensagem configurada...'
            : node.type === 'trigger'
              ? 'Início do fluxo de automação'
              : node.type === 'delay'
                ? `Aguardar ${node.config.amount || '0'} ${node.config.unit || 'minutos'}`
                : node.type === 'condition'
                  ? `Se ${node.config.field || '...'} ${node.config.operator === 'contains' ? 'contém' : '='} ${node.config.value || '...'}`
                  : 'Configurar bloco...'}
        </p>
      </div>

      {node.type === 'condition' ? (
        <>
          <div className="w-0.5 h-6 bg-muted-foreground/30" />
          <div className="flex relative w-full pt-6 justify-center">
            {/* Horizontal connection line */}
            <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-muted-foreground/30" />
            {/* Vertical drop lines */}
            <div className="absolute top-0 left-[25%] w-0.5 h-6 bg-muted-foreground/30" />
            <div className="absolute top-0 right-[25%] w-0.5 h-6 bg-muted-foreground/30" />

            <div className="flex flex-col items-center w-1/2 min-w-[240px]">
              <span className="text-[10px] font-bold text-success bg-success/10 border border-success/20 px-3 py-1 rounded-full mb-2 z-10 shadow-sm">
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
              <span className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-3 py-1 rounded-full mb-2 z-10 shadow-sm">
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
