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
import { MessageSquare, CheckCheck, Trash, Lock } from 'lucide-react'
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
  const { addEvent, updateEvent, deleteEvent, sendWaReminder, confirmWaReminder } = useAgendaStore()

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
    waStatus: 'pending',
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
        waStatus: 'pending',
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
        </DialogHeader>

        {event?.source === 'google' && (
          <div className="flex gap-2 p-3 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-100 items-center mb-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Evento sincronizado do Google Calendar. (Somente Leitura)
            </span>
          </div>
        )}

        {event && event.source !== 'google' && (
          <div className="flex gap-2 p-3 bg-muted/30 rounded-lg border items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground block text-xs">Status Notificação</span>
              <span className="font-medium flex items-center gap-1">
                {event.waStatus === 'confirmed' ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-green-600" /> Confirmado via WA
                  </>
                ) : event.waStatus === 'sent' ? (
                  <>
                    <MessageSquare className="w-4 h-4 text-blue-500" /> Lembrete Enviado
                  </>
                ) : (
                  <span className="text-muted-foreground">Pendente</span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              {event.waStatus !== 'confirmed' && (
                <Button variant="outline" size="sm" onClick={() => sendWaReminder(event.id)}>
                  <MessageSquare className="w-3 h-3 mr-1" /> Reenviar
                </Button>
              )}
              {event.waStatus === 'sent' && (
                <Button variant="secondary" size="sm" onClick={() => confirmWaReminder(event.id)}>
                  Confirmar
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Título / Descrição</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Retorno - João"
              disabled={event?.source === 'google'}
            />
          </div>
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Input
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="Nome do paciente"
              disabled={event?.source === 'google'}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={event?.source === 'google'}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                disabled={event?.source === 'google'}
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
                disabled={event?.source === 'google'}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                disabled={event?.source === 'google'}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              disabled={event?.source === 'google'}
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
          {event && event.source !== 'google' ? (
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
              {event?.source === 'google' ? 'Fechar' : 'Cancelar'}
            </Button>
            {event?.source !== 'google' && (
              <Button
                onClick={handleSave}
                className="bg-brand-blue text-white hover:bg-brand-blue/90"
              >
                {event ? 'Atualizar Evento' : 'Salvar Evento'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
