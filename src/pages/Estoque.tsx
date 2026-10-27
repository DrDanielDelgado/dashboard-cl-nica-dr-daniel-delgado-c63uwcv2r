import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Plus,
  AlertCircle,
  Package,
  Camera,
  Loader2,
  ArrowDownCircle,
  ArrowUpCircle,
  ScanLine,
  Check,
} from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getInventory,
  getMovements,
  createInventoryItem,
  registerMovement,
  runOcr,
  parseLabel,
  aiText,
  type InventoryItem,
  type StockMovement,
} from '@/services/inventory'
import { searchCatalog, findByEan, getCatalogCount, type CatalogItem } from '@/services/catalog'

const fmtBRL = (v?: number) =>
  (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Datas de validade são datas puras: exibir sem converter fuso (evita 1 dia a menos). */
const fmtDate = (v?: string) => {
  if (!v) return '—'
  const m = String(v).match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return '—'
  return `${m[3]}/${m[2]}/${m[1]}`
}

/** Grava a data como data pura (meio-dia UTC) para não deslocar o dia. */
const toDateField = (v?: string) => {
  if (!v) return ''
  const m = String(v).match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return v
  return `${m[1]}-${m[2]}-${m[3]} 12:00:00.000Z`
}

const statusOf = (item: InventoryItem) => {
  const qty = Number(item.current_qty) || 0
  const min = Number(item.min_qty) || 0
  if (min > 0 && qty <= min) return 'critical'
  if (min > 0 && qty <= min * 1.5) return 'warning'
  return 'normal'
}

export default function Estoque() {
  const { location } = useAppStore()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // diálogo de movimentação
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveItem, setMoveItem] = useState<InventoryItem | null>(null)
  const [moveType, setMoveType] = useState<'entrada' | 'saida'>('entrada')
  const [moveQty, setMoveQty] = useState('1')
  const [moveCost, setMoveCost] = useState('')
  const [moveSupplier, setMoveSupplier] = useState('')
  const [moveExpense, setMoveExpense] = useState(true)
  const [saving, setSaving] = useState(false)

  // diálogo de novo item
  const [newOpen, setNewOpen] = useState(false)
  const [form, setForm] = useState<any>({ category: 'Medicamento', unit: 'un' })

  // OCR
  const [scanOpen, setScanOpen] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrBusy, setOcrBusy] = useState(false)
  const [parsed, setParsed] = useState<any>(null)
  const [preview, setPreview] = useState<string>('')
  const [aiResult, setAiResult] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiMode, setAiMode] = useState<'translate' | 'explain' | 'structured'>('translate')

  // catálogo de referência (CMED/ANVISA)
  const [catTerm, setCatTerm] = useState('')
  const [catResults, setCatResults] = useState<CatalogItem[]>([])
  const [catBusy, setCatBusy] = useState(false)
  const [catTotal, setCatTotal] = useState(0)

  // fontes de dados do catálogo (CMED ativa; ANVISA/Brasíndice para o futuro)
  const [sources, setSources] = useState<CatalogSource[]>([])
  const [srcOpen, setSrcOpen] = useState(false)
  const [srcForm, setSrcForm] = useState<any>({ kind: 'ANVISA', active: true })

  const loadSources = () =>
    getCatalogSources()
      .then(setSources)
      .catch(() => setSources([]))

  useEffect(() => {
    loadSources()
  }, [])

  const saveSource = async () => {
    if (!srcForm.name?.trim()) return
    setSaving(true)
    try {
      if (srcForm.id) await updateCatalogSource(srcForm.id, srcForm)
      else await createCatalogSource(srcForm)
      setSrcOpen(false)
      setSrcForm({ kind: 'ANVISA', active: true })
      loadSources()
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    getCatalogCount()
      .then(setCatTotal)
      .catch(() => setCatTotal(0))
  }, [])

  const runCatalogSearch = async (term: string) => {
    setCatBusy(true)
    try {
      setCatResults((await searchCatalog(term, 30)) as CatalogItem[])
    } catch (e) {
      console.error(e)
      setCatResults([])
    } finally {
      setCatBusy(false)
    }
  }

  /** Preenche o formulário com um item do catálogo oficial. */
  const applyCatalogItem = (c: CatalogItem) => {
    const name = [c.name, c.presentation].filter(Boolean).join(' — ')
    setForm((prev: any) => ({
      ...prev,
      name: c.name || prev.name,
      presentation: c.presentation || '',
      substance: c.substance || '',
      ean: c.ean || '',
      supplier: c.laboratory || prev.supplier,
      unit_cost: c.pmc ? String(c.pmc) : prev.unit_cost,
      catalog_item: c.id,
    }))
    setNewOpen(true)
  }
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const [it, mv] = await Promise.all([getInventory(), getMovements()])
      setItems(it as unknown as InventoryItem[])
      setMovements(mv as unknown as StockMovement[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('inventory_items', () => load())
  useRealtime('stock_movements', () => load())

  const filtered = items.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.batch?.toLowerCase().includes(search.toLowerCase()),
  )

  const openMove = (item: InventoryItem, type: 'entrada' | 'saida') => {
    setMoveItem(item)
    setMoveType(type)
    setMoveQty('1')
    setMoveCost(item.unit_cost ? String(item.unit_cost) : '')
    setMoveSupplier(item.supplier || '')
    setMoveExpense(type === 'entrada')
    setMoveOpen(true)
  }

  const handleSaveMove = async () => {
    if (!moveItem) return
    setSaving(true)
    try {
      await registerMovement({
        itemId: moveItem.id,
        type: moveType,
        qty: Number(moveQty) || 0,
        unitCost: moveType === 'entrada' ? Number(moveCost) || 0 : undefined,
        supplier: moveSupplier,
        createExpense: moveType === 'entrada' && moveExpense,
        source: 'manual',
      })
      setMoveOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleScanFile = async (file: File) => {
    setOcrBusy(true)
    setOcrProgress(0)
    setOcrText('')
    setParsed(null)
    try {
      const url = URL.createObjectURL(file)
      setPreview(url)
      const text = await runOcr(file, setOcrProgress)
      setOcrText(text)

      const p = parseLabel(text)
      setParsed(p)

      // Se o OCR capturou um EAN, tenta casar com a biblioteca oficial
      const eanMatch = text.replace(/[\s.-]/g, '').match(/\b(7\d{12}|789\d{10})\b/)
      if (eanMatch) {
        const hit = await findByEan(eanMatch[1])
        if (hit) {
          setParsed({
            ...p,
            name: hit.name || p.name,
            batch: p.batch,
            catalogMatch: hit,
          })
        }
      }
    } catch (e: any) {
      setOcrText('Falha ao ler a imagem: ' + (e?.message || e))
    } finally {
      setOcrBusy(false)
    }
  }

  const handleCreateFromScan = () => {
    if (!parsed) return
    const hit = parsed.catalogMatch
    setForm({
      name: hit?.name || parsed.name || '',
      presentation: hit?.presentation || '',
      substance: hit?.substance || '',
      ean: hit?.ean || '',
      catalog_item: hit?.id || '',
      supplier: hit?.laboratory || '',
      unit_cost: hit?.pmc ? String(hit.pmc) : '',
      batch: parsed.batch || '',
      expiry: parsed.expiry || '',
      category: 'Medicamento',
      unit: 'un',
      current_qty: parsed.qty || 0,
      min_qty: 0,
    })
    setScanOpen(false)
    setNewOpen(true)
  }

  const handleCreateItem = async () => {
    if (!form.name?.trim()) return
    setSaving(true)
    try {
      await createInventoryItem({
        name: form.name,
        category: form.category,
        unit: form.unit,
        batch: form.batch || '',
        expiry: toDateField(form.expiry),
        current_qty: Number(form.current_qty) || 0,
        min_qty: Number(form.min_qty) || 0,
        unit_cost: Number(form.unit_cost) || 0,
        supplier: form.supplier || '',
        location: form.location || location,
        ...(form.catalog_item ? { catalog_item: form.catalog_item } : {}),
        ...(form.ean ? { ean: form.ean } : {}),
        ...(form.substance ? { substance: form.substance } : {}),
      } as any)
      setNewOpen(false)
      setForm({ category: 'Medicamento', unit: 'un' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (item: InventoryItem) => {
    switch (statusOf(item)) {
      case 'critical':
        return (
          <Badge variant="destructive" className="flex w-max items-center gap-1 px-2.5 py-1">
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
            className="flex w-max items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1"
          >
            Normal
          </Badge>
        )
    }
  }

  const totalValue = items.reduce(
    (acc, i) => acc + (Number(i.current_qty) || 0) * (Number(i.unit_cost) || 0),
    0,
  )
  const criticalCount = items.filter((i) => statusOf(i) === 'critical').length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue flex items-center gap-3">
            <Package className="h-8 w-8 text-brand-red" />
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground mt-1">
            Unidade <strong className="text-brand-blue">{location}</strong> · {items.length} itens ·
            valor em estoque {fmtBRL(totalValue)}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => {
              setScanOpen(true)
              setOcrText('')
              setParsed(null)
              setPreview('')
            }}
            className="flex-1 sm:flex-none border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5"
          >
            <ScanLine className="mr-2 h-4 w-4" /> Ler foto do produto
          </Button>
          <Button
            onClick={() => setNewOpen(true)}
            className="flex-1 sm:flex-none bg-brand-red hover:bg-brand-red/90 text-white shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Item
          </Button>
        </div>
      </div>

      {criticalCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-slate-700">
          <AlertCircle className="h-4 w-4 text-brand-red" />
          <span>
            <strong>{criticalCount}</strong> {criticalCount === 1 ? 'item' : 'itens'} no nível
            mínimo ou abaixo. Registre uma entrada para repor.
          </span>
        </div>
      )}

      <Tabs defaultValue="itens">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="mov">Movimentações</TabsTrigger>
          <TabsTrigger value="catalogo">
            Biblioteca ({catTotal.toLocaleString('pt-BR')})
          </TabsTrigger>
          <TabsTrigger value="fontes">Fontes de dados</TabsTrigger>
        </TabsList>

        <TabsContent value="fontes" className="mt-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 py-4">
              <div>
                <CardTitle className="text-base text-brand-blue">
                  Fontes de dados vinculadas
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Cada fonte é uma tabela de referência que alimenta a biblioteca do estoque. CMED
                  (ANVISA) é pública e atualizada mensalmente. Brasíndice é comercial (assinatura):
                  usa-se o arquivo TXT/CSV exportado pela sua conta.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setSrcForm({ kind: 'ANVISA', active: true })
                  setSrcOpen(true)
                }}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" /> Nova fonte
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-brand-blue">Fonte</TableHead>
                    <TableHead className="font-semibold text-brand-blue">Tipo</TableHead>
                    <TableHead className="font-semibold text-brand-blue">Edição</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">
                      Registros
                    </TableHead>
                    <TableHead className="font-semibold text-brand-blue">Status</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Nenhuma fonte cadastrada. Adicione CMED, ANVISA ou Brasíndice.
                      </TableCell>
                    </TableRow>
                  )}
                  {sources.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-bold text-slate-800">{s.name}</div>
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-blue underline break-all"
                          >
                            {s.url.slice(0, 60)}
                          </a>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">
                          {s.kind}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{s.edition || '—'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {(s.record_count || 0).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            s.active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }
                        >
                          {s.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSrcForm(s)
                              setSrcOpen(true)
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-brand-red hover:bg-brand-red/5"
                            onClick={async () => {
                              await deleteCatalogSource(s.id)
                              loadSources()
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalogo" className="mt-4">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="py-4 border-b bg-slate-50/50">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-brand-blue/60" />
                  <span className="text-sm font-semibold text-brand-blue">
                    Biblioteca de produtos médicos
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-brand-blue/5 text-brand-blue">
                    Fonte oficial CMED/ANVISA
                  </Badge>
                </div>
                <form
                  className="max-w-lg relative"
                  onSubmit={(e) => {
                    e.preventDefault()
                    runCatalogSearch(catTerm)
                  }}
                >
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-blue/50" />
                  <Input
                    placeholder="Nome comercial, princípio ativo, laboratório ou EAN..."
                    value={catTerm}
                    onChange={(e) => setCatTerm(e.target.value)}
                    className="pl-10 bg-white border-slate-200"
                  />
                </form>
                <p className="text-xs text-muted-foreground">
                  Preços de referência (PF/PMC) da lista oficial. Clique em um produto para
                  cadastrá-lo no estoque já preenchido.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-brand-blue">Produto</TableHead>
                    <TableHead className="font-semibold text-brand-blue">Princípio ativo</TableHead>
                    <TableHead className="font-semibold text-brand-blue">Laboratório</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">PMC</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catBusy && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Buscando na
                        biblioteca...
                      </TableCell>
                    </TableRow>
                  )}
                  {!catBusy && catResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                        Digite acima para buscar entre {catTotal.toLocaleString('pt-BR')} produtos
                        da lista oficial (ex.: dipirona, omeprazol, luva).
                      </TableCell>
                    </TableRow>
                  )}
                  {catResults.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/80">
                      <TableCell>
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.presentation}</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[220px] truncate">
                        {c.substance || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[180px] truncate">
                        {c.laboratory || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-700">
                        {c.pmc ? fmtBRL(c.pmc) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5"
                          onClick={() => applyCatalogItem(c)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Usar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itens" className="mt-4">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="py-4 border-b bg-slate-50/50">
              <div className="flex items-center max-w-sm relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-blue/50" />
                <Input
                  placeholder="Buscar produto ou lote..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white border-slate-200"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b-slate-200">
                    <TableHead className="font-semibold text-brand-blue">Produto</TableHead>
                    <TableHead className="font-semibold text-brand-blue">Lote</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">Qtd</TableHead>
                    <TableHead className="font-semibold text-brand-blue">Validade</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">
                      Custo un.
                    </TableHead>
                    <TableHead className="font-semibold text-brand-blue">Status</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                        Carregando estoque...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-10">
                        Nenhum item cadastrado. Use <strong>Novo Item</strong> ou{' '}
                        <strong>Ler foto do produto</strong> para começar.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/80">
                      <TableCell>
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          {item.category}
                          {item.supplier ? ` · ${item.supplier}` : ''}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium">
                        {item.batch || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-black text-lg text-brand-blue">
                          {Number(item.current_qty) || 0}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">{item.unit || 'un'}</span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">
                        {fmtDate(item.expiry)}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {item.unit_cost ? fmtBRL(item.unit_cost) : '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => openMove(item, 'entrada')}
                            title="Registrar entrada"
                          >
                            <ArrowDownCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-brand-red hover:bg-brand-red/5"
                            onClick={() => openMove(item, 'saida')}
                            title="Registrar saída"
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mov" className="mt-4">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-brand-blue">Data</TableHead>
                    <TableHead className="font-semibold text-brand-blue">Item</TableHead>
                    <TableHead className="font-semibold text-brand-blue">Tipo</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">Qtd</TableHead>
                    <TableHead className="text-right font-semibold text-brand-blue">
                      Custo
                    </TableHead>
                    <TableHead className="font-semibold text-brand-blue">Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-10">
                        Nenhuma movimentação registrada ainda.
                      </TableCell>
                    </TableRow>
                  )}
                  {movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-slate-600">
                        {new Date(m.moved_at || m.created || '').toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {m.expand?.item?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            m.type === 'entrada'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-brand-red border-red-200'
                          }
                        >
                          {m.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">{m.qty}</TableCell>
                      <TableCell className="text-right">
                        {m.total_cost ? fmtBRL(m.total_cost) : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {m.source || 'manual'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ---------- Movimentação ---------- */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>
              {moveType === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
              {moveItem ? ` — ${moveItem.name}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={moveQty}
                  onChange={(e) => setMoveQty(e.target.value)}
                  min="1"
                />
              </div>
              {moveType === 'entrada' && (
                <div className="space-y-2">
                  <Label>Custo unitário (R$)</Label>
                  <Input
                    type="number"
                    value={moveCost}
                    onChange={(e) => setMoveCost(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              )}
            </div>
            {moveType === 'entrada' && (
              <>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input
                    value={moveSupplier}
                    onChange={(e) => setMoveSupplier(e.target.value)}
                    placeholder="Nome do fornecedor"
                  />
                </div>
                <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={moveExpense}
                    onChange={(e) => setMoveExpense(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Lançar automaticamente no <strong>Financeiro</strong> como despesa
                    {Number(moveCost) > 0 && Number(moveQty) > 0
                      ? ` (${fmtBRL(Number(moveCost) * Number(moveQty))})`
                      : ''}
                  </span>
                </label>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveMove}
              disabled={saving}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              {saving ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Novo item ---------- */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Novo Item de Estoque</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-1 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Buscar na biblioteca oficial (CMED/ANVISA)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex.: dipirona, omeprazol, luva..."
                  value={catTerm}
                  onChange={(e) => setCatTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      runCatalogSearch(catTerm)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => runCatalogSearch(catTerm)}
                  disabled={catBusy}
                >
                  {catBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </Button>
              </div>
              {catResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded border border-slate-200 divide-y">
                  {catResults.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-2 py-1.5 hover:bg-brand-blue/5"
                      onClick={() => applyCatalogItem(c)}
                    >
                      <div className="text-xs font-semibold text-slate-800">
                        {c.name}{' '}
                        {c.presentation ? (
                          <span className="font-normal text-slate-500">— {c.presentation}</span>
                        ) : null}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.substance} {c.pmc ? `· PMC ${fmtBRL(c.pmc)}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nome do produto *</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex.: Dipirona 500mg"
              />
            </div>
            {form.catalog_item && (
              <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-800 flex items-center gap-1">
                <Check className="h-3 w-3" /> Vinculado à biblioteca oficial
                {form.substance ? ` · ${form.substance}` : ''}
                {form.ean ? ` · EAN ${form.ean}` : ''}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Medicamento', 'Material', 'Descartável', 'Equipamento', 'Outro'].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  value={form.unit || ''}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="un / cx / amp"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Lote</Label>
                <Input
                  value={form.batch || ''}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Validade</Label>
                <Input
                  type="date"
                  value={form.expiry || ''}
                  onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Qtd atual</Label>
                <Input
                  type="number"
                  value={form.current_qty || ''}
                  onChange={(e) => setForm({ ...form, current_qty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Qtd mínima</Label>
                <Input
                  type="number"
                  value={form.min_qty || ''}
                  onChange={(e) => setForm({ ...form, min_qty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Custo un.</Label>
                <Input
                  type="number"
                  value={form.unit_cost || ''}
                  onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input
                value={form.supplier || ''}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateItem}
              disabled={saving || !form.name?.trim()}
              className="bg-brand-red hover:bg-brand-red/90 text-white"
            >
              {saving ? 'Salvando...' : 'Cadastrar item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Fonte de dados ---------- */}
      <Dialog open={srcOpen} onOpenChange={setSrcOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              {srcForm.id ? 'Editar fonte de dados' : 'Nova fonte de dados'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={srcForm.name || ''}
                onChange={(e) => setSrcForm({ ...srcForm, name: e.target.value })}
                placeholder="Ex.: Brasíndice — tabela 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={srcForm.kind}
                  onValueChange={(v) => setSrcForm({ ...srcForm, kind: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['CMED', 'ANVISA', 'BRASINDICE', 'OUTRO'].map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Edição</Label>
                <Input
                  value={srcForm.edition || ''}
                  onChange={(e) => setSrcForm({ ...srcForm, edition: e.target.value })}
                  placeholder="2026-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL (opcional)</Label>
              <Input
                value={srcForm.url || ''}
                onChange={(e) => setSrcForm({ ...srcForm, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Registros</Label>
                <Input
                  type="number"
                  value={srcForm.record_count || ''}
                  onChange={(e) => setSrcForm({ ...srcForm, record_count: e.target.value })}
                />
              </div>
              <label className="flex items-end gap-2 text-sm text-slate-700 pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={srcForm.active !== false}
                  onChange={(e) => setSrcForm({ ...srcForm, active: e.target.checked })}
                />
                Fonte ativa
              </label>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                value={srcForm.notes || ''}
                onChange={(e) => setSrcForm({ ...srcForm, notes: e.target.value })}
                placeholder="Origem dos dados, responsável, forma de atualização"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSrcOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveSource}
              disabled={saving || !srcForm.name?.trim()}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- OCR ---------- */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-brand-blue" /> Ler produto pela foto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 px-3 py-2 text-xs text-slate-600">
              A foto é processada <strong>no seu dispositivo</strong> (OCR local). Nada é enviado
              para servidores externos.
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleScanFile(f)
              }}
            />

            <Button
              variant="outline"
              className="w-full h-24 border-dashed border-2 border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5"
              onClick={() => fileRef.current?.click()}
              disabled={ocrBusy}
            >
              {ocrBusy ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Lendo... {ocrProgress}%
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 mr-2" /> Tirar foto ou escolher imagem
                </>
              )}
            </Button>

            {preview && (
              <img
                src={preview}
                alt="Prévia do produto"
                className="max-h-40 w-full object-contain rounded border border-slate-200"
              />
            )}

            {ocrText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase text-slate-500">Texto reconhecido</Label>
                  <div className="flex gap-1">
                    {(['translate', 'explain', 'structured'] as const).map((m) => (
                      <Button
                        key={m}
                        type="button"
                        size="sm"
                        variant={aiMode === m ? 'default' : 'outline'}
                        className={
                          aiMode === m
                            ? 'h-7 px-2 text-[11px] bg-brand-blue hover:bg-brand-blue/90 text-white'
                            : 'h-7 px-2 text-[11px]'
                        }
                        disabled={aiBusy}
                        onClick={async () => {
                          setAiMode(m)
                          setAiBusy(true)
                          setAiResult('')
                          try {
                            setAiResult(await aiText(ocrText, m))
                          } catch (e: any) {
                            setAiResult('Falha: ' + (e?.message || e))
                          } finally {
                            setAiBusy(false)
                          }
                        }}
                      >
                        {m === 'translate' ? 'Traduzir' : m === 'explain' ? 'O que é' : 'Campos'}
                      </Button>
                    ))}
                  </div>
                </div>
                <pre className="max-h-32 overflow-auto rounded border border-slate-200 bg-slate-50 p-2 text-xs whitespace-pre-wrap text-slate-700">
                  {ocrText}
                </pre>
                {aiBusy && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Consultando IA...
                  </div>
                )}
                {aiResult && (
                  <div className="rounded border border-violet-200 bg-violet-50 p-2 text-xs whitespace-pre-wrap text-slate-800">
                    {aiResult}
                  </div>
                )}
              </div>
            )}

            {parsed && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1 text-sm">
                <div className="font-semibold text-emerald-800 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Dados identificados
                </div>
                <div className="text-slate-700">
                  <strong>Produto:</strong> {parsed.name || '—'}
                </div>
                <div className="text-slate-700">
                  <strong>Lote:</strong> {parsed.batch || '—'}
                </div>
                <div className="text-slate-700">
                  <strong>Validade:</strong> {fmtDate(parsed.expiry)}
                </div>
                {parsed.qty ? (
                  <div className="text-slate-700">
                    <strong>Qtd na embalagem:</strong> {parsed.qty}
                  </div>
                ) : null}
                {parsed.catalogMatch && (
                  <div className="mt-1 rounded bg-white/70 border border-emerald-200 px-2 py-1 text-xs text-emerald-900">
                    <strong>Encontrado na biblioteca oficial:</strong> {parsed.catalogMatch.name} —{' '}
                    {parsed.catalogMatch.presentation}
                    {parsed.catalogMatch.pmc ? ` · PMC ${fmtBRL(parsed.catalogMatch.pmc)}` : ''}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={handleCreateFromScan}
              disabled={!parsed}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              Usar estes dados no cadastro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
