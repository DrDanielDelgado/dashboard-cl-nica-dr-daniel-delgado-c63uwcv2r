import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { UserFormDialog } from './UserFormDialog'
import { User } from '@/types/user'

const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Dr. Daniel Delgado',
    email: 'daniel@clinicaintegrada.com.br',
    role: 'Administrador',
    status: 'active',
    permissions: { dashboard: true, records: true, appointments: true, sync: true, settings: true },
  },
  {
    id: '2',
    name: 'Ana Silva',
    email: 'ana@clinicaintegrada.com.br',
    role: 'Gerente',
    status: 'active',
    permissions: { dashboard: true, records: true, appointments: true, sync: true, settings: true },
  },
  {
    id: '3',
    name: 'Carlos Médico',
    email: 'carlos@clinicaintegrada.com.br',
    role: 'Médico',
    status: 'inactive',
    permissions: {
      dashboard: true,
      records: true,
      appointments: false,
      sync: false,
      settings: false,
    },
  },
]

export function UsersSettings() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const { toast } = useToast()

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
    toast({
      title: 'Usuário excluído',
      description: 'O acesso do usuário foi revogado com sucesso.',
    })
  }

  const handleSave = (user: User) => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === user.id ? user : u)))
      toast({
        title: 'Usuário atualizado',
        description: 'As informações e permissões foram salvas.',
      })
    } else {
      setUsers([...users, { ...user, id: Math.random().toString(36).substring(7) }])
      toast({ title: 'Usuário criado', description: 'O novo membro da equipe foi registrado.' })
    }
    setDialogOpen(false)
    setEditingUser(undefined)
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Gestão de Usuários e Permissões</CardTitle>
          <CardDescription>
            Administre os membros da equipe e seus acessos às ferramentas da clínica.
          </CardDescription>
        </div>
        <Button
          onClick={() => {
            setEditingUser(undefined)
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar Usuário
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Função/Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === 'active' ? 'default' : 'secondary'}
                    className={
                      user.status === 'active'
                        ? 'bg-success/10 text-success hover:bg-success/20 border-success/20'
                        : ''
                    }
                  >
                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingUser(user)
                        setDialogOpen(true)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSave={handleSave}
      />
    </Card>
  )
}
