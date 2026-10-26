import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  HelpCircle,
  Database,
} from 'lucide-react'
import { useHiDoctorStore } from '@/stores/hidoctor'
import { parseHiDoctorExportFile } from '@/lib/api/hidoctor'
import { Patient } from '@/types/paciente'
import { toast } from '@/hooks/use-toast'

interface HiDoctorImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HiDoctorImportDialog({ open, onOpenChange }: HiDoctorImportDialogProps) {
  const { importBatch, isSyncing } = useHiDoctorStore()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedPreview, setParsedPreview] = useState<Partial<Patient>[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setParseError(null)
    setIsParsing(true)

    try {
      const parsed = await parseHiDoctorExportFile(file)
      if (parsed.length === 0) {
        setParseError('Nenhum paciente válido encontrado no arquivo.')
        setParsedPreview([])
      } else {
        setParsedPreview(parsed)
      }
    } catch (err: any) {
      setParseError(err.message || 'Erro ao processar arquivo')
      setParsedPreview([])
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = async () => {
    if (parsedPreview.length === 0) return
    try {
      await importBatch(parsedPreview, 'file_import')
      onOpenChange(false)
      setSelectedFile(null)
      setParsedPreview([])
    } catch (_) {
      // toast já disparado no store
    }
  }

  const resetState = () => {
    setSelectedFile(null)
    setParsedPreview([])
    setParseError(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" /> Importar Prontuários HiDoctor
          </DialogTitle>
          <DialogDescription>
            Importe a lista de pacientes e históricos clínicos exportados do seu HiDoctor (Desktop
            ou HiDoctor NET) em formatos CSV ou JSON.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full mt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upload">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Upload de Arquivo
            </TabsTrigger>
            <TabsTrigger value="how_to">
              <HelpCircle className="w-4 h-4 mr-2" /> Como exportar do HiDoctor?
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 py-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt,.json"
              className="hidden"
              onChange={handleFileChange}
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors border-primary/30 bg-primary/5"
              >
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">
                  Clique aqui ou arraste o arquivo exportado do HiDoctor
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: <strong>CSV</strong> (com delimitador vírgula ou
                  ponto-e-vírgula) ou <strong>JSON</strong>
                </p>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetState()
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    Trocar arquivo
                  </Button>
                </div>

                {isParsing && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Analisando registros...</p>
                    <Progress value={50} className="h-1.5" />
                  </div>
                )}

                {parseError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Falha na leitura do arquivo</AlertTitle>
                    <AlertDescription className="text-xs">{parseError}</AlertDescription>
                  </Alert>
                )}

                {parsedPreview.length > 0 && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {parsedPreview.length} prontuários reconhecidos e prontos para importar
                      </span>
                      <Badge variant="outline">
                        {parsedPreview.filter((p) => p.cpf).length} com CPF
                      </Badge>
                    </div>

                    <div className="max-h-48 overflow-y-auto border rounded-md divide-y text-xs">
                      {parsedPreview.slice(0, 5).map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 flex items-center justify-between bg-background"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{p.fullName}</p>
                            <p className="text-muted-foreground text-[11px]">
                              {p.cpf ? `CPF: ${p.cpf}` : 'Sem CPF'} • {p.phone || 'Sem telefone'}
                            </p>
                          </div>
                          {p.clinicalNotes && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] max-w-[200px] truncate"
                            >
                              Com histórico
                            </Badge>
                          )}
                        </div>
                      ))}
                      {parsedPreview.length > 5 && (
                        <div className="p-2 text-center text-muted-foreground bg-muted/10 font-medium text-[11px]">
                          + {parsedPreview.length - 5} outros prontuários no lote
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="how_to"
            className="space-y-3 py-2 text-sm text-muted-foreground leading-relaxed"
          >
            <div className="p-4 border rounded-lg bg-muted/10 space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Passo a passo no HiDoctor:
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-xs">
                <li>
                  No HiDoctor Desktop ou HiDoctor NET, acesse o menu <strong>Relatórios</strong> ou{' '}
                  <strong>Ferramentas &gt; Exportar Dados</strong>.
                </li>
                <li>
                  Selecione a opção de exportar a lista de <strong>Pacientes/Prontuários</strong> no
                  formato <strong>CSV</strong> (valores separados por vírgula ou ponto-e-vírgula).
                </li>
                <li>
                  Certifique-se de incluir as colunas: <em>Nome</em>, <em>CPF</em>,{' '}
                  <em>Telefone</em>, <em>E-mail</em>, <em>Data de Nascimento</em> e{' '}
                  <em>Anotações/Histórico</em>.
                </li>
                <li>
                  Salve o arquivo no seu computador e faça o upload na aba{' '}
                  <strong>Upload de Arquivo</strong> ao lado.
                </li>
                <li>
                  O sistema fará a correspondência automática dos pacientes já cadastrados no banco
                  de dados e inserirá os novos sem duplicidade.
                </li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSyncing}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedPreview.length === 0 || isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {isSyncing
              ? 'Importando...'
              : `Importar ${parsedPreview.length > 0 ? `(${parsedPreview.length})` : ''} ao Banco`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
