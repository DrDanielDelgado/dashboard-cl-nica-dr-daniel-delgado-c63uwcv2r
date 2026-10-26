import { useState } from 'react'
import { AutomationBuilder } from '@/components/settings/automation/AutomationBuilder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PerformanceDashboard } from '@/components/settings/automation/PerformanceDashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MOCK_AUTOMATION_FLOWS } from '@/lib/mock-data'
import {
  Megaphone,
  Zap,
  Mail,
  MessageSquare,
  Bell,
  Clock,
  Play,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function Automations() {
  const flow = MOCK_AUTOMATION_FLOWS[0]
  const [triggeringCron, setTriggeringCron] = useState(false)
  const { toast } = useToast()

  const handleTriggerDailyCron = async () => {
    setTriggeringCron(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/marketing/automation/trigger-now`,
        {
          method: 'POST',
          headers: {
            Authorization: pb.authStore.token,
          },
        },
      )
      const data = await res.json()
      toast({
        title: 'Ciclo Diário Executado!',
        description: data.message || 'Lembretes, e-mails de aniversário e push disparados.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao rodar automação',
        description: err.message,
      })
    } finally {
      setTriggeringCron(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-brand-red" />
            Central de Automações & Marketing Nativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gatilhos em tempo real e ações multicanal (WhatsApp Cloud API, E-mail Marketing e Web
            Push). 100% nativo no Skip Cloud.
          </p>
        </div>

        <Button
          onClick={handleTriggerDailyCron}
          disabled={triggeringCron}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-md gap-2"
        >
          <Play className={`h-4 w-4 ${triggeringCron ? 'animate-spin' : ''}`} />
          {triggeringCron ? 'Executando Ciclo...' : 'Executar Automações Diárias Agora'}
        </Button>
      </div>

      {/* BLOCO CENTRAL: GATILHOS E AÇÕES INTEGRADAS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gatilhos Disponíveis */}
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Gatilhos Disponíveis (Triggers do Sistema)
            </CardTitle>
            <CardDescription>
              Eventos da clínica que disparam réguas de comunicação automaticamente:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-brand-blue" />
                  Agendamento Criado / Confirmado
                </span>
                <p className="text-xs text-muted-foreground">
                  Ao registrar uma nova consulta no sistema ou via HiDoctor.
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Ativo
              </Badge>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-brand-blue" />
                  Lembrete 24h & 4h Pré-Consulta
                </span>
                <p className="text-xs text-muted-foreground">
                  Job diário que identifica consultas do dia seguinte para reduzir no-show.
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Ativo
              </Badge>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Aniversário do Paciente
                </span>
                <p className="text-xs text-muted-foreground">
                  Compara a data de nascimento dos pacientes e dispara mensagem comemorativa.
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Ativo
              </Badge>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Megaphone className="h-4 w-4 text-brand-red" />
                  Novo Lead Cadastrado
                </span>
                <p className="text-xs text-muted-foreground">
                  Captado pelo Chat IA público ou inserido manualmente no Pipeline CRM.
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ações Disponíveis */}
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Canais & Ações Nativas (Sem Assinaturas Externas)
            </CardTitle>
            <CardDescription>
              Ações executadas imediatamente pelos módulos próprios da plataforma:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">
                    WhatsApp Cloud API (Meta Oficial)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Envio de templates, confirmações SIM/NÃO e lembretes.
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Nativo</Badge>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">E-mail Marketing Nativo</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Campanhas, newsletters e e-mails de aniversário sem SendPulse.
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Nativo</Badge>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Web Push Notifications</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Alertas desktop e mobile via Service Worker e VAPID.
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Nativo</Badge>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">
                    Assistente IA da Clínica
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Agente Skip Cloud para triagem e dúvidas de pacientes.
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Nativo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger
            value="builder"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm"
          >
            Construtor Visual de Fluxo
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
