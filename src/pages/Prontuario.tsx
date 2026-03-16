import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link as LinkIcon, UploadCloud, Stethoscope, Check, ChevronsUpDown } from 'lucide-react'
import useFinanceiroStore from '@/stores/financeiro'
import { useHiDoctorStore } from '@/stores/hidoctor'
import { useAppStore } from '@/stores/app'
import { OrcamentoPreviewDialog } from '@/components/financeiro/OrcamentoPreviewDialog'
import { Budget } from '@/types/financeiro'
import { PacientesList } from '@/components/prontuario/PacientesList'
import { cn } from '@/lib/utils'

export default function Prontuario() {
  const { budgets } = useFinanceiroStore()
  const { patients } = useHiDoctorStore()
  const { role } = useAppStore()

  const isSecretary = role === 'Secretária'

  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [openCombobox, setOpenCombobox] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  const comboboxPatients = useMemo(() => {
    if (!searchQuery) return patients.slice(0, 50)
    return patients
      .filter((p) => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 50)
  }, [patients, searchQuery])

  const patientBudgets = budgets.filter((b) => b.patient === selectedPatient)

  const getStatusBadge = (status: string) => {
    const map: Record<string, any> = {
      approved: (
        <Badge variant="secondary" className="bg-success/10 text-success">
          Aprovado
        </Badge>
      ),
      pending: (
        <Badge variant="outline" className="text-yellow-800 border-yellow-300">
          Pendente
        </Badge>
      ),
      sent: (
        <Badge variant="outline" className="text-blue-800 border-blue-300">
          Enviado
        </Badge>
      ),
      declined: <Badge variant="destructive">Recusado</Badge>,
      expired: <Badge variant="destructive">Expirado</Badge>,
    }
    return map[status] || <Badge variant="secondary">Rascunho</Badge>
  }

  const PatientSelector = () => (
    <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border w-fit mb-4">
      <span className="text-sm font-medium text-muted-foreground">Paciente Ativo:</span>
      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCombobox}
            className="w-[300px] justify-between bg-background shadow-sm border-primary/20"
            disabled={patients.length === 0}
          >
            {selectedPatient
              ? selectedPatient
              : patients.length === 0
                ? 'Sincronize primeiro'
                : 'Selecione o paciente...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar paciente..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
              <CommandGroup>
                {comboboxPatients.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.fullName}
                    onSelect={() => {
                      setSelectedPatient(p.fullName)
                      setOpenCombobox(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedPatient === p.fullName ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {p.fullName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prontuário & HiDoctor</h1>
          <p className="text-muted-foreground">
            Sincronize pacientes do HiNetX e centralize o histórico clínico e financeiro.
          </p>
        </div>
      </div>

      <Tabs defaultValue="hidoctor" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="hidoctor">Base Sincronizada (HiDoctor)</TabsTrigger>
          {!isSecretary && <TabsTrigger value="financeiro">Orçamentos Financeiros</TabsTrigger>}
          {!isSecretary && <TabsTrigger value="clinico">Ferramentas Extras</TabsTrigger>}
        </TabsList>

        <TabsContent value="hidoctor" className="animate-fade-in">
          <PacientesList />
        </TabsContent>

        {!isSecretary && (
          <TabsContent value="financeiro" className="space-y-4 animate-fade-in">
            <PatientSelector />

            <Card>
              <CardHeader>
                <CardTitle>Orçamentos {selectedPatient ? `de ${selectedPatient}` : ''}</CardTitle>
                <CardDescription>
                  Histórico de propostas financeiras criadas e enviadas para o paciente atual.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Data de Validade</TableHead>
                        <TableHead>Procedimento</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientBudgets.map((budget) => (
                        <TableRow
                          key={budget.id}
                          className="hover:bg-muted/30 cursor-pointer"
                          onClick={() => {
                            setSelectedBudget(budget)
                            setPreviewOpen(true)
                          }}
                        >
                          <TableCell>
                            {new Date(budget.validityDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium">{budget.procedure}</TableCell>
                          <TableCell>R$ {budget.finalValue.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(budget.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {patientBudgets.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-muted-foreground"
                          >
                            {selectedPatient
                              ? 'Nenhum orçamento encontrado no histórico financeiro deste paciente.'
                              : 'Selecione um paciente para visualizar os orçamentos.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {!isSecretary && (
          <TabsContent value="clinico" className="space-y-6 animate-fade-in">
            <PatientSelector />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" /> Prescrição Eletrônica (CFM)
                  </CardTitle>
                  <CardDescription>
                    Gere receitas digitais com assinatura para este paciente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Utilize o certificado digital A3 ou Nuvem para assinar as prescrições geradas.
                  </p>
                  <Button variant="secondary" className="w-full" disabled={!selectedPatient}>
                    <LinkIcon className="mr-2 h-4 w-4" /> Acessar CFM Prescrição
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Importação de Exames / Anexos</CardTitle>
                  <CardDescription>
                    Anexe laudos ou imagens (Ultrassom/Doppler) na ficha do paciente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground transition-colors',
                      selectedPatient
                        ? 'bg-muted/10 hover:bg-muted/20 cursor-pointer'
                        : 'bg-muted/5 opacity-50 cursor-not-allowed',
                    )}
                  >
                    <UploadCloud className="h-10 w-10 mb-4 text-primary/50" />
                    <p className="font-semibold text-foreground">Clique ou arraste arquivos</p>
                    <p className="text-sm mt-1">Suporta PDF, JPG, DICOM (até 50MB)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <OrcamentoPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        budget={selectedBudget}
      />
    </div>
  )
}
