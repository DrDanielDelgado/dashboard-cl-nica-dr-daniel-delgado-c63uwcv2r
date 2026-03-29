import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Users, DollarSign, CalendarCheck, Percent } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { useNavigate } from 'react-router-dom'

const REVENUE_DATA = [
  { name: 'Jan', revenue: 45000, expected: 50000 },
  { name: 'Fev', revenue: 52000, expected: 55000 },
  { name: 'Mar', revenue: 61000, expected: 60000 },
  { name: 'Abr', revenue: 58000, expected: 65000 },
  { name: 'Mai', revenue: 71000, expected: 70000 },
  { name: 'Jun', revenue: 85000, expected: 80000 },
]

const FUNNEL_DATA = [
  { stage: 'Leads Iniciais', count: 120 },
  { stage: 'Consultas Realizadas', count: 85 },
  { stage: 'Orçamentos Entregues', count: 60 },
  { stage: 'Procedimentos Fechados', count: 42 },
]

export default function Index() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
          <p className="text-muted-foreground">Bem-vindo ao dashboard de performance B2B.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/prontuario')}>
            Buscar Prontuário (⌘K)
          </Button>
          <Button onClick={() => navigate('/crm')} className="bg-brand-blue hover:bg-brand-blue/90">
            Acessar Pipeline
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Receita Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">R$ 85.000</div>
            <p className="text-xs text-emerald-600 flex items-center font-medium mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Novos Pacientes</CardTitle>
            <Users className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">+124</div>
            <p className="text-xs text-emerald-600 flex items-center font-medium mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conversão</CardTitle>
            <Percent className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">49.4%</div>
            <p className="text-xs text-emerald-600 flex items-center font-medium mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Consulta p/ Procedimento
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ocupação da Agenda</CardTitle>
            <CalendarCheck className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">92%</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800 text-lg">Evolução de Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ revenue: { color: 'hsl(var(--brand-blue))' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(val) => `R$${val / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--brand-blue))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800 text-lg">Funil de Vendas (CRM)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-2">
              {FUNNEL_DATA.map((item, index) => {
                const percentage = Math.round((item.count / FUNNEL_DATA[0].count) * 100)
                return (
                  <div key={item.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.stage}</span>
                      <span className="font-bold text-brand-blue">{item.count}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${index === FUNNEL_DATA.length - 1 ? 'bg-emerald-500' : 'bg-brand-blue'}`}
                        style={{ width: `${percentage}%`, transition: 'width 1s ease-in-out' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                className="w-full text-brand-blue border-brand-blue hover:bg-brand-blue/5"
                onClick={() => navigate('/crm')}
              >
                Otimizar Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
