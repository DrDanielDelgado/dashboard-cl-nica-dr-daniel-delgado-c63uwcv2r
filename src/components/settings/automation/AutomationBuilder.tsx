import { useState } from 'react'
import { Flow, FlowNode, NodeType } from '@/types/automation'
import { Button } from '@/components/ui/button'
import { FlowTree } from './FlowTree'
import { AutomationConfigPanel } from './AutomationConfigPanel'
import { Save, ArrowLeft, MessageSquare, Clock, GitBranch } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
    if (type === 'delay') title = 'Aguardar'
    if (type === 'condition') title = 'Condição'

    const newNode: FlowNode = { id: newId, type, title, config: {} }
    const { parentId, branch } = addNodeContext
    const parent = nodes[parentId]

    const existingChildId = (parent as any)[branch]
    if (existingChildId) {
      if (type === 'condition') {
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
    <div className="flex flex-col h-[75vh] min-h-[600px] border rounded-xl overflow-hidden bg-muted/10 animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b bg-background shadow-sm z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h3 className="font-bold text-lg leading-none">{flow.name}</h3>
            <span className="text-xs text-muted-foreground">Construtor Visual 360</span>
          </div>
        </div>
        <Button onClick={() => onSave({ ...flow, nodes })}>
          <Save className="w-4 h-4 mr-2" /> Publicar Fluxo
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-8 relative">
        <div className="flex justify-center min-w-max pb-32 pt-8">
          <FlowTree
            nodeId={flow.rootId}
            nodes={nodes}
            onEdit={setEditingNodeId}
            onAdd={(p: string, b: string) => setAddNodeContext({ parentId: p, branch: b })}
            parentId="root"
            branch="root"
          />
        </div>
      </div>

      <Dialog open={!!addNodeContext} onOpenChange={(o) => !o && setAddNodeContext(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Adicionar Bloco</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => handleAddBlock('message')}
            >
              <MessageSquare className="w-6 h-6 text-blue-500" />
              Mensagem
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => handleAddBlock('template')}
            >
              <MessageSquare className="w-6 h-6 text-green-500" />
              Template (WhatsApp)
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => handleAddBlock('delay')}
            >
              <Clock className="w-6 h-6 text-orange-500" />
              Aguardar
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => handleAddBlock('condition')}
            >
              <GitBranch className="w-6 h-6 text-purple-500" />
              Condição (Filtro)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {editingNodeId && nodes[editingNodeId] && (
        <AutomationConfigPanel
          node={nodes[editingNodeId]}
          onClose={() => setEditingNodeId(null)}
          onUpdate={(n: FlowNode) => setNodes((p) => ({ ...p, [n.id]: n }))}
          onDelete={() => handleDeleteNode(editingNodeId)}
        />
      )}
    </div>
  )
}
