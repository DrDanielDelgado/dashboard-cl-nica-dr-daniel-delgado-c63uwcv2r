import { useState, useEffect, useMemo } from 'react'
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
import {
  UploadCloud,
  FileCheck,
  Check,
  ChevronsUpDown,
  Users,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react'
import useFinanceiroStore from '@/stores/financeiro'
import { useHiDoctorStore } from '@/stores/hidoctor'
import { useAppStore } from '@/stores/app'
import { OrcamentoPreviewDialog } from '@/components/financeiro/OrcamentoPreviewDialog'
import { Budget } from '@/types/financeiro'
import { PacientesList } from '@/components/prontuario/PacientesList'
import { PatientAttachmentsTab } from '@/components/prontuario/PatientAttachmentsTab'
import { PrescricaoCfmContent } from '@/components/prontuario/PrescricaoCfmContent'
import { cn } from '@/lib/utils'

export default function Prontuario() {
  const { budgets } = useFinanceiroStore()
  const { patients, fetchPatients, loadSettings } = useHiDoctorStore()
  const { role } = useAppStore()

  // Garante carregamento dos pacientes do banco PocketBase ao abrir /prontuario
  useEffect(() => {
    fetchPatients()
    loadSettings()
  }, [])

  const isSecretary = role === 'Secretária'

  const [activeTab, setActiveTab] = useState<string>('hidoctor')
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [openCombobox, setOpenCombobox] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  // Encontra o objeto do paciente selecionado
  const activePatientObj = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId)
  }, [patients, selectedPatientId])

  const selectedPatientName = activePatientObj?.fullName || ''

  const comboboxPatients = useMemo(() => {
    if (!searchQuery) return patients.slice(0, 50)
    return patients
      .filter((p) => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 50)
  }, [patients, searchQuery])

  const patientBudgets = budgets.filter((b) => b.patient === selectedPatientName)

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
    <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-lg border w-fit mb-4">
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
            {selectedPatientName
              ? selectedPatientName
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
                      setSelectedPatientId(p.id)
                      setOpenCombobox(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedPatientId === p.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{p.fullName}</span>
                      {p.cpf && (
                        <span className="text-[10px] text-muted-foreground">CPF: {p.cpf}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedPatientId && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSelectedPatientId('')}
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          Limpar
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Gestão Clínica Completa
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Dr. Daniel Delgado
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Prontuário 360</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Centralize pacientes sincronizados do HiDoctor, galeria de exames multimídia, prescrição
            CFM e financeiro.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1 p-1 bg-muted/80">
          <TabsTrigger
            value="hidoctor"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 text-brand-blue" />
            Base de Pacientes (HiDoctor)
          </TabsTrigger>
          <TabsTrigger
            value="anexos"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <UploadCloud className="h-4 w-4 text-primary" />
            Importação de Exames / Anexos
          </TabsTrigger>
          {!isSecretary && (
            <TabsTrigger
              value="cfm"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileCheck className="h-4 w-4 text-emerald-600" />
              Prescrição CFM
            </TabsTrigger>
          )}
          {!isSecretary && (
            <TabsTrigger
              value="financeiro"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <CreditCard className="h-4 w-4 text-amber-600" />
              Orçamentos Financeiros
            </TabsTrigger>
          )}
          {!isSecretary && (
            <TabsTrigger
              value="clinico"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Layers className="h-4 w-4 text-purple-600" />
              Atalhos Rápidos
            </TabsTrigger>
          )}
        </TabsList>

        {/* ABA 1: Base de Pacientes */}
        <TabsContent value="hidoctor" className="animate-fade-in">
          <PacientesList />
        </TabsContent>

        {/* ABA 2: Importação de Exames / Anexos (NOVA) */}
        <TabsContent value="anexos" className="animate-fade-in">
          <PatientAttachmentsTab
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
        </TabsContent>

        {/* ABA 3: Prescrição CFM Incorporada (NOVA) */}
        {!isSecretary && (
          <TabsContent value="cfm" className="animate-fade-in">
            <PrescricaoCfmContent showHeader={false} selectedPatientName={selectedPatientName} />
          </TabsContent>
        )}

        {/* ABA 4: Orçamentos Financeiros */}
        {!isSecretary && (
          <TabsContent value="financeiro" className="space-y-4 animate-fade-in">
            <PatientSelector />

            <Card>
              <CardHeader>
                <CardTitle>
                  Orçamentos {selectedPatientName ? `de ${selectedPatientName}` : ''}
                </CardTitle>
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
                            setSelectedBudget(budget as any)
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
                            {selectedPatientName
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

        {/* ABA 5: Atalhos Rápidos e Visão Geral */}
        {!isSecretary && (
          <TabsContent value="clinico" className="space-y-6 animate-fade-in">
            <PatientSelector />

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-600" /> Prescrição Eletrônica (CFM)
                  </CardTitle>
                  <CardDescription>
                    Acesse o módulo oficial do CFM integrado no Prontuário 360 para assinar receitas
                    e atestados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Utilize a aba dedicada &quot;Prescrição CFM&quot; dentro do Prontuário 360 ou
                    clique abaixo para alternar diretamente.
                  </p>
                  <Button
                    variant="default"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
                    onClick={() => setActiveTab('cfm')}
                  >
                    <FileCheck className="h-4 w-4" /> Ir para Ferramenta CFM
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-primary" /> Importação de Exames / Anexos
                  </CardTitle>
                  <CardDescription>
                    Anexe laudos em PDF, imagens ultrassonográficas, exames DICOM e gravações de
                    áudio/vídeo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Central de upload múltiplo com suporte a diversos diretórios, validação até 50MB
                    e visualizadores em nuvem.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10 gap-2 font-semibold"
                    onClick={() => setActiveTab('anexos')}
                  >
                    <UploadCloud className="h-4 w-4" /> Ir para Importação de Exames
                  </Button>
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
