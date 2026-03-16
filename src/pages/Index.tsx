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

  // Acceptance Criteria: Redirect logic for "Secretária" profile
  if (role === 'Secretária') {
    return <Navigate to="/atendimento" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-brand-blue">
          Visão Geral - {location}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Bem-vindo(a) de volta. Aqui está o resumo de hoje para a sua unidade.
        </p>
      </div>

      {/* KPI Ribbon */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-elevation transition-all border-brand-blue/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-brand-blue">
              Atendimentos Hoje
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-brand-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">24</div>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              +3 em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-elevation transition-all border-brand-blue/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-brand-blue">
              Novos Leads (CRM)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-brand-red/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-brand-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">12</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">4 aguardando contato</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-elevation transition-all border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-amber-700">
              Alerta de Estoque
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">3 itens</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Vencimento próximo ou baixo
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-elevation transition-all border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-700">Receita Diária</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">R$ 4.250</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">Consolidado parcial</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5 shadow-sm border-brand-blue/10">
          <CardHeader>
            <CardTitle className="text-brand-blue">Fluxo Semanal de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={MOCK_REVENUE_DATA}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-blue))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--brand-blue))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(var(--brand-blue))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2 shadow-sm border-brand-blue/10 flex flex-col">
          <CardHeader>
            <CardTitle className="text-brand-blue">Minhas Tarefas ({role})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-5">
              {MOCK_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-800 leading-tight pr-4">
                      {task.title}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      Resp: {task.assignee}
                    </p>
                  </div>
                  <Badge
                    variant={task.status === 'done' ? 'secondary' : 'default'}
                    className={
                      task.status === 'done'
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-brand-red text-white hover:bg-brand-red/90'
                    }
                  >
                    {task.status === 'done' ? 'Concluído' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-brand-blue/10">
          <CardHeader>
            <CardTitle className="text-brand-blue">Links Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <a
              href="https://danieldelgadovascular.com.br/#"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-white bg-brand-blue/10 hover:bg-brand-blue px-4 py-2.5 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Site do Dr. Daniel Delgado
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-white bg-brand-red/10 hover:bg-brand-red px-4 py-2.5 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Instagram Feed
            </a>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-brand-blue/10">
          <CardHeader>
            <CardTitle className="text-brand-blue">Status das Unidades</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around flex-wrap gap-4 py-2">
            {['Juiz de Fora', 'Leopoldina', 'Além Paraíba'].map((unit) => (
              <div key={unit} className="flex flex-col items-center gap-2">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    unit === location
                      ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-110'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <ActivitySquare className="h-6 w-6" />
                </div>
                <span
                  className={`text-xs font-bold ${unit === location ? 'text-brand-blue' : 'text-slate-500'}`}
                >
                  {unit}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Operacional
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
