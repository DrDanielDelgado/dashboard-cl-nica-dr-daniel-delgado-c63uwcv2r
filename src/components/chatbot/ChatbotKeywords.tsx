import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const MOCK_KEYWORDS = [
  {
    id: 1,
    keyword: 'agendamento, marcar, consulta',
    response: 'Fluxo: Iniciar Triagem de Agendamento',
    type: 'flow',
  },
  {
    id: 2,
    keyword: 'endereço, local, onde fica',
    response: 'Nossas unidades estão localizadas em Juiz de Fora, Leopoldina e Além Paraíba...',
    type: 'text',
  },
  {
    id: 3,
    keyword: 'preço, valor, convênio, plano',
    response: 'Aceitamos diversos convênios. Para valores particulares, por favor...',
    type: 'text',
  },
  {
    id: 4,
    keyword: 'humano, atendente, falar com pessoa',
    response: 'Fluxo: Transferir para Atendimento Humano',
    type: 'action',
  },
]

export function ChatbotKeywords() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Gatilhos e Palavras-chave</CardTitle>
          <CardDescription>
            Defina como o bot deve responder a palavras específicas digitadas pelos pacientes.
          </CardDescription>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Novo Gatilho
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Palavras-chave (separadas por vírgula)</TableHead>
              <TableHead>Resposta / Ação</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_KEYWORDS.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-primary">{item.keyword}</TableCell>
                <TableCell className="text-muted-foreground">{item.response}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.type === 'flow'
                        ? 'default'
                        : item.type === 'action'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {item.type === 'flow' ? 'Fluxo' : item.type === 'action' ? 'Ação' : 'Texto'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
