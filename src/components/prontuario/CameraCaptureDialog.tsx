import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Camera,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  FlipHorizontal,
  Image as ImageIcon,
  HelpCircle,
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
import { Badge } from '@/components/ui/badge'
import { LgpdCaptureConsentDialog } from '@/components/prontuario/LgpdCaptureConsentDialog'
import { hasSessionConsent } from '@/services/captureConsentAudit'

export interface CapturedPhoto {
  id: string
  file: File
  dataUrl: string
  timestamp: Date
}

interface CameraCaptureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId?: string
  patientName: string
  onPhotosConfirmed: (photos: CapturedPhoto[]) => void
}

export function CameraCaptureDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  onPhotosConfirmed,
}: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([])
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<{ title: string; message: string } | null>(null)
  const [isLoadingStream, setIsLoadingStream] = useState<boolean>(false)
  const [flashAnimation, setFlashAnimation] = useState<boolean>(false)
  const [consentModalOpen, setConsentModalOpen] = useState<boolean>(false)
  const [hasConsent, setHasConsent] = useState<boolean>(false)

  // Encerra todas as tracks ativas da câmera para LGPD e privacidade
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch (e) {
          console.warn('Erro ao parar track de câmera:', e)
        }
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Inicializa a câmera com a direção configurada
  const startCamera = useCallback(
    async (facing: 'user' | 'environment') => {
      setIsLoadingStream(true)
      setCameraError(null)
      stopStream()

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError({
          title: 'Câmera não suportada neste navegador',
          message:
            'Seu navegador não oferece suporte à captura de vídeo ao vivo. Utilize um navegador atualizado como Chrome, Safari, Edge ou Firefox, ou utilize o upload de arquivos via seletor nativo.',
        })
        setIsLoadingStream(false)
        return
      }

      try {
        // Identifica se há múltiplas câmeras
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const videoInputs = devices.filter((d) => d.kind === 'videoinput')
          setHasMultipleCameras(videoInputs.length > 1)
        } catch {
          // Ignora falhas de enumeração
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          try {
            await videoRef.current.play()
          } catch {
            // Autoplay pode necessitar interação
          }
        }
      } catch (err: any) {
        console.error('Erro ao acessar câmera:', err)
        const errName = err?.name || ''
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setCameraError({
            title: 'Permissão de câmera bloqueada ou negada',
            message:
              'O acesso à câmera foi recusado. Para liberar, clique no ícone de cadeado/configurações ao lado do endereço do site na barra de navegação, permita o acesso à "Câmera" e recarregue a página.',
          })
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setCameraError({
            title: 'Nenhuma câmera encontrada',
            message:
              'Não foi detectada nenhuma câmera (webcam ou câmera integrada) conectada a este dispositivo.',
          })
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          setCameraError({
            title: 'Câmera em uso por outro aplicativo',
            message:
              'A câmera já está sendo utilizada por outro programa (Zoom, Teams, Meet ou outro navegador). Feche o outro app e tente novamente.',
          })
        } else {
          setCameraError({
            title: 'Não foi possível iniciar a câmera',
            message:
              err?.message || 'Ocorreu um erro inesperado ao conectar ao dispositivo de vídeo.',
          })
        }
      } finally {
        setIsLoadingStream(false)
      }
    },
    [stopStream],
  )

  // Inicia ou para quando o modal abre/fecha e gerencia o consentimento LGPD
  useEffect(() => {
    if (open) {
      const effectiveId = patientId || patientName || 'paciente'
      const alreadyGranted = hasSessionConsent(effectiveId, 'camera')
      if (alreadyGranted) {
        setHasConsent(true)
        startCamera(facingMode)
      } else {
        setHasConsent(false)
        setConsentModalOpen(true)
      }
    } else {
      stopStream()
      setCapturedPhotos([])
      setCameraError(null)
      setConsentModalOpen(false)
    }

    return () => {
      stopStream()
    }
  }, [open, patientId, patientName, facingMode, startCamera, stopStream])

  const handleConsentGranted = () => {
    setHasConsent(true)
    startCamera(facingMode)
  }

  const handleConsentDeclined = () => {
    setHasConsent(false)
    stopStream()
    onOpenChange(false)
  }

  // Alterna câmera frontal / traseira
  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
  }

  // Tira uma foto e guarda na lista de fotos capturadas
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    if (video.videoWidth === 0 || video.videoHeight === 0) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Se estiver usando câmera frontal (user), espelha horizontalmente para visual natural
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Flash visual
    setFlashAnimation(true)
    setTimeout(() => setFlashAnimation(false), 200)

    canvas.toBlob(
      (blob) => {
        if (!blob) return

        const timestamp = new Date()
        const dateStr = timestamp
          .toISOString()
          .replace(/[-:]/g, '')
          .replace('T', '_')
          .substring(0, 15)
        const photoNumber = capturedPhotos.length + 1
        const fileName = `foto_clinica_${dateStr}_${photoNumber}.jpg`

        const file = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: timestamp.getTime(),
        })

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

        const newPhoto: CapturedPhoto = {
          id: `photo-${Date.now()}-${Math.random()}`,
          file,
          dataUrl,
          timestamp,
        }

        setCapturedPhotos((prev) => [...prev, newPhoto])
      },
      'image/jpeg',
      0.92,
    )
  }

  // Remove uma foto capturada da lista antes de confirmar
  const handleRemovePhoto = (id: string) => {
    setCapturedPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  // Confirma e adiciona à fila de uploads do prontuário
  const handleConfirm = () => {
    if (capturedPhotos.length === 0) return
    onPhotosConfirmed(capturedPhotos)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          stopStream()
        }
        onOpenChange(val)
      }}
    >
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Camera className="h-3 w-3 mr-1" /> Câmera ao Vivo
              </Badge>
              {patientName && (
                <Badge variant="secondary" className="text-xs truncate max-w-[200px] sm:max-w-none">
                  {patientName}
                </Badge>
              )}
            </div>
            {hasMultipleCameras && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleFacingMode}
                disabled={isLoadingStream}
                className="h-7 text-xs gap-1"
                title="Alternar entre câmera frontal e traseira"
              >
                <FlipHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {facingMode === 'environment' ? 'Usar Frontal' : 'Usar Traseira'}
                </span>
              </Button>
            )}
          </div>
          <DialogTitle className="text-lg">Capturar Foto em Tempo Real</DialogTitle>
          <DialogDescription className="text-xs">
            Tire uma ou mais fotos consecutivas pelo computador ou celular. As imagens serão
            adicionadas diretamente à fila de upload do prontuário do paciente.
          </DialogDescription>
        </DialogHeader>

        {/* Viewport da Câmera / Erro */}
        <div className="relative flex-1 min-h-[260px] sm:min-h-[360px] bg-black rounded-lg overflow-hidden flex items-center justify-center border">
          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Flash visual */}
          {flashAnimation && (
            <div className="absolute inset-0 bg-white/80 z-20 pointer-events-none animate-pulse" />
          )}

          {cameraError ? (
            <div className="p-6 text-center max-w-md z-10 space-y-3 bg-background/95 rounded-lg border m-4 shadow-lg text-foreground">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm text-destructive">{cameraError.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{cameraError.message}</p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => startCamera(facingMode)}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Tentar Novamente
                </Button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover max-h-[380px] ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />
              {isLoadingStream && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-2 z-10">
                  <RotateCcw className="h-5 w-5 animate-spin text-primary" />
                  <span>Conectando à câmera...</span>
                </div>
              )}
            </>
          )}

          {/* Botão de Disparo sobreposto */}
          {!cameraError && !isLoadingStream && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-10">
              <Button
                type="button"
                onClick={capturePhoto}
                size="lg"
                className="rounded-full w-14 h-14 p-0 bg-white text-primary hover:bg-white/90 shadow-xl border-4 border-primary/50 transition-transform active:scale-95"
                title="Tirar foto"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <Camera className="h-5 w-5" />
                </div>
              </Button>
            </div>
          )}
        </div>

        {/* Miniaturas das fotos já tiradas nesta sessão */}
        {capturedPhotos.length > 0 && (
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-foreground">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                {capturedPhotos.length} foto(s) capturada(s)
              </span>
              <span className="text-[11px] text-muted-foreground">
                Clique no &quot;x&quot; para descartar antes de enviar
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 max-h-24">
              {capturedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative group shrink-0 w-20 h-20 rounded-md overflow-hidden border border-border/80 bg-muted"
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Captura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded font-mono">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-destructive/90 text-destructive-foreground rounded-full p-0.5 hover:bg-destructive shadow"
                    title="Remover foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <HelpCircle className="h-3 w-3 shrink-0" />
            <span>Por privacidade, a câmera desliga sozinha ao fechar esta janela.</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={capturedPhotos.length === 0}
              size="sm"
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Check className="h-3.5 w-3.5" />
              Adicionar à Fila ({capturedPhotos.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <LgpdCaptureConsentDialog
      open={consentModalOpen}
      onOpenChange={(val) => {
        setConsentModalOpen(val)
        if (!val && !hasConsent) {
          handleConsentDeclined()
        }
      }}
      captureType="camera"
      patientId={patientId}
      patientName={patientName}
      onConsentGranted={handleConsentGranted}
      onConsentDeclined={handleConsentDeclined}
    />
    </>
  )
}
