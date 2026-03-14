import { MOCK_CRM_LEADS } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Phone, Instagram, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CRM() {
  const columns = [
    {
      id: 'qualified',
      title: 'Leads Qualificados',
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    },
    {
      id: 'contacted',
      title: 'Em Contato (WhatsApp)',
      color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    },
    {
      id: 'scheduled',
      title: 'Agendados',
      color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    },
  ]

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM & Social</h1>
        <p className="text-muted-foreground">
          Pipeline de captação de pacientes e integração de redes.
        </p>
      </div>

      <Tabs defaultValue="pipeline" className="flex-1 flex flex-col">
        <TabsList className="mb-4 w-fit">
          <TabsTrigger value="pipeline">Pipeline CRM</TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Instagram className="w-4 h-4" /> / <Facebook className="w-4 h-4" /> Hub Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div
              key={col.id}
              className="min-w-[320px] w-full max-w-sm flex flex-col bg-muted/30 rounded-xl border p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{col.title}</h3>
                <Badge variant="secondary" className={col.color}>
                  {MOCK_CRM_LEADS.filter((l) => l.status === col.id).length}
                </Badge>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                {MOCK_CRM_LEADS.filter((l) => l.status === col.id).map((lead) => (
                  <Card
                    key={lead.id}
                    className="cursor-grab hover:shadow-md transition-shadow bg-card"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">{lead.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{lead.treatment}</p>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-green-600 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="social" className="flex-1">
          <div className="h-full border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/10">
            <div className="text-center space-y-2">
              <Instagram className="w-12 h-12 text-pink-600 mx-auto opacity-50" />
              <h3 className="font-semibold text-lg">Integração com Meta Ads & Instagram Feed</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Em breve: Visualize comentários, DMs e métricas de campanhas diretamente do seu
                dashboard clínico.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
