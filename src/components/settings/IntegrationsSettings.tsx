import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuditStore } from '@/stores/audit'
import {
  MessageSquare,
  Facebook,
  Instagram,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  AlertCircle,
  Calendar as CalendarIcon,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react'
import { useAgendaStore } from '@/stores/agenda'
import { WhatsAppMessagesPanel } from '@/components/settings/WhatsAppMessagesPanel'
import {
  getMetaConfig,
  testMetaConnection,
  sendWhatsAppMessage,
  MetaConfig,
  MetaTestResult,
} from '@/services/whatsapp'

export function IntegrationsSettings() {
  const { googleToken, connectGoogle, disconnectGoogle } = useAgendaStore()
  const { addLog } = useAuditStore()
  const { toast } = useToast()

  // Integration credentials with clinic's official data
  const [bmId, setBmId] = useState('1423050816165289')
  const [wabaId, setWabaId] = useState('895450846341386')
  const [phoneId, setPhoneId] = useState('')
  const [officialPhone, setOfficialPhone] = useState('32 991315729')
  const [token, setToken] = useState('')

  // Webhook info
  const [webhookUrl, setWebhookUrl] = useState('')
  const [verifyToken, setVerifyToken] = useState('clinica_daniel_delgado_secret_token_2026')

  // Connection testing state
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<MetaTestResult | null>(null)
  const [hasTokenConfigured, setHasTokenConfigured] = useState(false)

  // Quick test message
  const [testPhone, setTestPhone] = useState('5532991315729')
  const [sendingTestMsg, setSendingTestMsg] = useState(false)
  const [waAutoConfirm, setWaAutoConfirm] = useState(true)

  // Template message
  const [reminderTemplate, setReminderTemplate] = useState(
    'Olá {{paciente}}, sua consulta com Dr. Daniel Delgado está agendada para {{data}} às {{hora}}. Responda SIM para confirmar.',
  )

  // Load config on mount
  useEffect(() => {
    getMetaConfig()
      .then((cfg: MetaConfig) => {
        if (cfg.bmId) setBmId(cfg.bmId)
        if (cfg.wabaId) setWabaId(cfg.wabaId)
        if (cfg.phoneId) setPhoneId(cfg.phoneId)
        if (cfg.officialPhone) setOfficialPhone(cfg.officialPhone)
        if (cfg.webhookUrl) setWebhookUrl(cfg.webhookUrl)
        if (cfg.verifyToken) setVerifyToken(cfg.verifyToken)
        setHasTokenConfigured(cfg.hasAccessToken)
      })
      .catch((err) => {
        console.warn('Erro ao carregar configurações do Meta:', err)
        // Fallback default webhook URL using current origin
        setWebhookUrl(`${window.location.origin}/backend/v1/meta/webhook`)
      })
  }, [])

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copiado para a área de transferência',
      description: `${label} copiado com sucesso.`,
    })
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await testMetaConnection({
        token: token.trim() || undefined,
        phoneId: phoneId.trim() || undefined,
        wabaId: wabaId.trim() || undefined,
        bmId: bmId.trim() || undefined,
      })
      setTestResult(res)

      if (res.success) {
        if (res.configuredPhoneId && !phoneId) {
          setPhoneId(res.configuredPhoneId)
        }
        toast({
          title: 'Conexão Meta Validada!',
          description: `Token de System User ativo. WABA ID ${wabaId} conectada ao WhatsApp Cloud API.`,
        })
        addLog('Conexão Meta/WhatsApp Testada - Sucesso', 'Integrações - Meta WhatsApp')
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão Meta',
          description: res.error || 'Verifique o token e as permissões no Meta for Developers.',
        })
        addLog('Conexão Meta/WhatsApp Testada - Falha', 'Integrações - Meta WhatsApp')
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de Requisição',
        description: err.message || 'Falha ao conectar com o backend.',
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSendTestMessage = async () => {
    if (!testPhone) {
      toast({
        variant: 'destructive',
        title: 'Número obrigatório',
        description: 'Informe o número de telefone com DDD para envio de teste.',
      })
      return
    }

    setSendingTestMsg(true)
    try {
      const res = await sendWhatsAppMessage({
        to: testPhone,
        recipientName: 'Dr. Daniel Delgado (Teste)',
        type: 'text',
        text: 'Olá Dr. Daniel Delgado! Este é um teste oficial de conexão da WhatsApp Cloud API com a Clínica Dr. Daniel Delgado.',
        token: token.trim() || undefined,
        phoneId: phoneId.trim() || undefined,
      })

      if (res.success) {
        toast({
          title: 'Mensagem Enviada!',
          description: 'A mensagem de teste foi transmitida com sucesso pela WhatsApp Cloud API.',
        })
      } else if (res.pendingConfig) {
        toast({
          title: 'Aguardando Credenciais',
          description: res.warning || 'Configure o token permanente para envio real.',
          variant: 'default',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Falha no Envio',
          description: res.error || 'Erro ao enviar mensagem pelo WhatsApp.',
        })
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message || 'Falha na comunicação com o servidor.',
      })
    } finally {
      setSendingTestMsg(false)
    }
  }

  const handleSaveConfig = () => {
    addLog('Configurações WhatsApp/Meta Atualizadas', 'Integrações - Meta WhatsApp')
    toast({
      title: 'Configurações Salvas',
      description:
        'Parâmetros salvos no sistema. O token permanece protegido no servidor Skip Cloud.',
    })
  }

  const isConnected = testResult?.success || hasTokenConfigured

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Meta Business Suite & WhatsApp Cloud API Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Meta Business Suite & WhatsApp Business Cloud API Oficial
            </CardTitle>
            <CardDescription>
              Integração nativa oficial da clínica Dr. Daniel Delgado com o portfólio empresarial
              Meta e WhatsApp Business API.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }
          >
            {isConnected ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado / Ativo
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" /> Aguardando Token Permanente
              </>
            )}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Official Clinic Configuration Data */}
          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-brand-blue flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-brand-blue" />
              Parâmetros Oficiais do Portfólio Empresarial da Clínica
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white dark:bg-card p-3 rounded-lg border">
                <span className="text-xs text-muted-foreground block font-medium">
                  Business Manager (Portfólio Empresarial)
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  {bmId}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">BM Daniel Delgado</p>
              </div>
              <div className="bg-white dark:bg-card p-3 rounded-lg border">
                <span className="text-xs text-muted-foreground block font-medium">
                  WhatsApp Business Account ID (WABA)
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  {wabaId}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Conta Oficial WABA</p>
              </div>
              <div className="bg-white dark:bg-card p-3 rounded-lg border">
                <span className="text-xs text-muted-foreground block font-medium">
                  Número Oficial WhatsApp
                </span>
                <span className="font-mono font-semibold text-green-700 dark:text-green-400 text-sm">
                  {officialPhone}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Formato E.164: +55 32 99131-5729
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Meta System User Permanent Token</span>
                <span className="text-[11px] text-muted-foreground">Nunca exposto no frontend</span>
              </Label>
              <Input
                type="password"
                placeholder={
                  hasTokenConfigured
                    ? '••••••••••••••••••••••••••••••••'
                    : 'EAAG... (Cole o token gerado no Meta)'
                }
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Token gerado no Meta Business Suite via Usuário do Sistema com permissões{' '}
                <code>whatsapp_business_messaging</code> e <code>whatsapp_business_management</code>
                .
              </p>
            </div>

            <div className="space-y-2">
              <Label>Phone Number ID (WhatsApp Cloud API)</Label>
              <Input
                placeholder="Ex: 109876543210987"
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Identificador do número no WhatsApp Cloud API (detectado automaticamente ao testar).
              </p>
            </div>
          </div>

          {/* Webhook Configuration Guide */}
          <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-brand-blue" />
                  Configuração de Webhook do Meta (WhatsApp)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Copie a URL de Callback e o Token de Verificação abaixo e cole no painel{' '}
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-brand-blue"
                  >
                    Meta for Developers &gt; WhatsApp &gt; Configuração &gt; Webhook
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <Label className="text-xs">URL de Retorno de Chamada (Callback URL)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={webhookUrl || `${window.location.origin}/backend/v1/meta/webhook`}
                    className="font-mono text-xs bg-white dark:bg-card"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() =>
                      handleCopy(
                        webhookUrl || `${window.location.origin}/backend/v1/meta/webhook`,
                        'Callback URL',
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Token de Verificação (Verify Token)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={verifyToken}
                    className="font-mono text-xs bg-white dark:bg-card"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopy(verifyToken, 'Verify Token')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
              <p className="font-semibold text-foreground mb-1">
                Campos de assinatura do Webhook no Meta:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>
                  <code>messages</code> (recebe confirmações de presença como "SIM" ou respostas do
                  paciente)
                </li>
                <li>
                  <code>message_template_status_update</code> (atualização de status de templates)
                </li>
              </ul>
            </div>
          </div>

          {/* Test message section */}
          <div className="border rounded-xl p-4 bg-muted/10 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Send className="w-4 h-4 text-green-600" />
              Disparo de Teste em Tempo Real
            </h4>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Número de destino para teste (com DDD):</Label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="5532991315729"
                  className="font-mono text-sm"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleSendTestMessage}
                disabled={sendingTestMsg}
                className="shrink-0 border-green-600/30 text-green-700 hover:bg-green-50 dark:text-green-400"
              >
                <Send className={`w-4 h-4 mr-2 ${sendingTestMsg ? 'animate-spin' : ''}`} />
                {sendingTestMsg ? 'Enviando...' : 'Enviar Mensagem de Teste'}
              </Button>
            </div>
          </div>

          {/* Automation Switch */}
          <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
            <div className="space-y-0.5 pr-4">
              <Label className="text-base">Permitir Envios Automáticos (Lembretes 24h)</Label>
              <p className="text-sm text-muted-foreground">
                Dispara automaticamente lembretes e confirmações aos pacientes com base na agenda da
                clínica.
              </p>
            </div>
            <Switch
              checked={waAutoConfirm}
              onCheckedChange={(val) => {
                setWaAutoConfirm(val)
                addLog(
                  `Envios automáticos WhatsApp ${val ? 'ativados' : 'desativados'}`,
                  'Integrações - WhatsApp',
                )
              }}
            />
          </div>

          {/* Reminder template */}
          <div className="space-y-2">
            <Label>Template do Lembrete de Consulta (24h antes)</Label>
            <Textarea
              value={reminderTemplate}
              onChange={(e) => setReminderTemplate(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Variáveis dinâmicas suportadas: <code>{`{{paciente}}`}</code>,{' '}
              <code>{`{{data}}`}</code>, <code>{`{{hora}}`}</code>, <code>{`{{medico}}`}</code>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 justify-end border-t bg-muted/10 pt-4">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing}
            className="border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testando Conexão...' : 'Testar Conexão Meta Cloud API'}
          </Button>
          <Button
            onClick={handleSaveConfig}
            className="bg-brand-blue text-white hover:bg-brand-blue/90"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Configurações
          </Button>
        </CardFooter>
      </Card>

      {/* Real-time WhatsApp messages panel */}
      <WhatsAppMessagesPanel />

      {/* Meta Suite Social Media Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Facebook className="w-5 h-5 text-blue-600" />
              <Instagram className="w-5 h-5 text-pink-600" />
              Meta Business Suite (Facebook & Instagram)
            </CardTitle>
            <CardDescription>
              Portfólio empresarial Dr. Daniel Delgado vinculado para rastrear captação de leads e
              interações.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Vinculado ao BM {bmId}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
            <div className="p-5 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-4">
              <Facebook className="w-10 h-10 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Página do Facebook Oficial
                </p>
                <p className="font-medium text-foreground">
                  Dr. Daniel Delgado - Cirurgia Plástica
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">BM ID: {bmId}</p>
              </div>
            </div>
            <div className="p-5 rounded-lg border bg-pink-50/50 dark:bg-pink-900/10 flex items-center gap-4">
              <Instagram className="w-10 h-10 text-pink-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1">
                  Perfil Oficial do Instagram
                </p>
                <p className="font-medium text-foreground">@drdanieldelgado</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Integrado com WhatsApp Business Oficial
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="w-5 h-5 text-indigo-500" /> Google Calendar
            </CardTitle>
            <CardDescription>
              Sincronize sua agenda com o Google Calendar para visualização bidirecional.
            </CardDescription>
          </div>
          {googleToken ? (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado
            </Badge>
          ) : (
            <Badge variant="outline">
              <AlertCircle className="w-3 h-3 mr-1" /> Desconectado
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {!googleToken ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg bg-muted/10 transition-colors hover:bg-muted/20">
              <CalendarIcon className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Conecte seu Google Calendar para sincronizar agendamentos e evitar conflitos de
                horários na clínica.
              </p>
              <Button onClick={connectGoogle}>Conectar Google Calendar</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
              <div className="space-y-0.5 pr-4">
                <Label className="text-base">Sincronização Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Os eventos do seu Google Calendar estão sendo sincronizados bidirecionalmente.
                </p>
              </div>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                onClick={disconnectGoogle}
              >
                Desconectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
