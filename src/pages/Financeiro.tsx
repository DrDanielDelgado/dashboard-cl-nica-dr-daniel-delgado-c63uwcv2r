import { useState, useEffect } from 'react'
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
import { useRealtime } from '@/hooks/use-realtime'
import { getBudgets } from '@/services/api'

export default function Financeiro() {
  const { budgets, setBudgets } = useFinanceiroStore()
  const [relatoriosOpen, setRelatoriosOpen] = useState(false)

  const loadData = async () => {
    try {
      const res = await getBudgets()
      setBudgets(
        res.map((r: any) => ({
          id: r.id,
          patientId: r.patient,
          patient: r.expand?.patient?.name || r.items?.patient || 'Desconhecido',
          procedure: r.items?.procedure || '',
          value: r.items?.value || r.amount,
          discount: r.items?.discount || 0,
          finalValue: r.amount,
          validityDate: r.items?.validityDate || r.created,
          paymentMethods: r.items?.paymentMethods || [],
          status: r.status.toLowerCase(),
          unit: r.items?.unit || '',
          createdAt: r.created,
        })),
      )
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('budgets', () => loadData())

  const handleNFe = () => {
    toast({
      title: 'NFe Emitida com Sucesso',
      description: 'A nota fiscal foi processada pela SEF-MG.',
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
    .filter((b) => b.status === 'pending' || b.status === 'sent' || b.status === 'draft')
    .reduce((acc, b) => acc + b.finalValue, 0)
  const receitasMes = faturamentoPago
  const totalProjecao = faturamentoAprovado + projecaoReceita + faturamentoPago
  const percentageAprovado =
    totalProjecao > 0 ? ((faturamentoAprovado + faturamentoPago) / totalProjecao) * 100 : 0

  const followUps = budgets.filter((b) => {
    if (b.status !== 'pending' && b.status !== 'sent') return false
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
            Gestão de faturamento, NF-e MG, links de pagamento e boletos C6 integrados.
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
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projeção de Conversão de Orçamentos</CardTitle>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Integração SEF-MG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>CPF/CNPJ do Tomador</Label>
                <Input placeholder="000.000.000-00" />
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
                <Receipt className="h-5 w-5" /> Boletos C6 Bank
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Input placeholder="Nome Completo" />
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
