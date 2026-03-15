import { useState } from 'react'
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
import { Search, RefreshCw, Database, Eye } from 'lucide-react'
import { useHiDoctorStore } from '@/stores/hidoctor'
import { PatientDetailsDialog } from './PatientDetailsDialog'
import { Patient } from '@/types/paciente'

export function PacientesList() {
  const { patients, isSyncing, progress, lastSync, syncData } = useHiDoctorStore()
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('Todas')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const filteredPatients = patients.filter((p) => {
    const matchName = p.fullName.toLowerCase().includes(search.toLowerCase())
    const matchUnit = unitFilter === 'Todas' || p.unit === unitFilter
    return matchName && matchUnit
  })

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
            <Button
              onClick={syncData}
              disabled={isSyncing}
              size="lg"
              className="w-full sm:w-auto shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar com HiDoctor'}
            </Button>
          </div>
        </CardHeader>
        {isSyncing && (
          <CardContent className="py-2 animate-fade-in">
            <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
              <span>Baixando prontuários de app.hidoctor.com.br...</span>
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
              <CardTitle>Pacientes Sincronizados</CardTitle>
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
                  placeholder="Buscar paciente..."
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
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead>Unidade Clínica</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedPatient(p)}
                    >
                      <TableCell className="font-medium">{p.fullName}</TableCell>
                      <TableCell>
                        {new Date(p.lastConsultation).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" /> Abrir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      {patients.length === 0
                        ? 'Nenhum paciente sincronizado. Clique em "Sincronizar com HiDoctor" para começar.'
                        : 'Nenhum paciente encontrado com estes filtros.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PatientDetailsDialog
        patient={selectedPatient}
        open={!!selectedPatient}
        onOpenChange={(val) => !val && setSelectedPatient(null)}
      />
    </div>
  )
}
