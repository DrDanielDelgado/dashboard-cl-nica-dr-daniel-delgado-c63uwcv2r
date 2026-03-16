import { useState, useEffect } from 'react'
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
import { Plus, Edit2, Trash2, Mail, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { UserFormDialog } from './UserFormDialog'
import { InviteUserDialog } from './InviteUserDialog'
import { User } from '@/types/user'

const loadUsers = (): User[] => {
  try {
    const stored = localStorage.getItem('@db_users')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function UsersSettings() {
  const [users, setUsers] = useState<User[]>(loadUsers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem('@db_users', JSON.stringify(users))
  }, [users])

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
    toast({
      title: 'Usuário excluído',
      description: 'O acesso do usuário foi revogado com sucesso da base de dados.',
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

  const handleInvite = (user: Omit<User, 'id' | 'status'>) => {
    setUsers([
      ...users,
      { ...user, id: Math.random().toString(36).substring(7), status: 'pending' },
    ])
    setInviteOpen(false)
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
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setInviteOpen(true)}>
            <Mail className="w-4 h-4 mr-2" /> Convidar Usuário
          </Button>
          <Button
            onClick={() => {
              setEditingUser(undefined)
              setDialogOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Manualmente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed rounded-xl bg-muted/10">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Nenhum usuário cadastrado
            </h3>
            <p className="max-w-sm mx-auto mb-6 text-muted-foreground">
              A lista de usuários está vazia. Adicione o primeiro membro da equipe ou envie um
              convite.
            </p>
            <Button onClick={() => setDialogOpen(true)}>Cadastrar Novo Usuário</Button>
          </div>
        ) : (
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
                      variant={
                        user.status === 'active'
                          ? 'default'
                          : user.status === 'pending'
                            ? 'outline'
                            : 'secondary'
                      }
                      className={
                        user.status === 'active'
                          ? 'bg-success/10 text-success hover:bg-success/20 border-success/20'
                          : user.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : ''
                      }
                    >
                      {user.status === 'active'
                        ? 'Ativo'
                        : user.status === 'pending'
                          ? 'Pendente'
                          : 'Inativo'}
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
            </TableBody>
          </Table>
        )}
      </CardContent>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSave={handleSave}
      />

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />
    </Card>
  )
}
