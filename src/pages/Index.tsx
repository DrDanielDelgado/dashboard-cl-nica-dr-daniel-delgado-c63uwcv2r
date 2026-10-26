import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, CalendarCheck, Percent, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { useNavigate } from 'react-router-dom'
import { getPatients, getAppointments, getLeads, getBudgets } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const parseDate = (s: any) => new Date(String(s ?? '').replace(' ', 'T'))

const monthKey = (d: any) => {
  const date = parseDate(d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const fmtBRL = (v: number) =>
  `R$ ${Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`

export default function Index() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [p, a, l, b] = await Promise.all([
        getPatients(),
        getAppointments(),
        getLeads(),
        getBudgets(),
      ])
      setPatients(p)
      setAppointments(a)
      setLeads(l)
      setBudgets(b)
      setError('')
    } catch (e: any) {
      setError(
        'Não foi possível carregar os dados da clínica. Verifique o login e tente novamente.',
      )
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('patients', () => load())
  useRealtime('appointments', () => load())
  useRealtime('leads', () => load())
  useRealtime('budgets', () => load())

  const now = new Date()
  const thisMonth = monthKey(now.toISOString())

  const approved = budgets.filter((b) => b.status === 'Approved' || b.status === 'Paid')
  const revenueMonth = approved
    .filter((b) => monthKey(b.created) === thisMonth)
    .reduce((acc, b) => acc + (Number(b.amount) || 0), 0)

  const newPatientsMonth = patients.filter((p) => monthKey(p.created) === thisMonth).length

  const totalLeads = leads.length
  const closedLeads = leads.filter((l) => l.stage === 'Concluded').length
  const conversion = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 1000) / 10 : 0

  const windowStart = new Date(now.getTime() - 12 * 3600 * 1000)
  const windowEnd = new Date(now.getTime() + 7 * 24 * 3600 * 1000)
  const upcoming = appointments.filter((a) => {
    const s = parseDate(a.start)
    return s >= windowStart && s <= windowEnd && a.status !== 'Cancelled'
  }).length

  const revenueData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(d.toISOString())
    const total = approved
      .filter((b) => monthKey(b.created) === key)
      .reduce((acc, b) => acc + (Number(b.amount) || 0), 0)
    revenueData.push({ name: MONTHS[d.getMonth()], revenue: total })
  }

  const countStage = (stages: string[]) => leads.filter((l) => stages.includes(l.stage)).length
  const funnelData = [
    { stage: 'Leads Iniciais', count: totalLeads },
    {
      stage: 'Consultas Realizadas',
      count: countStage(['Consultation', 'Pre-Op', 'Post-Op', 'Concluded']),
    },
    { stage: 'Orçamentos Entregues', count: countStage(['Pre-Op', 'Post-Op', 'Concluded']) },
    { stage: 'Procedimentos Fechados', count: closedLeads },
  ]

  const isEmpty =
    patients.length === 0 && leads.length === 0 && budgets.length === 0 && appointments.length === 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel de gestão da Clínica Dr. Daniel Delgado.
          </p>
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

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-slate-700">
          <AlertCircle className="h-4 w-4 mt-0.5 text-brand-red" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Receita Aprovada (mês)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{fmtBRL(revenueMonth)}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Orçamentos pagos ou aprovados
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Novos Pacientes (mês)
            </CardTitle>
            <Users className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{newPatientsMonth}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Total na base: {patients.length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conversão</CardTitle>
            <Percent className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{conversion}%</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Lead → Procedimento fechado
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Agenda (7 dias)</CardTitle>
            <CalendarCheck className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{upcoming}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Consultas e procedimentos agendados
            </p>
          </CardContent>
        </Card>
      </div>

      {isEmpty && !error && (
        <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 text-sm text-slate-700">
          Seus indicadores aparecem aqui conforme a equipe cadastra pacientes, leads e orçamentos.
          Comece pelo <strong>Prontuário 360</strong> ou pelo <strong>Pipeline CRM</strong>.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800 text-lg">
              Faturamento — Orçamentos Aprovados/Pagos (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ revenue: { color: 'hsl(var(--brand-blue))' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              {funnelData.map((item, index) => {
                const percentage =
                  funnelData[0].count > 0 ? Math.round((item.count / funnelData[0].count) * 100) : 0
                return (
                  <div key={item.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.stage}</span>
                      <span className="font-bold text-brand-blue">{item.count}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${index === funnelData.length - 1 ? 'bg-emerald-500' : 'bg-brand-blue'}`}
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
