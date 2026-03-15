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
import { Progress } from '@/components/ui/progress'
import { useHiDoctorStore } from '@/stores/hidoctor'
import { RefreshCw, Database, CheckCircle2 } from 'lucide-react'

export function HiDoctorSettings() {
  const { syncData, isSyncing, progress, lastSync, patients } = useHiDoctorStore()
  const [credentials, setCredentials] = useState({
    serial: 'H80ARQW43',
    crm: '37525',
    password: 'CPV2406',
  })
  const [error, setError] = useState('')

  const handleSync = async () => {
    setError('')
    try {
      await syncData(credentials.serial, credentials.crm, credentials.password)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> Integração HiDoctor (HiNetX)
            </CardTitle>
            <CardDescription>
              Configure a conexão direta com o banco de dados de prontuários em produção via API.
            </CardDescription>
          </div>
          {patients.length > 0 && (
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium border border-success/20">
                <CheckCircle2 className="w-4 h-4" /> Base Conectada
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {patients.length.toLocaleString('pt-BR')} registros ativos
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 max-w-2xl">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serial">Número de Série (Licença)</Label>
            <Input
              id="serial"
              value={credentials.serial}
              onChange={(e) => setCredentials({ ...credentials, serial: e.target.value })}
              disabled={isSyncing}
              placeholder="Ex: H80ARQW43"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crm">CRM do Titular</Label>
            <Input
              id="crm"
              value={credentials.crm}
              onChange={(e) => setCredentials({ ...credentials, crm: e.target.value })}
              disabled={isSyncing}
              placeholder="Ex: 37525"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="password">Senha de API / HinetX</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              disabled={isSyncing}
            />
          </div>
        </div>

        {isSyncing && (
          <div className="space-y-2 pt-4 animate-fade-in">
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>Efetuando conexão e baixando prontuários completos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {lastSync && !isSyncing && (
          <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3 bg-muted/20 p-2 rounded-r-md">
            Última sincronização completa efetuada em: <strong>{lastSync}</strong>
          </p>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 border-t py-4">
        <Button onClick={handleSync} disabled={isSyncing} size="lg">
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Sincronizando Banco de Dados...' : 'Iniciar Sincronização Completa'}
        </Button>
      </CardFooter>
    </Card>
  )
}
