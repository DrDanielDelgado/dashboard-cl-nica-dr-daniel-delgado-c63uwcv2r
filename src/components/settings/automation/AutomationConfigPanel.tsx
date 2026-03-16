import { X, Save, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FlowNode } from '@/types/automation'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

interface AutomationConfigPanelProps {
  node: FlowNode | null
  onClose: () => void
  onSave: (node: FlowNode) => void
}

export function AutomationConfigPanel({ node, onClose, onSave }: AutomationConfigPanelProps) {
  if (!node) return null

  return (
    <div className="flex h-full w-80 flex-col border-l bg-white shadow-xl animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-blue/10 text-brand-blue">
            <Settings2 className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-slate-900">Configuração</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-500 hover:text-brand-red"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          <Label className="text-brand-blue font-medium">Nome do Bloco</Label>
          <Input defaultValue={node.title} className="focus-visible:ring-brand-blue" />
        </div>

        <div className="space-y-2">
          <Label className="text-brand-blue font-medium">Descrição</Label>
          <Textarea
            defaultValue={node.description}
            className="min-h-[100px] resize-none focus-visible:ring-brand-blue"
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Configurações Específicas</h4>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div className="space-y-0.5">
              <Label className="text-sm">Ativar IMEDIATAMENTE</Label>
              <p className="text-xs text-slate-500">Pular fila de espera</p>
            </div>
            <Switch />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Tag de Rastreio</Label>
            <Input placeholder="ex: tag-boas-vindas" className="focus-visible:ring-brand-blue" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-slate-50/50 p-4">
        <Button
          className="w-full bg-brand-red hover:bg-brand-red/90 text-white shadow-sm"
          onClick={() => onSave(node)}
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}
