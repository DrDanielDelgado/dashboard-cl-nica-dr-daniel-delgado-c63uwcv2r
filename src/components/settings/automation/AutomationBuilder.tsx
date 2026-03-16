import { useState } from 'react'
import { ArrowLeft, Play, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FlowTree } from './FlowTree'
import { AutomationConfigPanel } from './AutomationConfigPanel'
import { FlowNode } from '@/types/automation'

const MOCK_FLOW: FlowNode[] = [
  {
    id: '1',
    type: 'trigger',
    title: 'Novo Paciente Cadastrado',
    description: 'Inicia quando um paciente é adicionado ao sistema',
    status: 'active',
    children: [
      {
        id: '2',
        type: 'delay',
        title: 'Aguardar 1 dia',
        description: 'Espera 24 horas após o cadastro',
        children: [
          {
            id: '3',
            type: 'action',
            title: 'Enviar Mensagem de Boas-vindas',
            description: 'Envia WhatsApp com instruções da clínica',
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

  // Helper to deep find a node
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
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      {/* Topbar */}
      <div className="flex h-14 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-brand-blue">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-red text-white">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Boas-vindas Paciente</h2>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <span className="text-xs text-slate-500">Ativo</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-brand-blue border-brand-blue/30 hover:bg-brand-blue/5"
          >
            Testar Fluxo
          </Button>
          <Button className="bg-brand-red hover:bg-brand-red/90 text-white shadow-sm">
            <Play className="mr-2 h-4 w-4" />
            Publicar Alterações
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="relative flex-1 overflow-auto bg-grid-pattern">
          <FlowTree nodes={nodes} activeNodeId={activeNodeId} onSelectNode={setActiveNodeId} />
        </div>

        {/* Config Panel Right Sidebar */}
        {activeNodeId && (
          <AutomationConfigPanel
            node={activeNode}
            onClose={() => setActiveNodeId(null)}
            onSave={() => setActiveNodeId(null)}
          />
        )}
      </div>
    </div>
  )
}
