import pb from '@/lib/pocketbase/client'

export type CatalogItem = {
  id: string
  name: string
  substance?: string
  presentation?: string
  laboratory?: string
  ggrem?: string
  ean?: string
  registration?: string
  therapeutic_class?: string
  product_type?: string
  price_regime?: string
  tarja?: string
  pf?: number
  pmc?: number
  hospital_only?: boolean
  source?: string
  source_edition?: string
}

export type CatalogSource = {
  id: string
  name: string
  kind?: string
  url?: string
  edition?: string
  record_count?: number
  last_sync?: string
  notes?: string
  active?: boolean
}

/** Busca no catálogo por nome comercial, substância ou código EAN. */
export async function searchCatalog(term: string, limit = 25): Promise<CatalogItem[]> {
  const q = term.trim().replace(/["\\]/g, '')
  if (!q) return []
  const filter = `name ~ "${q}" || substance ~ "${q}" || ean ~ "${q}" || laboratory ~ "${q}"`
  const res: any = await pb.collection('med_catalog').getList(1, limit, {
    filter,
    sort: 'name',
  })
  return (res?.items || []) as CatalogItem[]
}

/** Busca um item do catálogo pelo código de barras (EAN). */
export async function findByEan(ean: string): Promise<CatalogItem | null> {
  const clean = String(ean || '').replace(/\D/g, '')
  if (clean.length < 8) return null
  try {
    const res = await pb.collection('med_catalog').getList(1, 1, {
      filter: `ean = "${clean}"`,
    })
    const items = (res as any).items as CatalogItem[]
    return items?.[0] || null
  } catch {
    return null
  }
}

export const getCatalogCount = async (): Promise<number> => {
  try {
    const res: any = await pb.collection('med_catalog').getList(1, 1, { fields: 'id' })
    return res?.totalItems || 0
  } catch {
    return 0
  }
}

export const getCatalogSources = async (): Promise<CatalogSource[]> => {
  return (await pb.collection('catalog_sources').getFullList({
    sort: 'name',
  })) as unknown as CatalogSource[]
}

export const createCatalogSource = async (data: Partial<CatalogSource>) => {
  return await pb.collection('catalog_sources').create(data)
}

export const updateCatalogSource = async (id: string, data: Partial<CatalogSource>) => {
  return await pb.collection('catalog_sources').update(id, data)
}

export const deleteCatalogSource = async (id: string) => {
  return await pb.collection('catalog_sources').delete(id)
}
