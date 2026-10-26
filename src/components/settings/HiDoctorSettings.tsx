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
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useHiDoctorStore } from '@/stores/hidoctor'
import {
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Globe,
  UploadCloud,
  History,
  Activity,
  ExternalLink,
} from 'lucide-react'
import { HiDoctorImportDialog } from '@/components/prontuario/HiDoctorImportDialog'

export function HiDoctorSettings() {
  const {
    syncData,
    testConnection,
    isSyncing,
    isTesting,
    progress,
    lastSync,
    patients,
    settings,
    syncLogs,
    loadSettings,
    loadLogs,
  } = useHiDoctorStore()

  const [credentials, setCredentials] = useState({
    serial: 'H80ARQW43',
    crm: '37525',
    password: 'CPV2406',
    apiUrl: 'https://api.hinetx.com.br/v2/prontuarios/sync',
  })
  const [error, setError] = useState('')
  const [testSuccess, setTestSuccess] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    loadSettings()
    loadLogs()
  }, [])

  useEffect(() => {
    if (settings) {
      setCredentials((prev) => ({
        ...prev,
        serial: settings.serial || prev.serial,
        crm: settings.crm || prev.crm,
        apiUrl: settings.api_url || prev.apiUrl,
        password: settings.password || prev.password,
      }))
    }
  }, [settings])

  const handleTest = async () => {
    setError('')
    setTestSuccess(null)
    try {
      const res = await testConnection({
        serial: credentials.serial,
        crm: credentials.crm,
        password: credentials.password,
        url: credentials.apiUrl,
      })
      if (res.status === 'connected') {
        setTestSuccess('Conexão realizada com sucesso com o servidor HiDoctor.')
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao testar conexão.')
    }
  }

  const handleSync = async () => {
    setError('')
    setTestSuccess(null)
    try {
      await syncData(credentials.serial, credentials.crm, credentials.password, credentials.apiUrl)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const isConnected = settings?.is_active || false

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> Integração HiDoctor (HiNetX)
              </CardTitle>
              <CardDescription>
                Configure a conexão com o prontuário eletrônico HiDoctor para importar e manter
                sincronizada a base clínica.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium border border-success/20">
                  <CheckCircle2 className="w-4 h-4" /> Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-sm font-medium border border-amber-200">
                  <AlertTriangle className="w-4 h-4" /> API Externa Inativa
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">
                Falha de Comunicação com HiDoctor
              </AlertTitle>
              <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
            </Alert>
          )}

          {testSuccess && (
            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-sm font-semibold">Teste Positivo</AlertTitle>
              <AlertDescription className="text-xs">{testSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="apiUrl" className="flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5" /> URL da API HiDoctor (HiNetX)
              </Label>
              <Input
                id="apiUrl"
                value={credentials.apiUrl}
                onChange={(e) => setCredentials({ ...credentials, apiUrl: e.target.value })}
                disabled={isSyncing}
                placeholder="https://api.hinetx.com.br/v2/prontuarios/sync"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial" className="text-xs">
                Número de Série (Licença)
              </Label>
              <Input
                id="serial"
                value={credentials.serial}
                onChange={(e) => setCredentials({ ...credentials, serial: e.target.value })}
                disabled={isSyncing}
                placeholder="Ex: H80ARQW43"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm" className="text-xs">
                CRM do Titular
              </Label>
              <Input
                id="crm"
                value={credentials.crm}
                onChange={(e) => setCredentials({ ...credentials, crm: e.target.value })}
                disabled={isSyncing}
                placeholder="Ex: 37525"
                className="text-xs"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password" className="text-xs">
                Senha de API / HiNetX
              </Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                disabled={isSyncing}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {isSyncing && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Efetuando requisição e processando prontuários...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-muted/20 rounded-lg border gap-3 text-xs">
            <div>
              <p className="font-medium text-foreground">
                Base local: <strong>{patients.length} prontuários</strong> ativos no banco
              </p>
              <p className="text-muted-foreground mt-0.5">
                {lastSync
                  ? `Última sincronização efetuada em: ${lastSync}`
                  : 'Nenhuma sincronização direta efetuada.'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportOpen(true)}
                className="text-xs"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Importar Backup
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <a
                  href="https://app.hidoctor.com.br/hinet/?tpl=win"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1"
                >
                  Abrir HiDoctor Web <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 flex flex-wrap justify-between gap-3">
          <Button variant="outline" onClick={handleTest} disabled={isSyncing || isTesting}>
            {isTesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isTesting ? 'Testando Conectividade...' : 'Testar Conexão com API'}
          </Button>

          <Button onClick={handleSync} disabled={isSyncing || isTesting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Iniciar Sincronização'}
          </Button>
        </CardFooter>
      </Card>

      {/* Histórico de Auditoria / Logs de Sincronização HiDoctor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-primary" /> Histórico de Sincronização e Auditoria
          </CardTitle>
          <CardDescription className="text-xs">
            Registro detalhado das tentativas de conexão e importação de prontuários.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-xs">
                  <TableHead className="pl-6">Data / Hora</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Novos / Atualizados</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.length > 0 ? (
                  syncLogs.map((log) => (
                    <TableRow key={log.id} className="text-xs">
                      <TableCell className="pl-6 font-mono text-muted-foreground">
                        {new Date(log.created).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {log.trigger_type === 'file_import'
                            ? 'Arquivo / Backup'
                            : log.trigger_type === 'manual'
                              ? 'API HiDoctor'
                              : log.trigger_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge className="bg-emerald-600 text-white text-[10px]">Sucesso</Badge>
                        ) : log.status === 'partial' ? (
                          <Badge variant="secondary" className="text-[10px]">
                            Parcial
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            Falhou
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.records_imported} novos / {log.records_updated} atualizados
                      </TableCell>
                      <TableCell
                        className="max-w-md truncate text-muted-foreground"
                        title={log.message}
                      >
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground text-xs"
                    >
                      Nenhum registro de auditoria disponível ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <HiDoctorImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
