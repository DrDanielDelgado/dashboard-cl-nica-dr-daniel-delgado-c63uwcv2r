import { useAppStore } from '@/stores/app'
import useFinanceiroStore from '@/stores/financeiro'
import { useAgendaStore } from '@/stores/agenda'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, DollarSign, Calendar, ExternalLink, ActivitySquare } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'

const MOCK_TASKS = [
  { id: 1, title: 'Revisar faturamento semanal', assignee: 'Administração', status: 'pending' },
  { id: 2, title: 'Confirmar agenda de amanhã', assignee: 'Secretária', status: 'pending' },
  { id: 3, title: 'Sincronizar exames HiDoctor', assignee: 'Enfermeira', status: 'done' },
]

export default function Index() {
  const { location, role } = useAppStore()
  const { budgets } = useFinanceiroStore()
  const { events } = useAgendaStore()

  const canViewFinance = ['Médico', 'Administrador', 'Gerente', 'Contador', 'Gerenciador'].includes(
    role,
  )

  const todayStr = new Date().toISOString().split('T')[0]
  const currentMonthStr = todayStr.substring(0, 7)

  // Productivity Metrics
  const todayEventsCount = events.filter((e) => e.date === todayStr).length
  const thisMonthEventsCount = events.filter((e) => e.date.startsWith(currentMonthStr)).length
  const lastMonthEventsCount = Math.floor(thisMonthEventsCount * 0.85) || 24 // Mock comparison

  const productivityGrowth =
    lastMonthEventsCount > 0
      ? ((thisMonthEventsCount - lastMonthEventsCount) / lastMonthEventsCount) * 100
      : 0

  // Financial Metrics
  const thisMonthRevenue = budgets
    .filter((b) => b.status === 'approved' && b.createdAt.startsWith(currentMonthStr))
    .reduce((acc, b) => acc + b.finalValue, 0)

  // Simulated Historical Data combined with real this month data
  const revenueData = [
    { name: 'Out', income: 12500 },
    { name: 'Nov', income: 15000 },
    { name: 'Dez', income: 14200 },
    { name: 'Jan', income: 18000 },
    { name: 'Fev', income: 21000 },
    { name: 'Mar', income: 14000 + thisMonthRevenue },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-brand-blue">
          Dashboard Analítico - {location}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Bem-vindo(a) de volta, {role}. Acompanhe os indicadores em tempo real.
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
            <div className="text-3xl font-bold text-slate-800">{todayEventsCount}</div>
            <p className="text-xs font-medium text-emerald-600 mt-1">Agenda atualizada</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevation transition-all border-brand-blue/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-brand-blue">
              Produtividade (Mês)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{thisMonthEventsCount}</div>
            <p
              className={`text-xs font-medium mt-1 ${productivityGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {productivityGrowth >= 0 ? '+' : ''}
              {productivityGrowth.toFixed(1)}% vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elevation transition-all border-l-4 border-l-brand-red/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-brand-red">Novos Pacientes</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-brand-red/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-brand-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">28</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Cadastrados nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        {canViewFinance ? (
          <Card className="hover:shadow-elevation transition-all border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-700">
                Faturamento Mensal
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                R$ {thisMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-1">Orçamentos aprovados</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-elevation transition-all border-slate-200 opacity-70 bg-slate-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500">
                Módulo Financeiro
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-slate-400">Acesso Restrito</div>
              <p className="text-xs font-medium text-slate-400 mt-1">Consulte o Administrador</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5 shadow-sm border-brand-blue/10">
          <CardHeader>
            <CardTitle className="text-brand-blue">
              {canViewFinance ? 'Crescimento de Receita (6 Meses)' : 'Volume de Atendimentos'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 h-[300px]">
            {canViewFinance ? (
              <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--brand-blue))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--brand-blue))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
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
                      tickFormatter={(val) => `R$ ${val / 1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Receita Mensal"
                      stroke="hsl(var(--brand-blue))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50 rounded-lg">
                <Activity className="h-10 w-10 mb-2 opacity-20" />
                <p>Gráfico indisponível para este nível de acesso.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2 shadow-sm border-brand-blue/10 flex flex-col">
          <CardHeader>
            <CardTitle className="text-brand-blue">Minhas Tarefas</CardTitle>
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
              <ExternalLink className="h-4 w-4" /> Site Institucional
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-white bg-brand-red/10 hover:bg-brand-red px-4 py-2.5 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> CRM Marketing
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
