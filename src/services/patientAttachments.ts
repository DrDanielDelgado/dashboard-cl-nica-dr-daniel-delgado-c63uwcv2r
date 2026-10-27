import pb from '@/lib/pocketbase/client'

export type AttachmentCategory =
  | 'exame'
  | 'imagem'
  | 'audio'
  | 'video'
  | 'dicom'
  | 'documento'
  | 'outro'

export interface PatientAttachmentRecord {
  id: string
  patient: string
  file: string
  title?: string
  file_name?: string
  file_type?: string
  mime_type?: string
  category: AttachmentCategory
  exam_date?: string
  description?: string
  size_bytes?: number
  uploaded_by?: string
  created: string
  updated: string
  expand?: {
    patient?: {
      id: string
      name: string
      cpf?: string
    }
    uploaded_by?: {
      id: string
      name?: string
      email?: string
    }
  }
}

export interface UploadAttachmentPayload {
  patientId: string
  file: File
  title?: string
  description?: string
  examDate?: string
  category?: AttachmentCategory
}

/**
 * Detecta a categoria e tipo simplificado do arquivo a partir da extensão ou mimeType.
 */
export function detectAttachmentCategory(file: File): {
  category: AttachmentCategory
  extension: string
} {
  const name = file.name.toLowerCase()
  const mime = (file.type || '').toLowerCase()
  const parts = name.split('.')
  const ext = parts.length > 1 ? parts.pop() || '' : ''

  // DICOM (.dcm, .dicom, ou mime dicom)
  if (ext === 'dcm' || ext === 'dicom' || mime.includes('dicom') || mime === 'application/dicom') {
    return { category: 'dicom', extension: ext || 'dcm' }
  }

  // Imagens (JPG, PNG, BMP, GIF, WEBP, SVG, TIFF, etc.)
  if (
    ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp', 'svg', 'tif', 'tiff'].includes(ext) ||
    mime.startsWith('image/')
  ) {
    return { category: 'imagem', extension: ext || 'img' }
  }

  // Áudio (MP3, WAV, M4A, OGG, AAC, WMA, etc.)
  if (
    ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'wma', 'flac'].includes(ext) ||
    mime.startsWith('audio/')
  ) {
    return { category: 'audio', extension: ext || 'audio' }
  }

  // Vídeo (MP4, MOV, AVI, WEBM, MKV, WMV, etc.)
  if (
    ['mp4', 'mov', 'avi', 'webm', 'mkv', 'wmv', 'm4v', '3gp'].includes(ext) ||
    mime.startsWith('video/')
  ) {
    return { category: 'video', extension: ext || 'video' }
  }

  // Documentos / PDF / Laudos
  if (
    ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext) ||
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('document')
  ) {
    return { category: 'documento', extension: ext || 'pdf' }
  }

  return { category: 'outro', extension: ext || 'bin' }
}

/**
 * Formata bytes para exibição legível (ex: 2.4 MB)
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Gera a URL completa do arquivo armazenado no PocketBase
 */
export function getAttachmentFileUrl(attachment: PatientAttachmentRecord): string {
  if (!attachment || !attachment.file) return ''
  return pb.files.getURL(attachment, attachment.file)
}

/**
 * Lista anexos de um paciente específico (ou todos se não informado)
 */
export async function getPatientAttachments(
  patientId?: string,
  categoryFilter?: string,
): Promise<PatientAttachmentRecord[]> {
  try {
    const filters: string[] = []
    if (patientId) {
      filters.push(`patient = "${patientId}"`)
    }
    if (categoryFilter && categoryFilter !== 'all') {
      filters.push(`category = "${categoryFilter}"`)
    }

    const filterStr = filters.join(' && ')

    const records = await pb
      .collection('patient_attachments')
      .getFullList<PatientAttachmentRecord>({
        filter: filterStr || undefined,
        sort: '-created',
        expand: 'patient,uploaded_by',
      })

    return records
  } catch (error) {
    console.error('Erro ao listar anexos do paciente:', error)
    throw error
  }
}

/**
 * Faz upload de um único arquivo vinculado ao paciente
 */
export async function uploadPatientAttachment(
  payload: UploadAttachmentPayload,
): Promise<PatientAttachmentRecord> {
  const { category, extension } = detectAttachmentCategory(payload.file)
  const currentUserId = pb.authStore.record?.id

  const formData = new FormData()
  formData.append('patient', payload.patientId)
  formData.append('file', payload.file)
  formData.append('title', payload.title?.trim() || payload.file.name)
  formData.append('file_name', payload.file.name)
  formData.append('file_type', extension)
  formData.append('mime_type', payload.file.type || 'application/octet-stream')
  formData.append('category', payload.category || category)
  formData.append('size_bytes', String(payload.file.size))

  if (payload.examDate) {
    formData.append('exam_date', payload.examDate)
  }
  if (payload.description) {
    formData.append('description', payload.description)
  }
  if (currentUserId) {
    formData.append('uploaded_by', currentUserId)
  }

  const record = await pb
    .collection('patient_attachments')
    .create<PatientAttachmentRecord>(formData, {
      expand: 'patient,uploaded_by',
    })

  return record
}

/**
 * Exclui um anexo pelo ID
 */
export async function deletePatientAttachment(id: string): Promise<boolean> {
  try {
    await pb.collection('patient_attachments').delete(id)
    return true
  } catch (error) {
    console.error(`Erro ao excluir anexo ${id}:`, error)
    throw error
  }
}
