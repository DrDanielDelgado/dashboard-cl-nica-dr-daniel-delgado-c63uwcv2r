// Importação em lote do catálogo médico direto no servidor (evita rate limit por registro).
// Recebe { rows: [[name, substance, presentation, laboratory, ggrem, ean, registration,
//                  therapeutic_class, product_type, price_regime, tarja, pf, pmc, hospital_only], ...] }
routerAdd('POST', '/backend/v1/import_catalog', (e) => {
  const body = e.requestInfo().body || {}
  const rows = body.rows || []
  const edition = body.edition || '2026-10-09'
  const source = body.source || 'CMED'

  if (!Array.isArray(rows) || rows.length === 0) {
    return e.json(400, { error: 'rows vazio' })
  }

  const col = $app.findCollectionByNameOrId('med_catalog')
  let created = 0
  let failed = 0
  const errors = []

  for (const r of rows) {
    if (!r || !r[0]) {
      failed++
      continue
    }
    try {
      const rec = new Record(col)
      rec.set('name', String(r[0] || ''))
      rec.set('substance', String(r[1] || ''))
      rec.set('presentation', String(r[2] || ''))
      rec.set('laboratory', String(r[3] || ''))
      rec.set('ggrem', String(r[4] || ''))
      rec.set('ean', String(r[5] || ''))
      rec.set('registration', String(r[6] || ''))
      rec.set('therapeutic_class', String(r[7] || ''))
      rec.set('product_type', String(r[8] || ''))
      rec.set('price_regime', String(r[9] || ''))
      rec.set('tarja', String(r[10] || ''))
      rec.set('pf', Number(r[11]) || 0)
      rec.set('pmc', Number(r[12]) || 0)
      rec.set('hospital_only', !!r[13])
      rec.set('source', source)
      rec.set('source_edition', edition)
      $app.save(rec)
      created++
    } catch (err) {
      failed++
      if (errors.length < 5) errors.push(String(err).slice(0, 160))
    }
  }

  return e.json(200, { created, failed, errors })
})

// Conta registros do catálogo.
routerAdd('GET', '/backend/v1/catalog_count', (e) => {
  const total = $app.countRecords('med_catalog')
  return e.json(200, { total })
})

// Limpa o catálogo (uso controlado, para reimportação).
routerAdd('POST', '/backend/v1/catalog_clear', (e) => {
  const rows = $app.findRecordsByFilter('med_catalog', '', '', 500, 0)
  let deleted = 0
  for (const r of rows) {
    try {
      $app.delete(r)
      deleted++
    } catch (_) {}
  }
  return e.json(200, { deleted, remaining: $app.countRecords('med_catalog') })
})
