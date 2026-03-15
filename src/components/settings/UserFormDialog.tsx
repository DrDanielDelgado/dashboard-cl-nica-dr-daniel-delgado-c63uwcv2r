import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Switch } from '@/components/ui/switch'
import { User, UserPermissions } from '@/types/user'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
  onSave: (user: User) => void
}

const DEFAULT_PERMS: UserPermissions = {
  dashboard: false,
  records: false,
  appointments: false,
  sync: false,
  settings: false,
}

export function UserFormDialog({ open, onOpenChange, user, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<User>>({
    status: 'active',
    permissions: DEFAULT_PERMS,
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setFormData(
        user
          ? { ...user }
          : { name: '', email: '', role: '', status: 'active', permissions: DEFAULT_PERMS },
      )
    }
  }, [open, user])

  const handleChange = (field: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePermChange = (field: keyof UserPermissions, value: boolean) => {
    setFormData((prev) => ({ ...prev, permissions: { ...prev.permissions!, [field]: value } }))
  }

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha nome, e-mail e cargo.',
      })
      return
    }
    onSave(formData as User)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{user ? 'Editar Usuário' : 'Adicionar Usuário'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Dados Básicos
              </h4>
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input
                  placeholder="Ex: Dr. João Silva"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="joao@clinica.com.br"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              {!user && (
                <div className="grid gap-2">
                  <Label>Senha</Label>
                  <Input type="password" placeholder="Defina uma senha provisória..." />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Cargo</Label>
                  <Select
                    value={formData.role || ''}
                    onValueChange={(v) => handleChange('role', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Médico">Médico</SelectItem>
                      <SelectItem value="Secretária">Secretária</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status || 'active'}
                    onValueChange={(v) => handleChange('status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Níveis de Acesso
              </h4>
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label className="font-normal cursor-pointer">
                    Visualização do Dashboard (Overview)
                  </Label>
                  <Switch
                    checked={formData.permissions?.dashboard}
                    onCheckedChange={(v) => handlePermChange('dashboard', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal cursor-pointer">
                    Acesso aos Prontuários (Patient Records)
                  </Label>
                  <Switch
                    checked={formData.permissions?.records}
                    onCheckedChange={(v) => handlePermChange('records', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal cursor-pointer">
                    Gerenciamento de Agendamentos
                  </Label>
                  <Switch
                    checked={formData.permissions?.appointments}
                    onCheckedChange={(v) => handlePermChange('appointments', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal cursor-pointer">Sincronização HiNetX/Centrax</Label>
                  <Switch
                    checked={formData.permissions?.sync}
                    onCheckedChange={(v) => handlePermChange('sync', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal cursor-pointer">Configurações do Sistema</Label>
                  <Switch
                    checked={formData.permissions?.settings}
                    onCheckedChange={(v) => handlePermChange('settings', v)}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>{user ? 'Salvar Alterações' : 'Criar Usuário'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
