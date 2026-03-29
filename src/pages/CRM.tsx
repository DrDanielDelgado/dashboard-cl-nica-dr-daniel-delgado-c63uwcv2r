import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Phone, Search, Calendar, MoreHorizontal, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'

type Lead = {
  id: string
  name: string
  treatment: string
  phone: string
  lastContact: string
  nextAppt: string
  status: string
  value: number
}

const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Ana Silva',
    treatment: 'Escleroterapia',
    phone: '(32) 99999-1111',
    lastContact: 'Hoje',
    nextAppt: '15/04/2026',
    status: 'first_consult',
    value: 350,
  },
  {
    id: '2',
    name: 'Carlos Santos',
    treatment: 'Laser Transdérmico',
    phone: '(32) 98888-2222',
    lastContact: 'Ontem',
    nextAppt: 'Agendar',
    status: 'pre_op',
    value: 1200,
  },
  {
    id: '3',
    name: 'Marcos Paulo',
    treatment: 'Cirurgia Varizes',
    phone: '(32) 97777-3333',
    lastContact: 'Há 2 dias',
    nextAppt: '20/04/2026',
    status: 'post_op',
    value: 4500,
  },
  {
    id: '4',
    name: 'Juliana Costa',
    treatment: 'Consulta Retorno',
    phone: '(32) 96666-4444',
    lastContact: 'Há 1 sem',
    nextAppt: '10/05/2026',
    status: 'recovery',
    value: 0,
  },
  {
    id: '5',
    name: 'Roberto Almeida',
    treatment: 'Avaliação Doppler',
    phone: '(32) 95555-5555',
    lastContact: 'Hoje',
    nextAppt: '18/04/2026',
    status: 'first_consult',
    value: 450,
  },
]

const PIPELINE_COLUMNS = [
  { id: 'first_consult', title: '1ª Consulta', color: 'border-l-blue-500' },
  { id: 'pre_op', title: 'Pré-Operatório / Orçamento', color: 'border-l-yellow-500' },
  { id: 'post_op', title: 'Pós-Operatório', color: 'border-l-orange-500' },
  { id: 'recovery', title: 'Acompanhamento / Alta', color: 'border-l-emerald-500' },
]

export default function CRM() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS)
  const [search, setSearch] = useState('')

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    const lead = leads.find((l) => l.id === leadId)

    if (lead && lead.status !== statusId) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: statusId } : l)))
      toast({
        title: 'Pipeline Atualizado',
        description: `${lead.name} movido para ${PIPELINE_COLUMNS.find((c) => c.id === statusId)?.title}.`,
      })
    }
  }

  const filteredLeads = leads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Pipeline Clínico (Kanban)
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o funil de tratamentos, arraste os cards para atualizar as fases dos
            pacientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente no funil..."
              className="pl-9 bg-white border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm">
            Novo Paciente
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((col) => {
          const colLeads = filteredLeads.filter((l) => l.status === col.id)
          const colValue = colLeads.reduce((acc, l) => acc + l.value, 0)

          return (
            <div
              key={col.id}
              className="min-w-[320px] w-[320px] flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 p-4 shadow-sm"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-4 rounded-full border-l-4 ${col.color}`} />
                  <h3 className="font-semibold text-sm text-slate-700">{col.title}</h3>
                </div>
                <Badge variant="secondary" className="bg-white border text-slate-600">
                  {colLeads.length}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground mb-4 px-1 font-medium">
                Volume projetado: R${' '}
                {colValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 pb-4">
                {colLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="cursor-grab active:cursor-grabbing hover:border-brand-blue/40 hover:shadow-md transition-all duration-200 bg-white border-slate-200"
                  >
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
                            <AvatarImage
                              src={`https://img.usecurling.com/ppl/thumbnail?seed=${lead.id}`}
                            />
                            <AvatarFallback className="bg-brand-blue/10 text-brand-blue text-xs font-bold">
                              {lead.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold text-sm text-slate-800 block leading-tight">
                              {lead.name}
                            </span>
                            <span className="text-xs text-brand-blue font-medium mt-0.5 block">
                              {lead.treatment}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mt-1 -mr-2 text-slate-400 hover:text-brand-blue"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate" title={`Contato: ${lead.lastContact}`}>
                            {lead.lastContact}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate font-medium">{lead.nextAppt}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {lead.phone}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-1.5" /> Falar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {colLeads.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">
                    Solte os pacientes aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
