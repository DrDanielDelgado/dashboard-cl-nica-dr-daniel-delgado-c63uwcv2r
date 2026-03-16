import { FlowNode } from '@/types/automation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface PanelProps {
  node?: FlowNode | null
  onClose: () => void
  onUpdate: (node: FlowNode) => void
  onDelete: () => void
}

export function AutomationConfigPanel({ node, onClose, onUpdate, onDelete }: PanelProps) {
  if (!node) return null

  const updateConfig = (key: string, value: any) => {
    onUpdate({ ...node, config: { ...node.config, [key]: value } })
  }

  return (
    <Sheet open={true} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[400px] border-l sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>Configurar Bloco</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Título do Bloco</Label>
            <Input
              value={node.title}
              onChange={(e) => onUpdate({ ...node, title: e.target.value })}
            />
          </div>

          {node.type === 'trigger' && (
            <div className="space-y-2">
              <Label>Evento de Disparo</Label>
              <Select
                value={node.config.triggerType || ''}
                onValueChange={(v) => updateConfig('triggerType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment_new">Novo Agendamento</SelectItem>
                  <SelectItem value="appointment_canceled">Agendamento Cancelado</SelectItem>
                  <SelectItem value="appointment_reminder">Lembrete de Consulta</SelectItem>
                  <SelectItem value="social_message">Início de Conversa (Social)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {node.type === 'message' && (
            <>
              <div className="space-y-2">
                <Label>Canal de Envio</Label>
                <Select
                  value={node.config.channel || ''}
                  onValueChange={(v) => updateConfig('channel', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram Direct</SelectItem>
                    <SelectItem value="facebook">Facebook Messenger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Texto da Mensagem</Label>
                <Textarea
                  className="h-32"
                  value={node.config.content || ''}
                  onChange={(e) => updateConfig('content', e.target.value)}
                  placeholder="Olá {{nome}}..."
                />
              </div>
            </>
          )}

          {node.type === 'delay' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tempo</Label>
                <Input
                  type="number"
                  value={node.config.amount || ''}
                  onChange={(e) => updateConfig('amount', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select
                  value={node.config.unit || 'minutes'}
                  onValueChange={(v) => updateConfig('unit', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {node.type === 'condition' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Regra de Verificação</Label>
                <Select
                  value={node.config.field || ''}
                  onValueChange={(v) => updateConfig('field', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Variável..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status do Agendamento</SelectItem>
                    <SelectItem value="tag">Tag do Paciente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>É igual a</Label>
                <Input
                  value={node.config.value || ''}
                  onChange={(e) => updateConfig('value', e.target.value)}
                  placeholder="Ex: Confirmado"
                />
              </div>
            </div>
          )}

          {node.type !== 'trigger' && (
            <div className="pt-6 border-t mt-8">
              <Button variant="destructive" className="w-full" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Remover Bloco
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
