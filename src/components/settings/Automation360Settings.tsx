import { useState, useEffect } from 'react'
import { Flow } from '@/types/automation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Workflow, Settings2, Copy, Trash2, TrendingUp } from 'lucide-react'
import { AutomationBuilder } from './automation/AutomationBuilder'
import { PerformanceDashboard } from './automation/PerformanceDashboard'
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

const loadFlows = (): Flow[] => {
  try {
    const stored = localStorage.getItem('@db_flows')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function Automation360Settings() {
  const [flows, setFlows] = useState<Flow[]>(loadFlows)
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null)
  const [dashboardOpenId, setDashboardOpenId] = useState<string | null>(null)
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')
  const { addLog } = useAuditStore()

  useEffect(() => {
    localStorage.setItem('@db_flows', JSON.stringify(flows))
  }, [flows])

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

  const duplicateFlow = (id: string) => {
    const flow = flows.find((f) => f.id === id)
    if (!flow) return
    const newFlow = {
      ...flow,
      id: Math.random().toString(36).substring(7),
      name: `${flow.name} (Cópia)`,
      isActive: false,
    }
    setFlows([...flows, newFlow])
    addLog('Fluxo Duplicado', `Automação 360: ${newFlow.name}`)
  }

  const deleteFlow = (id: string) => {
    setFlows(flows.filter((f) => f.id !== id))
    addLog('Fluxo Excluído', `Automação 360`)
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:flex-wrap gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Workflow className="w-6 h-6 text-primary" /> Automações 360
            </CardTitle>
            <CardDescription>
              Crie fluxos visuais e realize Testes A/B para interagir automaticamente com pacientes.
            </CardDescription>
          </div>
          <Button onClick={() => setIsNewDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Criar Novo Fluxo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {flows.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed rounded-xl bg-muted/10">
            <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg text-foreground mb-2">Nenhum fluxo criado</h3>
            <p className="max-w-sm mx-auto mb-6 text-muted-foreground">
              Comece automatizando lembretes de consulta ou respostas rápidas para seus pacientes.
            </p>
            <Button onClick={() => setIsNewDialogOpen(true)}>Criar meu primeiro fluxo</Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          {flows.map((flow) => (
            <Card
              key={flow.id}
              className={`transition-all duration-300 hover:shadow-md ${flow.isActive ? 'border-primary/30' : 'opacity-80'} ${dashboardOpenId === flow.id ? 'md:col-span-2 lg:col-span-3 row-span-2 ring-1 ring-primary/20' : ''}`}
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
                  {flow.metrics?.abTest && (
                    <Badge
                      variant="outline"
                      className="border-purple-300 text-purple-700 bg-purple-50"
                    >
                      A/B Test
                    </Badge>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    onClick={() => setEditingFlowId(flow.id)}
                  >
                    <Settings2 className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant={dashboardOpenId === flow.id ? 'default' : 'outline'}
                    className="flex-1 min-w-[140px]"
                    onClick={() => setDashboardOpenId(dashboardOpenId === flow.id ? null : flow.id)}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" /> Desempenho
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => duplicateFlow(flow.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteFlow(flow.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {dashboardOpenId === flow.id && (
                  <div className="mt-6 pt-6 border-t animate-fade-in-down w-full">
                    <PerformanceDashboard flow={flow} />
                  </div>
                )}
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
          <div className="py-4 space-y-2">
            <Label>Nome do Fluxo</Label>
            <Input
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
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
