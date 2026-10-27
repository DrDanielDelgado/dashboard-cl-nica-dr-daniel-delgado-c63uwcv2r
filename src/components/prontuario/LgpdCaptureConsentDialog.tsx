import { useState } from 'react'
import {
  ShieldCheck,
  Camera,
  Mic,
  AlertCircle,
  ExternalLink,
  Mail,
  UserCheck,
  Check,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/lib/auth'
import { useAuditStore } from '@/stores/audit'
import {
  CaptureConsentType,
  logCaptureConsentAudit,
  setSessionConsent,
} from '@/services/captureConsentAudit'

interface LgpdCaptureConsentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  captureType: CaptureConsentType
  patientId?: string
  patientName: string
  onConsentGranted: () => void
  onConsentDeclined?: () => void
}

export function LgpdCaptureConsentDialog({
  open,
  onOpenChange,
  captureType,
  patientId,
  patientName,
  onConsentGranted,
  onConsentDeclined,
}: LgpdCaptureConsentDialogProps) {
  const { user } = useAuth()
  const { addLog } = useAuditStore()
  const [agreed, setAgreed] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const isCamera = captureType === 'camera'
  const titleMediaType = isCamera ? 'Imagem / Câmera Clínica' : 'Áudio / Gravação de Voz'
  const mediaLabel = isCamera ? 'captura de foto da câmera' : 'gravação de áudio do microfone'

  const handleDecline = () => {
    setAgreed(false)
    onOpenChange(false)
    if (onConsentDeclined) {
      onConsentDeclined()
    }
  }

  const handleAccept = async () => {
    if (!agreed) return

    setIsSubmitting(true)
    const effectivePatientId = patientId || patientName || 'paciente-sem-id'

    // 1. Salva em sessionStorage para não pedir de novo na mesma sessão para o mesmo paciente
    setSessionConsent(effectivePatientId, captureType)

    // 2. Grava no audit local (useAuditStore / localStorage)
    const actionLabel = isCamera
      ? 'Consentimento LGPD (Foto/Câmera)'
      : 'Consentimento LGPD (Áudio/Microfone)'
    const resourceLabel = `Paciente: ${patientName || 'Não identificado'}`
    addLog(actionLabel, resourceLabel)

    // 3. Grava no PocketBase (integration_access_logs)
    await logCaptureConsentAudit({
      patientId: effectivePatientId,
      patientName,
      captureType,
      operatorName: user?.name,
      operatorEmail: user?.email,
    })

    setIsSubmitting(false)
    setAgreed(false)
    onOpenChange(false)
    onConsentGranted()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          handleDecline()
        } else {
          onOpenChange(val)
        }
      }}
    >
      <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-5 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                isCamera
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                  : 'bg-purple-500/10 text-purple-700 border-purple-500/30'
              }
            >
              {isCamera ? <Camera className="h-3 w-3 mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
              Termo LGPD • {titleMediaType}
            </Badge>
            {patientName && (
              <Badge variant="secondary" className="text-xs truncate max-w-[200px]">
                {patientName}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            Termo de Consentimento para Captura ao Vivo
          </DialogTitle>
          <DialogDescription className="text-xs">
            Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018) e as resoluções
            do CFM sobre prontuário eletrônico.
          </DialogDescription>
        </DialogHeader>

        {/* Corpo com texto explicativo do consentimento */}
        <ScrollArea className="max-h-[340px] pr-3 text-xs leading-relaxed text-muted-foreground border rounded-lg p-3.5 bg-muted/20">
          <div className="space-y-3 text-foreground">
            <div className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-md border border-primary/20 text-xs">
              <UserCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  Captura assistida com o paciente presente:
                </p>
                <p className="text-[11px] text-muted-foreground">
                  A ativação de {mediaLabel} é realizada pelo operador da clínica exclusivamente
                  durante o atendimento e mediante autorização verbal ou expressa do paciente{' '}
                  <strong className="text-foreground">{patientName || 'cadastrado'}</strong>.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                1. Finalidade do Tratamento
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Os dados capturados ({isCamera ? 'fotografias clínicas' : 'gravações de voz/relatos'}
                ) destinam-se exclusivamente à anexação ao prontuário médico individual do
                paciente, com o objetivo de acompanhamento clínico, registro de evolução, suporte ao
                diagnóstico e documentação médica assistencial.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                2. Acesso e Confidencialidade
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                O acesso às mídias é estritamente restrito à equipe médica e assistencial autorizada
                da clínica (Mattos Delgado Clínica Médica LTDA), sob sigilo profissional médico e
                dever legal de confidencialidade (Código de Ética Médica e Art. 11 da LGPD).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                3. Ativação Temporária do Dispositivo
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                O dispositivo ({isCamera ? 'câmera/webcam' : 'microfone'}) é acionado apenas pelo
                tempo estritamente necessário para a captura e é desligado automaticamente logo que a
                janela for fechada ou a gravação concluída. Nenhuma transmissão contínua ou em
                segundo plano é realizada.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                4. Direitos do Titular (Paciente)
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Conforme o Art. 18 da LGPD, o titular dos dados possui o direito de confirmação,
                acesso, correção de informações incompletas e esclarecimentos sobre o tratamento,
                observados os prazos regulatórios de guarda obrigatória de prontuários médicos (mínimo
                de 20 anos estabelecido pelo CFM).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                5. Responsável por Dados (DPO) e Política
              </h4>
              <div className="text-xs text-muted-foreground mt-0.5 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    Contato do responsável por dados:{' '}
                    <strong className="text-foreground">danieldelgadovascular@gmail.com</strong>
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    Consulte nossa{' '}
                    <a
                      href="/politica-privacidade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium underline hover:text-primary/80"
                    >
                      Política de Privacidade completa
                    </a>
                    .
                  </span>
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Checkbox de Aceite Obrigatório */}
        <div className="pt-3 pb-1 border-t space-y-2">
          <label
            htmlFor="consent-checkbox"
            className="flex items-start gap-2.5 cursor-pointer select-none rounded-md p-2 bg-muted/40 hover:bg-muted/60 transition-colors"
          >
            <Checkbox
              id="consent-checkbox"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(Boolean(checked))}
              className="mt-0.5"
            />
            <div className="space-y-0.5 text-xs">
              <span className="font-semibold text-foreground">
                Li e concordo em nome do paciente, com o consentimento dele.
              </span>
              <p className="text-[11px] text-muted-foreground">
                Confirmo que o paciente foi informado e autorizou a {mediaLabel} para fins de anexo
                clínico ao prontuário médico.
              </p>
            </div>
          </label>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>O aceite fica registrado nesta sessão para este paciente.</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDecline}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAccept}
              disabled={!agreed || isSubmitting}
              size="sm"
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Check className="h-3.5 w-3.5" />
              {isSubmitting ? 'Registrando...' : 'Concordar e capturar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
