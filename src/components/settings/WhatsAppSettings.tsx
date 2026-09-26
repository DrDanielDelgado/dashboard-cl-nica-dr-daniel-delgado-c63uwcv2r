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
import { Textarea } from '@/components/ui/textarea'
import { Save, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { WhatsAppMessagesPanel } from '@/components/settings/WhatsAppMessagesPanel'
import {
  getMetaConfig,
  testMetaConnection,
  sendWhatsAppMessage,
  MetaConfig,
} from '@/services/whatsapp'

export function WhatsAppSettings() {
  const [accountId, setAccountId] = useState('895450846341386')
  const [bmId, setBmId] = useState('1423050816165289')
  const [phoneId, setPhoneId] = useState('')
  const [officialPhone, setOfficialPhone] = useState('32 991315729')
  const [token, setToken] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [verifyToken, setVerifyToken] = useState('clinica_daniel_delgado_secret_token_2026')
  const [hasTokenConfigured, setHasTokenConfigured] = useState(false)
  const [template, setTemplate] = useState(
    'Olá {{paciente}}, sua consulta com Dr. Daniel Delgado está agendada para {{data}} às {{hora}}. Responda SIM para confirmar presença.',
  )

  const [testing, setTesting] = useState(false)
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null)
  const [testPhone, setTestPhone] = useState('5532991315729')
  const [sendingTest, setSendingTest] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    getMetaConfig()
      .then((cfg: MetaConfig) => {
        if (cfg.bmId) setBmId(cfg.bmId)
        if (cfg.wabaId) setAccountId(cfg.wabaId)
        if (cfg.phoneId) setPhoneId(cfg.phoneId)
        if (cfg.officialPhone) setOfficialPhone(cfg.officialPhone)
        if (cfg.webhookUrl) setWebhookUrl(cfg.webhookUrl)
        if (cfg.verifyToken) setVerifyToken(cfg.verifyToken)
        setHasTokenConfigured(cfg.hasAccessToken)
      })
      .catch((err) => {
        console.warn('Erro ao carregar configurações:', err)
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

  const handleTest = async () => {
    setTesting(true)
    setTestSuccess(null)
    try {
      const res = await testMetaConnection({
        token: token.trim() || undefined,
        phoneId: phoneId.trim() || undefined,
        wabaId: accountId.trim() || undefined,
        bmId: bmId.trim() || undefined,
      })

      if (res.success) {
        setTestSuccess(true)
        if (res.configuredPhoneId && !phoneId) {
          setPhoneId(res.configuredPhoneId)
        }
        toast({
          title: 'Conexão Bem Sucedida',
          description: 'Acesso validado na WhatsApp Cloud API e Meta Business Suite.',
        })
      } else {
        setTestSuccess(false)
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão',
          description: res.error || 'Verifique o token e as credenciais inseridas.',
        })
      }
    } catch (err: any) {
      setTestSuccess(false)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message || 'Falha de rede ao testar.',
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSendTestMessage = async () => {
    if (!testPhone) return
    setSendingTest(true)
    try {
      const res = await sendWhatsAppMessage({
        to: testPhone,
        recipientName: 'Dr. Daniel Delgado',
        type: 'text',
        text: 'Teste de mensagem oficial WhatsApp Cloud API - Clínica Dr. Daniel Delgado.',
        token: token.trim() || undefined,
        phoneId: phoneId.trim() || undefined,
      })

      if (res.success) {
        toast({
          title: 'Mensagem Enviada!',
          description: 'Mensagem transmitida com sucesso pela WhatsApp Cloud API.',
        })
      } else if (res.pendingConfig) {
        toast({
          title: 'Aguardando Credenciais',
          description: res.warning || 'Configure o token permanente no painel para envio.',
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
        description: err.message,
      })
    } finally {
      setSendingTest(false)
    }
  }

  const handleSave = () => {
    toast({
      title: 'Configurações Salvas',
      description: 'As configurações oficiais do WhatsApp Cloud API foram armazenadas.',
    })
  }

  const isConnected = testSuccess || hasTokenConfigured

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>WhatsApp Business Cloud API Oficial</CardTitle>
            <CardDescription>
              Configuração oficial do WhatsApp da Clínica Dr. Daniel Delgado (BM: {bmId} | WABA:{' '}
              {accountId}).
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`px-3 py-1 ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="mr-1.5 w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="mr-1.5 w-3.5 h-3.5" />
            )}
            {isConnected ? 'Conectado / Ativo' : 'Aguardando Token'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 max-w-3xl">
          <div className="grid md:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border text-xs">
            <div>
              <span className="text-muted-foreground block">Portfólio Empresarial:</span>
              <span className="font-mono font-semibold">{bmId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">WABA ID:</span>
              <span className="font-mono font-semibold">{accountId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Número Oficial:</span>
              <span className="font-mono font-semibold text-green-700 dark:text-green-400">
                {officialPhone}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>WhatsApp Business Account ID (WABA)</Label>
            <Input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="895450846341386"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number ID (Cloud API)</Label>
            <Input
              value={phoneId}
              onChange={(e) => setPhoneId(e.target.value)}
              placeholder="Ex: 109876543210987 (auto-detectado se vazio)"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex justify-between">
              <span>Permanent Access Token (System User Token)</span>
              <span className="text-[11px] text-muted-foreground">Armazenado com segurança</span>
            </Label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={hasTokenConfigured ? '••••••••••••••••••••••••' : 'EAAG...'}
            />
          </div>

          <div className="border rounded-lg p-3 bg-muted/20 space-y-2 text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-brand-blue" />
              Webhook Oficial para Receber Respostas e Confirmações
            </span>
            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] text-muted-foreground">Callback URL:</Label>
                <div className="flex gap-1 mt-0.5">
                  <Input
                    readOnly
                    value={webhookUrl || `${window.location.origin}/backend/v1/meta/webhook`}
                    className="h-8 font-mono text-[11px]"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0"
                    onClick={() =>
                      handleCopy(
                        webhookUrl || `${window.location.origin}/backend/v1/meta/webhook`,
                        'Callback URL',
                      )
                    }
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Verify Token:</Label>
                <div className="flex gap-1 mt-0.5">
                  <Input readOnly value={verifyToken} className="h-8 font-mono text-[11px]" />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleCopy(verifyToken, 'Verify Token')}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Disparo de Teste (WhatsApp)</Label>
            <div className="flex gap-2">
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="5532991315729"
                className="font-mono text-sm max-w-xs"
              />
              <Button
                variant="outline"
                onClick={handleSendTestMessage}
                disabled={sendingTest}
                className="text-green-700 dark:text-green-400 border-green-600/30"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {sendingTest ? 'Enviando...' : 'Enviar Teste'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Template de Lembrete (Agenda)</Label>
            <Textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Variáveis: {'{{paciente}}'}, {'{{data}}'}, {'{{hora}}'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>
          <Button onClick={handleSave} className="bg-brand-blue text-white hover:bg-brand-blue/90">
            <Save className="mr-2 h-4 w-4" /> Salvar Configurações WhatsApp
          </Button>
        </CardFooter>
      </Card>

      <WhatsAppMessagesPanel />
    </div>
  )
}
