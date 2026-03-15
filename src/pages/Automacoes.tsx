import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Bot,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock4,
  MessageSquare,
  Plus,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const INITIAL_FLOWS = [
  {
    id: '1',
    name: 'Lembrete 24h (Padrão)',
    trigger: '24h antes',
    units: ['Sete Lagoas', 'Curvelo'],
    isActive: true,
    message:
      'Olá {{paciente_nome}}, confirmamos sua consulta na unidade {{unidade_nome}} amanhã às {{hora_consulta}}.',
  },
  {
    id: '2',
    name: 'Confirmação no Dia',
    trigger: '4h antes',
    units: ['Sete Lagoas', 'Curvelo', 'Pompéu', 'Abaeté'],
    isActive: false,
    message:
      'Passando para lembrar da sua consulta hoje às {{hora_consulta}} com {{medico_nome}}. Responda SIM para confirmar.',
  },
]

const MOCK_LOGS = [
  {
    id: 'L1',
    patient: 'Carlos Alberto',
    unit: 'Sete Lagoas',
    time: '09:00',
    type: 'Lembrete 24h',
    status: 'sent',
    timestamp: '2026-03-14 08:00',
  },
  {
    id: 'L2',
    patient: 'Fernanda Lima',
    unit: 'Curvelo',
    time: '10:30',
    type: 'Lembrete 24h',
    status: 'read',
    timestamp: '2026-03-14 09:15',
  },
  {
    id: 'L3',
    patient: 'Ricardo Gomes',
    unit: 'Pompéu',
    time: '14:00',
    type: 'Confirmação no Dia',
    status: 'error',
    timestamp: '2026-03-14 10:00',
  },
  {
    id: 'L4',
    patient: 'Luciana M.',
    unit: 'Abaeté',
    time: '16:00',
    type: 'Confirmação no Dia',
    status: 'pending',
    timestamp: '-',
  },
]

const VARIABLES = [
  '{{paciente_nome}}',
  '{{data_consulta}}',
  '{{hora_consulta}}',
  '{{medico_nome}}',
  '{{unidade_nome}}',
  '{{unidade_endereco}}',
]

const ALL_UNITS = ['Sete Lagoas', 'Curvelo', 'Pompéu', 'Abaeté']

export default function Automacoes() {
  const [flows, setFlows] = useState(INITIAL_FLOWS)
  const [openDialog, setOpenDialog] = useState(false)
  const [newFlow, setNewFlow] = useState<{
    name: string
    trigger: string
    units: string[]
    message: string
  }>({
    name: '',
    trigger: '24h antes',
    units: [],
    message: '',
  })
  const { toast } = useToast()

  const toggleFlow = (id: string) => {
    setFlows(flows.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f)))
    toast({
      title: 'Status Atualizado',
      description: 'O fluxo de automação foi alterado com sucesso.',
    })
  }

  const toggleUnit = (unit: string) => {
    if (newFlow.units.includes(unit)) {
      setNewFlow({ ...newFlow, units: newFlow.units.filter((u) => u !== unit) })
    } else {
      setNewFlow({ ...newFlow, units: [...newFlow.units, unit] })
    }
  }

  const handleSaveFlow = () => {
    if (!newFlow.name || newFlow.units.length === 0 || !newFlow.message) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
      })
      return
    }

    const flow = {
      id: Math.random().toString(36).substring(7),
      ...newFlow,
      isActive: true,
    }

    setFlows([...flows, flow])
    setOpenDialog(false)
    setNewFlow({ name: '', trigger: '24h antes', units: [], message: '' })
    toast({
      title: 'Fluxo Criado',
      description: 'O novo fluxo de automação foi ativado e está pronto para uso.',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Enviado
          </Badge>
        )
      case 'read':
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Lido
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" /> Erro
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock4 className="w-3 h-3 mr-1" /> Pendente
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Automações de WhatsApp</h1>
        <p className="text-muted-foreground">
          Gerencie lembretes e confirmações automáticas para reduzir faltas e otimizar a agenda.
        </p>
      </div>

      <Tabs defaultValue="flows" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="flows">Fluxos de Automação</TabsTrigger>
          <TabsTrigger value="logs">Logs de Comunicação</TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Novo Fluxo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Criar Fluxo de Automação</DialogTitle>
                  <DialogDescription>
                    Configure as regras e o template de mensagem para o disparo automático via
                    WhatsApp API.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="grid gap-2">
                    <Label>Nome do Fluxo</Label>
                    <Input
                      placeholder="Ex: Lembrete 24h Padrão"
                      value={newFlow.name}
                      onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Momento do Disparo (Gatilho)</Label>
                    <Select
                      value={newFlow.trigger}
                      onValueChange={(v) => setNewFlow({ ...newFlow, trigger: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o momento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h antes">24 horas antes do agendamento</SelectItem>
                        <SelectItem value="4h antes">4 horas antes do agendamento</SelectItem>
                        <SelectItem value="1h antes">1 hora antes do agendamento</SelectItem>
                        <SelectItem value="No agendamento">Imediatamente ao agendar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Unidades Aplicáveis</Label>
                    <div className="flex gap-2 flex-wrap">
                      {ALL_UNITS.map((u) => (
                        <Badge
                          key={u}
                          variant={newFlow.units.includes(u) ? 'default' : 'outline'}
                          className="cursor-pointer select-none py-1.5 px-3"
                          onClick={() => toggleUnit(u)}
                        >
                          {u}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Template da Mensagem Dinâmica</Label>
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {VARIABLES.map((v) => (
                        <Badge
                          key={v}
                          variant="secondary"
                          className="cursor-pointer text-[11px] hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => setNewFlow({ ...newFlow, message: newFlow.message + v })}
                        >
                          + {v}
                        </Badge>
                      ))}
                    </div>
                    <Textarea
                      className="h-32 resize-none leading-relaxed"
                      placeholder="Escreva sua mensagem aqui utilizando as variáveis acima..."
                      value={newFlow.message}
                      onChange={(e) => setNewFlow({ ...newFlow, message: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveFlow}>Salvar e Ativar Fluxo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {flows.map((flow) => (
              <Card
                key={flow.id}
                className={`transition-all duration-300 ${flow.isActive ? 'border-primary/50 shadow-md bg-card' : 'opacity-75 bg-muted/30'}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" /> {flow.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4 text-muted-foreground" /> Gatilho: {flow.trigger}
                      </CardDescription>
                    </div>
                    <Switch checked={flow.isActive} onCheckedChange={() => toggleFlow(flow.id)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {flow.units.map((u) => (
                      <Badge key={u} variant="secondary" className="text-[11px]">
                        <MapPin className="w-3 h-3 mr-1" /> {u}
                      </Badge>
                    ))}
                  </div>
                  <div className="bg-muted/50 p-3.5 rounded-lg border border-border/50 text-sm relative">
                    <MessageSquare className="w-4 h-4 text-muted-foreground absolute top-3.5 right-3.5 opacity-40" />
                    <p className="pr-8 text-muted-foreground line-clamp-3 leading-relaxed">
                      {flow.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Disparos Recentes</CardTitle>
              <CardDescription>
                Acompanhe em tempo real o status de entrega e leitura das automações enviadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Horário Agendado</TableHead>
                    <TableHead>Tipo (Fluxo)</TableHead>
                    <TableHead>Status WhatsApp</TableHead>
                    <TableHead className="text-right">Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_LOGS.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.patient}</TableCell>
                      <TableCell className="text-muted-foreground">{log.unit}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell className="text-muted-foreground">{log.type}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs font-mono">
                        {log.timestamp}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
