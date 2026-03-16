import { useState } from 'react'
import { ArrowLeft, Play, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FlowTree } from './FlowTree'
import { AutomationConfigPanel } from './AutomationConfigPanel'
import { FlowNode } from '@/types/automation'

const MOCK_FLOW: FlowNode[] = [
  {
    id: 'n1',
    type: 'trigger',
    title: 'Lembrete de Consulta',
    description: 'Inicia 24 horas antes da data agendada no prontuário',
    status: 'active',
    children: [
      {
        id: 'n2',
        type: 'ab_test',
        title: 'Teste A/B de Abordagem',
        description: 'Distribui pacientes para avaliar melhor taxa de confirmação',
        children: [
          {
            id: 'n3',
            type: 'action',
            title: 'Mensagem Formal (A)',
            description: 'Olá {{nome}}. Confirmamos sua consulta com o Dr. Daniel...',
            config: { variant: 'A' },
          },
          {
            id: 'n4',
            type: 'action',
            title: 'Mensagem Casual (B)',
            description: 'Oi {{nome}}! Passando pra lembrar da nossa consulta...',
            config: { variant: 'B' },
          },
        ],
      },
    ],
  },
]

export function AutomationBuilder() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [nodes, setNodes] = useState<FlowNode[]>(MOCK_FLOW)

  const activeNode = activeNodeId ? findNode(nodes, activeNodeId) : null

  function findNode(nodesToSearch: FlowNode[], id: string): FlowNode | null {
    for (const node of nodesToSearch) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[600px] flex-col bg-slate-50/50 overflow-hidden rounded-xl border border-slate-200 shadow-elevation">
      {/* Topbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red text-white shadow-sm">
              <Workflow className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 leading-none">
                Confirmação de Consulta (Teste A/B)
              </h2>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <span className="text-[10px] font-medium uppercase text-slate-500 tracking-wider">
                  Publicado
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-brand-blue border-brand-blue/20 hover:bg-brand-blue/5 hover:text-brand-blue"
          >
            Modo de Teste
          </Button>
          <Button className="bg-brand-red hover:bg-brand-red/90 text-white shadow-md transition-transform active:scale-95">
            <Play className="mr-2 h-4 w-4 fill-current" />
            Publicar Alterações
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="relative flex-1 overflow-auto bg-grid-pattern cursor-grab active:cursor-grabbing">
          <FlowTree nodes={nodes} activeNodeId={activeNodeId} onSelectNode={setActiveNodeId} />
        </div>

        {/* Config Panel Right Sidebar */}
        {activeNodeId && (
          <AutomationConfigPanel
            node={activeNode}
            onClose={() => setActiveNodeId(null)}
            onSave={(updated) => {
              // Mock save interaction
              setActiveNodeId(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
