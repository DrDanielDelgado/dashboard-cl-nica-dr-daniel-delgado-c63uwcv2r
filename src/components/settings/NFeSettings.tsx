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
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function NFeSettings() {
  const [isProduction, setIsProduction] = useState(false)
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Sucesso',
      description: 'Credenciais e integrações SEF-MG atualizadas.',
    })
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Integração NF-e (Fazenda MG)</CardTitle>
        <CardDescription>
          Credenciais para emissão automática de notas fiscais de serviço em Minas Gerais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/30">
          <div className="space-y-1">
            <Label className="text-base">Ambiente de Operação</Label>
            <p className="text-sm text-muted-foreground">
              Alternar entre Homologação (Testes) e Produção.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm ${!isProduction ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
            >
              Homologação
            </span>
            <Switch checked={isProduction} onCheckedChange={setIsProduction} />
            <span
              className={`text-sm ${isProduction ? 'font-semibold text-destructive' : 'text-muted-foreground'}`}
            >
              Produção
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
          <div className="space-y-2 sm:col-span-2">
            <Label>Estado de Atuação</Label>
            <Input value="Minas Gerais (SEF-MG)" disabled className="bg-muted font-medium" />
          </div>

          <div className="space-y-2">
            <Label>Client ID (API)</Label>
            <Input type="password" placeholder="••••••••••••" defaultValue="client_mg_992" />
          </div>

          <div className="space-y-2">
            <Label>Client Secret</Label>
            <Input type="password" placeholder="••••••••••••" defaultValue="sec_mg_xyz_789" />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Certificado Digital A1/A3 (Pfx)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".pfx,.p12"
                className="file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Faça upload do seu certificado digital para assinatura eletrônica obrigatória.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Salvar Credenciais Fiscais
        </Button>
      </CardFooter>
    </Card>
  )
}
