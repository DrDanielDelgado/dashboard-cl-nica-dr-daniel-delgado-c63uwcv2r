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
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'

interface PanelProps {
  node?: FlowNode | null
  onClose: () => void
  onUpdate: (node: FlowNode) => void
  onDelete: () => void
}

const VARIABLES = [
  '{{nome_do_paciente}}',
  '{{data_consulta}}',
  '{{hora_consulta}}',
  '{{medico_nome}}',
]

export function AutomationConfigPanel({ node, onClose, onUpdate, onDelete }: PanelProps) {
  if (!node) return null

  const updateConfig = (key: string, value: any) => {
    onUpdate({ ...node, config: { ...node.config, [key]: value } })
  }

  const insertVariable = (variable: string) => {
    const currentContent = node.config.content || ''
    updateConfig('content', `${currentContent}${variable}`)
  }

  return (
    <Sheet open={true} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[400px] border-l sm:max-w-md overflow-y-auto pb-20">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Configurar Bloco</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Título do Bloco</Label>
            <Input
              value={node.title}
              onChange={(e) => onUpdate({ ...node, title: e.target.value })}
              placeholder="Ex: Lembrete 24h"
            />
          </div>

          {node.type === 'trigger' && (
            <div className="space-y-2">
              <Label>Evento de Disparo (Gatilho)</Label>
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
                  <SelectItem value="appointment_reminder">
                    Lembrete de Consulta (Agendado)
                  </SelectItem>
                  <SelectItem value="social_message">Mensagem Recebida (Social)</SelectItem>
                  <SelectItem value="tag_added">Tag de Paciente Adicionada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(node.type === 'message' || node.type === 'template') && (
            <>
              <div className="space-y-2">
                <Label>Canal de Envio</Label>
                <Select
                  value={node.config.channel || ''}
                  onValueChange={(v) => updateConfig('channel', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o canal..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp Business</SelectItem>
                    <SelectItem value="instagram">Instagram Direct</SelectItem>
                    <SelectItem value="facebook">Facebook Messenger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Texto da Mensagem</Label>
                </div>
                <Textarea
                  className="h-32 resize-none"
                  value={node.config.content || ''}
                  onChange={(e) => updateConfig('content', e.target.value)}
                  placeholder="Escreva sua mensagem..."
                />
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Variáveis Dinâmicas
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLES.map((v) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="cursor-pointer text-[10px] hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => insertVariable(v)}
                      >
                        + {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {node.type === 'delay' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tempo de Espera</Label>
                <Input
                  type="number"
                  min="0"
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
                <Label>Regra de Verificação (Se...)</Label>
                <Select
                  value={node.config.field || ''}
                  onValueChange={(v) => updateConfig('field', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a variável..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment_confirmed">Consulta Confirmada</SelectItem>
                    <SelectItem value="message_content">Conteúdo da Mensagem</SelectItem>
                    <SelectItem value="patient_tag">Tag do Paciente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Operador</Label>
                  <Select
                    value={node.config.operator || 'equals'}
                    onValueChange={(v) => updateConfig('operator', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">É igual a</SelectItem>
                      <SelectItem value="contains">Contém</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    value={node.config.value || ''}
                    onChange={(e) => updateConfig('value', e.target.value)}
                    placeholder="Ex: Sim"
                  />
                </div>
              </div>
            </div>
          )}

          {node.type !== 'trigger' && (
            <div className="pt-8 mt-auto">
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir Bloco
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
