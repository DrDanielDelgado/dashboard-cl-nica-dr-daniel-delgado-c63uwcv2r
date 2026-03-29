import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Patient } from '@/types/paciente'
import { useHiDoctorStore } from '@/stores/hidoctor'
import {
  FileText,
  Phone,
  Calendar,
  Activity,
  Shield,
  User,
  FileSignature,
  Save,
  MessageCircle,
  CreditCard,
  Download,
  Clock,
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-50/50 p-0 sm:rounded-xl border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-blue/10 rounded-full border border-brand-blue/20">
              <User className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <DialogTitle className="text-2xl text-slate-900 flex items-center gap-3">
                {patient.fullName}
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold uppercase tracking-wider"
                >
                  {patient.status}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {patient.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Nasc:{' '}
                  {new Date(patient.dob).toLocaleDateString('pt-BR')}
                </span>
              </DialogDescription>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 bg-white border shadow-sm">
              <TabsTrigger value="overview">Visão 360°</TabsTrigger>
              <TabsTrigger value="timeline">Feed de Atividades</TabsTrigger>
              <TabsTrigger value="documents">Documentos & Assinaturas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 animate-fade-in">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="font-semibold flex items-center gap-2 text-slate-800">
                        <Activity className="w-4 h-4 text-brand-blue" /> Evolução Clínica (CRM)
                      </h3>
                      {!patient.signature && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveNotes}
                          className="h-8 text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10"
                        >
                          <Save className="w-4 h-4 mr-2" /> Salvar Notas
                        </Button>
                      )}
                    </div>
                    {patient.signature ? (
                      <div className="p-4 bg-slate-50 border rounded-lg text-sm leading-relaxed whitespace-pre-wrap text-slate-700 font-medium opacity-80">
                        {patient.clinicalNotes}
                      </div>
                    ) : (
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[220px] p-4 text-sm leading-relaxed border-slate-200 focus-visible:ring-brand-blue/30 bg-slate-50/50"
                        placeholder="Registre aqui as anotações clínicas, propostas de tratamento e evolução..."
                      />
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-slate-800 border-b pb-3">
                      <FileText className="w-4 h-4 text-brand-blue" /> Histórico Base (HiDoctor)
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-lg border text-sm leading-relaxed text-slate-600">
                      {patient.history}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-3">
                      Ficha do Paciente
                    </h3>
                    <div className="space-y-3.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">CPF</span>
                        <span className="font-medium text-slate-800">{patient.cpf}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Unidade</span>
                        <Badge variant="secondary" className="font-medium">
                          {patient.unit}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Última Visita</span>
                        <span className="font-medium text-slate-800">
                          {new Date(patient.lastConsultation).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50/80 p-5 rounded-xl border border-red-100 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-red-800">
                      <Shield className="w-4 h-4" /> Alergias / Alertas
                    </h3>
                    <div className="text-sm font-medium text-red-700 bg-white/50 p-3 rounded border border-red-100">
                      {patient.allergies}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="timeline"
              className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-4">
                Feed de Interações (Timeline)
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent pt-4">
                {/* Timeline Item 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-blue text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm hover:border-brand-blue/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-slate-800">
                        Consulta de Avaliação Realizada
                      </h4>
                      <time className="text-xs font-mono text-muted-foreground">Ontem, 14:30</time>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Paciente compareceu para consulta de avaliação. Evolução salva no prontuário
                      via sistema CRM.
                    </p>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-slate-800">
                        Lembrete Automático (WhatsApp)
                      </h4>
                      <time className="text-xs font-mono text-muted-foreground">Há 2 dias</time>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Mensagem de confirmação de consulta enviada pelo robô e marcada como LIDA.
                    </p>
                  </div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-amber-500 text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm hover:border-amber-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-slate-800">
                        Orçamento Aprovado e Faturado
                      </h4>
                      <time className="text-xs font-mono text-muted-foreground">10 Fev 2026</time>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Orçamento de Escleroterapia no valor de R$ 350,00 aprovado pela paciente e
                      pago via PIX/Pagar.me.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Gerenciador de Documentos
                  </h3>
                  {!patient.signature && (
                    <Button
                      onClick={() => signPatientRecord(patient.id)}
                      className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm"
                    >
                      <FileSignature className="w-4 h-4 mr-2" /> Assinar Digitalmente
                    </Button>
                  )}
                </div>

                {patient.signature && (
                  <div className="p-5 border-2 border-brand-blue/20 bg-brand-blue/5 rounded-xl flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm">
                    <div className="p-3 bg-white rounded-full border shadow-sm self-start">
                      <FileSignature className="w-8 h-8 text-brand-blue" />
                    </div>
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge
                          variant="default"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                        >
                          Prontuário Assinado Digitalmente
                        </Badge>
                        <Button variant="outline" size="sm" className="bg-white">
                          <Download className="w-3.5 h-3.5 mr-2" /> Baixar Certificado
                        </Button>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        Responsável Legal: Dr. Daniel Delgado (CRM: 37.525)
                      </p>
                      <p className="text-xs flex items-center font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5 mr-1.5" /> Carimbo de Tempo:{' '}
                        {new Date(patient.signature.signedAt).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 break-all bg-white p-2 rounded border border-slate-200 shadow-sm mt-2">
                        <span className="font-semibold">Hash SHA-256:</span>{' '}
                        {patient.signature.hash}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border rounded-xl flex items-center justify-between hover:border-brand-blue/50 hover:shadow-md cursor-pointer transition-all group bg-slate-50/50">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm border group-hover:border-brand-blue/30 group-hover:text-brand-blue transition-colors">
                        <FileText className="w-5 h-5 text-slate-500 group-hover:text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Receita_Retorno.pdf</p>
                        <p className="text-xs text-slate-500 font-medium">12 Fev 2026 • 24 KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:bg-brand-blue/10">
                      <Download className="w-4 h-4 text-slate-500 group-hover:text-brand-blue" />
                    </Button>
                  </div>
                  <div className="p-4 border rounded-xl flex items-center justify-between hover:border-brand-blue/50 hover:shadow-md cursor-pointer transition-all group bg-slate-50/50">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm border group-hover:border-brand-blue/30 group-hover:text-brand-blue transition-colors">
                        <FileText className="w-5 h-5 text-slate-500 group-hover:text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Laudo_Doppler_MMII.pdf
                        </p>
                        <p className="text-xs text-slate-500 font-medium">10 Fev 2026 • 1.2 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:bg-brand-blue/10">
                      <Download className="w-4 h-4 text-slate-500 group-hover:text-brand-blue" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
