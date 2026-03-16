import { Flow } from '@/types/automation'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Shuffle, Trophy, Users, Target, Percent } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function PerformanceDashboard({ flow }: { flow: Flow }) {
  if (!flow.metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8 text-muted-foreground border-2 border-dashed border-slate-200 rounded-xl">
        <Target className="w-12 h-12 text-slate-300 mb-4" />
        <p className="font-medium text-slate-600">
          Métricas indisponíveis para este fluxo no momento.
        </p>
        <p className="text-sm">Inicie o fluxo para começar a coletar dados.</p>
      </div>
    )
  }

  const metrics = flow.metrics
  const hasAB = !!metrics.abTest
  const ab = metrics.abTest

  const getWinRate = (conv: number, ent: number) => (ent > 0 ? (conv / ent) * 100 : 0)
  const rateA = ab ? getWinRate(ab.a.conversions, ab.a.entries) : 0
  const rateB = ab ? getWinRate(ab.b.conversions, ab.b.entries) : 0
  const isAWinner = rateA > rateB

  const chartConfig = {
    a: { label: hasAB ? ab?.a.name || 'Caminho A' : 'Conversões', color: 'hsl(var(--brand-blue))' },
    ...(hasAB ? { b: { label: ab?.b.name || 'Caminho B', color: 'hsl(var(--brand-red))' } } : {}),
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-brand-blue/10 p-2 rounded-lg">
          <Target className="w-6 h-6 text-brand-blue" />
        </div>
        <div>
          <h4 className="font-bold text-xl text-brand-blue tracking-tight">
            Visão Geral de Desempenho
          </h4>
          <p className="text-sm text-muted-foreground">
            Métricas do fluxo de Confirmação de Consulta
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 font-medium mb-3">
            <Users className="w-5 h-5 text-brand-blue" /> Total de Entradas
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {metrics.entries.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Pacientes que iniciaram o fluxo</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 font-medium mb-3">
            <Target className="w-5 h-5 text-brand-blue" /> Confirmações (Sucesso)
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {metrics.conversions.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Consultas confirmadas com sucesso</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow ring-1 ring-emerald-500/20">
          <div className="flex items-center gap-2 text-slate-500 font-medium mb-3">
            <Percent className="w-5 h-5 text-emerald-600" /> Taxa de Conversão Global
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">
            {metrics.conversionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Performance média da automação</p>
        </div>
      </div>

      {hasAB && ab && (
        <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-5">
              <h5 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-purple-600" /> Resultados do Teste A/B
              </h5>
              <p className="text-sm text-slate-600">
                Comparativo de taxa de confirmação entre as variantes de mensagem configuradas no
                fluxo.
              </p>

              <div className="space-y-4 pt-2">
                {/* Variant A */}
                <div
                  className={`relative p-4 rounded-xl border-2 bg-white transition-all ${isAWinner ? 'border-brand-blue shadow-md' : 'border-slate-200'}`}
                >
                  {isAWinner && (
                    <div className="absolute -top-3 -right-3">
                      <Badge
                        variant="default"
                        className="bg-brand-blue text-white hover:bg-brand-blue border-none shadow-sm px-3 py-1"
                      >
                        <Trophy className="w-3.5 h-3.5 mr-1.5" /> Vencedor
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-brand-blue">{ab.a.name}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">{ab.a.conversions}</span> conf.
                      de {ab.a.entries} envios
                    </div>
                    <span className="text-2xl font-black text-brand-blue">{rateA.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Variant B */}
                <div
                  className={`relative p-4 rounded-xl border-2 bg-white transition-all ${!isAWinner ? 'border-brand-red shadow-md' : 'border-slate-200'}`}
                >
                  {!isAWinner && (
                    <div className="absolute -top-3 -right-3">
                      <Badge
                        variant="default"
                        className="bg-brand-red text-white hover:bg-brand-red border-none shadow-sm px-3 py-1"
                      >
                        <Trophy className="w-3.5 h-3.5 mr-1.5" /> Vencedor
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-brand-red">{ab.b.name}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">{ab.b.conversions}</span> conf.
                      de {ab.b.entries} envios
                    </div>
                    <span className="text-2xl font-black text-brand-red">{rateB.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h6 className="font-semibold text-sm text-slate-500 mb-4 uppercase tracking-wider">
                Evolução de Confirmações
              </h6>
              <div className="flex-1 min-h-[250px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.chartData || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickMargin={12}
                        stroke="#64748b"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        stroke="#64748b"
                        tickFormatter={(val) => `${val}`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
                      <Bar
                        dataKey="a"
                        fill="var(--color-a)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      {hasAB && (
                        <Bar
                          dataKey="b"
                          fill="var(--color-b)"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
