import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Zap, Copy, Check, Plus, Code2, Sparkles, Send } from 'lucide-react'
import { AutomationEventRecord, createAutomationEvent } from '@/services/automation'
import { useToast } from '@/hooks/use-toast'

interface CustomEventsTabProps {
  events: AutomationEventRecord[]
  onRefresh: () => void
}

export function CustomEventsTab({ events, onRefresh }: CustomEventsTabProps) {
  const { toast } = useToast()
  const [openCreate, setOpenCreate] = useState(false)
  const [eventName, setEventName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [customPayload, setCustomPayload] = useState(
    '{\n  "origem": "formulario_site",\n  "procedimento": "Varizes Laser"\n}',
  )
  const [submitting, setSubmitting] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)

  const curlExample = `curl -X POST "${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/automations/events" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_name": "lead_formulario_site",
    "email": "paciente@exemplo.com",
    "phone": "32991315729",
    "payload": {
      "origem": "Site Dr. Daniel",
      "interesse": "Consulta Vascular"
    }
  }'`

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlExample)
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
    toast({
      title: 'Comando cURL Copiado!',
      description: 'Pronto para colar em webhooks, formulários de landing pages ou integrações.',
    })
  }

  const handleCreateAndTrigger = async () => {
    if (!eventName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome do Evento é obrigatório',
      })
      return
    }
    if (!contactEmail && !contactPhone) {
      toast({
        variant: 'destructive',
        title: 'Contato Incompleto',
        description: 'Informe pelo menos um e-mail ou telefone para vincular o evento.',
      })
      return
    }

    let parsedPayload = {}
    try {
      parsedPayload = JSON.parse(customPayload)
    } catch (_) {
      toast({
        variant: 'destructive',
        title: 'JSON Inválido',
        description: 'Verifique a formatação do campo de dados adicionais.',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await createAutomationEvent({
        event_name: eventName,
        email: contactEmail,
        phone: contactPhone,
        payload: parsedPayload,
      })

      toast({
        title: 'Evento Disparado!',
        description: `Evento "${eventName}" salvo. ${res.matchedFlowsCount || 0} fluxo(s) associados acionados.`,
      })
      setOpenCreate(false)
      setEventName('')
      setContactEmail('')
      setContactPhone('')
      onRefresh()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao emitir evento',
        description: err.message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Documentation */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-l-4 border-l-purple-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Gatilho de Eventos Personalizados (SendPulse 360)
                </CardTitle>
                <CardDescription className="mt-1">
                  Dispare fluxos automatizados instantaneamente a partir de qualquer formulário,
                  landing page, sistema parceiro ou ação personalizada da clínica.
                </CardDescription>
              </div>
              <Button
                onClick={() => setOpenCreate(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 text-xs"
              >
                <Plus className="h-4 w-4" /> Emitir Evento Manual
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-xl text-slate-100 font-mono text-xs relative overflow-x-auto">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-purple-400" /> Chamada de API HTTP REST (cURL)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCurl}
                  className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copiar Código
                    </>
                  )}
                </Button>
              </div>
              <pre className="text-[11px] leading-relaxed select-all">{curlExample}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-3 leading-relaxed">
            <p>
              1. Crie um fluxo no <strong>Construtor Visual</strong> escolhendo o gatilho{' '}
              <strong>"Evento Personalizado"</strong> e defina o nome do evento (ex:{' '}
              <code>lead_formulario_site</code>).
            </p>
            <p>
              2. Quando sua landing page ou webhook fizer a requisição POST com o e-mail ou WhatsApp
              do paciente, o Skip Cloud processa e inicia a régua imediatamente.
            </p>
            <p>
              3. O motor executará as ações de WhatsApp Meta, E-mail Marketing, Web Push e
              Assistente IA configuradas no fluxo.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events History Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Histórico de Eventos Recebidos</CardTitle>
          <CardDescription>
            Últimos eventos registrados na coleção <code>automation_events</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Nenhum evento personalizado registrado ainda. Emita um teste acima ou envie via cURL.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Contato (E-mail / WhatsApp)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Recebimento</TableHead>
                  <TableHead>Dados (Payload)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-semibold text-slate-800">
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {ev.event_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{ev.contact_email || '-'}</div>
                      <div className="text-muted-foreground">{ev.contact_phone || ''}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          ev.is_processed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {ev.is_processed ? 'Processado' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(ev.created).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] max-w-xs truncate text-slate-600">
                      {typeof ev.payload === 'object'
                        ? JSON.stringify(ev.payload)
                        : String(ev.payload || '{}')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Emitir Evento Manual */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" /> Emitir Evento Personalizado
            </DialogTitle>
            <DialogDescription>
              Simule o envio de um evento externo para acionar fluxos automatizados vinculados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nome do Evento</Label>
              <Input
                placeholder="ex: formulario_preenchido"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">E-mail do Contato</Label>
                <Input
                  type="email"
                  placeholder="paciente@exemplo.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Telefone / WhatsApp</Label>
                <Input
                  placeholder="(32) 99131-5729"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Dados Adicionais (JSON Payload)</Label>
              <Textarea
                rows={4}
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                className="font-mono text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAndTrigger}
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Enviando...' : 'Emitir e Disparar Fluxos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
