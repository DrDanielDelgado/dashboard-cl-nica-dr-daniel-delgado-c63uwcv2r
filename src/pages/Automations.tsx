import { useState, useEffect } from 'react'
import {
  Megaphone,
  Zap,
  Mail,
  MessageSquare,
  Bell,
  Clock,
  Play,
  Plus,
  Sparkles,
  ShieldCheck,
  Workflow,
  Copy,
  Trash2,
  Settings2,
  RefreshCw,
  Users,
  Activity,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  AutomationFlowRecord,
  AutomationFlowRunRecord,
  AutomationEventRecord,
  getAutomationFlows,
  createAutomationFlow,
  updateAutomationFlow,
  deleteAutomationFlow,
  getFlowRuns,
  getAutomationEvents,
} from '@/services/automation'
import { VisualFlowBuilder } from '@/components/settings/automation/VisualFlowBuilder'
import { TestFlowModal } from '@/components/settings/automation/TestFlowModal'
import { CustomEventsTab } from '@/components/settings/automation/CustomEventsTab'
import { FlowRunsLogTab } from '@/components/settings/automation/FlowRunsLogTab'

export default function Automations() {
  const { toast } = useToast()
  const [flows, setFlows] = useState<AutomationFlowRecord[]>([])
  const [runs, setRuns] = useState<AutomationFlowRunRecord[]>([])
  const [events, setEvents] = useState<AutomationEventRecord[]>([])
  const [patients, setPatients] = useState<
    Array<{ id: string; name: string; phone?: string; email?: string }>
  >([])
  const [loading, setLoading] = useState(false)
  const [triggeringCron, setTriggeringCron] = useState(false)

  // Builder mode
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null)

  // Modais
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')
  const [newFlowTrigger, setNewFlowTrigger] = useState<any>('contact_created')
  const [testingFlow, setTestingFlow] = useState<AutomationFlowRecord | null>(null)

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [loadedFlows, loadedRuns, loadedEvents] = await Promise.all([
        getAutomationFlows(),
        getFlowRuns(),
        getAutomationEvents(),
      ])
      setFlows(loadedFlows)
      setRuns(loadedRuns)
      setEvents(loadedEvents)

      // Carregar pacientes reais para os testes
      try {
        const pList = await pb.collection('patients').getList(1, 100, { sort: 'name' })
        setPatients(
          pList.items.map((p) => ({
            id: p.id,
            name: p.getString('name'),
            phone: p.getString('phone'),
            email: p.getString('email'),
          })),
        )
      } catch {
        /* intentionally ignored */
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados de automação:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) return
    try {
      const created = await createAutomationFlow({
        name: newFlowName,
        trigger_type: newFlowTrigger,
        status: 'draft',
      })
      toast({
        title: 'Novo Fluxo Criado',
        description: `O fluxo "${created.name}" foi inicializado. Abrindo construtor visual...`,
      })
      setFlows([created, ...flows])
      setIsNewDialogOpen(false)
      setNewFlowName('')
      setEditingFlowId(created.id)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar fluxo',
        description: err.message,
      })
    }
  }

  const handleToggleFlow = async (flow: AutomationFlowRecord, active: boolean) => {
    const newStatus = active ? 'active' : 'paused'
    try {
      const updated = await updateAutomationFlow(flow.id, { status: newStatus })
      setFlows(flows.map((f) => (f.id === flow.id ? updated : f)))
      toast({
        title: `Fluxo ${active ? 'Ativado' : 'Pausado'}`,
        description: `O fluxo "${flow.name}" agora está ${active ? 'ativo para novos contatos' : 'pausado'}.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: err.message,
      })
    }
  }

  const handleDeleteFlow = async (id: string, name: string) => {
    try {
      await deleteAutomationFlow(id)
      setFlows(flows.filter((f) => f.id !== id))
      toast({
        title: 'Fluxo Excluído',
        description: `O fluxo "${name}" foi removido com sucesso.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir fluxo',
        description: err.message,
      })
    }
  }

  const handleDuplicateFlow = async (flow: AutomationFlowRecord) => {
    try {
      const dup = await createAutomationFlow({
        name: `${flow.name} (Cópia)`,
        description: flow.description,
        status: 'draft',
        trigger_type: flow.trigger_type,
        trigger_config: flow.trigger_config,
        definition: flow.definition,
      })
      setFlows([dup, ...flows])
      toast({
        title: 'Fluxo Duplicado',
        description: `Criada cópia de "${flow.name}".`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao duplicar',
        description: err.message,
      })
    }
  }

  const handleTriggerDailyCron = async () => {
    setTriggeringCron(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/marketing/automation/trigger-now`,
        {
          method: 'POST',
          headers: {
            Authorization: pb.authStore.token,
          },
        },
      )
      const data = await res.json()
      toast({
        title: 'Ciclo Diário Executado!',
        description: data.message || 'Lembretes, e-mails de aniversário e push disparados.',
      })
      loadAllData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao rodar automação',
        description: err.message,
      })
    } finally {
      setTriggeringCron(false)
    }
  }

  // Se estiver editando um fluxo, renderiza o Construtor Visual completo
  if (editingFlowId) {
    const flowToEdit = flows.find((f) => f.id === editingFlowId)
    if (flowToEdit) {
      return (
        <VisualFlowBuilder
          flow={flowToEdit}
          onBack={() => setEditingFlowId(null)}
          onSaveSuccess={(updated) => {
            setFlows(flows.map((f) => (f.id === updated.id ? updated : f)))
          }}
          onOpenTestModal={(f) => setTestingFlow(f)}
        />
      )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-brand-red" />
            Central de Automações & Fluxos 360
          </h1>
          <p className="text-muted-foreground mt-1">
            Construtor de fluxos automatizados nativo no estilo SendPulse 360. WhatsApp Cloud API,
            E-mail Marketing, Web Push e Agente IA unificados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadAllData}
            disabled={loading}
            className="gap-2 text-slate-600"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            onClick={handleTriggerDailyCron}
            disabled={triggeringCron}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-md gap-2"
          >
            <Play className={`h-4 w-4 ${triggeringCron ? 'animate-spin' : ''}`} />
            {triggeringCron ? 'Executando...' : 'Executar Automações Diárias'}
          </Button>

          <Button
            onClick={() => setIsNewDialogOpen(true)}
            className="bg-brand-red hover:bg-brand-red/90 text-white shadow-md gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Novo Fluxo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="flows" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-xl grid-cols-3 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger
            value="flows"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-medium"
          >
            Meus Fluxos ({flows.length})
          </TabsTrigger>
          <TabsTrigger
            value="runs"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-medium"
          >
            Execuções ({runs.length})
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-medium"
          >
            Eventos Personalizados
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MEUS FLUXOS */}
        <TabsContent value="flows" className="space-y-6 m-0 focus-visible:outline-none">
          {/* Se não houver fluxos */}
          {flows.length === 0 && !loading && (
            <Card className="text-center p-12 border-2 border-dashed rounded-2xl bg-muted/10">
              <Workflow className="w-12 h-12 mx-auto mb-4 text-brand-blue/50" />
              <h3 className="font-semibold text-lg text-slate-800 mb-1">
                Nenhum fluxo automatizado criado ainda
              </h3>
              <p className="max-w-md mx-auto mb-6 text-sm text-muted-foreground">
                Crie seu primeiro fluxo estilo SendPulse 360 com disparos em múltiplos canais
                (WhatsApp, E-mail, Web Push, IA e Pipeline).
              </p>
              <Button
                onClick={() => setIsNewDialogOpen(true)}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white gap-2"
              >
                <Plus className="h-4 w-4" /> Criar Meu Primeiro Fluxo
              </Button>
            </Card>
          )}

          {/* Cards de Fluxos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {flows.map((flow) => {
              const nodesCount = flow.definition?.nodes?.length || 0
              const isActive = flow.status === 'active'

              return (
                <Card
                  key={flow.id}
                  className={`transition-all duration-200 hover:shadow-md border ${
                    isActive ? 'border-primary/40 shadow-sm' : 'border-slate-200 opacity-90'
                  }`}
                >
                  <CardContent className="p-5 flex flex-col h-full space-y-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base text-slate-900 leading-snug truncate">
                          {flow.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {flow.description || 'Fluxo multicanal automatizado'}
                        </p>
                      </div>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => handleToggleFlow(flow, checked)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className={
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {isActive ? 'Ativo' : flow.status === 'paused' ? 'Pausado' : 'Rascunho'}
                      </Badge>

                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {nodesCount} Blocos
                      </Badge>

                      <Badge variant="outline" className="text-slate-600 border-slate-200">
                        Gatilho: {flow.trigger_type}
                      </Badge>
                    </div>

                    {/* Estatísticas de Entrada / Conclusão */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Total Entradas
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {flow.total_entered || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Concluídos</span>
                        <span className="font-bold text-emerald-600 text-sm">
                          {flow.total_completed || 0}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="pt-2 mt-auto border-t flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFlowId(flow.id)}
                        className="flex-1 text-xs gap-1.5 text-brand-blue border-brand-blue/30 hover:bg-brand-blue/10"
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Editar Visual
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestingFlow(flow)}
                        className="text-xs gap-1 text-slate-700"
                      >
                        <Play className="h-3.5 w-3.5" /> Testar
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateFlow(flow)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-700"
                        title="Duplicar Fluxo"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFlow(flow.id, flow.name)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                        title="Excluir Fluxo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Banner de Canais Nativos Integrados */}
          <div className="grid lg:grid-cols-4 gap-4 mt-8">
            <Card className="bg-emerald-50/50 border-emerald-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">WhatsApp Cloud API</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Templates e confirmações oficiais Meta integrados.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-sky-50/50 border-sky-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">E-mail Marketing</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Layout da clínica com substituição de variáveis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50/50 border-amber-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">Web Push Notifications</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Disparo instantâneo para navegadores e celulares.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50/50 border-purple-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">Agente IA Nativo</h4>
                  <p className="text-[11px] text-muted-foreground">
                    clinica-daniel-delgado gerando respostas contextuais.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: EXECUÇÕES (RUNS LOG) */}
        <TabsContent value="runs" className="m-0 focus-visible:outline-none">
          <FlowRunsLogTab runs={runs} loading={loading} onRefresh={loadAllData} />
        </TabsContent>

        {/* TAB 3: EVENTOS PERSONALIZADOS */}
        <TabsContent value="events" className="m-0 focus-visible:outline-none">
          <CustomEventsTab events={events} onRefresh={loadAllData} />
        </TabsContent>
      </Tabs>

      {/* Dialog: Criar Novo Fluxo */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-brand-red" />
              Novo Fluxo Automatizado
            </DialogTitle>
            <DialogDescription>
              Defina o nome e o evento disparador inicial do seu fluxo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nome do Fluxo</Label>
              <Input
                placeholder="Ex: Régua de Boas-Vindas para Novos Pacientes"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Evento Gatilho (Trigger)</Label>
              <Select value={newFlowTrigger} onValueChange={setNewFlowTrigger}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact_created">
                    Novo Contato Criado (Paciente / Lead)
                  </SelectItem>
                  <SelectItem value="birthday">Aniversário do Paciente</SelectItem>
                  <SelectItem value="deal_stage_changed">
                    Mudança de Etapa no Pipeline CRM
                  </SelectItem>
                  <SelectItem value="custom_event">Evento Personalizado (API/Site)</SelectItem>
                  <SelectItem value="contact_webhook">Webhook de Contato</SelectItem>
                  <SelectItem value="manual">Manual / Teste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFlow}
              disabled={!newFlowName.trim()}
              className="bg-brand-red hover:bg-brand-red/90 text-white"
            >
              Abrir Construtor Visual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Teste com Contato */}
      <TestFlowModal
        flow={testingFlow}
        isOpen={!!testingFlow}
        onClose={() => setTestingFlow(null)}
        patients={patients}
      />
    </div>
  )
}
