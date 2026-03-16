import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, AlertCircle, Package } from 'lucide-react'
import { MOCK_INVENTORY } from '@/lib/mock-data'
import { useAppStore } from '@/stores/app'

export default function Estoque() {
  const { location } = useAppStore()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return (
          <Badge
            variant="destructive"
            className="flex w-max items-center gap-1 bg-brand-red text-white px-2.5 py-1"
          >
            <AlertCircle className="w-3.5 h-3.5" /> Crítico
          </Badge>
        )
      case 'warning':
        return (
          <Badge
            variant="outline"
            className="flex w-max items-center gap-1 bg-amber-100 text-amber-800 border-amber-300 px-2.5 py-1"
          >
            <AlertCircle className="w-3.5 h-3.5" /> Atenção
          </Badge>
        )
      default:
        return (
          <Badge
            variant="secondary"
            className="flex w-max items-center gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2.5 py-1"
          >
            Normal
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue flex items-center gap-3">
            <Package className="h-8 w-8 text-brand-red" />
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerenciando insumos médicos para a unidade{' '}
            <strong className="text-brand-blue">{location}</strong>.
          </p>
        </div>
        <Button className="w-full sm:w-auto bg-brand-red hover:bg-brand-red/90 text-white shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Nova Entrada
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="py-4 border-b bg-slate-50/50">
          <div className="flex items-center max-w-sm relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-blue/50" />
            <Input
              placeholder="Buscar produto ou lote..."
              className="pl-10 bg-white border-slate-200 focus-visible:ring-brand-blue/30 shadow-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-slate-200">
                <TableHead className="font-semibold text-brand-blue">Produto</TableHead>
                <TableHead className="font-semibold text-brand-blue">Lote</TableHead>
                <TableHead className="text-right font-semibold text-brand-blue">
                  Quantidade
                </TableHead>
                <TableHead className="font-semibold text-brand-blue">Validade</TableHead>
                <TableHead className="font-semibold text-brand-blue">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INVENTORY.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-bold text-slate-800">{item.name}</TableCell>
                  <TableCell className="text-slate-500 font-medium">{item.batch}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-black text-lg text-brand-blue">{item.qty}</span>
                  </TableCell>
                  <TableCell className="font-medium text-slate-600">
                    {new Date(item.expiry).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
