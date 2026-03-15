import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserCircle, MessageSquare, Clock, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const MOCK_HANDOFFS = [
  {
    id: 'H1',
    patient: 'Ana Clara Souza',
    platform: 'WhatsApp',
    unit: 'Juiz de Fora',
    waitTime: '4 min',
    lastMessage: 'Gostaria de falar com uma secretária sobre meu exame.',
  },
  {
    id: 'H2',
    patient: 'Roberto Alves',
    platform: 'Instagram',
    unit: 'Não selecionada',
    waitTime: '12 min',
    lastMessage: 'Vcs fazem cirurgia a laser? O robô não entendeu.',
  },
]

export function ChatbotHandoff() {
  const { toast } = useToast()

  const handleTakeover = (name: string) => {
    toast({
      title: 'Conversa Assumida',
      description: `Você assumiu o atendimento de ${name}. O bot foi pausado para este chat.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Fila de Atendimento Humano
            <Badge variant="destructive" className="ml-2">
              {MOCK_HANDOFFS.length} aguardando
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Pacientes que solicitaram falar com um atendente ou onde o bot falhou em responder.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_HANDOFFS.map((ticket) => (
          <Card
            key={ticket.id}
            className="border-l-4 border-l-amber-500 hover:shadow-md transition-all"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-10 h-10 text-muted-foreground opacity-50" />
                  <div>
                    <h3 className="font-semibold">{ticket.patient}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {ticket.platform}
                      </span>
                      <span>•</span>
                      <span>{ticket.unit}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                  <Clock className="w-3 h-3 mr-1" /> {ticket.waitTime}
                </Badge>
              </div>

              <div className="bg-muted/40 p-3 rounded-lg text-sm italic text-muted-foreground border">
                "{ticket.lastMessage}"
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => handleTakeover(ticket.patient)} className="w-full sm:w-auto">
                  Assumir Conversa <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {MOCK_HANDOFFS.length === 0 && (
          <div className="col-span-2 text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
            Nenhum paciente aguardando atendimento humano no momento.
          </div>
        )}
      </div>
    </div>
  )
}
