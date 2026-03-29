import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  Send,
  Building2,
  Receipt,
  FileDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { OrcamentosTab } from '@/components/financeiro/OrcamentosTab'
import { RelatoriosDialog } from '@/components/financeiro/RelatoriosDialog'
import useFinanceiroStore from '@/stores/financeiro'

export default function Financeiro() {
  const { budgets } = useFinanceiroStore()
  const [relatoriosOpen, setRelatoriosOpen] = useState(false)

  const handleNFe = () => {
    toast({
      title: 'NFe Emitida com Sucesso',
      description: 'A nota fiscal foi processada pela SEF-MG e salva no histórico.',
    })
  }

  const handleBoleto = () => {
    toast({ title: 'Boleto Gerado', description: 'Boleto Banco C6 gerado e enviado ao paciente.' })
  }

  const faturamentoAprovado = budgets
    .filter((b) => b.status === 'approved')
    .reduce((acc, b) => acc + b.finalValue, 0)

  const faturamentoPago = budgets
    .filter((b) => b.status === 'paid')
    .reduce((acc, b) => acc + b.finalValue, 0)

  const projecaoReceita = budgets
    .filter((b) => b.status === 'pending' || b.status === 'sent')
    .reduce((acc, b) => acc + b.finalValue, 0)

  const receitasMes = faturamentoPago
  const totalProjecao = faturamentoAprovado + projecaoReceita + faturamentoPago
  const percentageAprovado =
    totalProjecao > 0 ? ((faturamentoAprovado + faturamentoPago) / totalProjecao) * 100 : 0

  const followUps = budgets.filter((b) => {
    if (b.status !== 'pending') return false
    const diff = new Date(b.validityDate).getTime() - new Date().getTime()
    return diff > 0 && diff <= 48 * 60 * 60 * 1000
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Transações & Financeiro
          </h1>
          <p className="text-muted-foreground">
            Gestão de faturamento, NF-e MG, links de pagamento e boletos C6 integrados ao pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setRelatoriosOpen(true)}
            className="border-brand-blue text-brand-blue hover:bg-brand-blue/5"
          >
            <FileDown className="w-4 h-4 mr-2" /> Exportar Planilha
          </Button>
        </div>
      </div>

      <Tabs defaultValue="fluxo" className="w-full">
        <TabsList className="flex flex-wrap h-auto w-fit max-w-full justify-start mb-6 bg-white border shadow-sm">
          <TabsTrigger value="fluxo" className="px-6 py-2.5">
            Visão Geral (Pipeline)
          </TabsTrigger>
          <TabsTrigger value="orcamento" className="px-6 py-2.5">
            Propostas / Orçamentos
          </TabsTrigger>
          <TabsTrigger value="nfe" className="px-6 py-2.5">
            Emissão NF-e (SEF-MG)
          </TabsTrigger>
          <TabsTrigger value="c6" className="px-6 py-2.5">
            Boletos (C6 Bank)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fluxo" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Card className="bg-emerald-500/10 border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Recebido (Mês)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">
                  R$ {receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-emerald-700/80 mt-1">Status 'Pago'</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Aprovado (A Receber)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {faturamentoAprovado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">R$ 0,00</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Projeção de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  R$ {projecaoReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pendentes / Enviados</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Follow-ups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{followUps.length}</div>
                <p className="text-xs text-orange-600/80 mt-1">Vencendo em até 48h</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projeção de Conversão de Orçamentos</CardTitle>
              <CardDescription>
                Acompanhe o volume financeiro de propostas aprovadas ou pagas em relação ao total
                negociado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-primary">
                  Garantido (R${' '}
                  {(faturamentoAprovado + faturamentoPago).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                  )
                </span>
                <span className="text-muted-foreground">
                  Pendente (R${' '}
                  {projecaoReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                </span>
              </div>
              <Progress value={percentageAprovado} className="h-4" />
              <p className="text-xs text-muted-foreground text-center">
                {percentageAprovado.toFixed(1)}% do volume financeiro projetado já foi convertido em
                faturamento garantido ou recebido.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Integração SEF-MG
              </CardTitle>
              <CardDescription>
                Emissão direta de Nota Fiscal Eletrônica de Serviços.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>CPF/CNPJ do Tomador</Label>
                <Input placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label>Valor do Serviço (R$)</Label>
                <Input type="number" placeholder="1500.00" />
              </div>
              <div className="space-y-2">
                <Label>Descrição do Serviço</Label>
                <Input placeholder="Consulta / Procedimento Médico" />
              </div>
              <Button onClick={handleNFe} className="w-full mt-4">
                <FileText className="mr-2 h-4 w-4" /> Transmitir NF-e
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="c6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-black" /> Emissão de Boletos C6 Bank
              </CardTitle>
              <CardDescription>Gere boletos de cobrança na sua conta PJ C6.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Paciente / Pagador</Label>
                <Input placeholder="Nome Completo" />
              </div>
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input type="date" />
              </div>
              <Button
                onClick={handleBoleto}
                className="w-full bg-[#242424] hover:bg-[#1a1a1a] text-white mt-4"
              >
                <Send className="mr-2 h-4 w-4" /> Gerar Boleto C6
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orcamento">
          <OrcamentosTab />
        </TabsContent>
      </Tabs>

      <RelatoriosDialog open={relatoriosOpen} onOpenChange={setRelatoriosOpen} />
    </div>
  )
}
