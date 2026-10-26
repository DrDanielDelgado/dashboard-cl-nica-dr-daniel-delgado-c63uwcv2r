import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Eye,
  AlertCircle,
  Activity,
} from 'lucide-react'
import { AutomationFlowRunRecord } from '@/services/automation'
import { Input } from '@/components/ui/input'

interface FlowRunsLogTabProps {
  runs: AutomationFlowRunRecord[]
  loading: boolean
  onRefresh: () => void
}

export function FlowRunsLogTab({ runs, loading, onRefresh }: FlowRunsLogTabProps) {
  const [search, setSearch] = useState('')
  const [selectedRun, setSelectedRun] = useState<AutomationFlowRunRecord | null>(null)

  const filteredRuns = runs.filter((r) => {
    const term = search.toLowerCase()
    return (
      (r.contact_name && r.contact_name.toLowerCase().includes(term)) ||
      (r.contact_email && r.contact_email.toLowerCase().includes(term)) ||
      (r.contact_phone && r.contact_phone.includes(term)) ||
      (r.expand?.flow?.name && r.expand.flow.name.toLowerCase().includes(term))
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Concluído
          </Badge>
        )
      case 'waiting':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Aguardando Atraso
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Falhou
          </Badge>
        )
      case 'running':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Activity className="w-3 h-3 mr-1 animate-spin" /> Em Execução
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-blue" />
              Execuções de Fluxo por Contato
            </CardTitle>
            <CardDescription>
              Histórico detalhado da passagem dos pacientes e leads nó a nó pelos fluxos da
              SendPulse 360 Nativa.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por contato ou fluxo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-white"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRuns.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Nenhuma execução registrada até o momento. Execute um teste em algum fluxo para
              visualizar o log.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>Fluxo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Nó Atual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(run.created).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-slate-800">
                      {run.expand?.flow?.name || 'Fluxo'}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-slate-900">
                        {run.contact_name || run.expand?.patient?.name || 'Contato'}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {run.contact_phone || run.contact_email || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-600">
                      {run.current_node_id || 'Concluído'}
                    </TableCell>
                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRun(run)}
                        className="h-7 px-2 text-xs text-brand-blue hover:bg-brand-blue/10 gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detalhes da Execução */}
      <Dialog open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-blue" />
              Rastreamento de Execução
            </DialogTitle>
            <DialogDescription>
              Passos executados para{' '}
              <strong className="text-slate-900">
                {selectedRun?.contact_name || selectedRun?.contact_email || 'Contato'}
              </strong>
            </DialogDescription>
          </DialogHeader>

          {selectedRun && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Fluxo:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedRun.expand?.flow?.name || 'Fluxo'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Status Geral:</span>
                  {getStatusBadge(selectedRun.status)}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    E-mail / Telefone:
                  </span>
                  <span className="font-mono text-slate-800">
                    {selectedRun.contact_email || selectedRun.contact_phone || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Início:</span>
                  <span className="text-slate-800">
                    {new Date(selectedRun.created).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {selectedRun.error_message && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Erro encontrado:</span>
                    <span>{selectedRun.error_message}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Linha do Tempo dos Blocos Percorridos:
                </span>

                {Array.isArray(selectedRun.execution_steps) &&
                selectedRun.execution_steps.length > 0 ? (
                  <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                    {selectedRun.execution_steps.map((st, i) => (
                      <div key={i} className="relative space-y-1">
                        <div
                          className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                            st.status === 'success'
                              ? 'bg-emerald-500'
                              : st.status === 'waiting'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                          }`}
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{st.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(st.timestamp).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {st.type}
                        </Badge>
                        {st.details && (
                          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-600 truncate">
                            {typeof st.details === 'object'
                              ? JSON.stringify(st.details)
                              : String(st.details)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center py-4">
                    Nenhum passo gravado neste histórico.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
