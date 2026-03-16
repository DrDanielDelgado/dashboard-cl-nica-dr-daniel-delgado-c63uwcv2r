import { X, Save, Settings2, Split } from 'lucide-react'
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

  const isABTest = node.type === 'ab_test'

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l bg-white shadow-2xl animate-in slide-in-from-right-8 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${isABTest ? 'bg-purple-100 text-purple-600' : 'bg-brand-blue/10 text-brand-blue'}`}
          >
            {isABTest ? <Split className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
          </div>
          <h3 className="font-semibold text-slate-900">
            {isABTest ? 'Teste A/B' : 'Configuração'}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:text-brand-red hover:bg-brand-red/10 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Nome do Bloco</Label>
          <Input
            defaultValue={node.title}
            className="focus-visible:ring-brand-blue border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Descrição Interna</Label>
          <Textarea
            defaultValue={node.description}
            className="min-h-[80px] resize-none focus-visible:ring-brand-blue border-slate-200 text-sm"
          />
        </div>

        {isABTest && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 space-y-3">
            <Label className="text-purple-900 font-semibold flex items-center gap-2">
              <Split className="w-4 h-4" /> Distribuição de Tráfego
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-xs text-purple-600 font-medium block">Caminho A</span>
                <Input
                  type="number"
                  defaultValue="50"
                  disabled
                  className="bg-white text-center font-bold"
                />
              </div>
              <span className="text-slate-300 font-bold">%</span>
              <div className="flex-1 space-y-1">
                <span className="text-xs text-purple-600 font-medium block">Caminho B</span>
                <Input
                  type="number"
                  defaultValue="50"
                  disabled
                  className="bg-white text-center font-bold"
                />
              </div>
            </div>
            <p className="text-[10px] text-purple-600/70 text-center">
              Os pacientes serão divididos uniformemente entre as variantes.
            </p>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Avançado</h4>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-sm cursor-pointer">Ignorar Feriados</Label>
              <p className="text-xs text-slate-500">Pausa o envio em dias não úteis</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Tag de CRM para rastreio</Label>
            <Input
              placeholder="ex: ab-test-lembrete"
              className="focus-visible:ring-brand-blue text-sm"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4 bg-white">
        <Button
          className="w-full bg-brand-red hover:bg-brand-red/90 text-white shadow-md h-11 text-base font-medium"
          onClick={() => onSave(node)}
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
      </div>
    </div>
  )
}
