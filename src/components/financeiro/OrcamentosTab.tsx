import { useState } from 'react'
import { Plus, Search, MoreHorizontal, FileText, Edit, Trash, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrcamentoFormDialog } from './OrcamentoFormDialog'
import { OrcamentoPreviewDialog } from './OrcamentoPreviewDialog'
import { Budget } from '@/types/financeiro'
import { useToast } from '@/hooks/use-toast'
import useFinanceiroStore from '@/stores/financeiro'

export function OrcamentosTab() {
  const { budgets, addBudget, updateBudget, deleteBudget, updateBudgetStatus } =
    useFinanceiroStore()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const { toast } = useToast()

  const filtered = budgets.filter((b) => b.patient?.toLowerCase().includes(search.toLowerCase()))

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
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300"
          >
            Recusado
          </Badge>
        )
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>
      default:
        return <Badge variant="secondary">Rascunho</Badge>
    }
  }

  const handleDelete = (id: string) => {
    deleteBudget(id)
    toast({ title: 'Orçamento Excluído', description: 'O orçamento foi removido com sucesso.' })
  }

  const handleSave = (budget: Budget) => {
    if (budget.id) {
      updateBudget(budget)
      toast({ title: 'Orçamento Atualizado', description: 'As alterações foram salvas.' })
    } else {
      addBudget(budget)
      toast({ title: 'Orçamento Criado', description: 'Novo orçamento gerado com sucesso.' })
    }
    setFormOpen(false)
  }

  const handleWhatsApp = (budget: Budget) => {
    const validade = new Date(budget.validityDate).toLocaleDateString('pt-BR')
    const obs = budget.observations ? `\n\nObservações: ${budget.observations}` : ''
    const text = `Olá ${budget.patient},\n\nAqui é do consultório do Dr. Daniel Delgado (CRM 37.525).\n\nSegue o orçamento para o procedimento: *${budget.procedure}*.\n\nValor Final: R$ ${budget.finalValue.toFixed(2)}\nFormas de Pagamento: ${budget.paymentMethods.join(', ')}\nValidade da Proposta: ${validade}${obs}\n\nQualquer dúvida, estamos à disposição para aprovação e agendamento!`

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    updateBudgetStatus(budget.id, 'sent')
    toast({
      title: 'Enviado via WhatsApp',
      description: 'Status atualizado para "Enviado". O WhatsApp foi aberto em nova aba.',
    })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
          <div>
            <CardTitle>Gerenciamento de Orçamentos</CardTitle>
            <CardDescription>
              Crie, edite e envie aprovações por WhatsApp para os pacientes.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setSelectedBudget(null)
              setFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 max-w-sm relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
            <Input
              placeholder="Buscar por paciente..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Paciente</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Valor Final</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((budget) => (
                  <TableRow key={budget.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{budget.patient}</TableCell>
                    <TableCell>{budget.procedure}</TableCell>
                    <TableCell>R$ {budget.finalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(budget.validityDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{getStatusBadge(budget.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleWhatsApp(budget)}>
                            <MessageCircle className="w-4 h-4 mr-2 text-green-600" /> Enviar
                            WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBudget(budget)
                              setPreviewOpen(true)
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" /> Gerar Documento
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBudget(budget)
                              setFormOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(budget.id)}
                          >
                            <Trash className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum orçamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OrcamentoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        budget={selectedBudget}
        onSave={handleSave}
      />

      <OrcamentoPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        budget={selectedBudget}
      />
    </div>
  )
}
