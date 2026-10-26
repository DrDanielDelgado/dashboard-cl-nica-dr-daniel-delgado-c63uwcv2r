import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Search,
  RefreshCw,
  Database,
  Eye,
  ChevronLeft,
  ChevronRight,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
  Globe,
  ExternalLink,
} from 'lucide-react'
import { useHiDoctorStore } from '@/stores/hidoctor'
import { PatientDetailsDialog } from './PatientDetailsDialog'
import { Patient } from '@/types/paciente'
import { PatientFormDialog } from './PatientFormDialog'
import { HiDoctorImportDialog } from './HiDoctorImportDialog'
import { useRealtime } from '@/hooks/use-realtime'

export function PacientesList() {
  const {
    patients,
    settings,
    isSyncing,
    isTesting,
    progress,
    lastSync,
    lastTestResult,
    errorMessage,
    fetchPatients,
    loadSettings,
    loadLogs,
    testConnection,
    syncData,
  } = useHiDoctorStore()

  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('Todas')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [credentials, setCredentials] = useState({
    serial: 'H80ARQW43',
    crm: '37525',
    password: 'CPV2406',
    apiUrl: 'https://api.hinetx.com.br/v2/prontuarios/sync',
  })
  const [authError, setAuthError] = useState('')
  const [testSuccess, setTestSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
    loadSettings()
    loadLogs()
  }, [])

  useRealtime('patients', () => fetchPatients())
  useRealtime('hidoctor_settings', () => loadSettings())

  // Atualiza credenciais quando settings do banco chegam
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

  const ITEMS_PER_PAGE = 20

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchName =
        p.fullName.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search)
      const matchUnit = unitFilter === 'Todas' || p.unit === unitFilter
      return matchName && matchUnit
    })
  }, [patients, search, unitFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, unitFilter])

  const handleOpenSyncModal = () => {
    setAuthError('')
    setTestSuccess(null)
    setAuthOpen(true)
  }

  const handleTestConnectionClick = async () => {
    setAuthError('')
    setTestSuccess(null)
    try {
      const res = await testConnection({
        serial: credentials.serial,
        crm: credentials.crm,
        password: credentials.password,
        url: credentials.apiUrl,
      })
      if (res.status === 'connected') {
        setTestSuccess('Conexão estabelecida com sucesso!')
      } else {
        setAuthError(res.message)
      }
    } catch (e: any) {
      setAuthError(e.message || 'Falha ao testar conexão.')
    }
  }

  const handleConfirmSync = async () => {
    try {
      setAuthError('')
      setTestSuccess(null)
      await syncData(credentials.serial, credentials.crm, credentials.password, credentials.apiUrl)
      setAuthOpen(false)
    } catch (e: any) {
      setAuthError(e.message)
    }
  }

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const isIntegrationActive = settings?.is_active || false
  const lastSyncStatus = settings?.last_sync_status || 'never'

  return (
    <div className="space-y-4">
      {/* Banner de Diagnóstico e Conexão HiDoctor */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-primary text-xl">
                  <Database className="w-5 h-5" /> Integração HiDoctor (HiNetX)
                </CardTitle>

                {isIntegrationActive ? (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conexão Ativa
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-400 text-amber-800 bg-amber-50 gap-1 text-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Conexão Externa Inativa
                  </Badge>
                )}

                <Badge variant="secondary" className="text-xs">
                  {patients.length} prontuários no banco
                </Badge>
              </div>

              <CardDescription className="text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Médico: <strong>Dr. Daniel Delgado</strong> (CRM: {credentials.crm})
                </span>
                <span>•</span>
                <span>
                  Serial: <strong>{credentials.serial}</strong>
                </span>
                <span>•</span>
                <span>
                  Endpoint:{' '}
                  <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono">
                    {credentials.apiUrl}
                  </code>
                </span>
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Button onClick={() => setCreateOpen(true)} size="sm" className="flex-1 sm:flex-none">
                Novo Paciente
              </Button>

              <Button
                onClick={() => setImportOpen(true)}
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none border-primary/30"
              >
                <UploadCloud className="w-4 h-4 mr-1.5 text-primary" /> Importar Backup (CSV/JSON)
              </Button>

              <Button
                onClick={handleOpenSyncModal}
                disabled={isSyncing}
                size="sm"
                variant="default"
                className="flex-1 sm:flex-none shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar HiDoctor'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isSyncing && (
          <CardContent className="py-2 animate-fade-in border-t border-primary/10">
            <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
              <span>Estabelecendo conexão segura via API HiNetX e processando prontuários...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        )}

        {/* Diagnóstico contextual se a API externa falhou ou está inativa */}
        {!isIntegrationActive && (
          <CardContent className="py-2.5 pt-0">
            <Alert className="border-amber-200 bg-amber-50/70 text-amber-900 py-2.5 text-xs">
              <Info className="h-4 w-4 text-amber-700" />
              <AlertTitle className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                Diagnóstico da Conexão HiDoctor
              </AlertTitle>
              <AlertDescription className="text-amber-800 space-y-1">
                <p>
                  O endpoint público da API HiDoctor (
                  <code className="font-mono text-[11px]">api.hinetx.com.br</code>) não responde
                  diretamente via DNS da internet comercial (o HiDoctor tradicional opera via
                  software instalado e portal web).
                </p>
                <p>
                  <strong>Como sincronizar seus dados agora:</strong> Você pode clicar em{' '}
                  <span
                    className="font-semibold underline cursor-pointer"
                    onClick={() => setImportOpen(true)}
                  >
                    "Importar Backup (CSV/JSON)"
                  </span>{' '}
                  para enviar a exportação gerada no seu HiDoctor, ou acessar o portal{' '}
                  <a
                    href="https://app.hidoctor.com.br/hinet/?tpl=win"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold inline-flex items-center gap-0.5 text-amber-950"
                  >
                    HiDoctor NET Web <ExternalLink className="w-3 h-3" />
                  </a>
                  .
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Tabela de Prontuários */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>
                Prontuários & Pacientes Ativos{' '}
                {filteredPatients.length > 0 && `(${filteredPatients.length})`}
              </CardTitle>
              <CardDescription>
                {lastSync
                  ? `Último registro/sincronização: ${lastSync}`
                  : 'Registros armazenados no banco de dados da clínica.'}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente ou CPF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas as Unidades</SelectItem>
                  <SelectItem value="Juiz de Fora">Juiz de Fora</SelectItem>
                  <SelectItem value="Leopoldina">Leopoldina</SelectItem>
                  <SelectItem value="Além Paraíba">Além Paraíba</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-6">Nome Completo</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone / Contato</TableHead>
                  <TableHead>Última Consulta / Atualização</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedPatient(p)}
                    >
                      <TableCell className="font-medium pl-6">
                        <div className="flex flex-col">
                          <span className="text-slate-900">{p.fullName}</span>
                          {p.email && (
                            <span className="text-xs text-muted-foreground">{p.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.cpf || <span className="text-muted-foreground text-xs">Não inf.</span>}
                      </TableCell>
                      <TableCell>
                        {p.phone || <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell>
                        {p.lastConsultation ? (
                          new Date(p.lastConsultation).toLocaleDateString('pt-BR')
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" /> Prontuário
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      {patients.length === 0 ? (
                        <div className="space-y-3 max-w-sm mx-auto">
                          <p>Nenhum prontuário registrado ou sincronizado ainda.</p>
                          <div className="flex justify-center gap-2">
                            <Button size="sm" onClick={() => setImportOpen(true)}>
                              <UploadCloud className="w-4 h-4 mr-1.5" /> Importar Arquivo
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                              Cadastrar Paciente
                            </Button>
                          </div>
                        </div>
                      ) : (
                        'Nenhum paciente encontrado com estes filtros.'
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredPatients.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-muted/10 gap-4">
              <p className="text-sm text-muted-foreground">
                Mostrando{' '}
                {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredPatients.length)} a{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} de{' '}
                {filteredPatients.length} registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Próxima <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PatientDetailsDialog
        patient={selectedPatient}
        open={!!selectedPatient}
        onOpenChange={(val) => !val && setSelectedPatient(null)}
      />

      <PatientFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <HiDoctorImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {/* Modal de Autenticação e Sincronização com HiDoctor */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Sincronização HiDoctor (HiNetX)
            </DialogTitle>
            <DialogDescription>
              Valide as credenciais e teste a conectividade com a API do HiDoctor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {authError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">Falha na Comunicação</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed">{authError}</AlertDescription>
              </Alert>
            )}

            {testSuccess && (
              <Alert className="py-2.5 bg-emerald-50 border-emerald-200 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-xs font-semibold">Sucesso</AlertTitle>
                <AlertDescription className="text-xs">{testSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="apiUrl" className="flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5" /> URL do Endpoint da API HiDoctor
              </Label>
              <Input
                id="apiUrl"
                value={credentials.apiUrl}
                onChange={(e) => setCredentials({ ...credentials, apiUrl: e.target.value })}
                placeholder="https://api.hinetx.com.br/v2/prontuarios/sync"
                className="font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="serial" className="text-xs">
                  Número de Série (Licença)
                </Label>
                <Input
                  id="serial"
                  value={credentials.serial}
                  onChange={(e) => setCredentials({ ...credentials, serial: e.target.value })}
                  placeholder="Ex: H80ARQW43"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crm" className="text-xs">
                  CRM Médico
                </Label>
                <Input
                  id="crm"
                  value={credentials.crm}
                  onChange={(e) => setCredentials({ ...credentials, crm: e.target.value })}
                  placeholder="Ex: 37525"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs">
                Senha de Acesso API / HiNetX
              </Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-muted-foreground border-t">
              <span>Testar se o endpoint responde antes de sincronizar</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnectionClick}
                disabled={isTesting || isSyncing}
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                {isTesting ? 'Testando...' : 'Testar Conexão'}
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAuthOpen(false)}
              disabled={isSyncing || isTesting}
            >
              Fechar
            </Button>
            <Button onClick={handleConfirmSync} disabled={isSyncing || isTesting}>
              {isSyncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isSyncing ? 'Sincronizando...' : 'Iniciar Sincronização'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
