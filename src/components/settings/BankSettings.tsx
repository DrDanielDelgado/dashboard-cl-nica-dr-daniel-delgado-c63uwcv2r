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
import { Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function BankSettings() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Sucesso',
      description: 'Credenciais do C6 Bank atualizadas para emissão de boletos.',
    })
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Integração Bancária (C6 Bank)</CardTitle>
        <CardDescription>
          Configure o acesso via API para automação na geração de boletos de cobrança.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label>API Client ID (Boletos)</Label>
          <Input type="password" placeholder="••••••••••••" defaultValue="c6_prod_123_abc" />
        </div>
        <div className="space-y-2">
          <Label>API Client Secret (Boletos)</Label>
          <Input type="password" placeholder="••••••••••••" defaultValue="sec_c6_abc_xyz_789" />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          className="bg-[#242424] hover:bg-[#1a1a1a] text-white border border-[#242424]"
        >
          <Save className="mr-2 h-4 w-4" /> Salvar Chaves C6 Bank
        </Button>
      </CardFooter>
    </Card>
  )
}
