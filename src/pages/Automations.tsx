import { AutomationBuilder } from '@/components/settings/automation/AutomationBuilder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PerformanceDashboard } from '@/components/settings/automation/PerformanceDashboard'
import { MOCK_AUTOMATION_FLOWS } from '@/lib/mock-data'
import { Megaphone } from 'lucide-react'

export default function Automations() {
  const flow = MOCK_AUTOMATION_FLOWS[0] // Confirmação de Consulta (Teste A/B)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-brand-blue flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-brand-red" />
          Automações & Marketing
        </h1>
        <p className="text-muted-foreground">
          Crie fluxos de mensagens, realize testes A/B e acompanhe as métricas de conversão dos
          pacientes.
        </p>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger
            value="builder"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm"
          >
            Construtor de Fluxo
          </TabsTrigger>
          <TabsTrigger
            value="metrics"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm"
          >
            Métricas & Teste A/B
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="m-0 focus-visible:outline-none">
          <AutomationBuilder />
        </TabsContent>

        <TabsContent value="metrics" className="m-0 focus-visible:outline-none">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <PerformanceDashboard flow={flow} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
