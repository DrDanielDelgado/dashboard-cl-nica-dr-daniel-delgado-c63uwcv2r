import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Database, Link as LinkIcon, UploadCloud, Stethoscope, ExternalLink } from 'lucide-react'
import useFinanceiroStore from '@/stores/financeiro'
import { OrcamentoPreviewDialog } from '@/components/financeiro/OrcamentoPreviewDialog'
import { HiDoctorPortalDialog } from '@/components/prontuario/HiDoctorPortalDialog'
import { Budget } from '@/types/financeiro'

export default function Prontuario() {
  const { budgets } = useFinanceiroStore()
  const uniquePatients = Array.from(new Set(budgets.map((b) => b.patient)))

  const [selectedPatient, setSelectedPatient] = useState(
    uniquePatients[0] || 'Selecione um paciente',
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [hiDoctorOpen, setHiDoctorOpen] = useState(false)

  const patientBudgets = budgets.filter((b) => b.patient === selectedPatient)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-success/10 text-success">
            Aprovado
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pendente
          </Badge>
        )
      case 'sent':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Enviado (WA)
          </Badge>
        )
      case 'declined':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
            Recusado
          </Badge>
        )
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>
      default:
        return <Badge variant="secondary">Rascunho</Badge>
    }
  }

  const handleOpenBudget = (budget: Budget) => {
    setSelectedBudget(budget)
    setPreviewOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prontuário Eletrônico & Integrações</h1>
          <p className="text-muted-foreground">
            Centralize dados clínicos e histórico financeiro do paciente.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground ml-2">Paciente Ativo:</span>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-[220px] bg-background shadow-sm border-primary/20">
              <SelectValue placeholder="Selecione o paciente..." />
            </SelectTrigger>
            <SelectContent>
              {uniquePatients.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
              <SelectItem value="Novo Paciente">Novo Paciente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="clinico" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="clinico">Integrações Clínicas</TabsTrigger>
          <TabsTrigger value="financeiro">Histórico Financeiro / Orçamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="clinico" className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Database className="h-5 w-5" /> Portal de Integração HiDoctor
                </CardTitle>
                <CardDescription>
                  Sincronize e visualize dados clínicos de{' '}
                  {selectedPatient !== 'Novo Paciente' ? (
                    <span className="font-semibold">{selectedPatient}</span>
                  ) : (
                    'um paciente'
                  )}{' '}
                  com o banco de dados externo HiDoctor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm bg-background p-3 rounded border font-mono text-muted-foreground">
                  Status:{' '}
                  <span className="text-success font-semibold">Pronto para Sincronização</span>
                  <br />
                  Serial Ativo: H80ARQW43
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="default"
                    onClick={() => setHiDoctorOpen(true)}
                    className="flex-1"
                  >
                    <Database className="mr-2 h-4 w-4" /> Acessar Portal
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <a href="https://app.hidoctor.com.br/hinetx/" target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Acesso Web
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                <Button variant="secondary" className="w-full">
                  <LinkIcon className="mr-2 h-4 w-4" /> Acessar CFM Prescrição
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Importação de Exames / Anexos</CardTitle>
              <CardDescription>
                Anexe laudos ou imagens (Ultrassom/Doppler) na ficha do paciente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
                <UploadCloud className="h-10 w-10 mb-4 text-primary/50" />
                <p className="font-semibold text-foreground">Clique ou arraste os arquivos aqui</p>
                <p className="text-sm mt-1">Suporta PDF, JPG, DICOM (até 50MB)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos de {selectedPatient}</CardTitle>
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
                        onClick={() => handleOpenBudget(budget)}
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
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          Nenhum orçamento encontrado no histórico financeiro deste paciente.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrcamentoPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        budget={selectedBudget}
      />
      <HiDoctorPortalDialog
        open={hiDoctorOpen}
        onOpenChange={setHiDoctorOpen}
        patientName={selectedPatient}
      />
    </div>
  )
}
