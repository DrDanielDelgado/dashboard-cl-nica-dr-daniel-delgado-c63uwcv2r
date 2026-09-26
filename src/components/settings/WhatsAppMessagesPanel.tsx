import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MessageSquare,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  RotateCcw,
  Send,
  User,
  Phone,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  WhatsAppMessageRecord,
  getWhatsAppMessages,
  resendWhatsAppMessage,
} from '@/services/whatsapp'

export function WhatsAppMessagesPanel() {
  const [messages, setMessages] = useState<WhatsAppMessageRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessageRecord | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadMessages = async () => {
    setLoading(true)
    try {
      const data = await getWhatsAppMessages()
      setMessages(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  useRealtime('whatsapp_messages', () => {
    loadMessages()
  })

  const handleResend = async (msg: WhatsAppMessageRecord) => {
    setResendingId(msg.id)
    try {
      const res = await resendWhatsAppMessage(msg)
      if (res.success || res.status === 'sent') {
        toast({
          title: 'Mensagem Reenviada',
          description:
            'A mensagem foi reenviada com sucesso para ' + (msg.recipient_name || msg.phone),
        })
      } else if (res.pendingConfig) {
        toast({
          title: 'Aguardando Credenciais',
          description:
            res.warning || 'Configure o token permanente do Meta no painel para envio real.',
          variant: 'default',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Falha no Reenvio',
          description: res.error || 'Não foi possível reenviar a mensagem.',
        })
      }
      loadMessages()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no Reenvio',
        description: err.message || 'Erro inesperado ao reenviar.',
      })
    } finally {
      setResendingId(null)
    }
  }

  const filteredMessages = messages.filter((m) => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      !searchTerm ||
      (m.recipient_name && m.recipient_name.toLowerCase().includes(term)) ||
      (m.phone && m.phone.includes(term)) ||
      (m.content && m.content.toLowerCase().includes(term)) ||
      (m.expand?.patient?.name && m.expand.patient.name.toLowerCase().includes(term))
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'read':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1 font-medium"
          >
            <Eye className="w-3 h-3" /> Lido
          </Badge>
        )
      case 'delivered':
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 border-blue-500/20 flex items-center gap-1 font-medium"
          >
            <CheckCircle2 className="w-3 h-3" /> Entregue
          </Badge>
        )
      case 'sent':
        return (
          <Badge
            variant="outline"
            className="bg-sky-500/10 text-sky-600 border-sky-500/20 flex items-center gap-1 font-medium"
          >
            <Send className="w-3 h-3" /> Enviado
          </Badge>
        )
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1 font-medium"
          >
            <Clock className="w-3 h-3" /> Pendente
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" /> Falhou
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card className="border-border/60 shadow-sm animate-fade-in">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Painel de Mensagens WhatsApp Cloud API
          </CardTitle>
          <CardDescription>
            Acompanhe o status em tempo real de cada mensagem oficial enviada aos pacientes da
            clínica.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadMessages}
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do paciente, telefone ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="read">Lido</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="failed">Falha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">Nenhuma mensagem encontrada</p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Os disparos de lembretes da agenda e notificações de consultas aparecerão aqui com
              status de entrega e leitura.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Paciente / Destinatário</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tipo / Conteúdo</TableHead>
                  <TableHead>Status WhatsApp</TableHead>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((msg) => {
                  const patientName = msg.recipient_name || msg.expand?.patient?.name || 'Paciente'
                  return (
                    <TableRow key={msg.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs">
                            {patientName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none">{patientName}</p>
                            {msg.expand?.appointment && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Consulta: {msg.expand.appointment.title || 'Agendamento'}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {msg.phone}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-xs truncate text-foreground" title={msg.content}>
                          {msg.content || `Template: ${msg.template_name || 'Lembrete'}`}
                        </p>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {msg.message_type}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(msg.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(msg.created).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMessage(msg)}
                          className="h-8 px-2 text-xs"
                        >
                          Detalhes
                        </Button>
                        {msg.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResend(msg)}
                            disabled={resendingId === msg.id}
                            className="h-8 px-2 text-xs border-amber-300 hover:bg-amber-50 text-amber-800 dark:text-amber-300"
                          >
                            <RotateCcw
                              className={`w-3 h-3 mr-1 ${
                                resendingId === msg.id ? 'animate-spin' : ''
                              }`}
                            />
                            Reenviar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Message Details Modal */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Detalhes da Notificação WhatsApp
              </DialogTitle>
              <DialogDescription>
                Registro da mensagem enviada via WhatsApp Cloud API.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Destinatário:</span>
                  <p className="font-semibold flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    {selectedMessage.recipient_name ||
                      selectedMessage.expand?.patient?.name ||
                      'Não informado'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Telefone:</span>
                  <p className="font-mono flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    {selectedMessage.phone}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status atual:</span>
                  <div className="mt-0.5">{getStatusBadge(selectedMessage.status)}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">ID no WhatsApp (wamid):</span>
                  <p
                    className="font-mono text-[11px] truncate mt-0.5"
                    title={selectedMessage.whatsapp_message_id || 'N/A'}
                  >
                    {selectedMessage.whatsapp_message_id || 'Pendente / Não retornado'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Conteúdo da Mensagem:</span>
                <div className="mt-1 p-3 bg-muted/40 rounded-lg border text-xs leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedMessage.content || 'Template sem corpo explícito'}
                </div>
              </div>

              {selectedMessage.error_details && (
                <div>
                  <span className="text-xs text-destructive font-medium">Detalhes do Erro:</span>
                  <div className="mt-1 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 text-xs">
                    {selectedMessage.error_details}
                  </div>
                </div>
              )}

              <div className="border-t pt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div className="p-2 rounded bg-muted/20">
                  <p className="font-medium text-foreground">Enviado em</p>
                  <p className="font-mono text-[11px] mt-0.5">
                    {selectedMessage.sent_at
                      ? new Date(selectedMessage.sent_at).toLocaleTimeString('pt-BR')
                      : '—'}
                  </p>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <p className="font-medium text-foreground">Entregue em</p>
                  <p className="font-mono text-[11px] mt-0.5">
                    {selectedMessage.delivered_at
                      ? new Date(selectedMessage.delivered_at).toLocaleTimeString('pt-BR')
                      : '—'}
                  </p>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <p className="font-medium text-foreground">Lido em</p>
                  <p className="font-mono text-[11px] mt-0.5">
                    {selectedMessage.read_at
                      ? new Date(selectedMessage.read_at).toLocaleTimeString('pt-BR')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
