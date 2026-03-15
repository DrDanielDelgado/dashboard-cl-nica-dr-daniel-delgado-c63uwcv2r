import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { Budget } from '@/types/financeiro'
import { useAppStore } from '@/stores/app'

export function OrcamentoPreviewDialog({
  open,
  onOpenChange,
  budget,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget: Budget | null
}) {
  const { location } = useAppStore()

  if (!budget) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-secondary/30 p-4 sm:p-8 overflow-y-auto max-h-[90vh]">
        <DialogTitle className="sr-only">Visualização do Orçamento</DialogTitle>
        <DialogDescription className="sr-only">Documento para impressão</DialogDescription>

        <div className="flex justify-end mb-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="bg-background">
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </div>

        <div className="bg-white p-10 shadow-sm border border-border min-h-[800px] text-black print:shadow-none print:border-none print:p-0 print:m-0">
          <div className="border-b-2 border-primary pb-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-primary tracking-tight">DR. DANIEL DELGADO</h2>
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                Cirurgia Vascular e Angiologia
              </p>
            </div>
            <div className="sm:text-right text-sm text-muted-foreground">
              <p>CRM: 37.525</p>
              <p>Unidade: {location}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-8 text-center uppercase tracking-wider">
            Orçamento de Procedimento
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Paciente:</p>
                <p className="font-semibold text-base uppercase">{budget.patient}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Válido até:</p>
                <p className="font-semibold text-base">
                  {new Date(budget.validityDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="bg-muted/20 p-5 rounded-lg border border-muted print:bg-gray-50">
              <p className="text-muted-foreground text-sm mb-1">Procedimento Indicado:</p>
              <p className="font-semibold text-lg">{budget.procedure}</p>
            </div>

            <div className="space-y-3 text-base border-t border-b py-6">
              <div className="flex justify-between">
                <span>Valor do Procedimento:</span>
                <span>R$ {budget.value.toFixed(2)}</span>
              </div>
              {budget.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Desconto:</span>
                  <span>- R$ {budget.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl pt-3 border-t mt-3">
                <span>Valor Final Líquido:</span>
                <span>R$ {budget.finalValue.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Formas de Pagamento Aceitas:</p>
              <div className="flex gap-2 flex-wrap">
                {budget.paymentMethods.map((m) => (
                  <span
                    key={m}
                    className="bg-muted px-3 py-1 rounded text-sm font-medium print:border print:border-gray-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {budget.observations && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Observações / Condições:</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{budget.observations}</p>
              </div>
            )}
          </div>

          <div className="mt-32 pt-8 text-center">
            <div className="w-64 border-b border-black mx-auto mb-2"></div>
            <p className="text-base font-semibold">Dr. Daniel Delgado</p>
            <p className="text-sm text-muted-foreground">Médico Responsável - CRM 37.525</p>
            <p className="text-xs text-muted-foreground mt-4">
              Este documento não é um recibo ou nota fiscal. Os valores são válidos apenas até a
              data de validade estipulada.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
