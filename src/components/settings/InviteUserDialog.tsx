import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Mail } from 'lucide-react'
import { User } from '@/types/user'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (user: Omit<User, 'id' | 'status'>) => void
}

export function InviteUserDialog({ open, onOpenChange, onInvite }: Props) {
  const [formData, setFormData] = useState({ name: '', email: '', role: '' })
  const { toast } = useToast()

  const handleInvite = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha nome, e-mail e cargo.',
      })
      return
    }

    toast({
      title: 'Convite Enviado',
      description: `Um e-mail de configuração foi enviado para ${formData.email}.`,
    })

    onInvite({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: {
        dashboard: true,
        records: false,
        appointments: true,
        sync: false,
        settings: false,
      },
    })

    setFormData({ name: '', email: '', role: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Novo Usuário</DialogTitle>
          <DialogDescription>
            Envie um convite por e-mail. O usuário receberá um link seguro para definir sua senha e
            ativar o acesso.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input
              placeholder="Ex: Maria Secretária"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              placeholder="maria@clinica.com.br"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cargo / Perfil</Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cargo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Médico">Médico</SelectItem>
                <SelectItem value="Secretária">Secretária</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Gerente">Gerente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleInvite}>
            <Mail className="w-4 h-4 mr-2" /> Enviar Convite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
