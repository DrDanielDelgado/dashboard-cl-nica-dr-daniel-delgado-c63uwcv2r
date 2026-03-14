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
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { MessageSquare, Instagram, Facebook, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

const INITIAL_PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: MessageSquare,
    color: 'text-green-500',
    active: true,
    accountId: '11993424128032',
    token: 'EAALabcxyz123...',
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    icon: Instagram,
    color: 'text-pink-500',
    active: false,
    accountId: '',
    token: '',
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    icon: Facebook,
    color: 'text-blue-500',
    active: false,
    accountId: '',
    token: '',
  },
]

export function ChatbotPlatforms() {
  const [platforms, setPlatforms] = useState(INITIAL_PLATFORMS)
  const { toast } = useToast()

  const handleToggle = (id: string) => {
    setPlatforms(platforms.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
  }

  const handleSave = () => {
    toast({
      title: 'Configurações Salvas',
      description: 'As integrações Omnichannel foram atualizadas com sucesso.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={`transition-all duration-300 ${platform.active ? 'border-primary/50 shadow-md bg-card' : 'opacity-80 bg-muted/30'}`}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <platform.icon className={`w-5 h-5 ${platform.color}`} /> {platform.name}
                  </CardTitle>
                  <CardDescription>Conexão via Meta API</CardDescription>
                </div>
                <Switch
                  checked={platform.active}
                  onCheckedChange={() => handleToggle(platform.id)}
                />
              </div>
              <Badge variant={platform.active ? 'default' : 'secondary'} className="w-fit mt-2">
                {platform.active ? 'Online' : 'Offline'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ID da Conta / Página</Label>
                <Input
                  type="password"
                  defaultValue={platform.accountId}
                  placeholder="Ex: 1234567890"
                  disabled={!platform.active}
                />
              </div>
              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input
                  type="password"
                  defaultValue={platform.token}
                  placeholder="Insira o Token"
                  disabled={!platform.active}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Salvar Integrações
        </Button>
      </div>
    </div>
  )
}
