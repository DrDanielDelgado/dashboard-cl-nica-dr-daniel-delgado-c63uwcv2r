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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FileDown, FileText } from 'lucide-react'
import useFinanceiroStore from '@/stores/financeiro'
import { RelatorioPreviewDialog } from './RelatorioPreviewDialog'

export function RelatoriosDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { budgets } = useFinanceiroStore()
  const [units, setUnits] = useState<string[]>(['Juiz de Fora', 'Leopoldina', 'Além Paraíba'])
  const [status, setStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [previewOpen, setPreviewOpen] = useState(false)

  const toggleUnit = (u: string) => {
    setUnits((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]))
  }

  const getFilteredBudgets = () => {
    return budgets.filter((b) => {
      if (!units.includes(b.unit)) return false
      if (status !== 'all' && b.status !== status) return false
      if (startDate && new Date(b.createdAt) < new Date(startDate)) return false
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(b.createdAt) > end) return false
      }
      return true
    })
  }

  const handleExcel = () => {
    const data = getFilteredBudgets()
    let csv =
      'Data de Emissão,Validade,Paciente,Procedimentos,Valor Total,Forma de Pagamento,Unidade,Status\n'
    data.forEach((b) => {
      const emite = new Date(b.createdAt).toLocaleDateString('pt-BR')
      const validade = new Date(b.validityDate).toLocaleDateString('pt-BR')
      const pagamentos = `"${b.paymentMethods.join(' / ')}"`
      csv += `${emite},${validade},${b.patient},${b.procedure},${b.finalValue.toFixed(2)},${pagamentos},${b.unit},${b.status}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_financeiro_dr_daniel_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Exportar Relatórios Financeiros</DialogTitle>
            <DialogDescription>
              Filtre e exporte os dados financeiros em PDF ou Excel (CSV).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Unidades de Atendimento</Label>
              <div className="flex flex-col gap-3 mt-2">
                {['Juiz de Fora', 'Leopoldina', 'Além Paraíba'].map((u) => (
                  <div key={u} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unit-${u}`}
                      checked={units.includes(u)}
                      onCheckedChange={() => toggleUnit(u)}
                    />
                    <Label htmlFor={`unit-${u}`} className="font-normal cursor-pointer">
                      {u}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial (Emissão)</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final (Emissão)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status do Orçamento</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="declined">Recusado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
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
              <FileText className="w-4 h-4 mr-2" /> Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RelatorioPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={getFilteredBudgets()}
        filters={{ units, startDate, endDate, status }}
      />
    </>
  )
}
