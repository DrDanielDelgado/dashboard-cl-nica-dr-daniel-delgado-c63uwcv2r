import { Play, MessageSquare, Clock, Filter, Plus, Settings2, Split } from 'lucide-react'
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
  ab_test: Split,
}

function FlowNodeComponent({
  node,
  activeNodeId,
  onSelectNode,
}: {
  node: FlowNode
  activeNodeId: string | null
  onSelectNode: (id: string) => void
}) {
  const Icon = iconMap[node.type] || Settings2
  const isActive = activeNodeId === node.id
  const hasChildren = node.children && node.children.length > 0
  const isBranching = hasChildren && node.children!.length > 1

  return (
    <div className="relative flex flex-col items-center animate-fade-in-up">
      {/* Node Card */}
      <div
        className={cn(
          'group relative z-10 flex w-64 cursor-pointer flex-col rounded-xl border-2 bg-white p-4 text-left transition-all duration-200 shadow-elevation',
          isActive
            ? 'border-brand-red ring-4 ring-brand-red/10 scale-105'
            : 'border-brand-blue/10 hover:border-brand-blue/40',
        )}
        onClick={() => onSelectNode(node.id)}
      >
        <div className="mb-3 flex items-center justify-between">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              node.type === 'trigger'
                ? 'bg-brand-blue text-white shadow-md'
                : node.type === 'ab_test'
                  ? 'bg-purple-100 text-purple-600'
                  : isActive
                    ? 'bg-brand-red/10 text-brand-red'
                    : 'bg-slate-100 text-slate-500 group-hover:text-brand-blue',
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {node.type === 'ab_test' && (
            <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              A/B
            </span>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 leading-tight">{node.title}</h4>
          {node.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{node.description}</p>
          )}
        </div>

        {node.status === 'active' && (
          <div className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </div>
        )}
      </div>

      {/* Connection & Children */}
      {hasChildren && (
        <div className="flex flex-col items-center w-full">
          {/* Main vertical drop */}
          <div className="relative flex h-12 w-full justify-center">
            <div className="w-0.5 h-full bg-brand-blue/20" />
            {!isBranching && (
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 -translate-y-1/2 z-20 h-6 w-6 rounded-full border-brand-blue/30 bg-white text-brand-blue shadow-sm hover:border-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Branches layout */}
          {isBranching ? (
            <div className="relative flex gap-12 pt-0">
              {/* Horizontal line connecting branches */}
              <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-brand-blue/20" />

              {node.children!.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center pt-6">
                  {/* Vertical drop to child from horizontal line */}
                  <div className="absolute top-0 w-0.5 h-6 bg-brand-blue/20" />
                  {/* Path Labels for A/B Test */}
                  {node.type === 'ab_test' && child.config?.variant && (
                    <span className="absolute top-1 bg-white px-2 text-[10px] font-bold text-slate-400 border rounded-full z-10">
                      {child.config.variant === 'A' ? '50%' : '50%'}
                    </span>
                  )}
                  <FlowNodeComponent
                    node={child}
                    activeNodeId={activeNodeId}
                    onSelectNode={onSelectNode}
                  />
                </div>
              ))}
            </div>
          ) : (
            <FlowNodeComponent
              node={node.children![0]}
              activeNodeId={activeNodeId}
              onSelectNode={onSelectNode}
            />
          )}
        </div>
      )}
    </div>
  )
}

export function FlowTree({ nodes, activeNodeId, onSelectNode }: FlowTreeProps) {
  if (!nodes || nodes.length === 0) return null

  return (
    <div className="flex min-w-max flex-col items-center py-12 px-24">
      {nodes.map((node) => (
        <FlowNodeComponent
          key={node.id}
          node={node}
          activeNodeId={activeNodeId}
          onSelectNode={onSelectNode}
        />
      ))}
    </div>
  )
}
