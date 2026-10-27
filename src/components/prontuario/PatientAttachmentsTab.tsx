import { useState, useEffect, useRef, useMemo } from 'react'
import {
  UploadCloud,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  FileCode,
  File,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Shield,
  HardDrive,
  User,
  Camera,
  Mic,
  FolderOpen,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  PatientAttachmentRecord,
  AttachmentCategory,
  detectAttachmentCategory,
  formatFileSize,
  getAttachmentFileUrl,
  getPatientAttachments,
  uploadPatientAttachment,
  deletePatientAttachment,
} from '@/services/patientAttachments'
import { Patient } from '@/types/paciente'
import { cn } from '@/lib/utils'
import { CameraCaptureDialog, CapturedPhoto } from '@/components/prontuario/CameraCaptureDialog'
import { AudioRecordDialog, CapturedAudio } from '@/components/prontuario/AudioRecordDialog'

interface PatientAttachmentsTabProps {
  patients: Patient[]
  selectedPatientId?: string
  onSelectPatient?: (patientId: string) => void
}

interface QueuedFile {
  id: string
  file: File
  category: AttachmentCategory
  extension: string
  title: string
  description: string
  examDate: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  errorMessage?: string
  progress: number
}

const MAX_FILE_SIZE = 52428800 // 50MB

const ALLOWED_EXTENSIONS_TEXT =
  'JPG, JPEG, PNG, BMP, GIF, WEBP, PDF, DICOM (.dcm/.dicom), MP3, WAV, M4A, MP4, MOV, AVI, etc.'

