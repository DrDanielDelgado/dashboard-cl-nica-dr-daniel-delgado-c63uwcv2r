import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useAuditStore } from '@/stores/audit'

export function AuditLogsSettings() {
  const { logs } = useAuditStore()
  const [dateFilter, setDateFilter] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchUser = userFilter === 'all' || log.user === userFilter
      const matchAction = actionFilter === 'all' || log.action === actionFilter
      const matchDate = !dateFilter || log.timestamp.includes(dateFilter)
      return matchUser && matchAction && matchDate
    })
  }, [logs, dateFilter, userFilter, actionFilter])

  const uniqueUsers = Array.from(new Set(logs.map((l) => l.user)))
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)))

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Trilha de Auditoria (Audit Logs)</CardTitle>
        <CardDescription>
          Acompanhe todas as atividades e acessos realizados no sistema para fins de segurança e
          conformidade.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
          <div className="space-y-2">
            <Label>Data (AAAA-MM-DD)</Label>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Usuário</Label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {uniqueUsers.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Ação</Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {uniqueActions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data / Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação Realizada</TableHead>
                <TableHead>Recurso Afetado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </TableCell>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.resource}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
