import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { Budget } from '@/types/financeiro'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface RelatorioPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Budget[]
  filters: { units: string[]; startDate: string; endDate: string; status: string }
}

export function RelatorioPreviewDialog({
  open,
  onOpenChange,
  data,
  filters,
}: RelatorioPreviewProps) {
  if (!open) return null

  const handlePrint = () => window.print()

  const grouped = data.reduce(
    (acc, curr) => {
      if (!acc[curr.unit]) acc[curr.unit] = { items: [], total: 0 }
      acc[curr.unit].items.push(curr)
      acc[curr.unit].total += curr.finalValue
      return acc
    },
    {} as Record<string, { items: Budget[]; total: number }>,
  )

  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'approved':
        return 'Aprovado'
      case 'declined':
        return 'Recusado'
      case 'expired':
        return 'Expirado'
      case 'sent':
        return 'Enviado'
      case 'draft':
        return 'Rascunho'
      case 'all':
        return 'Todos'
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-secondary/30 p-4 sm:p-8 overflow-y-auto max-h-[90vh]">
        <DialogTitle className="sr-only">Relatório PDF</DialogTitle>
        <DialogDescription className="sr-only">Documento de relatório</DialogDescription>

        <div className="flex justify-end mb-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="bg-background">
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </div>

        <div className="bg-white p-10 shadow-sm border border-border min-h-[800px] text-black print:shadow-none print:border-none print:p-0 print:m-0">
          <div className="border-b-2 border-primary pb-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-primary tracking-tight">DR. DANIEL DELGADO</h2>
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                Cirurgia Vascular e Angiologia
              </p>
            </div>
            <div className="sm:text-right text-sm text-muted-foreground">
              <p>CRM: 37.525</p>
              <p>Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-6 text-center uppercase tracking-wider">
            Relatório Financeiro de Orçamentos
          </h3>

          <div className="text-sm mb-8 text-muted-foreground bg-muted/20 p-4 rounded-lg border border-muted print:border-gray-300 print:bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <strong>Unidades:</strong>
                <p>{filters.units.join(', ') || 'Nenhuma selecionada'}</p>
              </div>
              <div>
                <strong>Período:</strong>
                <p>
                  {filters.startDate
                    ? new Date(filters.startDate).toLocaleDateString('pt-BR')
                    : 'Início'}
                  {' até '}
                  {filters.endDate ? new Date(filters.endDate).toLocaleDateString('pt-BR') : 'Hoje'}
                </p>
              </div>
              <div>
                <strong>Status:</strong>
                <p>{translateStatus(filters.status)}</p>
              </div>
            </div>
          </div>

          {Object.entries(grouped).map(([unit, { items, total }]) => (
            <div key={unit} className="mb-10">
              <h4 className="text-lg font-bold border-b-2 border-muted pb-2 mb-4 text-primary uppercase tracking-wide">
                {unit}
              </h4>
              <div className="rounded border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-semibold text-black">Paciente</TableHead>
                      <TableHead className="font-semibold text-black">Procedimento</TableHead>
                      <TableHead className="font-semibold text-black">Emissão</TableHead>
                      <TableHead className="font-semibold text-black">Status</TableHead>
                      <TableHead className="font-semibold text-black text-right">
                        Valor Final
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="border-b print:border-gray-200">
                        <TableCell className="font-medium">{item.patient}</TableCell>
                        <TableCell>{item.procedure}</TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{translateStatus(item.status)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          R$ {item.finalValue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-4">
                <div className="bg-primary/10 px-5 py-3 rounded-lg font-bold text-lg text-primary print:bg-gray-100 print:text-black print:border print:border-gray-300">
                  Total da Unidade: R$ {total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <div className="text-center text-muted-foreground py-16 bg-muted/10 rounded-lg border border-dashed">
              Nenhum registro encontrado para os filtros selecionados.
            </div>
          )}

          <div className="mt-20 pt-8 text-center border-t border-muted">
            <p className="text-base font-semibold">Dr. Daniel Delgado</p>
            <p className="text-sm text-muted-foreground">Médico Responsável - CRM 37.525</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
