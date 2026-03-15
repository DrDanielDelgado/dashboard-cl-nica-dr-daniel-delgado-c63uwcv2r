import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Send, Building2, Receipt } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { OrcamentosTab } from '@/components/financeiro/OrcamentosTab'

export default function Financeiro() {
  const handleNFe = () => {
    toast({
      title: 'NFe Emitida com Sucesso',
      description: 'A nota fiscal foi processada pela SEF-MG.',
    })
  }

  const handleBoleto = () => {
    toast({
      title: 'Boleto Gerado',
      description: 'Boleto Banco C6 gerado e enviado ao paciente.',
    })
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro & Faturamento</h1>
        <p className="text-muted-foreground">
          Controle de caixa, orçamentos, emissão de NF-e MG e Boletos C6.
        </p>
      </div>

      <Tabs defaultValue="fluxo" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-4">
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="orcamento">Orçamentos</TabsTrigger>
          <TabsTrigger value="nfe">NF-e (SEF-MG)</TabsTrigger>
          <TabsTrigger value="c6">Banco C6</TabsTrigger>
        </TabsList>

        <TabsContent value="fluxo" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Receitas (Mês)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">R$ 145.200,00</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Despesas (Mês)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-alert">R$ 82.400,00</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saldo Projetado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">R$ 62.800,00</div>
              </CardContent>
            </Card>
          </div>
          <Card className="h-64 flex items-center justify-center bg-muted/20 border-dashed">
            <p className="text-muted-foreground">
              Gráfico detalhado de Fluxo de Caixa aparecerá aqui.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="nfe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Integração SEF-MG
              </CardTitle>
              <CardDescription>
                Emissão direta de Nota Fiscal Eletrônica de Serviços para o Estado de Minas Gerais.
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
              <CardDescription>
                Gere boletos de cobrança integrados diretamente na sua conta PJ C6.
              </CardDescription>
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
    </div>
  )
}
