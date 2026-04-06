import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash } from 'lucide-react'
import { AgendaEvent, getLocalDateStr } from '@/stores/agenda'
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPatients,
} from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface EventDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  event?: AgendaEvent
  defaultDate?: string
  defaultStartTime?: string
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  defaultStartTime,
}: EventDialogProps) {
  const { toast } = useToast()
  const [patients, setPatients] = useState<any[]>([])

  const [formData, setFormData] = useState<Partial<AgendaEvent>>({
    title: '',
    date: defaultDate || getLocalDateStr(new Date()),
    startTime: defaultStartTime || '09:00',
    endTime: defaultStartTime
      ? `${String(parseInt(defaultStartTime.split(':')[0]) + 1).padStart(2, '0')}:${defaultStartTime.split(':')[1]}`
      : '09:30',
    type: 'Consulta',
    patientId: '',
    status: 'pending',
  })

  useEffect(() => {
    getPatients().then(setPatients).catch(console.error)
  }, [])

  useEffect(() => {
    if (event) {
      setFormData(event)
    } else {
      setFormData({
        title: '',
        date: defaultDate || getLocalDateStr(new Date()),
        startTime: defaultStartTime || '09:00',
        endTime: defaultStartTime
          ? `${String(parseInt(defaultStartTime.split(':')[0]) + 1).padStart(2, '0')}:${defaultStartTime.split(':')[1]}`
          : '09:30',
        type: 'Consulta',
        patientId: '',
        status: 'pending',
      })
    }
  }, [event, defaultDate, defaultStartTime, open])

  const handleSave = async () => {
    if (!formData.patientId) {
      toast({ title: 'Erro', description: 'Selecione um paciente', variant: 'destructive' })
      return
    }
    try {
      const start = `${formData.date} ${formData.startTime}:00.000Z`
      const end = `${formData.date} ${formData.endTime}:00.000Z`
      const payload = {
        title: formData.title,
        start,
        end,
        status:
          formData.status === 'confirmed'
            ? 'Confirmed'
            : formData.status === 'cancelled'
              ? 'Cancelled'
              : 'Scheduled',
        type:
          formData.type === 'Consulta'
            ? 'Consultation'
            : formData.type === 'Procedimento'
              ? 'Surgery'
              : 'Follow-up',
        patient: formData.patientId,
      }

      if (event && event.id) {
        await updateAppointment(event.id, payload)
        toast({ title: 'Agendamento atualizado' })
      } else {
        await createAppointment(payload)
        toast({ title: 'Agendamento criado' })
      }
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (event && event.id) {
      try {
        await deleteAppointment(event.id)
        toast({ title: 'Agendamento excluído' })
        onOpenChange(false)
      } catch (err: any) {
        toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Select
              value={formData.patientId}
              onValueChange={(val: string) => setFormData({ ...formData, patientId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Título / Descrição</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Retorno - Procedimento Laser"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Procedimento">Procedimento</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val: any) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between w-full mt-2 border-t pt-4">
          {event && event.id ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash className="w-4 h-4 mr-2" /> Excluir
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              {event ? 'Atualizar Evento' : 'Salvar Evento'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
