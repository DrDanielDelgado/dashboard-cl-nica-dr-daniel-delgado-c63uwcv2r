import { useState, useEffect } from 'react'
import {
  KeyRound,
  ShieldCheck,
  Webhook,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  PowerOff,
  Activity,
  Code2,
  Terminal,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  Clock,
  Layers,
  Database,
  AlertCircle,
  FileText,
} from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

import {
  getDashboardApiKey,
  regenerateDashboardApiKey,
  getPartnerApiKeys,
  createPartnerApiKey,
  updatePartnerApiKey,
  revokePartnerApiKey,
  deletePartnerApiKey,
  getPartnerApiLogs,
  maskKey,
  ApiKeyRecord,
  PartnerApiKeyRecord,
  PartnerApiLogRecord,
  PartnerPermissions,
  DEFAULT_PARTNER_PERMISSIONS,
} from '@/services/apiConnections'

export default function ConexoesApi() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'partners' | 'logs'>('dashboard')

  // Estado Chave Dashboard
  const [dashboardKey, setDashboardKey] = useState<ApiKeyRecord | null>(null)
  const [isLoadingKey, setIsLoadingKey] = useState(false)
  const [isRevealedKey, setIsRevealedKey] = useState(false)
  const [isRegenerateAlertOpen, setIsRegenerateAlertOpen] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Estado Parceiros
  const [partners, setPartners] = useState<PartnerApiKeyRecord[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(false)
  const [isCreatePartnerOpen, setIsCreatePartnerOpen] = useState(false)
  const [isCreatingPartner, setIsCreatingPartner] = useState(false)
  const [newPartnerName, setNewPartnerName] = useState('')
  const [newPartnerDesc, setNewPartnerDesc] = useState('')
  const [newPartnerPermissions, setNewPartnerPermissions] = useState<PartnerPermissions>({
    ...DEFAULT_PARTNER_PERMISSIONS,
  })

  // Modal com a chave gerada de exibição única
  const [createdSecretModal, setCreatedSecretModal] = useState<{
    open: boolean
    name: string
    key: string
  }>({
    open: false,
    name: '',
    key: '',
  })

  // Estado Logs
  const [logs, setLogs] = useState<PartnerApiLogRecord[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>('all')

  // Copiado states para feedback visual
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const publicApiBase = 'https://dashboard-clinica-integrada-5c3b1.goskip.app/api'
  const partnerGatewayBase =
    'https://dashboard-clinica-integrada-5c3b1.shrd03.internal.goskip.dev/backend/v1/partner-api'

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardKey()
    loadPartners()
    loadLogs()
  }, [])

  async function loadDashboardKey() {
    setIsLoadingKey(true)
    try {
      const data = await getDashboardApiKey()
      setDashboardKey(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar chave do Dashboard',
        description: 'Não foi possível carregar a chave de serviço da API.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingKey(false)
    }
  }

  async function loadPartners() {
    setIsLoadingPartners(true)
    try {
      const data = await getPartnerApiKeys()
      setPartners(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar parceiros',
        description: 'Não foi possível carregar a lista de acessos compartilhados.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingPartners(false)
    }
  }

  async function loadLogs(filterPartner?: string) {
    setIsLoadingLogs(true)
    try {
      const pId = filterPartner !== undefined ? filterPartner : selectedPartnerFilter
      const data = await getPartnerApiLogs(100, pId)
      setLogs(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar logs',
        description: 'Não foi possível carregar o histórico de chamadas de API.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingLogs(false)
    }
  }

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(label)
    toast({
      title: 'Copiado para a área de transferência',
      description: `${label} copiado com sucesso.`,
    })
    setTimeout(() => {
      setCopiedKey((prev) => (prev === label ? null : prev))
    }, 2500)
  }

  async function handleConfirmRegenerateKey() {
    if (!dashboardKey) return
    setIsRegenerating(true)
    try {
      const updated = await regenerateDashboardApiKey(dashboardKey.id)
      setDashboardKey(updated)
      setIsRegenerateAlertOpen(false)
      setIsRevealedKey(true)
      toast({
        title: 'Chave regenerada com sucesso',
        description: 'A chave anterior foi invalidada imediatamente. Use a nova chave.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao regenerar chave',
        description: 'Não foi possível atualizar a chave de serviço.',
        variant: 'destructive',
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  async function handleCreatePartner() {
    if (!newPartnerName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do parceiro ou integração (ex: Laboratório Alfa, n8n).',
        variant: 'destructive',
      })
      return
    }

    setIsCreatingPartner(true)
    try {
      const { record, rawKey } = await createPartnerApiKey({
        name: newPartnerName.trim(),
        description: newPartnerDesc.trim(),
        permissions: newPartnerPermissions,
      })

      setPartners((prev) => [record, ...prev])
      setIsCreatePartnerOpen(false)
      setNewPartnerName('')
      setNewPartnerDesc('')
      setNewPartnerPermissions({ ...DEFAULT_PARTNER_PERMISSIONS })

      // Exibe modal com a chave bruta uma única vez
      setCreatedSecretModal({
        open: true,
        name: record.name,
        key: rawKey,
      })

      toast({
        title: 'Acesso do parceiro criado!',
        description: 'Copie a chave agora, pois ela não poderá ser recuperada na íntegra.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao criar parceiro',
        description: 'Não foi possível registrar o acesso de parceiro.',
        variant: 'destructive',
      })
    } finally {
      setIsCreatingPartner(false)
    }
  }

  async function handleTogglePartnerStatus(partner: PartnerApiKeyRecord) {
    try {
      const updated = await updatePartnerApiKey(partner.id, {
        is_active: !partner.is_active,
      })
      setPartners((prev) => prev.map((p) => (p.id === partner.id ? updated : p)))
      toast({
        title: updated.is_active ? 'Chave ativada' : 'Chave pausada',
        description: `O acesso de ${partner.name} está agora ${updated.is_active ? 'ativo' : 'inativo'}.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao alterar status',
        description: 'Não foi possível atualizar o parceiro.',
        variant: 'destructive',
      })
    }
  }

  async function handleRevokePartner(partner: PartnerApiKeyRecord) {
    try {
      const updated = await revokePartnerApiKey(partner.id)
      setPartners((prev) => prev.map((p) => (p.id === partner.id ? updated : p)))
      toast({
        title: 'Acesso revogado',
        description: `A chave de ${partner.name} foi revogada e bloqueada imediatamente.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao revogar chave',
        description: 'Não foi possível revogar a chave do parceiro.',
        variant: 'destructive',
      })
    }
  }

  async function handleDeletePartner(id: string, name: string) {
    try {
      const ok = await deletePartnerApiKey(id)
      if (ok) {
        setPartners((prev) => prev.filter((p) => p.id !== id))
        toast({
          title: 'Acesso excluído',
          description: `O registro de ${name} foi removido com sucesso.`,
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao remover parceiro',
        description: 'Não foi possível remover o registro.',
        variant: 'destructive',
      })
    }
  }

  const collections = [
    {
      name: 'patients',
      label: 'Pacientes',
      description: 'Prontuários e fichas cadastrais (nome, telefone, e-mail, cpf)',
    },
    {
      name: 'appointments',
      label: 'Agendamentos',
      description: 'Consultas, cirurgias vasculares e retornos agendados',
    },
    {
      name: 'leads',
      label: 'Leads CRM',
      description: 'Oportunidades do funil vascular e pipeline de pacientes',
    },
    {
      name: 'budgets',
      label: 'Orçamentos',
      description: 'Orçamentos e propostas financeiras de procedimentos vasculares',
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* Header com Identidade da Clínica */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
              Integrações Avançadas
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Ambiente Seguro REST & SSL
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2.5">
            <Webhook className="h-8 w-8 text-primary" />
            Hub de Conexões & API
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie as credenciais REST do Dashboard da Clínica Dr. Daniel Delgado, acessos
            compartilhados de parceiros (laboratórios, convênios, n8n) e auditoria de tráfego.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadDashboardKey()
              loadPartners()
              loadLogs()
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar Tudo
          </Button>
        </div>
      </div>

      {/* Tabs Principais */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'dashboard' | 'partners' | 'logs')}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md h-11 bg-muted/60 p-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">Chave do</span> Dashboard
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Parceiros
            {partners.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {partners.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Auditoria
            {logs.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {logs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* =========================================================================
            ABA 1: CHAVE API DO DASHBOARD
            ========================================================================= */}
        <TabsContent value="dashboard" className="space-y-6 outline-none">
          {/* Card Chave de Serviço */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Chave de Serviço da API (Dashboard)</CardTitle>
                    <CardDescription>
                      Token permanente usado para serviços de background, scripts de automação e
                      integrações diretas.
                    </CardDescription>
                  </div>
                </div>
                {dashboardKey && (
                  <Badge
                    variant={dashboardKey.is_active ? 'default' : 'secondary'}
                    className={dashboardKey.is_active ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
                  >
                    {dashboardKey.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Chave API de Acesso Geral
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      readOnly
                      type={isRevealedKey ? 'text' : 'password'}
                      value={dashboardKey ? dashboardKey.key : 'Carregando...'}
                      className="font-mono text-sm pr-10 bg-muted/40 selection:bg-primary/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsRevealedKey(!isRevealedKey)}
                    >
                      {isRevealedKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2 shrink-0"
                    onClick={() =>
                      dashboardKey && handleCopy(dashboardKey.key, 'Chave do Dashboard')
                    }
                    disabled={!dashboardKey || isLoadingKey}
                  >
                    {copiedKey === 'Chave do Dashboard' ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copiar
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2 shrink-0 bg-rose-600 hover:bg-rose-700"
                    onClick={() => setIsRegenerateAlertOpen(true)}
                    disabled={!dashboardKey || isRegenerating}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  Mantenha este token confidencial. Ao regenerar, todas as integrações que utilizam
                  a chave antiga precisarão ser atualizadas.
                </p>
              </div>

              {/* Informações da Chave */}
              {dashboardKey && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg text-xs border border-border/50">
                  <div>
                    <span className="text-muted-foreground">Nome do Recurso:</span>
                    <p className="font-medium text-foreground">{dashboardKey.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Criado em:</span>
                    <p className="font-medium text-foreground">
                      {new Date(dashboardKey.created).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Última Atualização:</span>
                    <p className="font-medium text-foreground">
                      {new Date(dashboardKey.updated).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endpoints & Exemplos de Requisição cURL */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Endpoints REST & Exemplos Prontos (cURL)
              </h2>
              <p className="text-muted-foreground text-sm">
                Acesse os recursos clínicos via REST API oficial. Abaixo estão os endpoints
                disponíveis e exemplos para copiar e colar diretamente no terminal ou Postman.
              </p>
            </div>

            {/* Base URL */}
            <Card className="border-border">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      URL Base da API do Projeto
                    </span>
                    <p className="font-mono text-sm font-semibold text-primary">{publicApiBase}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0 self-start sm:self-auto"
                    onClick={() => handleCopy(publicApiBase, 'URL Base')}
                  >
                    {copiedKey === 'URL Base' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copiar URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exemplo de Autenticação */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-500" />
                      1. Autenticação via Auth With Password (Usuários do Dashboard)
                    </CardTitle>
                    <CardDescription>
                      Endpoint para gerar o JWT de sessão a partir do e-mail e senha do
                      usuário/médico.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      handleCopy(
                        `curl -X POST "${publicApiBase}/collections/users/auth-with-password" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "identity": "delgadodm@hotmail.com",\n    "password": "SUA_SENHA_AQUI"\n  }'`,
                        'cURL Auth',
                      )
                    }
                  >
                    {copiedKey === 'cURL Auth' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copiar cURL
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-3 bg-muted/60 rounded-lg text-xs font-mono overflow-x-auto text-foreground/90 border border-border/50">
                  {`curl -X POST "${publicApiBase}/collections/users/auth-with-password" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identity": "delgadodm@hotmail.com",
    "password": "SUA_SENHA_AQUI"
  }'`}
                </pre>
              </CardContent>
            </Card>

            {/* Coleções Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collections.map((col) => {
                const getCurl = `curl -X GET "${publicApiBase}/collections/${col.name}/records?page=1&perPage=20" \\\n  -H "Authorization: Bearer <SEU_TOKEN_OU_CHAVE>"`
                const postCurl = `curl -X POST "${publicApiBase}/collections/${col.name}/records" \\\n  -H "Authorization: Bearer <SEU_TOKEN_OU_CHAVE>" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    /* campos da entidade */\n  }'`

                return (
                  <Card key={col.name} className="border-border flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="font-mono text-xs">
                            /api/collections/{col.name}/records
                          </Badge>
                          <CardTitle className="text-base mt-1">{col.label}</CardTitle>
                          <CardDescription className="text-xs">{col.description}</CardDescription>
                        </div>
                        <Database className="h-5 w-5 text-muted-foreground/60" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold text-emerald-600">
                            GET (Listar / Buscar)
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(getCurl, `cURL GET ${col.label}`)}
                          >
                            {copiedKey === `cURL GET ${col.label}` ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <pre className="p-2 bg-muted/60 rounded text-[11px] font-mono overflow-x-auto text-foreground/90 border border-border/40">
                          {getCurl}
                        </pre>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold text-blue-600">POST (Criar Registro)</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(postCurl, `cURL POST ${col.label}`)}
                          >
                            {copiedKey === `cURL POST ${col.label}` ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <pre className="p-2 bg-muted/60 rounded text-[11px] font-mono overflow-x-auto text-foreground/90 border border-border/40">
                          {postCurl}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            ABA 2: ACESSOS COMPARTILHADOS DE PARCEIROS
            ========================================================================= */}
        <TabsContent value="partners" className="space-y-6 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Acessos Compartilhados de Parceiros
              </h2>
              <p className="text-muted-foreground text-sm">
                Crie chaves de API individuais para laboratórios, convênios, webhooks externos, n8n
                e Make com permissões granulares por coleção.
              </p>
            </div>
            <Button onClick={() => setIsCreatePartnerOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Parceiro
            </Button>
          </div>

          {/* Guia de Integração do Parceiro */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-primary/10 text-primary shrink-0">
                  <Code2 className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-foreground text-sm">
                    Como o Parceiro utiliza a Chave Individual:
                  </span>
                  <p className="text-muted-foreground">
                    O parceiro faz requisições diretamente para a rota do gateway:{' '}
                    <code className="text-primary font-mono font-medium">
                      {partnerGatewayBase}/:collection
                    </code>
                    . A chave deve ser informada no cabeçalho HTTP{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">
                      X-Partner-Key: ptr_sec_...
                    </code>{' '}
                    ou{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">
                      Authorization: Bearer ptr_sec_...
                    </code>
                    . O gateway valida as permissões de leitura/escrita configuradas e registra o
                    log automaticamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Parceiros */}
          {isLoadingPartners ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : partners.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted text-muted-foreground mb-3">
                  <Layers className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Nenhum parceiro cadastrado
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Adicione laboratórios, convênios ou ferramentas de automação (n8n/Make) para
                  emitir uma chave de API com permissões restritas.
                </p>
                <Button
                  onClick={() => setIsCreatePartnerOpen(true)}
                  variant="outline"
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar Primeiro Parceiro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {partners.map((partner) => {
                const perms =
                  (partner.permissions as PartnerPermissions) || DEFAULT_PARTNER_PERMISSIONS
                const hasReadPatients = perms.patients?.read
                const hasWritePatients = perms.patients?.write
                const hasReadAppts = perms.appointments?.read
                const hasWriteAppts = perms.appointments?.write
                const hasReadLeads = perms.leads?.read
                const hasWriteLeads = perms.leads?.write
                const hasReadBudgets = perms.budgets?.read
                const hasWriteBudgets = perms.budgets?.write

                return (
                  <Card key={partner.id} className="border-border flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{partner.name}</CardTitle>
                            <Badge
                              variant={partner.is_active ? 'default' : 'secondary'}
                              className={
                                partner.is_active
                                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }
                            >
                              {partner.is_active ? 'Ativo' : 'Revogado / Inativo'}
                            </Badge>
                          </div>
                          {partner.description && (
                            <CardDescription className="text-xs mt-1 line-clamp-2">
                              {partner.description}
                            </CardDescription>
                          )}
                        </div>

                        {/* Botão de Revogação Imediata */}
                        {partner.is_active ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5 shrink-0"
                            onClick={() => handleRevokePartner(partner)}
                          >
                            <PowerOff className="h-3.5 w-3.5" />
                            Revogar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 gap-1.5 shrink-0"
                            onClick={() => handleTogglePartnerStatus(partner)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Reativar
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-1">
                      {/* Chave Mascarada */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Chave de Acesso</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            readOnly
                            value={partner.masked_hint || maskKey(partner.key)}
                            className="font-mono text-xs bg-muted/40 h-8"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(partner.key, `Chave ${partner.name}`)}
                            title="Copiar token"
                          >
                            {copiedKey === `Chave ${partner.name}` ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Matriz de Permissões */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground font-semibold">
                          Permissões por Coleção
                        </Label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded bg-muted/30 border border-border/40 flex items-center justify-between">
                            <span className="font-medium">Pacientes</span>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant={hasReadPatients ? 'outline' : 'secondary'}
                                className={
                                  hasReadPatients
                                    ? 'text-emerald-600 border-emerald-300 text-[10px] px-1'
                                    : 'text-[10px] px-1 opacity-50'
                                }
                              >
                                R
                              </Badge>
                              <Badge
                                variant={hasWritePatients ? 'outline' : 'secondary'}
                                className={
                                  hasWritePatients
                                    ? 'text-blue-600 border-blue-300 text-[10px] px-1'
                                    : 'text-[10px] px-1 opacity-50'
                                }
                              >
                                W
                              </Badge>
                            </div>
                          </div>

                          <div className="p-2 rounded bg-muted/30 border border-border/40 flex items-center justify-between">
                            <span className="font-medium">Agendamentos</span>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant={hasReadAppts ? 'outline' : 'secondary'}
                                className={
                                  hasReadAppts
                                    ? 'text-emerald-600 border-emerald-300 text-[10px] px-1'
                                    : 'text-[10px] px-1 opacity-50'
                                }
                              >
                                R
                              </Badge>
                              <Badge
                                variant={hasWriteAppts ? 'outline' : 'secondary'}
                                className={
                                  hasWriteAppts
                                    ? 'text-blue-600 border-blue-300 text-[10px] px-1'
                                    : 'text-[10px] px-1 opacity-50'
                                }
                              >
                                W
                              </Badge>
                            </div>
                          </div>

                          <div className="p-2 rounded bg-muted/30 border border-border/40 flex items-center justify-between">
                            <span className="font-medium">Leads CRM</span>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant={hasReadLeads ? 'outline' : 'secondary'}
                                className={
                                  hasReadLeads
                                    ? 'text-emerald-600 border-emerald-300 text-[10px] px-1'
                                    : 'text-[10px] px-1 opacity-50'
                                }
                              >
                                R
                              </Badge>
                              <Badge
                                variant={hasWriteLeads ? 'outline' : 'secondary'}
                                className={
                                  hasWriteLeads
                                    ? 'text-blue-600 border-blue-300 text-[10px] px-1'
                                    : 'text-[10px] px-1 opacity-50'
                                }
                              >
                                W
                              </Badge>
                            </div>
                          </div>

                          <div className="p-2 rounded bg-muted/30 border border-border/40 flex items-center justify-between">
                            <span className="font-medium">Orçamentos</span>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant={hasReadBudgets ? 'outline' : 'secondary'}
                                className={
                                  hasReadBudgets
                                    ? 'text-emerald-600 border-emerald-300 text-[10px] px-1'
                                    : 'text-[10px] px-1 opacity-50'
                                }
                              >
                                R
                              </Badge>
                              <Badge
                                variant={hasWriteBudgets ? 'outline' : 'secondary'}
                                className={
                                  hasWriteBudgets
                                    ? 'text-blue-600 border-blue-300 text-[10px] px-1'
                                    : 'text-[10px] px-1 opacity-50'
                                }
                              >
                                W
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Métricas e Detalhes */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5 text-primary" />
                            <strong>{partner.call_count || 0}</strong> chamadas
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {partner.last_used_at
                              ? new Date(partner.last_used_at).toLocaleDateString('pt-BR')
                              : 'Nunca usado'}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => handleDeletePartner(partner.id, partner.name)}
                          title="Excluir parceiro"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* =========================================================================
            ABA 3: AUDITORIA & LOG DE CHAMADAS
            ========================================================================= */}
        <TabsContent value="logs" className="space-y-6 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Auditoria de Chamadas da API
              </h2>
              <p className="text-muted-foreground text-sm">
                Rastreamento em tempo real de cada requisição realizada pelos parceiros e serviços
                externos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={selectedPartnerFilter}
                onValueChange={(val) => {
                  setSelectedPartnerFilter(val)
                  loadLogs(val)
                }}
              >
                <SelectTrigger className="w-[200px] h-9 text-xs">
                  <SelectValue placeholder="Filtrar por parceiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Parceiros</SelectItem>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => loadLogs()}
                disabled={isLoadingLogs}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Tabela de Logs */}
          <Card className="border-border">
            <CardContent className="p-0">
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 rounded-full bg-muted text-muted-foreground mb-3">
                    <Activity className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Nenhum log de chamada registrado
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    Assim que parceiros ou automações começarem a fazer requisições à API, os
                    registros aparecerão aqui em ordem cronológica.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-3 px-4">Data / Hora</th>
                        <th className="py-3 px-4">Parceiro</th>
                        <th className="py-3 px-4">Método</th>
                        <th className="py-3 px-4">Coleção / Endpoint</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">IP / Origem</th>
                        <th className="py-3 px-4">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {logs.map((log) => {
                        const isSuccess = log.status === 'success'
                        const isForbidden = log.status === 'forbidden'
                        const isUnauthorized = log.status === 'unauthorized'

                        return (
                          <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 font-mono whitespace-nowrap text-muted-foreground">
                              {new Date(log.created).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                              {log.partner_name || 'Desconhecido'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={`font-mono text-[10px] ${
                                  log.method === 'GET'
                                    ? 'text-emerald-600 border-emerald-300'
                                    : 'text-blue-600 border-blue-300'
                                }`}
                              >
                                {log.method}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-mono text-muted-foreground">
                              {log.endpoint || `/backend/v1/partner-api/${log.collection_accessed}`}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <Badge
                                variant={isSuccess ? 'default' : 'destructive'}
                                className={`text-[10px] ${
                                  isSuccess
                                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                                    : isForbidden
                                      ? 'bg-amber-600 hover:bg-amber-600 text-white'
                                      : 'bg-rose-600 hover:bg-rose-600 text-white'
                                }`}
                              >
                                {log.status_code || (isSuccess ? 200 : 400)} - {log.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                              {log.ip || '-'}
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate text-muted-foreground">
                              {log.error_details || (isSuccess ? 'Requisição processada' : '-')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Criar Novo Parceiro */}
      <Dialog open={isCreatePartnerOpen} onOpenChange={setIsCreatePartnerOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Novo Acesso de Parceiro
            </DialogTitle>
            <DialogDescription>
              Configure o parceiro e defina quais coleções ele poderá consultar ou modificar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="partner-name" className="text-xs font-semibold">
                Nome do Parceiro / Aplicação <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="partner-name"
                placeholder="Ex: Laboratório Hermes Pardini, Convênio Unimed, n8n Flow"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="partner-desc" className="text-xs font-semibold">
                Descrição / Finalidade (Opcional)
              </Label>
              <Textarea
                id="partner-desc"
                placeholder="Ex: Sincronização automática de exames e laudos vasculares."
                value={newPartnerDesc}
                onChange={(e) => setNewPartnerDesc(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                Permissões de Acesso por Coleção
              </Label>
              <div className="space-y-2.5">
                {collections.map((col) => {
                  const key = col.name as keyof PartnerPermissions
                  const current = newPartnerPermissions[key]

                  return (
                    <div
                      key={col.name}
                      className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{col.label}</p>
                        <p className="text-xs text-muted-foreground">{col.description}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            id={`read-${col.name}`}
                            checked={current?.read}
                            onCheckedChange={(checked) =>
                              setNewPartnerPermissions((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], read: checked },
                              }))
                            }
                          />
                          <Label htmlFor={`read-${col.name}`} className="text-xs cursor-pointer">
                            Ler
                          </Label>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Switch
                            id={`write-${col.name}`}
                            checked={current?.write}
                            onCheckedChange={(checked) =>
                              setNewPartnerPermissions((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], write: checked },
                              }))
                            }
                          />
                          <Label htmlFor={`write-${col.name}`} className="text-xs cursor-pointer">
                            Escrever
                          </Label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreatePartnerOpen(false)}
              disabled={isCreatingPartner}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreatePartner} disabled={isCreatingPartner} className="gap-2">
              {isCreatingPartner ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Gerando Chave...
                </>
              ) : (
                'Gerar Chave de Parceiro'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Chave Criada (Exibição Única) */}
      <Dialog
        open={createdSecretModal.open}
        onOpenChange={(open) => setCreatedSecretModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-700 w-fit mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg">Chave de API Criada com Sucesso!</DialogTitle>
            <DialogDescription>
              A chave abaixo para{' '}
              <strong className="text-foreground">{createdSecretModal.name}</strong> só será exibida
              na íntegra neste momento. Copie e guarde-a com segurança.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">Chave de Acesso</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={createdSecretModal.key}
                  className="font-mono text-xs bg-muted selection:bg-primary/20 h-10 text-foreground"
                />
                <Button
                  className="gap-2 shrink-0"
                  onClick={() => handleCopy(createdSecretModal.key, 'Chave Gerada')}
                >
                  {copiedKey === 'Chave Gerada' ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copiar
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Aviso importante:
              </p>
              <p>
                Por motivos de segurança, o sistema nunca mais exibirá essa chave completa no painel
                (ela será armazenada em formato mascarado).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setCreatedSecretModal((prev) => ({ ...prev, open: false }))}
              className="w-full sm:w-auto"
            >
              Concluir & Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Regeneração da Chave Dashboard */}
      <AlertDialog open={isRegenerateAlertOpen} onOpenChange={setIsRegenerateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="h-5 w-5" />
              Regenerar Chave de Serviço do Dashboard?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Esta ação invalidará imediatamente a chave atual. Todas as aplicações externas,
                serviços e scripts que utilizam o token antigo deixarão de funcionar até serem
                atualizados com a nova chave.
              </p>
              <p className="font-semibold text-foreground">
                Tem certeza que deseja prosseguir com a regeneração?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRegenerating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRegenerateKey}
              disabled={isRegenerating}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Regenerando...
                </>
              ) : (
                'Sim, Regenerar Chave'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
