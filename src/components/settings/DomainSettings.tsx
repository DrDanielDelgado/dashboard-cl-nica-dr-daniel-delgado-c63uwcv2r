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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function DomainSettings() {
  const [domain, setDomain] = useState('danieldelgadovascular.com.br')
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Sucesso',
      description: 'Configurações de domínio salvas com sucesso.',
    })
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Domínio Personalizado</CardTitle>
        <CardDescription>Configure o endereço web onde sua clínica será acessada.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle className="font-semibold">Importante: Publicação na Nuvem</AlertTitle>
          <AlertDescription className="mt-2">
            Para que a aplicação seja efetivamente publicada neste domínio personalizado e fique
            disponível aos usuários, você deve utilizar o botão <strong>"Publish"</strong> na
            interface da nuvem Skip após salvar.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 max-w-md">
          <Label htmlFor="domain">URL do Domínio</Label>
          <Input
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="ex: danieldelgadovascular.com.br"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Salvar Domínio
        </Button>
      </CardFooter>
    </Card>
  )
}
