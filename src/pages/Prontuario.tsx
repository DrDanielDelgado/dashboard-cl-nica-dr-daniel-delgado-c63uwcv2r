import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Link as LinkIcon, UploadCloud, Stethoscope } from 'lucide-react'

export default function Prontuario() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prontuário Eletrônico & Integrações</h1>
        <p className="text-muted-foreground">
          Centralize os dados clínicos integrando com sistemas terceiros (HiDoctor, CFM).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Database className="h-5 w-5" /> Sistema HiDoctor
            </CardTitle>
            <CardDescription>
              Integração direta com o prontuário HiDoctor. Sincronize dados de pacientes e
              evoluções.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm bg-background p-3 rounded border font-mono text-muted-foreground">
              Status: <span className="text-success font-semibold">Conectado (API v2.1)</span>
              <br />
              Última Sincronização: Há 5 minutos
            </div>
            <div className="flex gap-2">
              <Button variant="default">Abrir HiDoctor Web</Button>
              <Button variant="outline">
                <UploadCloud className="mr-2 h-4 w-4" /> Forçar Sincronização
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" /> Prescrição Eletrônica (CFM)
            </CardTitle>
            <CardDescription>
              Acesse a plataforma oficial do Conselho Federal de Medicina para receitas digitais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Utilize o certificado digital A3 ou Nuvem para assinar as prescrições geradas a partir
              do prontuário do paciente.
            </p>
            <Button variant="secondary" className="w-full">
              <LinkIcon className="mr-2 h-4 w-4" /> Acessar CFM Prescrição
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importação de Exames / Anexos</CardTitle>
          <CardDescription>
            Arraste e solte laudos em PDF, imagens de ultrassom ou Doppler para anexar à ficha
            global do paciente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
            <UploadCloud className="h-10 w-10 mb-4 text-primary/50" />
            <p className="font-semibold text-foreground">Clique ou arraste os arquivos aqui</p>
            <p className="text-sm mt-1">Suporta PDF, JPG, DICOM (até 50MB)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
