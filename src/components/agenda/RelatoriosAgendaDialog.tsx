import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FileDown, FileText } from 'lucide-react'
import { useAgendaStore } from '@/stores/agenda'
import { RelatorioAgendaPreviewDialog } from './RelatorioAgendaPreviewDialog'

export function RelatoriosAgendaDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { events } = useAgendaStore()
  const [status, setStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [previewOpen, setPreviewOpen] = useState(false)

  const getFilteredEvents = () => {
    return events.filter((e) => {
      if (status !== 'all' && e.status !== status) return false
      if (startDate && e.date < startDate) return false
      if (endDate && e.date > endDate) return false
      return true
    })
  }

  const handleExcel = () => {
    const data = getFilteredEvents()
    let csv = 'Data,Paciente,Procedimento/Serviço,Hora Início,Hora Fim,Status\n'
    data.forEach((e) => {
      const parsedStatus =
        e.status === 'confirmed' ? 'Confirmado' : e.status === 'pending' ? 'Pendente' : 'Cancelado'
      csv += `${e.date},${e.patientName},${e.type},${e.startTime},${e.endTime},${parsedStatus}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_agendamentos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Exportar Dados de Agendamento</DialogTitle>
            <DialogDescription>
              Filtre e baixe a lista de atendimentos para análise em PDF ou Excel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status da Consulta</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleExcel}>
              <FileDown className="w-4 h-4 mr-2" /> Excel (.csv)
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                onOpenChange(false)
                setPreviewOpen(true)
              }}
            >
              <FileText className="w-4 h-4 mr-2" /> Visualizar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RelatorioAgendaPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={getFilteredEvents()}
        filters={{ startDate, endDate, status }}
      />
    </>
  )
}
