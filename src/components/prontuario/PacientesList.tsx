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
import { Search, RefreshCw, Database, Eye, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { useHiDoctorStore } from '@/stores/hidoctor'
import { PatientDetailsDialog } from './PatientDetailsDialog'
import { Patient } from '@/types/paciente'
import { PatientFormDialog } from './PatientFormDialog'
import { getPatients } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'

export function PacientesList() {
  const { patients, setPatients, isSyncing, progress, lastSync, syncData } = useHiDoctorStore()
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('Todas')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const loadData = async () => {
    try {
      const data = await getPatients()
      setPatients(
        data.map((p: any) => ({
          id: p.id,
          fullName: p.name,
          cpf: p.cpf || '',
          phone: p.phone || '',
          email: p.email || '',
          lastConsultation: p.updated,
          unit: 'Juiz de Fora',
          status: 'Ativo',
        })),
      )
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('patients', () => loadData())
  const [currentPage, setCurrentPage] = useState(1)

  const [authOpen, setAuthOpen] = useState(false)
  const [credentials, setCredentials] = useState({
    serial: 'H80ARQW43',
    crm: '37525',
    password: 'CPV2406',
  })
  const [authError, setAuthError] = useState('')

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

  const handleSyncClick = () => {
    setAuthOpen(true)
  }

  const handleConfirmSync = async () => {
    try {
      setAuthError('')
      await syncData(credentials.serial, credentials.crm, credentials.password)
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

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Database className="w-5 h-5" /> Motor de Sincronização HiNetX
              </CardTitle>
              <CardDescription>
                Conectado como: Dr. Daniel Delgado (CRM: 37525) | Serial: H80ARQW43
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => setCreateOpen(true)} size="lg" className="flex-1 sm:flex-none">
                Novo Paciente
              </Button>
              <Button
                onClick={handleSyncClick}
                disabled={isSyncing}
                size="lg"
                variant="outline"
                className="flex-1 sm:flex-none shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sinc...' : 'Sync HiDoctor'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {isSyncing && (
          <CardContent className="py-2 animate-fade-in">
            <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
              <span>Estabelecendo conexão segura via API HiNetX e baixando prontuários...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>
                Pacientes Sincronizados{' '}
                {filteredPatients.length > 0 && `(${filteredPatients.length})`}
              </CardTitle>
              <CardDescription>
                {lastSync
                  ? `Última sincronização: ${lastSync}`
                  : 'Nenhuma sincronização realizada.'}
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
                  <TableHead>Última Consulta</TableHead>
                  <TableHead>Unidade Clínica</TableHead>
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
                      <TableCell className="font-medium pl-6">{p.fullName}</TableCell>
                      <TableCell>{p.cpf}</TableCell>
                      <TableCell>
                        {new Date(p.lastConsultation).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" /> Abrir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      {patients.length === 0
                        ? 'Nenhum paciente sincronizado. Clique em "Sincronizar com HiDoctor" para começar.'
                        : 'Nenhum paciente encontrado com estes filtros.'}
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

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Autenticação HiNetX
            </DialogTitle>
            <DialogDescription>
              Insira suas credenciais do portal HiDoctor para autorizar o download da base completa
              (5.500+ registros).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {authError && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                {authError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="serial">Número de Série</Label>
              <Input
                id="serial"
                value={credentials.serial}
                onChange={(e) => setCredentials({ ...credentials, serial: e.target.value })}
                placeholder="Ex: H80ARQW43"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm">CRM Médico</Label>
              <Input
                id="crm"
                value={credentials.crm}
                onChange={(e) => setCredentials({ ...credentials, crm: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha API / HiNetX</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAuthOpen(false)} disabled={isSyncing}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSync} disabled={isSyncing}>
              {isSyncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isSyncing ? 'Autenticando...' : 'Autenticar e Sincronizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
