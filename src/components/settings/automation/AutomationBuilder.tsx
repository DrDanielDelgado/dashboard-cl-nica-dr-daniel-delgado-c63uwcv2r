import { useState } from 'react'
import { Flow, FlowNode, NodeType } from '@/types/automation'
import { Button } from '@/components/ui/button'
import { FlowTree } from './FlowTree'
import { AutomationConfigPanel } from './AutomationConfigPanel'
import { Save, ArrowLeft, MessageSquare, Clock, GitBranch, Shuffle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface BuilderProps {
  flow: Flow
  onSave: (f: Flow) => void
  onBack: () => void
}

export function AutomationBuilder({ flow, onSave, onBack }: BuilderProps) {
  const [nodes, setNodes] = useState<Record<string, FlowNode>>(flow.nodes)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [addNodeContext, setAddNodeContext] = useState<{ parentId: string; branch: string } | null>(
    null,
  )

  const handleAddBlock = (type: NodeType) => {
    if (!addNodeContext) return
    const newId = Math.random().toString(36).substring(7)

    let title = 'Novo Bloco'
    if (type === 'message') title = 'Enviar Mensagem'
    if (type === 'template') title = 'Template WhatsApp'
    if (type === 'delay') title = 'Aguardar (Delay)'
    if (type === 'condition') title = 'Condição (If/Else)'
    if (type === 'ab_test') title = 'Teste A/B'

    const newNode: FlowNode = { id: newId, type, title, config: {} }
    const { parentId, branch } = addNodeContext
    const parent = nodes[parentId]
    const existingChildId = (parent as any)[branch]

    if (existingChildId) {
      if (type === 'condition' || type === 'ab_test') {
        newNode.nextTrueId = existingChildId
      } else {
        newNode.nextId = existingChildId
      }
    }

    setNodes((prev) => ({
      ...prev,
      [newId]: newNode,
      [parentId]: { ...prev[parentId], [branch]: newId },
    }))

    setAddNodeContext(null)
    setEditingNodeId(newId)
  }

  const handleDeleteNode = (id: string) => {
    const newNodes = { ...nodes }
    for (const key in newNodes) {
      const n = newNodes[key]
      if (n.nextId === id) n.nextId = null
      if (n.nextTrueId === id) n.nextTrueId = null
      if (n.nextFalseId === id) n.nextFalseId = null
    }
    delete newNodes[id]
    setNodes(newNodes)
    setEditingNodeId(null)
  }

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] border rounded-xl overflow-hidden bg-dot-pattern animate-fade-in relative shadow-inner">
      <div className="flex items-center justify-between p-4 border-b bg-background shadow-sm z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h3 className="font-bold text-lg leading-none">{flow.name}</h3>
            <span className="text-xs text-muted-foreground">Construtor Visual de Automação</span>
          </div>
        </div>
        <Button onClick={() => onSave({ ...flow, nodes })}>
          <Save className="w-4 h-4 mr-2" /> Salvar Fluxo
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-8 relative bg-muted/5">
        <div className="flex justify-center min-w-max pb-48 pt-8">
          <FlowTree
            nodeId={flow.rootId}
            nodes={nodes}
            onEdit={setEditingNodeId}
            onAdd={(p, b) => setAddNodeContext({ parentId: p, branch: b })}
            parentId="root"
            branch="root"
          />
        </div>
      </div>

      <Dialog open={!!addNodeContext} onOpenChange={(o) => !o && setAddNodeContext(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Bloco</DialogTitle>
            <DialogDescription>
              Escolha o tipo de ação ou lógica para inserir no fluxo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2 border-blue-200 hover:border-blue-500"
              onClick={() => handleAddBlock('template')}
            >
              <MessageSquare className="w-6 h-6 text-blue-600" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2 border-orange-200 hover:border-orange-500"
              onClick={() => handleAddBlock('delay')}
            >
              <Clock className="w-6 h-6 text-orange-500" /> Aguardar
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2 border-amber-200 hover:border-amber-500"
              onClick={() => handleAddBlock('condition')}
            >
              <GitBranch className="w-6 h-6 text-amber-500" /> Condição
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50"
              onClick={() => handleAddBlock('ab_test')}
            >
              <Shuffle className="w-6 h-6 text-purple-500" /> Teste A/B
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {editingNodeId && nodes[editingNodeId] && (
        <AutomationConfigPanel
          node={nodes[editingNodeId]}
          onClose={() => setEditingNodeId(null)}
          onUpdate={(n) => setNodes((p) => ({ ...p, [n.id]: n }))}
          onDelete={() => handleDeleteNode(editingNodeId)}
        />
      )}
    </div>
  )
}
