import { useAppStore } from '@/stores/app'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Activity,
  Users,
  AlertTriangle,
  DollarSign,
  ExternalLink,
  ActivitySquare,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { MOCK_REVENUE_DATA, MOCK_TASKS } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Navigate } from 'react-router-dom'

export default function Index() {
  const { location, role } = useAppStore()

  if (role === 'Secretária') {
    return <Navigate to="/atendimento" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral - {location}</h1>
        <p className="text-muted-foreground">Bem-vindo(a) de volta. Aqui está o resumo de hoje.</p>
      </div>

      {/* KPI Ribbon */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-elevation transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 em relação a ontem</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-elevation transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads (CRM)</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 aguardando contato</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-elevation transition-all border-l-4 border-l-alert">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerta de Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-alert" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-alert">3 itens</div>
            <p className="text-xs text-muted-foreground">Vencimento próximo ou baixo</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-elevation transition-all border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Diária</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ 4.250</div>
            <p className="text-xs text-muted-foreground">Consolidado parcial</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Fluxo Semanal de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={MOCK_REVENUE_DATA}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle>Minhas Tarefas ({role})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Responsável: {task.assignee}</p>
                  </div>
                  <Badge
                    variant={task.status === 'done' ? 'secondary' : 'default'}
                    className="text-[10px]"
                  >
                    {task.status === 'done' ? 'Concluído' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Links Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <a
              href="https://danieldelgadovascular.com.br/#"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline bg-primary/10 px-4 py-2 rounded-lg"
            >
              <ExternalLink className="h-4 w-4" /> Site do Dr. Daniel Delgado
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-sm font-medium text-pink-600 hover:underline bg-pink-500/10 px-4 py-2 rounded-lg"
            >
              <ExternalLink className="h-4 w-4" /> Instagram Feed
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Unidades</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around flex-wrap gap-4">
            {['Juiz de Fora', 'Leopoldina', 'Além Paraíba'].map((unit) => (
              <div key={unit} className="flex flex-col items-center gap-2">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${unit === location ? 'bg-primary text-primary-foreground shadow-lg scale-110 transition-transform' : 'bg-muted text-muted-foreground'}`}
                >
                  <ActivitySquare className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{unit}</span>
                <span className="text-[10px] text-success">Operacional</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
