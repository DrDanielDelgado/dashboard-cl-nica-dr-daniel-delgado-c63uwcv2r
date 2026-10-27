import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
  Volume2,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export interface CapturedAudio {
  id: string
  file: File
  audioUrl: string
  durationSeconds: number
  title: string
  timestamp: Date
}

interface AudioRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
  onAudioConfirmed: (audio: CapturedAudio) => void
}

export function AudioRecordDialog({
  open,
  onOpenChange,
  patientName,
  onAudioConfirmed,
}: AudioRecordDialogProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<number | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'recorded'>('idle')
  const [durationSeconds, setDurationSeconds] = useState<number>(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioTitle, setAudioTitle] = useState<string>('')
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false)
  const [micError, setMicError] = useState<{ title: string; message: string } | null>(null)

  // Encerra todas as tracks do microfone para garantir privacidade e LGPD
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch (e) {
          console.warn('Erro ao parar track de áudio:', e)
        }
      })
      streamRef.current = null
    }
  }, [])

  // Limpa o timer
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }, [])

  // Reseta estado completo da gravação
  const resetRecording = useCallback(() => {
    stopTimer()
    stopStream()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Ignora
      }
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setRecordState('idle')
    setDurationSeconds(0)
    setRecordedBlob(null)
    setAudioUrl(null)
    setIsPlayingPreview(false)
    setMicError(null)
  }, [stopTimer, stopStream, audioUrl])

  // Fecha e limpa tudo
  useEffect(() => {
    if (!open) {
      resetRecording()
    } else {
      // Sugere título com data/hora formatada
      const now = new Date()
      const dateStr = now.toLocaleDateString('pt-BR')
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setAudioTitle(`Gravação de Áudio — ${dateStr} ${timeStr}`)
    }
    return () => {
      stopTimer()
      stopStream()
    }
  }, [open, resetRecording, stopTimer, stopStream])

  // Inicia a gravação com MediaRecorder
  const startRecording = async () => {
    setMicError(null)
    chunksRef.current = []

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError({
        title: 'Microfone não suportado neste navegador',
        message:
          'Seu navegador não oferece suporte à API de gravação de áudio. Utilize uma versão recente do Google Chrome, Safari, Firefox ou Edge.',
      })
      return
    }

    if (typeof window.MediaRecorder === 'undefined') {
      setMicError({
        title: 'MediaRecorder não disponível',
        message: 'A gravação de áudio em tempo real não está habilitada neste ambiente.',
      })
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // Tenta webm/opus ou mp4/aac de acordo com suporte do navegador (Safari vs Chrome)
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus'
        } else {
          mimeType = '' // Deixa o navegador escolher o padrão
        }
      }

      const options = mimeType ? { mimeType } : undefined
      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        stopTimer()
        stopStream()

        const actualMime = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: actualMime })
        const url = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setAudioUrl(url)
        setRecordState('recorded')
      }

      // Inicia captura em fatias de 100ms para responsividade
      recorder.start(100)
      setRecordState('recording')
      setDurationSeconds(0)

      timerIntervalRef.current = window.setInterval(() => {
        setDurationSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      console.error('Erro ao acessar microfone:', err)
      const errName = err?.name || ''
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setMicError({
          title: 'Permissão de microfone bloqueada ou negada',
          message:
            'O acesso ao microfone foi recusado. Clique no ícone de permissões ao lado da URL no navegador, habilite o Microfone e recarregue a página.',
        })
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setMicError({
          title: 'Nenhum microfone encontrado',
          message:
            'Nenhum dispositivo de captação de áudio foi detectado neste computador ou celular.',
        })
      } else {
        setMicError({
          title: 'Não foi possível gravar áudio',
          message: err?.message || 'Ocorreu um erro ao conectar ao microfone.',
        })
      }
      stopStream()
    }
  }

  // Interrompe a gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // Toca ou pausa o preview do áudio gravado
  const togglePlayPreview = () => {
    if (!audioElementRef.current) return

    if (isPlayingPreview) {
      audioElementRef.current.pause()
      setIsPlayingPreview(false)
    } else {
      audioElementRef.current
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => setIsPlayingPreview(false))
    }
  }

  // Formata os segundos em MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
  }

  // Confirma e envia para a fila de uploads do prontuário
  const handleConfirm = () => {
    if (!recordedBlob || !audioUrl) return

    const now = new Date()
    const dateStr = now.toISOString().replace(/[-:]/g, '').replace('T', '_').substring(0, 15)

    const isWebm = recordedBlob.type.includes('webm')
    const isMp4 = recordedBlob.type.includes('mp4')
    const ext = isMp4 ? 'm4a' : isWebm ? 'webm' : 'ogg'
    const fileName = `audio_clinico_${dateStr}.${ext}`

    const file = new File([recordedBlob], fileName, {
      type: recordedBlob.type || 'audio/webm',
      lastModified: now.getTime(),
    })

    const captured: CapturedAudio = {
      id: `audio-${Date.now()}-${Math.random()}`,
      file,
      audioUrl,
      durationSeconds,
      title: audioTitle.trim() || `Gravação de Áudio — ${now.toLocaleDateString('pt-BR')}`,
      timestamp: now,
    }

    onAudioConfirmed(captured)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          resetRecording()
        }
        onOpenChange(val)
      }}
    >
      <DialogContent className="max-w-lg p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-700 border-purple-500/20"
            >
              <Mic className="h-3 w-3 mr-1" /> Gravação de Áudio ao Vivo
            </Badge>
            {patientName && (
              <Badge variant="secondary" className="text-xs truncate max-w-[200px]">
                {patientName}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg">Gravar Áudio Clínico</DialogTitle>
          <DialogDescription className="text-xs">
            Grave notas de voz, orientações, ditados ou relatos de consulta em tempo real. O áudio
            será anexado à fila de uploads da ficha do paciente.
          </DialogDescription>
        </DialogHeader>

        {/* Erro de microfone */}
        {micError && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2 text-foreground">
            <div className="flex items-center gap-2 text-destructive font-semibold text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{micError.title}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{micError.message}</p>
          </div>
        )}

        {/* Painel Central de Gravação */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4 rounded-xl bg-muted/20 border">
          {/* Cronômetro */}
          <div className="text-center space-y-1">
            <div
              className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight ${
                recordState === 'recording' ? 'text-destructive animate-pulse' : 'text-foreground'
              }`}
            >
              {formatTime(durationSeconds)}
            </div>
            <div className="text-xs text-muted-foreground">
              {recordState === 'idle' && 'Pronto para gravar'}
              {recordState === 'recording' && 'Gravando áudio... fale ao microfone'}
              {recordState === 'recorded' && `Áudio gravado (${formatTime(durationSeconds)})`}
            </div>
          </div>

          {/* Botão de Ação Principal */}
          {recordState === 'idle' && (
            <Button
              type="button"
              onClick={startRecording}
              size="lg"
              className="rounded-full w-20 h-20 p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
              title="Iniciar Gravação"
            >
              <Mic className="h-9 w-9" />
            </Button>
          )}

          {recordState === 'recording' && (
            <div className="flex flex-col items-center gap-3">
              <Button
                type="button"
                onClick={stopRecording}
                size="lg"
                className="rounded-full w-20 h-20 p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg transition-transform active:scale-95 animate-pulse"
                title="Parar Gravação"
              >
                <Square className="h-8 w-8 fill-current" />
              </Button>
              <span className="text-[11px] font-medium text-destructive">
                Clique no quadrado vermelho para concluir
              </span>
            </div>
          )}

          {recordState === 'recorded' && audioUrl && (
            <div className="w-full max-w-sm px-4 space-y-3 animate-fade-in">
              <audio
                ref={audioElementRef}
                src={audioUrl}
                onEnded={() => setIsPlayingPreview(false)}
                className="hidden"
              />

              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPreview}
                  className="gap-1.5 text-xs h-9"
                >
                  {isPlayingPreview ? (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> Ouvir Prévia
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetRecording}
                  className="gap-1.5 text-xs h-9 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Regravar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Título opcional da gravação */}
        {recordState === 'recorded' && (
          <div className="space-y-1.5 animate-fade-in">
            <Label htmlFor="audioTitle" className="text-xs font-medium">
              Título do Anexo de Áudio
            </Label>
            <Input
              id="audioTitle"
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              placeholder="Ex: Anamnese por voz / Nota clínica pós-consulta"
              className="text-xs h-8"
            />
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <HelpCircle className="h-3 w-3 shrink-0" />
            <span>O microfone é desligado automaticamente ao finalizar ou fechar (LGPD).</span>
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
              disabled={recordState !== 'recorded'}
              size="sm"
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Check className="h-3.5 w-3.5" />
              Adicionar à Fila de Upload
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
