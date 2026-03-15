import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Patient } from '@/types/paciente'
import { FileText, Phone, MapPin, Calendar, Activity, Shield, User } from 'lucide-react'

export function PatientDetailsDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            {patient.fullName}
            <Badge variant="outline" className="ml-2 text-xs">
              {patient.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="pt-2">
            Prontuário eletrônico completo integrado via HiDoctor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <FileText className="w-4 h-4" /> Dados Pessoais e Contato
            </h3>
            <div className="bg-muted/20 p-4 rounded-lg space-y-3 text-sm border border-border/50">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground col-span-1">Nascimento:</span>
                <span className="col-span-2 font-medium">
                  {new Date(patient.dob).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground col-span-1">CPF:</span>
                <span className="col-span-2 font-medium">{patient.cpf}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Telefone:
                </span>
                <span className="col-span-2 font-medium">{patient.phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Unidade:
                </span>
                <span className="col-span-2 font-medium">{patient.unit}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Última Visita:
                </span>
                <span className="col-span-2 font-medium">
                  {new Date(patient.lastConsultation).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <Activity className="w-4 h-4" /> Anamnese / Histórico
            </h3>
            <div className="p-4 bg-muted/20 rounded-lg border border-border/50 text-sm leading-relaxed min-h-[140px]">
              {patient.history}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="font-semibold flex items-center gap-2 text-primary">
            <FileText className="w-4 h-4" /> Evolução Clínica (Anotações HiDoctor)
          </h3>
          <div className="p-4 bg-background border rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
            {patient.clinicalNotes}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t mt-4">
          <h3 className="font-semibold flex items-center gap-2 text-destructive">
            <Shield className="w-4 h-4" /> Alertas / Alergias
          </h3>
          <div className="p-3 border rounded-lg text-sm text-yellow-800 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800 font-medium">
            {patient.allergies}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
