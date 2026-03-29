import { useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { useAuditStore } from '@/stores/audit'
import {
  MessageSquare,
  Facebook,
  Instagram,
  Share2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  AlertCircle,
  Plug,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { useAgendaStore } from '@/stores/agenda'

export function IntegrationsSettings() {
  const { googleToken, connectGoogle, disconnectGoogle } = useAgendaStore()
  const { addLog } = useAuditStore()
  const { toast } = useToast()

  const [waKeys, setWaKeys] = useState({ apiKey: '', phoneId: '', accountId: '' })
  const [waStatus, setWaStatus] = useState<'disconnected' | 'testing' | 'connected' | 'error'>(
    'disconnected',
  )
  const [waAutoConfirm, setWaAutoConfirm] = useState(false)

  const [metaConnected, setMetaConnected] = useState(false)

  const handleTestWa = () => {
    setWaStatus('testing')
    setTimeout(() => {
      if (waKeys.apiKey && waKeys.phoneId && waKeys.accountId) {
        setWaStatus('connected')
        toast({ title: 'Sucesso', description: 'WhatsApp Business API conectado com sucesso.' })
        addLog('Conexão WhatsApp Testada - Sucesso', 'Integrações - WhatsApp')
      } else {
        setWaStatus('error')
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão',
          description: 'Verifique as credenciais e tente novamente.',
        })
        addLog('Conexão WhatsApp Testada - Falha', 'Integrações - WhatsApp')
      }
    }, 1200)
  }

  const handleSaveWa = () => {
    addLog('Configurações do WhatsApp Atualizadas', 'Integrações - WhatsApp')
    toast({ title: 'Salvo', description: 'As configurações do WhatsApp foram salvas.' })
  }

  const handleConnectMeta = () => {
    setMetaConnected(true)
    addLog('Conta Meta (FB/IG) Conectada', 'Integrações - Meta')
    toast({
      title: 'Meta Integrado',
      description: 'Suas contas do Facebook e Instagram foram vinculadas com sucesso.',
    })
  }

  const getBadge = (status: 'disconnected' | 'testing' | 'connected' | 'error') => {
    if (status === 'connected')
      return (
        <Badge
          variant="outline"
          className="bg-success/10 text-success border-success/20 hover:bg-success/20"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" /> Ativo
        </Badge>
      )
    if (status === 'testing')
      return (
        <Badge variant="secondary">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Testando...
        </Badge>
      )
    if (status === 'error')
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" /> Erro de Conexão
        </Badge>
      )
    return (
      <Badge variant="outline">
        <AlertCircle className="w-3 h-3 mr-1" /> Desconectado
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-green-500" /> WhatsApp Business API
            </CardTitle>
            <CardDescription>
              Gerencie credenciais para habilitar o envio de mensagens e automações via WhatsApp.
            </CardDescription>
          </div>
          {getBadge(waStatus)}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>API Key (System User Token)</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={waKeys.apiKey}
                onChange={(e) => setWaKeys({ ...waKeys, apiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number ID</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={waKeys.phoneId}
                onChange={(e) => setWaKeys({ ...waKeys, phoneId: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2 max-w-2xl">
              <Label>WhatsApp Business Account ID</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={waKeys.accountId}
                onChange={(e) => setWaKeys({ ...waKeys, accountId: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
            <div className="space-y-0.5 pr-4">
              <Label className="text-base">Permitir Envios Automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Habilita a conta do WhatsApp para ser utilizada pelas Automações 360 do sistema.
              </p>
            </div>
            <Switch
              checked={waAutoConfirm}
              onCheckedChange={(val) => {
                setWaAutoConfirm(val)
                addLog(
                  `Permissão de automações WhatsApp ${val ? 'ativada' : 'desativada'}`,
                  'Integrações - WhatsApp',
                )
              }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-end border-t bg-muted/10 pt-4">
          <Button variant="outline" onClick={handleTestWa} disabled={waStatus === 'testing'}>
            <RefreshCw className={`w-4 h-4 mr-2 ${waStatus === 'testing' ? 'animate-spin' : ''}`} />
            Testar Conexão
          </Button>
          <Button onClick={handleSaveWa}>
            <Save className="w-4 h-4 mr-2" /> Salvar Configurações
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Facebook className="w-5 h-5 text-blue-600" />
              <Instagram className="w-5 h-5 text-pink-600" />
              Meta Business Suite
            </CardTitle>
            <CardDescription>
              Vincule suas contas do Facebook e Instagram para rastrear interações de leads no CRM.
            </CardDescription>
          </div>
          {metaConnected ? (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Ativo
            </Badge>
          ) : (
            <Badge variant="outline">
              <AlertCircle className="w-3 h-3 mr-1" /> Desconectado
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {!metaConnected ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg bg-muted/10 transition-colors hover:bg-muted/20">
              <Share2 className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Nenhuma conta vinculada atualmente. Conecte sua página do Facebook e perfil do
                Instagram para habilitar os recursos de Automação 360 para essas redes.
              </p>
              <Button onClick={handleConnectMeta}>
                <Plug className="w-4 h-4 mr-2" /> Conectar Conta Meta
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
              <div className="p-5 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-4">
                <Facebook className="w-10 h-10 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    Página do Facebook
                  </p>
                  <p className="font-medium text-foreground">Clínica Delgado Integrada</p>
                </div>
              </div>
              <div className="p-5 rounded-lg border bg-pink-50/50 dark:bg-pink-900/10 flex items-center gap-4">
                <Instagram className="w-10 h-10 text-pink-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1">
                    Perfil do Instagram
                  </p>
                  <p className="font-medium text-foreground">@clinicadelgado</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              <Button onClick={connectGoogle}>
                <Plug className="w-4 h-4 mr-2" /> Conectar Google Calendar
              </Button>
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
