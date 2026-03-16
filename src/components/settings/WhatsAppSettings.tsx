import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Save, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function WhatsAppSettings() {
  const [accountId, setAccountId] = useState('11993424128032')
  const [phoneId, setPhoneId] = useState('11345923984321')
  const [token, setToken] = useState('EAALabcxyz123...')
  const [template, setTemplate] = useState(
    'Olá {{paciente}}, sua consulta com Dr. Daniel Delgado está agendada para {{data}} às {{hora}}. Responda SIM para confirmar.',
  )
  const { toast } = useToast()

  const isConnected = accountId.length > 0 && phoneId.length > 0 && token.length > 0

  const handleSave = () => {
    toast({
      title: 'Sucesso',
      description: 'Chaves e templates do WhatsApp salvos com sucesso.',
    })
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>WhatsApp Business API</CardTitle>
          <CardDescription>
            Configure a API oficial e os templates automáticos de lembretes.
          </CardDescription>
        </div>
        <Badge
          variant={isConnected ? 'default' : 'secondary'}
          className={`px-3 py-1 ${isConnected ? 'bg-success hover:bg-success/90 text-white' : ''}`}
        >
          {isConnected ? (
            <CheckCircle2 className="mr-1.5 w-3 h-3" />
          ) : (
            <XCircle className="mr-1.5 w-3 h-3" />
          )}
          {isConnected ? 'Conectado' : 'Desconectado'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label>WhatsApp Business Account ID</Label>
          <Input
            type="password"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Insira o Account ID"
          />
        </div>
        <div className="space-y-2">
          <Label>Phone Number ID</Label>
          <Input
            type="password"
            value={phoneId}
            onChange={(e) => setPhoneId(e.target.value)}
            placeholder="Insira o Phone Number ID"
          />
        </div>
        <div className="space-y-2 border-b pb-6">
          <Label>Permanent Access Token (System User Token)</Label>
          <Input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Insira o Token Permanente"
          />
        </div>

        <div className="space-y-2">
          <Label>Template de Lembrete (Agenda)</Label>
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Variáveis disponíveis: {'{{paciente}}'}, {'{{data}}'}, {'{{hora}}'}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
          <Save className="mr-2 h-4 w-4" /> Salvar Configurações WhatsApp
        </Button>
      </CardFooter>
    </Card>
  )
}
