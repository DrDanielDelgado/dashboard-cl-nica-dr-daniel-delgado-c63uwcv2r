import { MOCK_TASKS } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/stores/app'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ShieldAlert } from 'lucide-react'

export default function Equipe() {
  const { role } = useAppStore()
  const isManager = ['Gerenciador', 'Administrador', 'Gerente'].includes(role)

  const columns = [
    { id: 'todo', title: 'A Fazer' },
    { id: 'in-progress', title: 'Em Andamento' },
    { id: 'done', title: 'Concluídas' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe & Tarefas</h1>
          <p className="text-muted-foreground">
            Kanban de delegação de tarefas diárias e rotinas da clínica.
          </p>
        </div>
      </div>

      {!isManager && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg flex items-center gap-2 text-sm">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          Seu perfil ({role}) permite visualizar as tarefas. Apenas os Gestores podem alterar
          permissões amplas da equipe.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 items-start mt-6">
        {columns.map((col) => (
          <div key={col.id} className="bg-muted/40 rounded-xl p-4 border flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {col.title}
            </h3>
            {MOCK_TASKS.filter((t) => t.status === col.id).map((task) => (
              <Card key={task.id} className="cursor-grab hover:border-primary/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <p className="font-medium text-sm leading-snug">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {task.assignee.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {MOCK_TASKS.filter((t) => t.status === col.id).length === 0 && (
              <div className="text-center p-4 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                Nenhuma tarefa
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
