import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, CreditCard, Activity } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

export function GlobalSearch({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const navigate = useNavigate()

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
        <CommandGroup heading="Acesso Rápido - Módulos CRM">
          <CommandItem onSelect={() => runCommand(() => navigate('/crm'))}>
            <Users className="mr-2 h-4 w-4 text-brand-blue" />
            <span className="font-medium">Pipeline Clínico</span>
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
        <CommandSeparator />
        <CommandGroup heading="Pacientes Recentes (HiDoctor Sync)">
          <CommandItem onSelect={() => runCommand(() => navigate('/prontuario'))}>
            <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Carlos Alberto - Tratamento a Laser</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/prontuario'))}>
            <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Fernanda Lima - Pós-Operatório</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
