import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Patient } from '@/types/paciente'
import { useHiDoctorStore } from '@/stores/hidoctor'
import {
  FileText,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Shield,
  User,
  FileSignature,
  Save,
  Printer,
} from 'lucide-react'

export function PatientDetailsDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { updatePatient, signPatientRecord } = useHiDoctorStore()
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (patient) setNotes(patient.clinicalNotes)
  }, [patient, open])

  if (!patient) return null

  const handleSaveNotes = () => {
    if (patient.signature) return
    updatePatient(patient.id, { clinicalNotes: notes })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:p-0">
        <div className="flex justify-end gap-2 mb-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
          {!patient.signature && (
            <Button
              size="sm"
              onClick={() => signPatientRecord(patient.id)}
              className="bg-primary text-white"
            >
              <FileSignature className="w-4 h-4 mr-2" /> Assinar Digitalmente
            </Button>
          )}
        </div>

        <div className="print:bg-white print:text-black print:p-8">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full print:border print:border-black print:bg-transparent">
                  <User className="w-6 h-6 text-primary print:text-black" />
                </div>
                {patient.fullName}
                <Badge variant="outline" className="ml-2 text-xs print:border-black">
                  {patient.status}
                </Badge>
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Prontuário eletrônico completo integrado via HiDoctor.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-primary print:text-black">
                <FileText className="w-4 h-4" /> Dados Pessoais e Contato
              </h3>
              <div className="bg-muted/20 p-4 rounded-lg space-y-3 text-sm border border-border/50 print:bg-transparent print:border-black">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground col-span-1 print:text-black font-medium">
                    Nascimento:
                  </span>
                  <span className="col-span-2 font-medium">
                    {new Date(patient.dob).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground col-span-1 print:text-black font-medium">
                    CPF:
                  </span>
                  <span className="col-span-2 font-medium">{patient.cpf}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground col-span-1 flex items-center gap-1 print:text-black font-medium">
                    <Phone className="w-3 h-3" /> Telefone:
                  </span>
                  <span className="col-span-2 font-medium">{patient.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground col-span-1 flex items-center gap-1 print:text-black font-medium">
                    <MapPin className="w-3 h-3" /> Unidade:
                  </span>
                  <span className="col-span-2 font-medium">{patient.unit}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground col-span-1 flex items-center gap-1 print:text-black font-medium">
                    <Calendar className="w-3 h-3" /> Última Visita:
                  </span>
                  <span className="col-span-2 font-medium">
                    {new Date(patient.lastConsultation).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-primary print:text-black">
                <Activity className="w-4 h-4" /> Anamnese / Histórico
              </h3>
              <div className="p-4 bg-muted/20 rounded-lg border border-border/50 text-sm leading-relaxed min-h-[140px] print:bg-transparent print:border-black">
                {patient.history}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold flex items-center gap-2 text-primary print:text-black">
                <FileText className="w-4 h-4" /> Evolução Clínica (Anotações)
              </h3>
              {!patient.signature && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveNotes}
                  className="print:hidden"
                >
                  <Save className="w-4 h-4 mr-2" /> Salvar Notas
                </Button>
              )}
            </div>

            {patient.signature ? (
              <div className="p-4 bg-muted/10 border rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm print:border-black opacity-80 cursor-not-allowed">
                {patient.clinicalNotes}
              </div>
            ) : (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[150px] p-4 text-sm leading-relaxed shadow-sm print:border-black"
                placeholder="Insira a evolução clínica aqui..."
              />
            )}
          </div>

          {patient.signature && (
            <div className="mt-8 p-4 border-2 border-primary/20 bg-primary/5 rounded-lg flex items-start gap-4 print:border-black print:bg-transparent">
              <div className="p-3 bg-white rounded-full border shadow-sm print:hidden">
                <FileSignature className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-success hover:bg-success text-white print:border print:border-black print:text-black print:bg-transparent"
                  >
                    Documento Assinado Digitalmente
                  </Badge>
                </div>
                <p className="text-sm font-medium pt-1">
                  Responsável: {patient.signature.signedBy} (CRM: 37.525)
                </p>
                <p className="text-xs text-muted-foreground print:text-black">
                  Data/Hora: {new Date(patient.signature.signedAt).toLocaleString('pt-BR')}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground break-all mt-2 bg-muted/50 p-1 rounded print:bg-transparent print:text-black">
                  Hash SHA-256: {patient.signature.hash}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t mt-6 print:border-black">
            <h3 className="font-semibold flex items-center gap-2 text-destructive print:text-black">
              <Shield className="w-4 h-4" /> Alertas / Alergias
            </h3>
            <div className="p-3 border rounded-lg text-sm text-yellow-800 bg-yellow-50 border-yellow-200 font-medium print:border-black print:bg-transparent print:text-black">
              {patient.allergies}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
