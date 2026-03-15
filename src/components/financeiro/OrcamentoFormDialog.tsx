import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { Budget } from '@/types/financeiro'

const PAYMENT_METHODS = ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro']
const PROCEDURES = [
  'Tratamento de Varizes (Laser)',
  'Escleroterapia',
  'Laser',
  'Espuma',
  'Aneurisma de Aorta',
  'Check-up Vascular',
]

export function OrcamentoFormDialog({
  open,
  onOpenChange,
  budget,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget: Budget | null
  onSave: (b: Budget) => void
}) {
  const [formData, setFormData] = useState<Partial<Budget>>({
    value: 0,
    discount: 0,
    finalValue: 0,
    paymentMethods: [],
    status: 'pending',
  })

  useEffect(() => {
    if (open) {
      if (budget) setFormData(budget)
      else
        setFormData({
          value: 0,
          discount: 0,
          finalValue: 0,
          paymentMethods: [],
          status: 'pending',
        })
    }
  }, [budget, open])

  useEffect(() => {
    const value = formData.value || 0
    const discount = formData.discount || 0
    setFormData((prev) => ({ ...prev, finalValue: Math.max(0, value - discount) }))
  }, [formData.value, formData.discount])

  const togglePayment = (method: string) => {
    const current = formData.paymentMethods || []
    if (current.includes(method)) {
      setFormData({ ...formData, paymentMethods: current.filter((m) => m !== method) })
    } else {
      setFormData({ ...formData, paymentMethods: [...current, method] })
    }
  }

  const handleSave = () => {
    if (!formData.patient || !formData.procedure || !formData.validityDate) return
    onSave(formData as Budget)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
          <DialogDescription className="sr-only">Preencha os dados do orçamento.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Input
              placeholder="Nome do paciente"
              value={formData.patient || ''}
              onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Procedimento</Label>
            <Select
              value={formData.procedure}
              onValueChange={(v) => setFormData({ ...formData, procedure: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um procedimento" />
              </SelectTrigger>
              <SelectContent>
                {PROCEDURES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Total (R$)</Label>
              <Input
                type="number"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Desconto (R$)</Label>
              <Input
                type="number"
                value={formData.discount || ''}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Final Líquido</Label>
              <Input
                readOnly
                className="bg-muted font-bold"
                value={`R$ ${formData.finalValue?.toFixed(2) || '0.00'}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Validade do Orçamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!formData.validityDate && 'text-muted-foreground'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.validityDate ? (
                      new Date(formData.validityDate).toLocaleDateString('pt-BR')
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.validityDate ? new Date(formData.validityDate) : undefined}
                    onSelect={(date) =>
                      setFormData({ ...formData, validityDate: date?.toISOString() })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Formas de Pagamento Aceitas</Label>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_METHODS.map((m) => (
                <Badge
                  key={m}
                  variant={formData.paymentMethods?.includes(m) ? 'default' : 'outline'}
                  className="cursor-pointer py-1"
                  onClick={() => togglePayment(m)}
                >
                  {m}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v: any) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="sent">Enviado via WA</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="declined">Recusado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações / Condições</Label>
            <Textarea
              placeholder="Ex: Parcelamento em 10x, pagamento à vista..."
              value={formData.observations || ''}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Orçamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
