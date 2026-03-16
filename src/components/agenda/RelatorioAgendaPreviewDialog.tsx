import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { AgendaEvent } from '@/stores/agenda'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/stores/app'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AgendaEvent[]
  filters: { startDate: string; endDate: string; status: string }
}

export function RelatorioAgendaPreviewDialog({ open, onOpenChange, data, filters }: Props) {
  const { location } = useAppStore()

  if (!open) return null

  const handlePrint = () => window.print()

  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'confirmed':
        return 'Confirmado'
      case 'cancelled':
        return 'Cancelado'
      case 'all':
        return 'Todos'
      default:
        return status
    }
  }

  // Sort chronologically
  const sortedData = [...data].sort((a, b) => {
    if (a.date === b.date) return a.startTime.localeCompare(b.startTime)
    return a.date.localeCompare(b.date)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-secondary/30 p-4 sm:p-8 overflow-y-auto max-h-[90vh]">
        <DialogTitle className="sr-only">Relatório de Agendamentos</DialogTitle>
        <DialogDescription className="sr-only">Visualização para impressão</DialogDescription>

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
                Relatório Clínico - {location}
              </p>
            </div>
            <div className="sm:text-right text-sm text-muted-foreground">
              <p>Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
              <p>Total de Registros: {data.length}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-6 text-center uppercase tracking-wider">
            Histórico de Agendamentos
          </h3>

          <div className="text-sm mb-8 text-muted-foreground bg-muted/20 p-4 rounded-lg border border-muted print:border-gray-300 print:bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <strong>Período Selecionado:</strong>
                <p>
                  {filters.startDate
                    ? new Date(filters.startDate).toLocaleDateString('pt-BR')
                    : 'Início'}
                  {' até '}
                  {filters.endDate ? new Date(filters.endDate).toLocaleDateString('pt-BR') : 'Hoje'}
                </p>
              </div>
              <div>
                <strong>Status Filtrado:</strong>
                <p>{translateStatus(filters.status)}</p>
              </div>
            </div>
          </div>

          {sortedData.length > 0 ? (
            <div className="rounded border overflow-hidden print:border-gray-300">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-semibold text-black">Data</TableHead>
                    <TableHead className="font-semibold text-black">Paciente</TableHead>
                    <TableHead className="font-semibold text-black">Procedimento</TableHead>
                    <TableHead className="font-semibold text-black">Horário</TableHead>
                    <TableHead className="font-semibold text-black">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow key={item.id} className="border-b print:border-gray-200">
                      <TableCell className="font-medium whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{item.patientName}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.startTime} - {item.endTime}
                      </TableCell>
                      <TableCell>{translateStatus(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16 bg-muted/10 rounded-lg border border-dashed">
              Nenhum agendamento encontrado para os filtros selecionados.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
