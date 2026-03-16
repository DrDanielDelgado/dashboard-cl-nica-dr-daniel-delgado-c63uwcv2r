import { useState } from 'react'
import { Flow } from '@/types/automation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Workflow, Settings2 } from 'lucide-react'
import { AutomationBuilder } from './automation/AutomationBuilder'
import { useAuditStore } from '@/stores/audit'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const INITIAL_FLOWS: Flow[] = [
  {
    id: 'f1',
    name: 'Boas-vindas Hub Social',
    isActive: true,
    triggerType: 'social_message',
    rootId: 'n1',
    nodes: {
      n1: {
        id: 'n1',
        type: 'trigger',
        title: 'Início de Conversa',
        config: { triggerType: 'social_message' },
        nextId: 'n2',
      },
      n2: {
        id: 'n2',
        type: 'message',
        title: 'Resposta Automática',
        config: {
          channel: 'instagram',
          content: 'Olá! Agradecemos o contato. Nossa equipe responderá em breve.',
        },
        nextId: null,
      },
    },
  },
]

export function Automation360Settings() {
  const [flows, setFlows] = useState<Flow[]>(INITIAL_FLOWS)
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null)
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')
  const { addLog } = useAuditStore()

  const handleCreateFlow = () => {
    if (!newFlowName) return
    const newId = Math.random().toString(36).substring(7)
    const rootId = `root_${newId}`
    const newFlow: Flow = {
      id: newId,
      name: newFlowName,
      isActive: false,
      triggerType: 'appointment_new',
      rootId,
      nodes: {
        [rootId]: {
          id: rootId,
          type: 'trigger',
          title: 'Gatilho Inicial',
          config: { triggerType: 'appointment_new' },
        },
      },
    }
    setFlows([...flows, newFlow])
    setIsNewDialogOpen(false)
    setNewFlowName('')
    setEditingFlowId(newId)
    addLog('Novo Fluxo Criado', `Automação 360: ${newFlowName}`)
  }

  const handleSaveFlow = (updatedFlow: Flow) => {
    setFlows(flows.map((f) => (f.id === updatedFlow.id ? updatedFlow : f)))
    setEditingFlowId(null)
    addLog('Fluxo Atualizado e Publicado', `Automação 360: ${updatedFlow.name}`)
  }

  const toggleFlow = (id: string, name: string, active: boolean) => {
    setFlows(flows.map((f) => (f.id === id ? { ...f, isActive: active } : f)))
    addLog(`Fluxo ${active ? 'Ativado' : 'Pausado'}`, `Automação 360: ${name}`)
  }

  if (editingFlowId) {
    const flowToEdit = flows.find((f) => f.id === editingFlowId)
    if (flowToEdit) {
      return (
        <AutomationBuilder
          flow={flowToEdit}
          onSave={handleSaveFlow}
          onBack={() => setEditingFlowId(null)}
        />
      )
    }
  }

  return (
    <Card className="animate-fade-in border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Workflow className="w-6 h-6 text-primary" /> Automações 360
            </CardTitle>
            <CardDescription>
              Crie fluxos visuais para interagir automaticamente com pacientes via WhatsApp,
              Instagram e Facebook.
            </CardDescription>
          </div>
          <Button onClick={() => setIsNewDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Criar Novo Fluxo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {flows.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
            <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg text-foreground mb-2">Nenhum fluxo criado</h3>
            <p className="max-w-sm mx-auto mb-6">
              Comece automatizando lembretes de consulta ou respostas rápidas do Instagram.
            </p>
            <Button onClick={() => setIsNewDialogOpen(true)}>Criar meu primeiro fluxo</Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.map((flow) => (
            <Card
              key={flow.id}
              className={`hover:shadow-md transition-shadow ${flow.isActive ? 'border-primary/30' : 'opacity-80'}`}
            >
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-lg leading-tight pr-4">{flow.name}</h4>
                  <Switch
                    checked={flow.isActive}
                    onCheckedChange={(v) => toggleFlow(flow.id, flow.name, v)}
                  />
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <Badge
                    variant={flow.isActive ? 'default' : 'secondary'}
                    className={flow.isActive ? 'bg-success hover:bg-success/90 text-white' : ''}
                  >
                    {flow.isActive ? 'Ativo' : 'Pausado'}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    {Object.keys(flow.nodes).length} Blocos
                  </span>
                </div>
                <div className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setEditingFlowId(flow.id)}
                  >
                    <Settings2 className="w-4 h-4 mr-2" /> Editar Fluxo Visual
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Fluxo de Automação</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Nome do Fluxo</Label>
            <Input
              className="mt-2"
              placeholder="Ex: Confirmação 24h WhatsApp"
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFlow} disabled={!newFlowName}>
              Continuar para o Construtor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
