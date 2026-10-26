import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Mail,
  Bell,
  Send,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  checkPushSupport,
  subscribeToWebPush,
  broadcastPushNotification,
  PushStatus,
} from '@/services/webpush'

interface EmailCampaign {
  id: string
  title: string
  subject: string
  content: string
  target_filter: string
  status: 'draft' | 'sending' | 'sent' | 'failed'
  sent_count?: number
  failed_count?: number
  sent_at?: string
  created?: string
}

interface PushNotificationRecord {
  id: string
  title: string
  body: string
  url?: string
  sent_count?: number
  created?: string
}

export default function Marketing() {
  const [activeTab, setActiveTab] = useState<'email' | 'push'>('email')
  const { toast } = useToast()

  // E-mail Marketing State
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [patientsCount, setPatientsCount] = useState(0)

  // Criar / Enviar Campanha
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [targetFilter, setTargetFilter] = useState<'all' | 'with_appointments' | 'leads_only'>(
    'all',
  )
  const [sending, setSending] = useState(false)

  // Web Push State
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null)
  const [subscribing, setSubscribing] = useState(false)
  const [pushHistory, setPushHistory] = useState<PushNotificationRecord[]>([])
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [pushTitle, setPushTitle] = useState('Clínica Dr. Daniel Delgado')
  const [pushBody, setPushBody] = useState('')
  const [pushUrl, setPushUrl] = useState('/agenda')
  const [pushTarget, setPushTarget] = useState<'all' | 'staff' | 'patients'>('all')
  const [broadcasting, setBroadcasting] = useState(false)

  // Carregar dados de campanhas e pacientes
  const loadEmailData = async () => {
    setLoadingCampaigns(true)
    try {
      const campRes = await pb.collection('email_campaigns').getList<EmailCampaign>(1, 50, {
        sort: '-created',
      })
      setCampaigns(campRes.items)

      const patRes = await pb.collection('patients').getList(1, 1, {
        filter: 'email != ""',
      })
      setPatientsCount(patRes.totalItems)
    } catch (err: any) {
      console.warn('Erro ao listar campanhas:', err)
    } finally {
      setLoadingCampaigns(false)
    }
  }

  // Carregar dados de Push
  const loadPushData = async () => {
    const status = await checkPushSupport()
    setPushStatus(status)

    try {
      const subsRes = await pb.collection('push_subscriptions').getList(1, 1, {
        filter: 'is_active = true',
      })
      setSubscribersCount(subsRes.totalItems)

      const notifsRes = await pb
        .collection('push_notifications')
        .getList<PushNotificationRecord>(1, 20, {
          sort: '-created',
        })
      setPushHistory(notifsRes.items)
    } catch (err) {
      console.warn('Erro ao carregar push:', err)
    }
  }

  useEffect(() => {
    loadEmailData()
    loadPushData()
  }, [])

  // Inserir tag de variável no editor
  const insertVariable = (tag: string) => {
    setContent((prev) => prev + tag)
  }

  const handleSendCampaign = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campos Obrigatórios',
        description: 'Preencha o assunto e o conteúdo da mensagem.',
      })
      return
    }

    setSending(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/marketing/email/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: pb.authStore.token,
          },
          body: JSON.stringify({
            title: title.trim() || subject.trim(),
            subject,
            content,
            targetFilter,
          }),
        },
      )

      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Erro ao disparar campanha de e-mail.')
      }

      toast({
        title: 'Campanha Disparada com Sucesso!',
        description: `Enviada para ${data.sentCount} destinatário(s). Falhas: ${data.failedCount || 0}`,
      })

      setDialogOpen(false)
      setTitle('')
      setSubject('')
      setContent('')
      loadEmailData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Envio',
        description: err.message,
      })
    } finally {
      setSending(false)
    }
  }

  const handleEnablePush = async () => {
    setSubscribing(true)
    try {
      const res = await subscribeToWebPush()
      if (res.success) {
        toast({
          title: 'Notificações Ativadas!',
          description: 'Seu navegador agora receberá avisos em tempo real da clínica.',
        })
        loadPushData()
      } else {
        toast({
          variant: 'destructive',
          title: 'Não foi possível ativar',
          description: res.error || 'Permissão negada ou erro de registro.',
        })
      }
    } finally {
      setSubscribing(false)
    }
  }

  const handleBroadcastPush = async () => {
    if (!pushBody.trim()) {
      toast({
        variant: 'destructive',
        title: 'Texto obrigatório',
        description: 'Digite o conteúdo da notificação push.',
      })
      return
    }

    setBroadcasting(true)
    try {
      const res = await broadcastPushNotification({
        title: pushTitle.trim() || 'Clínica Dr. Daniel Delgado',
        body: pushBody.trim(),
        url: pushUrl,
        target: pushTarget,
      })

      toast({
        title: 'Web Push Enviado!',
        description: res.message || 'Notificação entregue com sucesso.',
      })
      setPushBody('')
      loadPushData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no envio do Push',
        description: err.message,
      })
    } finally {
      setBroadcasting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" />
            Central de Marketing Nativa
          </h1>
          <p className="text-muted-foreground mt-1">
            Módulo próprio integrado ao PocketBase — sem dependência de serviços externos. Dispare
            e-mails em massa e notificações Web Push diretamente aos seus pacientes.
          </p>
        </div>

        {activeTab === 'email' ? (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-md gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Campanha de E-mail
          </Button>
        ) : (
          <Button
            onClick={handleEnablePush}
            disabled={subscribing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2"
          >
            <Smartphone className="h-4 w-4" />
            {pushStatus?.isSubscribed
              ? 'Notificações Ativas neste Aparelho'
              : 'Ativar Notificações no Meu Navegador'}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger
            value="email"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm gap-2"
          >
            <Mail className="h-4 w-4" />
            E-mail Marketing
          </TabsTrigger>
          <TabsTrigger
            value="push"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm gap-2"
          >
            <Bell className="h-4 w-4" />
            Web Push Notifications
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: E-MAIL MARKETING */}
        <TabsContent value="email" className="space-y-6 m-0 focus-visible:outline-none">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Pacientes com E-mail Cadastrado</CardDescription>
                <CardTitle className="text-3xl text-brand-blue flex items-center justify-between">
                  {patientsCount}
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Base real e sincronizada da coleção de pacientes.
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Campanhas Realizadas</CardDescription>
                <CardTitle className="text-3xl text-emerald-600 flex items-center justify-between">
                  {campaigns.length}
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Total de disparos nativos efetuados pelo painel.
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Mecanismo de Envio</CardDescription>
                <CardTitle className="text-xl text-foreground flex items-center justify-between">
                  Servidor Nativo
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Envio via MailClient PocketBase com templates responsivos.
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Histórico de Campanhas de E-mail</CardTitle>
                <CardDescription>
                  Acompanhe os envios, status de entrega e mensagens disparadas.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadEmailData}
                disabled={loadingCampaigns}
                className="gap-1 text-muted-foreground"
              >
                <RefreshCw className={`h-4 w-4 ${loadingCampaigns ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-base text-foreground">
                    Nenhuma campanha de e-mail ainda
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Crie sua primeira campanha para enviar orientações, informativos vasculares ou
                    novidades da clínica aos seus pacientes.
                  </p>
                  <Button onClick={() => setDialogOpen(true)} size="sm" className="mt-2">
                    Criar Minha Primeira Campanha
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Público</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Enviados</TableHead>
                        <TableHead className="text-right">Data de Envio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((camp) => (
                        <TableRow key={camp.id}>
                          <TableCell className="font-medium text-foreground">
                            {camp.title || 'Campanha'}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {camp.subject}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {camp.target_filter === 'with_appointments'
                                ? 'Com Agendamento'
                                : camp.target_filter === 'leads_only'
                                  ? 'Somente Leads'
                                  : 'Todos os Pacientes'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {camp.status === 'sent' && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Enviada
                              </Badge>
                            )}
                            {camp.status === 'sending' && (
                              <Badge variant="secondary">
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Processando
                              </Badge>
                            )}
                            {camp.status === 'failed' && (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" /> Falha
                              </Badge>
                            )}
                            {camp.status === 'draft' && <Badge variant="outline">Rascunho</Badge>}
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {camp.sent_count ?? 0}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {camp.sent_at
                              ? new Date(camp.sent_at).toLocaleString('pt-BR')
                              : new Date(camp.created || '').toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: WEB PUSH NOTIFICATIONS */}
        <TabsContent value="push" className="space-y-6 m-0 focus-visible:outline-none">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Status do Navegador</CardDescription>
                <CardTitle className="text-xl flex items-center justify-between">
                  {pushStatus?.isSupported ? (
                    <span className="text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="h-5 w-5" /> Suportado
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1.5">
                      <AlertCircle className="h-5 w-5" /> Não Suportado
                    </span>
                  )}
                  <Badge variant="outline">{pushStatus?.permission || 'padrão'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Service Worker e API de Web Push operando localmente no navegador.
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Dispositivos Inscritos</CardDescription>
                <CardTitle className="text-3xl text-brand-blue flex items-center justify-between">
                  {subscribersCount}
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Inscrições armazenadas na coleção push_subscriptions.
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Segurança VAPID</CardDescription>
                <CardTitle className="text-lg text-foreground flex items-center justify-between">
                  Ativa
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    Criptografada
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Assinatura criptográfica P-256 no padrão RFC 8292.
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Compor Notificação Push */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-brand-blue" />
                  Disparar Notificação Web Push
                </CardTitle>
                <CardDescription>
                  Envie alertas instantâneos que aparecem na área de trabalho ou celular dos
                  inscritos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título da Notificação</Label>
                  <Input
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="Ex: Lembrete Importante - Clínica Dr. Daniel Delgado"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo da Mensagem</Label>
                  <Textarea
                    rows={3}
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder="Ex: Sua consulta está confirmada para hoje às 14h. Não se esqueça de levar seus exames prévios."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Link de Destino ao Clicar</Label>
                    <Input
                      value={pushUrl}
                      onChange={(e) => setPushUrl(e.target.value)}
                      placeholder="/agenda"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Público Alvo</Label>
                    <Select value={pushTarget} onValueChange={(v: any) => setPushTarget(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Inscritos</SelectItem>
                        <SelectItem value="patients">Apenas Pacientes</SelectItem>
                        <SelectItem value="staff">Equipe Médica / Recepção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground flex gap-2 items-start">
                  <Info className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                  <span>
                    O Web Push nativo não consome créditos de terceiros e é entregue mesmo com o
                    site fechado caso o navegador tenha suporte habilitado.
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleEnablePush}
                  disabled={subscribing}
                  size="sm"
                >
                  <Bell className="h-4 w-4 mr-1.5" /> Inscrever Este Navegador
                </Button>
                <Button
                  onClick={handleBroadcastPush}
                  disabled={broadcasting || !pushBody.trim()}
                  className="bg-brand-blue text-white hover:bg-brand-blue/90"
                >
                  <Send className={`h-4 w-4 mr-2 ${broadcasting ? 'animate-spin' : ''}`} />
                  {broadcasting ? 'Disparando...' : 'Transmitir Notificação'}
                </Button>
              </CardFooter>
            </Card>

            {/* Histórico de Disparos Push */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Histórico de Notificações Web Push</CardTitle>
                  <CardDescription>Disparos efetuados via broadcast nativo.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={loadPushData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {pushHistory.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    Nenhuma notificação push disparada ainda.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pushHistory.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-lg border bg-card flex flex-col gap-1 text-sm shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <Bell className="h-3.5 w-3.5 text-primary" />
                            {notif.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {notif.created ? new Date(notif.created).toLocaleString('pt-BR') : ''}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{notif.body}</p>
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t mt-1">
                          <span>Link: {notif.url || '/'}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {notif.sent_count ?? 1} entregue(s)
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO: CRIAR NOVA CAMPANHA DE E-MAIL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-blue" />
              Criar Nova Campanha de E-mail Marketing
            </DialogTitle>
            <DialogDescription>
              Configure o assunto e o corpo do e-mail. Utilize tags dinâmicas para personalizar o
              nome do paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Identificação Interna da Campanha</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Cuidados Pós-Escleroterapia - Março"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Segmento de Destinatários</Label>
                <Select value={targetFilter} onValueChange={(v: any) => setTargetFilter(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Pacientes ({patientsCount})</SelectItem>
                    <SelectItem value="with_appointments">Apenas Pacientes com Consulta</SelectItem>
                    <SelectItem value="leads_only">Leads do Pipeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Assunto do E-mail</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: {primeiro_nome}, orientações importantes para o seu tratamento vascular"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Corpo do E-mail (Texto e Variáveis)</Label>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground mr-1">Inserir:</span>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted text-[10px]"
                    onClick={() => insertVariable('{primeiro_nome}')}
                  >
                    + {'{primeiro_nome}'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted text-[10px]"
                    onClick={() => insertVariable('{nome}')}
                  >
                    + {'{nome}'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted text-[10px]"
                    onClick={() => insertVariable('{email}')}
                  >
                    + {'{email}'}
                  </Badge>
                </div>
              </div>

              <Textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Olá {primeiro_nome},\n\nEsperamos que você esteja bem! Passando para compartilhar dicas essenciais para a saúde das suas pernas e alívio de sintomas vasculares...\n\nQualquer dúvida, conte com a nossa equipe.`}
                className="font-sans leading-relaxed text-sm"
              />
            </div>

            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1 border">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
                Template Automático da Clínica
              </span>
              <p className="text-muted-foreground">
                O e-mail será envelopado com o cabeçalho e rodapé institucionais da Clínica Dr.
                Daniel Delgado, incluindo contatos de Juiz de Fora e assinatura médica.
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              disabled={!content.trim()}
              className="gap-1.5"
            >
              <Eye className="h-4 w-4" /> Pré-visualizar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSendCampaign}
                disabled={sending || !subject.trim() || !content.trim()}
                className="bg-brand-blue text-white hover:bg-brand-blue/90 gap-1.5"
              >
                <Send className={`h-4 w-4 ${sending ? 'animate-spin' : ''}`} />
                {sending ? 'Disparando...' : 'Disparar Campanha'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: PRÉ-VISUALIZAÇÃO */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Pré-visualização do E-mail</DialogTitle>
            <DialogDescription>
              Exemplo de como o paciente Maria visualizará o comunicado na caixa de entrada.
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-xl p-6 bg-white text-slate-800 shadow-inner space-y-4">
            <div className="border-b pb-3 text-xs text-slate-500 space-y-1">
              <div>
                <strong>De:</strong> Clínica Dr. Daniel Delgado
                &lt;contato@drdanieldelgado.com.br&gt;
              </div>
              <div>
                <strong>Para:</strong> Maria Oliveira &lt;maria.oliveira@exemplo.com.br&gt;
              </div>
              <div>
                <strong>Assunto:</strong>{' '}
                {subject
                  .replace(/\{primeiro_nome\}/gi, 'Maria')
                  .replace(/\{nome\}/gi, 'Maria Oliveira') || 'Assunto da Campanha'}
              </div>
            </div>

            <div className="text-center border-b-2 border-sky-600 pb-3">
              <h2 className="text-lg font-bold text-slate-900 m-0">Clínica Dr. Daniel Delgado</h2>
              <p className="text-xs text-slate-500 m-0">Cirurgia Vascular & Angiologia</p>
            </div>

            <div className="text-sm leading-relaxed whitespace-pre-wrap py-2">
              {content
                .replace(/\{primeiro_nome\}/gi, 'Maria')
                .replace(/\{nome\}/gi, 'Maria Oliveira')
                .replace(/\{email\}/gi, 'maria.oliveira@exemplo.com.br') ||
                'Corpo da mensagem aparecerá aqui...'}
            </div>

            <div className="border-t pt-3 text-[11px] text-slate-400 text-center">
              Você recebeu este comunicado oficial da Clínica Dr. Daniel Delgado.
              <br />
              Juiz de Fora - MG | Tel / WhatsApp: (32) 99131-5729
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
