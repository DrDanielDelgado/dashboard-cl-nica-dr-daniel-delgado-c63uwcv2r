import { Flow } from '@/types/automation'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
      <div className="text-center p-8 text-muted-foreground">
        Métricas indisponíveis para este fluxo no momento.
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
    a: { label: hasAB ? ab?.a.name || 'Caminho A' : 'Conversões', color: 'hsl(var(--primary))' },
    ...(hasAB ? { b: { label: ab?.b.name || 'Caminho B', color: '#8b5cf6' } } : {}),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-lg">Visão Geral de Desempenho</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" /> Entradas
          </div>
          <p className="text-2xl font-bold">{metrics.entries.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-background rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" /> Conversões
          </div>
          <p className="text-2xl font-bold">{metrics.conversions.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-background rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Percent className="w-4 h-4" /> Taxa de Conversão
          </div>
          <p className="text-2xl font-bold text-success">{metrics.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {hasAB && ab && (
        <div className="grid md:grid-cols-2 gap-6 bg-muted/30 p-5 rounded-xl border border-muted">
          <div className="space-y-4">
            <h5 className="font-semibold flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-500" /> Resultados do Teste A/B
            </h5>
            <div className="space-y-3">
              <div
                className={`p-3 rounded-lg border ${isAWinner ? 'bg-success/10 border-success/30' : 'bg-background'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{ab.a.name || 'Caminho A'}</span>
                  {isAWinner && (
                    <Badge variant="outline" className="bg-success text-white border-none">
                      <Trophy className="w-3 h-3 mr-1" /> Vencedor
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>
                    {ab.a.conversions} de {ab.a.entries} convertidos
                  </span>
                  <span className="font-bold text-foreground">{rateA.toFixed(1)}%</span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border ${!isAWinner ? 'bg-success/10 border-success/30' : 'bg-background'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{ab.b.name || 'Caminho B'}</span>
                  {!isAWinner && (
                    <Badge variant="outline" className="bg-success text-white border-none">
                      <Trophy className="w-3 h-3 mr-1" /> Vencedor
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>
                    {ab.b.conversions} de {ab.b.entries} convertidos
                  </span>
                  <span className="font-bold text-foreground">{rateB.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[200px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={metrics.chartData || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="a" fill="var(--color-a)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                {hasAB && (
                  <Bar dataKey="b" fill="var(--color-b)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                )}
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      )}
    </div>
  )
}
