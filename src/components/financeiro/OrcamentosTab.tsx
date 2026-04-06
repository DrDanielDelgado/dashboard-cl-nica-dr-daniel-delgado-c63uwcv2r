import { useState } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Edit,
  Trash,
  MessageCircle,
  Link as LinkIcon,
  CheckCircle,
} from 'lucide-react'
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { OrcamentoFormDialog } from './OrcamentoFormDialog'
import { OrcamentoPreviewDialog } from './OrcamentoPreviewDialog'
import { Budget } from '@/stores/financeiro'
import { useToast } from '@/hooks/use-toast'
import useFinanceiroStore from '@/stores/financeiro'
import { createBudget, updateBudget, deleteBudget } from '@/services/api'

export function OrcamentosTab() {
  const { budgets, generatePaymentLink } = useFinanceiroStore()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const { toast } = useToast()

  const filtered = budgets.filter((b) => b.patient?.toLowerCase().includes(search.toLowerCase()))

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            Pago
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
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
      case 'rejected':
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

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id)
      toast({ title: 'Orçamento Excluído', description: 'O orçamento foi removido com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleSave = async (budget: Budget) => {
    try {
      const payload = {
        patient: budget.patientId,
        amount: budget.finalValue,
        status: budget.status.charAt(0).toUpperCase() + budget.status.slice(1),
        items: {
          procedure: budget.procedure,
          value: budget.value,
          discount: budget.discount,
          validityDate: budget.validityDate,
          paymentMethods: budget.paymentMethods,
          unit: budget.unit,
        },
      }
      if (budget.id) {
        await updateBudget(budget.id, payload)
        toast({ title: 'Orçamento Atualizado', description: 'As alterações foram salvas.' })
      } else {
        await createBudget(payload)
        toast({ title: 'Orçamento Criado', description: 'Novo orçamento gerado com sucesso.' })
      }
      setFormOpen(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateBudget(id, { status: status.charAt(0).toUpperCase() + status.slice(1) })
      toast({ title: 'Status Atualizado' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleWhatsApp = (budget: Budget) => {
    const validade = new Date(budget.validityDate).toLocaleDateString('pt-BR')
    const obs = budget.observations ? `\n\nObservações: ${budget.observations}` : ''
    const link = budget.paymentLink ? `\n\nLink para Pagamento Seguro: ${budget.paymentLink}` : ''
    const text = `Olá ${budget.patient},\n\nAqui é do consultório do Dr. Daniel Delgado (CRM 37.525).\n\nSegue o orçamento para o procedimento: *${budget.procedure}*.\n\nValor Final: R$ ${budget.finalValue.toFixed(2)}\nFormas de Pagamento: ${budget.paymentMethods.join(', ')}\nValidade da Proposta: ${validade}${obs}${link}\n\nQualquer dúvida, estamos à disposição para aprovação e agendamento!`

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    if (budget.status === 'pending' || budget.status === 'draft') {
      handleStatusUpdate(budget.id, 'Sent')
    }
    toast({
      title: 'Enviado via WhatsApp',
      description: 'O WhatsApp foi aberto em nova aba com a mensagem preenchida.',
    })
  }

  const isFollowUp = (budget: Budget) => {
    if (budget.status !== 'pending' && budget.status !== 'sent') return false
    const diff = new Date(budget.validityDate).getTime() - new Date().getTime()
    return diff > 0 && diff <= 48 * 60 * 60 * 1000
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
          <div>
            <CardTitle>Gerenciamento de Orçamentos e Cobranças</CardTitle>
            <CardDescription>
              Crie orçamentos, envie aprovações por WhatsApp e gerencie os recebimentos.
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
                    <TableCell className="font-medium">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {budget.patient}
                        {isFollowUp(budget) && (
                          <Badge
                            variant="destructive"
                            className="w-fit h-5 px-1.5 text-[10px] uppercase tracking-wider bg-orange-500 hover:bg-orange-600 animate-pulse"
                          >
                            Follow-up
                          </Badge>
                        )}
                        {budget.paymentLink && budget.status !== 'paid' && (
                          <Badge
                            variant="outline"
                            className="w-fit h-5 px-1.5 text-[10px] text-muted-foreground border-muted-foreground/30"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" /> Link Gerado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
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
                          {budget.status !== 'paid' && (
                            <>
                              {generatePaymentLink && (
                                <DropdownMenuItem onClick={() => generatePaymentLink(budget.id)}>
                                  <LinkIcon className="w-4 h-4 mr-2" /> Gerar Link Pagamento
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(budget.id, 'paid')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" /> Marcar
                                como Pago
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleWhatsApp(budget)}>
                                <MessageCircle className="w-4 h-4 mr-2 text-green-600" /> Enviar
                                Cobrança (WA)
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBudget(budget)
                              setPreviewOpen(true)
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" /> Ver Documento / Recibo
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
