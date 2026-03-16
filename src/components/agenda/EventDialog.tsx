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
import { useAgendaStore, AgendaEvent, getLocalDateStr } from '@/stores/agenda'

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
  const { addEvent, updateEvent, deleteEvent } = useAgendaStore()

  const [formData, setFormData] = useState<Partial<AgendaEvent>>({
    title: '',
    date: defaultDate || getLocalDateStr(new Date()),
    startTime: defaultStartTime || '09:00',
    endTime: defaultStartTime
      ? `${String(parseInt(defaultStartTime.split(':')[0]) + 1).padStart(2, '0')}:${defaultStartTime.split(':')[1]}`
      : '09:30',
    type: 'Consulta',
    patientName: '',
    status: 'pending',
  })

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
        patientName: '',
        status: 'pending',
      })
    }
  }, [event, defaultDate, defaultStartTime, open])

  const handleSave = () => {
    if (event) {
      updateEvent(event.id, formData)
    } else {
      addEvent(formData as Omit<AgendaEvent, 'id'>)
    }
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (event) {
      deleteEvent(event.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Título / Descrição</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Retorno - João"
            />
          </div>
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Input
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="Nome do paciente"
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
        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          {event ? (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Excluir
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
              {event ? 'Atualizar Google' : 'Salvar no Google'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
