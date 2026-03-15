import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  Database,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  User,
  Key,
  Shield,
  Settings2,
  FileText,
  Activity,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Badge } from '@/components/ui/badge'

interface HiDoctorPortalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
}

export function HiDoctorPortalDialog({
  open,
  onOpenChange,
  patientName,
}: HiDoctorPortalDialogProps) {
  const [credentials, setCredentials] = useState({
    user: 'Dr. Daniel Delgado',
    serial: 'H80ARQW43',
    crm: '37525',
    password: 'CPV2406',
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')
  const [syncData, setSyncData] = useState<any>(null)

  useEffect(() => {
    if (open) {
      setIsConnected(false)
      setError('')
      setSyncData(null)
    }
  }, [open, patientName])

  const handleConnect = () => {
    setIsConnecting(true)
    setError('')
    setTimeout(() => {
      if (credentials.password === 'CPV2406' && credentials.serial === 'H80ARQW43') {
        setIsConnected(true)
        setSyncData({
          patient: patientName === 'Novo Paciente' ? 'Paciente Não Identificado' : patientName,
          history: `${patientName !== 'Novo Paciente' ? patientName : 'O paciente'} relata dores nas pernas ao final do dia. Histórico de varizes na família relatado na primeira consulta.`,
          notes:
            'Realizado ultrassom doppler em membro inferior esquerdo. Presença de refluxo na veia safena magna esquerda. Classificação CEAP C3.',
          lastVisit: new Date().toLocaleDateString('pt-BR'),
          allergies: 'Nenhuma conhecida',
        })
      } else {
        setError(
          'Falha na autenticação. Verifique suas credenciais do HiDoctor (Serial/Senha incorretos).',
        )
      }
      setIsConnecting(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Database className="h-6 w-6 text-primary" /> Portal de Integração HiDoctor
          </DialogTitle>
          <DialogDescription>
            Acesse o banco de dados clínico e gerencie suas credenciais de sincronização.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sync" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="sync">
                <RefreshCw className="h-4 w-4 mr-2" /> Sincronização
              </TabsTrigger>
              <TabsTrigger value="credentials">
                <Settings2 className="h-4 w-4 mr-2" /> Credenciais
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="sync"
            className="flex-1 flex flex-col min-h-0 data-[state=active]:flex m-0 p-6"
          >
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center flex-1 space-y-6 bg-muted/10 rounded-lg border border-dashed">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Database className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight">Conectar ao HiDoctor</h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm">
                    Utilize as credenciais ativas para acessar o banco de dados clínico e buscar
                    informações de{' '}
                    <span className="font-medium text-foreground">{patientName}</span>.
                  </p>
                </div>
                {error && (
                  <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro na Conexão</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    size="lg"
                    className="w-56"
                  >
                    {isConnecting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-5 w-5" />
                    )}
                    {isConnecting ? 'Autenticando...' : 'Iniciar Sincronização'}
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="https://app.hidoctor.com.br/hinetx/" target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-5 w-5" /> Web Link
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <ResizablePanelGroup
                direction="horizontal"
                className="border rounded-xl flex-1 shadow-sm"
              >
                <ResizablePanel defaultSize={50} minSize={30} className="bg-muted/10">
                  <div className="p-4 border-b bg-primary/5 flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-4 w-4" /> Prontuário Externo (HiDoctor)
                    </h4>
                    <Badge variant="outline" className="bg-background">
                      Serial: {credentials.serial}
                    </Badge>
                  </div>
                  <ScrollArea className="h-[calc(100%-60px)]">
                    <div className="p-6 space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                          {syncData?.patient.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{syncData?.patient}</p>
                          <p className="text-sm text-muted-foreground">
                            Última consulta: {syncData?.lastVisit}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h5 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <Activity className="h-4 w-4" /> Histórico Clínico
                          </h5>
                          <div className="p-3 bg-background border rounded-md text-sm leading-relaxed">
                            {syncData?.history}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <h5 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" /> Anotações (Evolução)
                          </h5>
                          <div className="p-3 bg-background border rounded-md text-sm leading-relaxed">
                            {syncData?.notes}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <h5 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <Shield className="h-4 w-4" /> Alergias
                          </h5>
                          <div className="p-3 border rounded-md text-sm text-yellow-700 bg-yellow-50 border-yellow-200">
                            {syncData?.allergies}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={30} className="bg-background">
                  <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4" /> Registros Internos
                    </h4>
                    <Button size="sm" variant="secondary">
                      Mesclar Dados
                    </Button>
                  </div>
                  <ScrollArea className="h-[calc(100%-60px)]">
                    <div className="p-6 space-y-6">
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-sm">Ficha de Avaliação Vascular</h5>
                            <p className="text-xs text-muted-foreground">
                              Criado em {new Date().toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge>Em andamento</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          O paciente relatou desconforto, avaliação inicial realizada. Aguardando
                          dados complementares do sistema HiDoctor.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
          </TabsContent>

          <TabsContent value="credentials" className="flex-1 p-6 m-0 overflow-auto">
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <h3 className="text-lg font-medium">Gestão de Credenciais HiDoctor</h3>
                <p className="text-sm text-muted-foreground">
                  Configure os dados de acesso da API do HiDoctor.
                </p>
              </div>
              <div className="grid gap-6 bg-muted/20 p-6 rounded-xl border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="user" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Usuário
                    </Label>
                    <Input
                      id="user"
                      value={credentials.user}
                      onChange={(e) => setCredentials({ ...credentials, user: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crm" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> CRM
                    </Label>
                    <Input
                      id="crm"
                      value={credentials.crm}
                      onChange={(e) => setCredentials({ ...credentials, crm: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serial" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Número de Série
                    </Label>
                    <Input
                      id="serial"
                      value={credentials.serial}
                      onChange={(e) => setCredentials({ ...credentials, serial: e.target.value })}
                      className="bg-background font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Key className="h-4 w-4" /> Senha (Hinet/API)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="bg-background font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsConnected(false)}>
                    Testar Conexão
                  </Button>
                  <Button onClick={() => setIsConnected(false)}>Salvar Configurações</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
