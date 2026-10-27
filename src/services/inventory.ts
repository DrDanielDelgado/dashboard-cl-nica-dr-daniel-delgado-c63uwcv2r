import pb from '@/lib/pocketbase/client'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL

export type InventoryItem = {
  id: string
  name: string
  category?: string
  unit?: string
  batch?: string
  expiry?: string
  current_qty?: number
  min_qty?: number
  unit_cost?: number
  supplier?: string
  location?: string
  notes?: string
  image?: string
  collectionId?: string
  collectionName?: string
  created?: string
  updated?: string
}

export type StockMovement = {
  id: string
  item: string
  type: 'entrada' | 'saida' | 'ajuste'
  qty: number
  unit_cost?: number
  total_cost?: number
  supplier?: string
  note?: string
  source?: string
  moved_at?: string
  created?: string
  expand?: { item?: InventoryItem; patient?: any }
}

export const getInventory = async () => {
  return await pb.collection('inventory_items').getFullList({ sort: 'name' })
}

export const createInventoryItem = async (data: Partial<InventoryItem>) => {
  return await pb.collection('inventory_items').create(data)
}

export const updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
  return await pb.collection('inventory_items').update(id, data)
}

export const deleteInventoryItem = async (id: string) => {
  return await pb.collection('inventory_items').delete(id)
}

export const getMovements = async () => {
  return await pb
    .collection('stock_movements')
    .getFullList({ sort: '-created', expand: 'item', perPage: 200 })
}

/**
 * Registra uma movimentação e atualiza o saldo do item.
 * Entrada em estoque pode gerar despesa no financeiro automaticamente.
 */
export const registerMovement = async (data: {
  itemId: string
  type: 'entrada' | 'saida' | 'ajuste'
  qty: number
  unitCost?: number
  supplier?: string
  note?: string
  source?: string
  createExpense?: boolean
}) => {
  const item = await pb.collection('inventory_items').getOne(data.itemId)
  const currentQty = Number(item.current_qty) || 0
  const delta = data.type === 'saida' ? -data.qty : data.qty
  const newQty = Math.max(0, currentQty + delta)

  const totalCost = (Number(data.unitCost) || 0) * data.qty

  const movement = await pb.collection('stock_movements').create({
    item: data.itemId,
    type: data.type,
    qty: data.qty,
    unit_cost: Number(data.unitCost) || 0,
    total_cost: totalCost,
    supplier: data.supplier || '',
    note: data.note || '',
    source: data.source || 'manual',
    moved_at: new Date().toISOString(),
  })

  await pb.collection('inventory_items').update(data.itemId, {
    current_qty: newQty,
    ...(data.unitCost ? { unit_cost: Number(data.unitCost) } : {}),
  })

  // Entrada com custo vira despesa no financeiro
  if (data.type === 'entrada' && data.createExpense && totalCost > 0) {
    await pb.collection('expenses').create({
      description: `${item.name} — ${data.qty} ${item.unit || 'un'} (lote ${item.batch || '-'})`,
      category: item.category === 'Medicamento' ? 'Medicamento' : 'Material',
      amount: totalCost,
      status: 'Pendente',
      supplier: data.supplier || '',
      movement: movement.id,
      notes: 'Gerado automaticamente pela entrada de estoque',
    })
  }

  return movement
}

export type Expense = {
  id: string
  description: string
  category?: string
  amount?: number
  paid_at?: string
  due_date?: string
  status?: string
  supplier?: string
  movement?: string
  notes?: string
  created?: string
}

export const getExpenses = async () => {
  return await pb.collection('expenses').getFullList({ sort: '-created', perPage: 200 })
}

export const updateExpenseStatus = async (id: string, status: string) => {
  return await pb.collection('expenses').update(id, {
    status,
    ...(status === 'Pago' ? { paid_at: new Date().toISOString() } : {}),
  })
}

/**
 * OCR no navegador com Tesseract.js carregado sob demanda via CDN.
 * A imagem NÃO sai do dispositivo: o reconhecimento roda em WASM local.
 */
export async function runOcr(
  file: File | string,
  onProgress?: (p: number) => void,
): Promise<string> {
  const w = window as any
  if (!w.Tesseract) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'
      s.onload = () => resolve()
      s.onerror = () =>
        reject(new Error('Falha ao carregar o motor de OCR (verifique a internet).'))
      document.head.appendChild(s)
    })
  }
  const Tesseract = (window as any).Tesseract
  const result = await Tesseract.recognize(file, 'por', {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && onProgress) onProgress(Math.round(m.progress * 100))
    },
  })
  return String(result?.data?.text || '')
}

/** Traduz / interpreta o texto do rótulo usando a IA do Skip (só texto). */
export async function aiText(
  text: string,
  action: 'translate' | 'explain' | 'structured' = 'translate',
): Promise<string> {
  const res = await fetch(`${PB_URL}/backend/v1/ai_text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, action }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any)?.error || 'Falha na IA de texto.')
  return String((data as any)?.text || '')
}

/** Extrai pistas de medicamento/lote/validade a partir do texto do OCR. */
export function parseLabel(raw: string) {
  const text = raw.replace(/\r/g, '')
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2)

  const expiry =
    text.match(/(?:val(?:idade)?\.?\s*[:]?\s*)?(0?[1-9]|1[0-2])[/\-.](\d{4})/i) ||
    text.match(/(?:val(?:idade)?\.?\s*[:]?\s*)?(0?[1-9]|1[0-2])[/\-.](\d{2})\b/i)

  const batch = text.match(/(?:lote|l\.)\s*[:.]?\s*([A-Z0-9\-.]{3,})/i)
  const qty = text.match(/(\d{1,4})\s*(?:un|unid|cx|caixa|amp|ampola|cp|comprimidos?|frascos?)/i)

  let expiryISO = ''
  if (expiry) {
    const month = String(expiry[1]).padStart(2, '0')
    const yearRaw = expiry[2]
    const year = yearRaw.length === 2 ? '20' + yearRaw : yearRaw
    expiryISO = `${year}-${month}-01`
  }

  // Nome: primeira linha com letras e tamanho razoável que não seja palavra-chave
  const skip = /^(lote|val|fabric|registro|ms\s|uso|via|posologia|composi)/i
  const nameLine =
    lines.find((l) => /[A-Za-zÀ-ÿ]{3,}/.test(l) && !skip.test(l) && l.length <= 60) || ''

  return {
    name: nameLine,
    batch: batch ? batch[1].toUpperCase() : '',
    expiry: expiryISO,
    qty: qty ? Number(qty[1]) : undefined,
    raw: text,
  }
}