export function PatientAttachmentsTab({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientAttachmentsTabProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileCameraInputRef = useRef<HTMLInputElement>(null)

  // Estados principais
  const [currentPatientId, setCurrentPatientId] = useState<string>(selectedPatientId || '')
  const [attachments, setAttachments] = useState<PatientAttachmentRecord[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Fila de upload
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([])
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [batchExamDate, setBatchExamDate] = useState<string>(
    new Date().toISOString().substring(0, 10),
  )
  const [batchDescription, setBatchDescription] = useState<string>('')

  // Preview Dialog
  const [previewAttachment, setPreviewAttachment] = useState<PatientAttachmentRecord | null>(null)
  const [previewOpen, setPreviewOpen] = useState<boolean>(false)

  // Delete Alert Dialog
  const [attachmentToDelete, setAttachmentToDelete] = useState<PatientAttachmentRecord | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)

  // Drag & drop highlight
  const [isDragging, setIsDragging] = useState<boolean>(false)

  // Modais de Câmera e Áudio ao Vivo
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false)
  const [audioModalOpen, setAudioModalOpen] = useState<boolean>(false)

  // Sincroniza com prop externa quando mudar
  useEffect(() => {
    if (selectedPatientId && selectedPatientId !== currentPatientId) {
      setCurrentPatientId(selectedPatientId)
    }
  }, [selectedPatientId])

  // Carrega anexos ao selecionar paciente ou filtro
  const loadAttachments = async () => {
    setLoading(true)
    try {
      const records = await getPatientAttachments(
        currentPatientId || undefined,
        categoryFilter !== 'all' ? categoryFilter : undefined,
      )
      setAttachments(records)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar anexos',
        description: err.message || 'Não foi possível buscar os anexos no servidor.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttachments()
  }, [currentPatientId, categoryFilter])

  // Paciente ativo selecionado
  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === currentPatientId)
  }, [patients, currentPatientId])

  // Filtragem local por termo de busca
  const filteredAttachments = useMemo(() => {
    if (!searchTerm.trim()) return attachments
    const term = searchTerm.toLowerCase()
    return attachments.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.file_name && item.file_name.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.expand?.patient?.name && item.expand.patient.name.toLowerCase().includes(term)),
    )
  }, [attachments, searchTerm])

  // Métricas rápidas
  const totalSize = useMemo(() => {
    return attachments.reduce((acc, curr) => acc + (curr.size_bytes || 0), 0)
  }, [attachments])

  // Processa seleção de arquivos (input ou drag-and-drop)
  const handleFilesSelected = (files: FileList | File[]) => {
    const list = Array.from(files)
    if (list.length === 0) return

    const newQueued: QueuedFile[] = []
    const rejected: string[] = []

    list.forEach((f) => {
      if (f.size > MAX_FILE_SIZE) {
        rejected.push(`${f.name} (${formatFileSize(f.size)} > 50MB)`)
        return
      }

      const { category, extension } = detectAttachmentCategory(f)
      newQueued.push({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        file: f,
        category,
        extension,
        title: f.name.replace(/\.[^/.]+$/, ''), // remove extensão para título padrão amigável
        description: batchDescription,
        examDate: batchExamDate,
        status: 'pending',
        progress: 0,
      })
    })

    if (rejected.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Arquivos excederam o limite de 50MB',
        description: `${rejected.length} arquivo(s) não foram adicionados: ${rejected.slice(0, 3).join(', ')}${
          rejected.length > 3 ? '...' : ''
        }`,
      })
    }

    if (newQueued.length > 0) {
      setQueuedFiles((prev) => [...prev, ...newQueued])
      toast({
        title: `${newQueued.length} arquivo(s) prontos para upload`,
        description: 'Selecione o paciente e clique em "Iniciar Upload dos Arquivos".',
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer?.files) {
      handleFilesSelected(e.dataTransfer.files)
    }
  }

  // Validador de paciente selecionado antes de abrir ferramentas ao vivo
  const checkPatientSelected = (actionLabel: string): boolean => {
    if (!currentPatientId || currentPatientId === 'all') {
      toast({
        variant: 'destructive',
        title: 'Selecione um paciente',
        description: `Para ${actionLabel}, selecione o paciente correspondente no seletor acima.`,
      })
      return false
    }
    return true
  }

  const handleOpenCameraModal = () => {
    if (checkPatientSelected('capturar foto')) {
      setCameraModalOpen(true)
    }
  }

  const handleOpenAudioModal = () => {
    if (checkPatientSelected('gravar áudio')) {
      setAudioModalOpen(true)
    }
  }

  // Recebe fotos capturadas pela câmera e as adiciona na mesma fila
  const handlePhotosConfirmed = (photos: CapturedPhoto[]) => {
    if (photos.length === 0) return

    const newQueued: QueuedFile[] = photos.map((p, index) => {
      const { category, extension } = detectAttachmentCategory(p.file)
      const now = new Date()
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      return {
        id: `camera-${p.id}`,
        file: p.file,
        category,
        extension,
        title:
          `Foto Clínica ${index + 1 > 1 ? `#${index + 1}` : ''} — ${now.toLocaleDateString('pt-BR')} ${timeStr}`.trim(),
        description: batchDescription || 'Captura de foto em tempo real pelo prontuário',
        examDate: batchExamDate,
        status: 'pending',
        progress: 0,
      }
    })

    setQueuedFiles((prev) => [...prev, ...newQueued])
    toast({
      title: `${newQueued.length} foto(s) da câmera adicionada(s) à fila!`,
      description: 'Revise os dados e clique em "Iniciar Upload dos Arquivos" para salvar.',
    })
  }

  // Recebe áudio gravado e o adiciona na mesma fila
  const handleAudioConfirmed = (audio: CapturedAudio) => {
    const { category, extension } = detectAttachmentCategory(audio.file)
    const newQueued: QueuedFile = {
      id: `audio-${audio.id}`,
      file: audio.file,
      category: 'audio',
      extension,
      title: audio.title,
      description:
        batchDescription ||
        `Gravação de áudio em tempo real (${Math.round(audio.durationSeconds)}s)`,
      examDate: batchExamDate,
      status: 'pending',
      progress: 0,
    }

    setQueuedFiles((prev) => [...prev, newQueued])
    toast({
      title: 'Gravação de áudio adicionada à fila!',
      description: 'Revise os dados e clique em "Iniciar Upload dos Arquivos" para salvar.',
    })
  }

  const handleRemoveQueueItem = (id: string) => {
    setQueuedFiles((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearQueue = () => {
    setQueuedFiles([])
  }

  // Envio de toda a fila
  const handleStartUpload = async () => {
    if (!currentPatientId) {
      toast({
        variant: 'destructive',
        title: 'Selecione um paciente',
        description: 'Obrigatório vincular os anexos a um paciente cadastrado no prontuário.',
      })
      return
    }

    const pendingItems = queuedFiles.filter((q) => q.status === 'pending' || q.status === 'error')
    if (pendingItems.length === 0) {
      toast({
        title: 'Nenhum arquivo pendente',
        description: 'Todos os arquivos da lista já foram processados.',
      })
      return
    }

    setIsUploading(true)
    let successCount = 0
    let failCount = 0

    for (const item of pendingItems) {
      // Atualiza status para enviando
      setQueuedFiles((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 30 } : q)),
      )

      try {
        await uploadPatientAttachment({
          patientId: currentPatientId,
          file: item.file,
          title: item.title,
          description: item.description,
          examDate: item.examDate,
          category: item.category,
        })

        successCount++
        setQueuedFiles((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'success', progress: 100 } : q)),
        )
      } catch (err: any) {
        failCount++
        setQueuedFiles((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: 'error',
                  progress: 0,
                  errorMessage: err.message || 'Falha no upload',
                }
              : q,
          ),
        )
      }
    }

    setIsUploading(false)
    await loadAttachments()

    if (failCount === 0) {
      toast({
        title: 'Upload concluído com sucesso!',
        description: `${successCount} arquivo(s) vinculados à ficha do paciente com segurança.`,
      })
      // Limpa os que tiveram sucesso após 2s
      setTimeout(() => {
        setQueuedFiles((prev) => prev.filter((q) => q.status !== 'success'))
      }, 2000)
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload parcial',
        description: `${successCount} sucesso, ${failCount} falha(s). Verifique os erros apontados.`,
      })
    }
  }

  // Exclusão de um anexo com confirmação
  const handleConfirmDelete = async () => {
    if (!attachmentToDelete) return
    setDeleting(true)
    try {
      await deletePatientAttachment(attachmentToDelete.id)
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentToDelete.id))
      toast({
        title: 'Anexo excluído',
        description: `O arquivo "${attachmentToDelete.title || attachmentToDelete.file_name}" foi removido com sucesso.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: err.message || 'Não foi possível excluir o arquivo.',
      })
    } finally {
      setDeleting(false)
      setAttachmentToDelete(null)
    }
  }

  // Helper de ícone por categoria
  const getCategoryIcon = (category: AttachmentCategory, className = 'w-5 h-5') => {
    switch (category) {
      case 'imagem':
        return <FileImage className={cn('text-emerald-500', className)} />
      case 'audio':
        return <FileAudio className={cn('text-purple-500', className)} />
      case 'video':
        return <FileVideo className={cn('text-red-500', className)} />
      case 'dicom':
        return <FileCode className={cn('text-cyan-600 font-bold', className)} />
      case 'documento':
        return <FileText className={cn('text-blue-500', className)} />
      default:
        return <File className={cn('text-muted-foreground', className)} />
    }
  }

  // Helper de badge por categoria
  const getCategoryBadge = (category: AttachmentCategory) => {
    switch (category) {
      case 'imagem':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs"
          >
            Imagem
          </Badge>
        )
      case 'audio':
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-700 border-purple-500/20 text-xs"
          >
            Áudio
          </Badge>
        )
      case 'video':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 text-xs">
            Vídeo
          </Badge>
        )
      case 'dicom':
        return (
          <Badge
            variant="outline"
            className="bg-cyan-500/10 text-cyan-700 border-cyan-500/20 text-xs font-mono"
          >
            DICOM
          </Badge>
        )
      case 'documento':
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 border-blue-500/20 text-xs"
          >
            Laudo / PDF
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Outro
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho explicativo e Seletor de Paciente */}
      <div className="grid md:grid-cols-12 gap-4 items-start">
        <Card className="md:col-span-8 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-muted/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 text-xs"
              >
                Módulo Prontuário 360
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                LGPD & Backup Cloud
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2 text-foreground">
              <HardDrive className="h-6 w-6 text-primary" />
              Importação de Exames & Anexos Multimídia
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Faça upload de múltiplos arquivos de diversos diretórios locais para a ficha clínica
              do paciente. Suporta imagens (JPG, PNG, BMP, WEBP), exames radiológicos{' '}
              <strong>DICOM (.dcm)</strong>, laudos em PDF e mídias de áudio/vídeo (MP3, WAV, MP4,
              MOV).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Seletor de paciente */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <div className="flex items-center gap-2 shrink-0">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Paciente Destino:</span>
              </div>
              <div className="flex-1 max-w-md">
                <Select
                  value={currentPatientId}
                  onValueChange={(val) => {
                    setCurrentPatientId(val)
                    if (onSelectPatient) onSelectPatient(val)
                  }}
                >
                  <SelectTrigger className="w-full bg-background border-primary/30 shadow-sm">
                    <SelectValue placeholder="Selecione o paciente do prontuário..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="all">
                      <span className="font-semibold text-muted-foreground">
                        Todos os Pacientes (Visão Geral)
                      </span>
                    </SelectItem>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.fullName} {p.cpf ? `(CPF: ${p.cpf})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentPatientId && currentPatientId !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentPatientId('')
                    if (onSelectPatient) onSelectPatient('')
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground h-8"
                >
                  Limpar seleção
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card resumo do paciente selecionado */}
        <Card className="md:col-span-4 border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
              <span>Status do Prontuário</span>
              <Shield className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground">Paciente ativo:</span>
              <p className="font-bold text-sm text-foreground truncate">
                {activePatient
                  ? activePatient.fullName
                  : currentPatientId === 'all'
                    ? 'Todos os Pacientes'
                    : 'Nenhum selecionado'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t text-muted-foreground">
              <span>Total de Anexos:</span>
              <span className="font-mono font-bold text-foreground">{attachments.length}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-1 text-muted-foreground">
              <span>Espaço em Nuvem:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatFileSize(totalSize)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ÁREA DE CAPTURA AO VIVO & UPLOAD MÚLTIPLO */}
      <Card className="border border-primary/30 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-muted/20 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" />
                Upload Múltiplo & Captura em Tempo Real
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Envie arquivos locais ou capture fotos pela câmera e grave áudios ao vivo pelo
                computador ou celular. Tudo alimenta a mesma fila unificada.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge variant="outline" className="text-xs font-mono">
                Limite: 50MB / arquivo
              </Badge>
            </div>
          </div>

          {/* BARRA DE AÇÕES RÁPIDAS: ARQUIVOS + CÂMERA AO VIVO + ÁUDIO AO VIVO */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Botão Selecionar Arquivos */}
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start gap-2 h-10 border-primary/30 hover:border-primary hover:bg-primary/5 text-xs font-medium"
            >
              <FolderOpen className="h-4 w-4 text-primary shrink-0" />
              <div className="text-left min-w-0">
                <p className="font-semibold text-foreground truncate">Selecionar Arquivos</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Múltiplos diretórios / drag & drop
                </p>
              </div>
            </Button>

            {/* Botão Câmera ao Vivo */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenCameraModal}
                className="flex-1 justify-start gap-2 h-10 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5 text-xs font-medium"
              >
                <Camera className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="font-semibold text-foreground truncate">Tirar Foto (Câmera)</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Webcam ou celular ao vivo
                  </p>
                </div>
              </Button>
              {/* Fallback nativo mobile (environment) */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (checkPatientSelected('usar a câmera')) {
                    mobileCameraInputRef.current?.click()
                  }
                }}
                className="h-10 px-2 text-muted-foreground hover:text-emerald-700"
                title="Abrir app de câmera nativo do celular"
              >
                <span className="text-[10px] font-mono uppercase">App</span>
              </Button>
            </div>

            {/* Botão Gravar Áudio ao Vivo */}
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenAudioModal}
              className="w-full justify-start gap-2 h-10 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5 text-xs font-medium"
            >
              <Mic className="h-4 w-4 text-purple-600 shrink-0" />
              <div className="text-left min-w-0">
                <p className="font-semibold text-foreground truncate">Gravar Áudio</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Microfone ao vivo com timer
                </p>
              </div>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Inputs ocultos */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFilesSelected(e.target.files)
                e.target.value = ''
              }
            }}
          />
          <input
            ref={mobileCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFilesSelected(e.target.files)
                e.target.value = ''
              }
            }}
          />

          {/* Dropzone Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200',
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-muted hover:border-primary/50 hover:bg-muted/30 bg-muted/10',
            )}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              Arraste múltiplos arquivos aqui ou clique para selecionar
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg">
              Formatos aceitos: <strong>{ALLOWED_EXTENSIONS_TEXT}</strong>
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-3">
              <Badge variant="secondary" className="text-[11px]">
                Imagens (JPG/PNG/BMP/WEBP)
              </Badge>
              <Badge variant="secondary" className="text-[11px] font-mono">
                DICOM (.dcm/.dicom)
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                Laudos (PDF)
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                Áudio (MP3/WAV/M4A/Gravação)
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                Vídeo (MP4/MOV/AVI)
              </Badge>
            </div>
          </div>

          {/* Opções de lote para a fila */}
          {queuedFiles.length > 0 && (
            <div className="bg-muted/40 p-4 rounded-lg border space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    {queuedFiles.length} arquivo(s) na fila
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Total: {formatFileSize(queuedFiles.reduce((acc, q) => acc + q.file.size, 0))}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearQueue}
                    disabled={isUploading}
                    className="text-xs h-8 text-destructive hover:bg-destructive/10"
                  >
                    Limpar Fila
                  </Button>
                  <Button
                    type="button"
                    onClick={handleStartUpload}
                    disabled={isUploading || queuedFiles.length === 0}
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-3.5 w-3.5" /> Iniciar Upload dos Arquivos
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Dados padrão para aplicar na fila */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <Label htmlFor="batchDate" className="text-xs font-medium">
                    Data do Exame / Procedimento (padrão)
                  </Label>
                  <Input
                    id="batchDate"
                    type="date"
                    value={batchExamDate}
                    onChange={(e) => {
                      setBatchExamDate(e.target.value)
                      setQueuedFiles((prev) =>
                        prev.map((q) =>
                          q.status === 'pending' ? { ...q, examDate: e.target.value } : q,
                        ),
                      )
                    }}
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="batchDesc" className="text-xs font-medium">
                    Descrição / Observação Clínica Geral (opcional)
                  </Label>
                  <Input
                    id="batchDesc"
                    placeholder="Ex: Ultrassom obstétrico / Doppler de carótidas"
                    value={batchDescription}
                    onChange={(e) => {
                      setBatchDescription(e.target.value)
                      setQueuedFiles((prev) =>
                        prev.map((q) =>
                          q.status === 'pending' ? { ...q, description: e.target.value } : q,
                        ),
                      )
                    }}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>

              {/* Lista detalhada dos itens da fila */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {queuedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-md bg-background border text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getCategoryIcon(item.category, 'w-4 h-4 shrink-0')}
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{item.file.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{formatFileSize(item.file.size)}</span>
                          <span>•</span>
                          <span className="uppercase">{item.extension}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                      {item.status === 'pending' && (
                        <Badge variant="outline" className="text-[10px]">
                          Pendente
                        </Badge>
                      )}
                      {item.status === 'uploading' && (
                        <div className="flex items-center gap-2 w-28">
                          <Progress value={item.progress} className="h-1.5" />
                          <span className="text-[10px] font-mono">Enviando</span>
                        </div>
                      )}
                      {item.status === 'success' && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-600 gap-1 text-[10px]"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Enviado
                        </Badge>
                      )}
                      {item.status === 'error' && (
                        <Badge
                          variant="destructive"
                          className="gap-1 text-[10px]"
                          title={item.errorMessage}
                        >
                          <AlertCircle className="h-3 w-3" /> Erro
                        </Badge>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQueueItem(item.id)}
                        disabled={isUploading && item.status === 'uploading'}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* LISTA / GALERIA DE ANEXOS DO PACIENTE */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Galeria de Exames & Histórico de Anexos
              </CardTitle>
              <CardDescription className="text-xs">
                {currentPatientId && currentPatientId !== 'all'
                  ? `Exibindo arquivos cadastrados para ${activePatient?.fullName || 'o paciente selecionado'}.`
                  : 'Exibindo todos os arquivos anexados no sistema.'}
              </CardDescription>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-60">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar anexo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <div className="w-36">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="imagem">Imagens</SelectItem>
                    <SelectItem value="dicom">DICOM</SelectItem>
                    <SelectItem value="documento">Laudos / PDF</SelectItem>
                    <SelectItem value="audio">Áudios</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                    <SelectItem value="outro">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={loadAttachments}
                disabled={loading}
                className="h-8 px-2.5 text-xs gap-1"
                title="Recarregar lista"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p>Carregando histórico de exames...</p>
            </div>
          ) : filteredAttachments.length === 0 ? (
            <div className="py-16 text-center border rounded-lg bg-muted/10 space-y-3">
              <UploadCloud className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <div>
                <p className="font-semibold text-sm text-foreground">
                  Nenhum exame ou anexo encontrado
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  {searchTerm
                    ? 'Nenhum resultado corresponde à sua busca por "' + searchTerm + '".'
                    : currentPatientId && currentPatientId !== 'all'
                      ? 'Este paciente ainda não possui laudos, imagens ou exames vinculados.'
                      : 'Selecione um paciente ou envie o primeiro exame na área de upload acima.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAttachments.map((att) => {
                const fileUrl = getAttachmentFileUrl(att)
                const isImage = att.category === 'imagem'
                const isAudio = att.category === 'audio'
                const isVideo = att.category === 'video'
                const isDicom = att.category === 'dicom'
                const isPdf =
                  att.category === 'documento' || (att.file_name && att.file_name.endsWith('.pdf'))

                return (
                  <Card
                    key={att.id}
                    className="border overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between bg-card group"
                  >
                    <div>
                      {/* Miniatura ou Área de Ícone */}
                      <div
                        onClick={() => {
                          setPreviewAttachment(att)
                          setPreviewOpen(true)
                        }}
                        className="h-36 w-full bg-muted/40 relative cursor-pointer flex items-center justify-center overflow-hidden border-b"
                      >
                        {isImage && fileUrl ? (
                          <img
                            src={fileUrl}
                            alt={att.title || att.file_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : isVideo && fileUrl ? (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileVideo className="h-12 w-12 text-red-500/80 mb-1" />
                            <span className="text-[11px] font-medium">Prévia de Vídeo</span>
                          </div>
                        ) : isAudio ? (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileAudio className="h-12 w-12 text-purple-500/80 mb-1" />
                            <span className="text-[11px] font-medium">Arquivo de Áudio</span>
                          </div>
                        ) : isDicom ? (
                          <div className="flex flex-col items-center justify-center text-cyan-700 dark:text-cyan-400">
                            <FileCode className="h-12 w-12 mb-1" />
                            <span className="text-[11px] font-mono font-bold">EXAME DICOM</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            {getCategoryIcon(att.category, 'h-12 w-12 mb-1')}
                            <span className="text-[11px] font-medium">Documento / Laudo</span>
                          </div>
                        )}

                        <div className="absolute top-2 left-2">
                          {getCategoryBadge(att.category)}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {formatFileSize(att.size_bytes)}
                        </div>
                      </div>

                      {/* Informações */}
                      <div className="p-3 space-y-1.5 text-xs">
                        <h4
                          className="font-bold text-foreground text-sm truncate"
                          title={att.title || att.file_name}
                        >
                          {att.title || att.file_name}
                        </h4>

                        <div className="text-[11px] text-muted-foreground truncate">
                          Paciente:{' '}
                          <span className="font-medium text-foreground">
                            {att.expand?.patient?.name || 'Não identificado'}
                          </span>
                        </div>

                        {att.exam_date && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Data Exame:{' '}
                              {new Date(att.exam_date).toLocaleDateString('pt-BR', {
                                timeZone: 'UTC',
                              })}
                            </span>
                          </div>
                        )}

                        {att.description && (
                          <p
                            className="text-[11px] text-muted-foreground line-clamp-2"
                            title={att.description}
                          >
                            {att.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="p-3 pt-0 border-t bg-muted/10 flex items-center justify-between gap-1 text-xs">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewAttachment(att)
                          setPreviewOpen(true)
                        }}
                        className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary"
                      >
                        <Eye className="h-3 w-3" /> Ver
                      </Button>

                      <div className="flex items-center gap-1">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={att.file_name || att.title}
                          className="inline-flex"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Download direto"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </a>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachmentToDelete(att)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          title="Excluir anexo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO (PREVIEW) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {previewAttachment && getCategoryBadge(previewAttachment.category)}
              <DialogTitle className="text-lg truncate">
                {previewAttachment?.title || previewAttachment?.file_name}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Paciente: {previewAttachment?.expand?.patient?.name || 'Não identificado'} • Tamanho:{' '}
              {formatFileSize(previewAttachment?.size_bytes)}
            </DialogDescription>
          </DialogHeader>

          {/* Área de Visualização Especializada */}
          <div className="flex-1 min-h-[300px] max-h-[550px] overflow-auto flex items-center justify-center bg-muted/20 rounded-lg p-3 border">
            {previewAttachment && (
              <>
                {/* Imagem */}
                {previewAttachment.category === 'imagem' && (
                  <img
                    src={getAttachmentFileUrl(previewAttachment)}
                    alt={previewAttachment.title}
                    className="max-h-[500px] max-w-full object-contain rounded"
                  />
                )}

                {/* PDF */}
                {previewAttachment.category === 'documento' &&
                  previewAttachment.file_name?.toLowerCase().endsWith('.pdf') && (
                    <iframe
                      src={getAttachmentFileUrl(previewAttachment)}
                      className="w-full h-[500px] rounded border"
                      title={previewAttachment.title}
                    />
                  )}

                {/* Áudio */}
                {previewAttachment.category === 'audio' && (
                  <div className="w-full max-w-md p-6 space-y-4 text-center">
                    <FileAudio className="h-16 w-16 text-purple-500 mx-auto" />
                    <h4 className="font-semibold">
                      {previewAttachment.title || previewAttachment.file_name}
                    </h4>
                    <audio controls className="w-full">
                      <source
                        src={getAttachmentFileUrl(previewAttachment)}
                        type={previewAttachment.mime_type}
                      />
                      Seu navegador não suporta reprodução de áudio.
                    </audio>
                  </div>
                )}

                {/* Vídeo */}
                {previewAttachment.category === 'video' && (
                  <video controls className="max-h-[500px] max-w-full rounded shadow">
                    <source
                      src={getAttachmentFileUrl(previewAttachment)}
                      type={previewAttachment.mime_type}
                    />
                    Seu navegador não suporta reprodução de vídeo.
                  </video>
                )}

                {/* DICOM ou Outro arquivo sem visualizador nativo */}
                {(previewAttachment.category === 'dicom' ||
                  (previewAttachment.category === 'documento' &&
                    !previewAttachment.file_name?.toLowerCase().endsWith('.pdf')) ||
                  previewAttachment.category === 'outro') && (
                  <div className="p-8 text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center mx-auto">
                      <FileCode className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">
                        {previewAttachment.category === 'dicom'
                          ? 'Arquivo Radiológico DICOM (.dcm)'
                          : 'Download do Arquivo Clínico'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {previewAttachment.category === 'dicom'
                          ? 'Arquivos médicos DICOM contêm metadados volumétricos e imagens diagnósticas para visualização em estações PACS ou softwares médicos dedicados (ex: OsiriX, Horos, Weasis).'
                          : 'Este tipo de arquivo pode ser baixado diretamente para visualização no aplicativo correspondente.'}
                      </p>
                    </div>
                    <a
                      href={getAttachmentFileUrl(previewAttachment)}
                      download={previewAttachment.file_name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button className="gap-2 bg-primary">
                        <Download className="h-4 w-4" /> Baixar Arquivo Original
                      </Button>
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span>Armazenado com segurança LGPD no Skip Cloud</span>
            </div>
            <div className="flex items-center gap-2">
              {previewAttachment && (
                <a
                  href={getAttachmentFileUrl(previewAttachment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" /> Abrir em Nova Aba
                  </Button>
                </a>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewOpen(false)}
                className="text-xs"
              >
                Fechar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <AlertDialog
        open={Boolean(attachmentToDelete)}
        onOpenChange={(open) => {
          if (!open) setAttachmentToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Confirmar Exclusão de Anexo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Tem certeza que deseja excluir permanentemente o arquivo{' '}
              <strong>{attachmentToDelete?.title || attachmentToDelete?.file_name}</strong> da ficha
              do paciente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {deleting ? 'Excluindo...' : 'Sim, Excluir Anexo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL DE CÂMERA AO VIVO COM CONSENTIMENTO LGPD */}
      <CameraCaptureDialog
        open={cameraModalOpen}
        onOpenChange={setCameraModalOpen}
        patientId={activePatient?.id || currentPatientId}
        patientName={activePatient?.fullName || ''}
        onPhotosConfirmed={handlePhotosConfirmed}
      />

      {/* MODAL DE GRAVAÇÃO DE ÁUDIO AO VIVO COM CONSENTIMENTO LGPD */}
      <AudioRecordDialog
        open={audioModalOpen}
        onOpenChange={setAudioModalOpen}
        patientId={activePatient?.id || currentPatientId}
        patientName={activePatient?.fullName || ''}
        onAudioConfirmed={handleAudioConfirmed}
      />
    </div>
  )
}
