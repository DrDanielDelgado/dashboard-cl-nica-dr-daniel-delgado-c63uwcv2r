import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Save, MapPin, Database, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function ChatbotFlows() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Fluxos Atualizados',
      description: 'As mensagens e regras de roteamento foram salvas.',
    })
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Configurações Globais do Bot</CardTitle>
          <CardDescription>
            Defina o comportamento do assistente virtual para todas as plataformas conectadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Roteamento Multi-Unidades
              </Label>
              <p className="text-sm text-muted-foreground">
                Oferecer um menu inicial para o paciente escolher entre as unidades (Juiz de Fora,
                Leopoldina, Além Paraíba).
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Captura de Leads (CRM)
              </Label>
              <p className="text-sm text-muted-foreground">
                Extrair nome e telefone automaticamente e criar um card no Pipeline do CRM.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Mensagem de Boas-vindas (Horário Comercial)
              </Label>
              <Textarea
                className="min-h-[100px]"
                defaultValue="Olá! Bem-vindo(a) à Clínica do Dr. Daniel Delgado. Sou seu assistente virtual. Como posso ajudar você hoje? Digite 'Agendar' ou escolha uma opção do menu."
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> Mensagem de Ausência (Fora do Horário)
              </Label>
              <Textarea
                className="min-h-[100px] bg-muted/30"
                defaultValue="Olá! Nosso horário de atendimento é de Seg a Sex, das 08h às 18h. Deixe sua mensagem e retornaremos assim que possível!"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" /> Salvar Regras
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
