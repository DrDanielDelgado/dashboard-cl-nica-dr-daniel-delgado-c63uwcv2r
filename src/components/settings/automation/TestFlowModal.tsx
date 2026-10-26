import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Badge } from '@/components/ui/badge'
import { AutomationFlowRecord, triggerFlowTest } from '@/services/automation'
import { useToast } from '@/hooks/use-toast'
import { Play, CheckCircle2, AlertCircle, Clock, Check } from 'lucide-react'

interface TestFlowModalProps {
  flow: AutomationFlowRecord | null
  isOpen: boolean
  onClose: () => void
  patients: Array<{ id: string; name: string; phone?: string; email?: string }>
}

export function TestFlowModal({ flow, isOpen, onClose, patients }: TestFlowModalProps) {
  const { toast } = useToast()
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [customName, setCustomName] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const [customPhone, setCustomPhone] = useState('')
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<any>(null)

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id)
    const p = patients.find((item) => item.id === id)
    if (p) {
      setCustomName(p.name)
      setCustomEmail(p.email || '')
      setCustomPhone(p.phone || '')
    }
  }

  const handleRunTest = async () => {
    if (!flow) return

    if (!customEmail && !customPhone) {
      toast({
        variant: 'destructive',
        title: 'Contato Incompleto',
        description: 'Preencha pelo menos o e-mail ou o telefone do contato para disparar o fluxo.',
      })
      return
    }

    setRunning(true)
    setRunResult(null)
    try {
      const res = await triggerFlowTest(flow.id, {
        name: customName || 'Paciente Teste',
        email: customEmail,
        phone: customPhone,
        patientId: selectedPatientId || undefined,
      })

      setRunResult(res)
      toast({
        title: 'Fluxo Executado!',
        description: `Execução concluída com status: ${res.status}. ${res.stepsCount || 0} passos percorridos.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no teste',
        description: err.message,
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-brand-blue" />
            Testar Fluxo: {flow?.name}
          </DialogTitle>
          <DialogDescription>
            Simule a entrada de um contato real ou personalizado no fluxo automatizado para validar
            o percurso dos blocos e os disparos multicanal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Escolher Paciente Existente */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Escolher Paciente do Prontuário</Label>
            <Select value={selectedPatientId} onValueChange={handleSelectPatient}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Selecione um paciente cadastrado..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.phone ? `(${p.phone})` : ''} {p.email ? `• ${p.email}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground font-medium">
                Ou preencher contato avulso
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nome do Contato</Label>
              <Input
                placeholder="Dr. Daniel ou Paciente"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-mail</Label>
              <Input
                type="email"
                placeholder="contato@clinica.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefone / WhatsApp</Label>
              <Input
                placeholder="(32) 99131-5729"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Resultado do Teste */}
          {runResult && (
            <div className="mt-4 p-4 rounded-xl border bg-slate-50 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-semibold text-xs text-slate-800">Resultado da Execução:</span>
                <Badge
                  variant={runResult.success ? 'default' : 'destructive'}
                  className={runResult.success ? 'bg-emerald-600 text-white' : ''}
                >
                  {runResult.status?.toUpperCase() || 'SUCESSO'}
                </Badge>
              </div>

              {runResult.errorMessage && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{runResult.errorMessage}</span>
                </div>
              )}

              {runResult.steps && runResult.steps.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Passos Percorridos ({runResult.steps.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {runResult.steps.map((st: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 bg-white rounded-lg border text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium text-slate-800">{st.title}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {st.type}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {st.status === 'success' ? 'Executado' : st.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={running}>
            Fechar
          </Button>
          <Button
            onClick={handleRunTest}
            disabled={running}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white gap-2"
          >
            <Play className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Disparando...' : 'Iniciar Teste Real'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
