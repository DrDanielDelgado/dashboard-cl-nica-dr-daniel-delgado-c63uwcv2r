import { Play, MessageSquare, Clock, Filter, Plus, Settings2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FlowNode } from '@/types/automation'

interface FlowTreeProps {
  nodes: FlowNode[]
  activeNodeId: string | null
  onSelectNode: (nodeId: string) => void
}

const iconMap = {
  trigger: Play,
  action: MessageSquare,
  condition: Filter,
  delay: Clock,
}

function FlowNodeComponent({
  node,
  activeNodeId,
  onSelectNode,
  isLast = false,
}: {
  node: FlowNode
  activeNodeId: string | null
  onSelectNode: (id: string) => void
  isLast?: boolean
}) {
  const Icon = iconMap[node.type] || Settings2
  const isActive = activeNodeId === node.id

  return (
    <div className="relative flex flex-col items-center animate-fade-in-up">
      {/* Node Card */}
      <div
        className={cn(
          'group relative z-10 flex w-64 cursor-pointer flex-col rounded-xl border-2 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md',
          isActive
            ? 'border-brand-red shadow-md ring-4 ring-brand-red/10'
            : 'border-brand-blue/20 hover:border-brand-blue/50',
        )}
        onClick={() => onSelectNode(node.id)}
      >
        <div className="mb-3 flex items-center justify-between">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              node.type === 'trigger'
                ? 'bg-brand-blue text-white'
                : isActive
                  ? 'bg-brand-red/10 text-brand-red'
                  : 'bg-brand-blue/10 text-brand-blue',
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900">{node.title}</h4>
          {node.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{node.description}</p>
          )}
        </div>

        {/* Status Indicator */}
        {node.status === 'active' && (
          <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        )}
      </div>

      {/* Connection Line */}
      {!isLast && (
        <div className="flex h-12 w-full flex-col items-center justify-center">
          <div className="h-full w-0.5 bg-brand-blue/20" />
          <Button
            variant="outline"
            size="icon"
            className="absolute z-20 h-6 w-6 rounded-full border-brand-blue/30 bg-white text-brand-blue shadow-sm hover:border-brand-blue hover:bg-brand-blue hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Children Recursion */}
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center">
          {node.children.map((child, index) => (
            <FlowNodeComponent
              key={child.id}
              node={child}
              activeNodeId={activeNodeId}
              onSelectNode={onSelectNode}
              isLast={index === (node.children?.length ?? 0) - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FlowTree({ nodes, activeNodeId, onSelectNode }: FlowTreeProps) {
  if (!nodes || nodes.length === 0) return null

  return (
    <div className="flex min-w-max flex-col items-center py-8">
      {nodes.map((node, index) => (
        <FlowNodeComponent
          key={node.id}
          node={node}
          activeNodeId={activeNodeId}
          onSelectNode={onSelectNode}
          isLast={index === nodes.length - 1}
        />
      ))}
    </div>
  )
}
