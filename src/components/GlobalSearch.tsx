import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, CreditCard, Activity, User, BriefcaseMedical } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { getPatients, getAppointments } from '@/services/api'

export function GlobalSearch({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const navigate = useNavigate()
  const [patients, setPatients] = React.useState<any[]>([])
  const [appointments, setAppointments] = React.useState<any[]>([])

  React.useEffect(() => {
    if (open) {
      getPatients()
        .then(setPatients)
        .catch(() => {})
      getAppointments()
        .then(setAppointments)
        .catch(() => {})
    }
  }, [open])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [setOpen],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar pacientes, consultas, orçamentos (Ex: Carlos)..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado no sistema.</CommandEmpty>
        <CommandGroup heading="Acesso Rápido - Módulos">
          <CommandItem onSelect={() => runCommand(() => navigate('/crm'))}>
            <Users className="mr-2 h-4 w-4 text-brand-blue" />
            <span className="font-medium">Pipeline Clínico (CRM)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/agenda'))}>
            <Calendar className="mr-2 h-4 w-4 text-brand-blue" />
            <span className="font-medium">Agenda & Consultas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/financeiro'))}>
            <CreditCard className="mr-2 h-4 w-4 text-brand-blue" />
            <span className="font-medium">Faturamento & Transações</span>
          </CommandItem>
        </CommandGroup>

        {patients.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pacientes">
              {patients.slice(0, 5).map((p) => (
                <CommandItem key={p.id} onSelect={() => runCommand(() => navigate('/prontuario'))}>
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {p.name} {p.cpf ? `- ${p.cpf}` : ''}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {appointments.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Próximas Consultas">
              {appointments
                .filter((a) => new Date(a.start) >= new Date())
                .slice(0, 5)
                .map((a) => (
                  <CommandItem key={a.id} onSelect={() => runCommand(() => navigate('/agenda'))}>
                    <BriefcaseMedical className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>
                      {new Date(a.start).toLocaleDateString('pt-BR')} - {a.title || a.type} (
                      {a.expand?.patient?.name || 'Sem Paciente'})
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
