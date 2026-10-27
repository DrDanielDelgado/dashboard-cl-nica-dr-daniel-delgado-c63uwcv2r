// Endpoint de apoio à leitura de rótulos: tradução e interpretação de texto (sem imagem).
// O gateway $ai do Skip aceita apenas texto; o OCR roda no navegador do usuário.
routerAdd('POST', '/backend/v1/ai_text', (e) => {
  const body = e.requestInfo().body || {}
  const text = String(body.text || '').slice(0, 4000)
  const action = body.action || 'translate'

  if (!text.trim()) return e.json(400, { error: 'texto vazio' })

  const prompts = {
    translate:
      'Traduza o texto de rótulo/embalagem abaixo para português do Brasil. ' +
      'Se já estiver em português, apenas devolva o texto organizado. ' +
      'Responda SOMENTE com a tradução, sem comentários.',
    explain:
      'Explique em português do Brasil, em no máximo 5 linhas curtas, o que é o produto descrito ' +
      'no texto de rótulo abaixo, para que serve e cuidados principais. ' +
      'Se não for possível identificar, diga isso.',
    structured:
      'Extraia do texto de rótulo abaixo, em português do Brasil, os campos: produto, principio_ativo, ' +
      'lote, validade (AAAA-MM), quantidade e fabricante. ' +
      'Responda apenas as linhas "campo: valor"; use "-" quando não encontrar.',
  }

  try {
    const reply = $ai.chat({
      model: 'fast',
      messages: [
        {
          role: 'system',
          content:
            'Você apoia uma clínica médica na conferência de materiais e medicamentos. Seja objetivo e não invente dados.',
        },
        { role: 'user', content: prompts[action] + '\n\n---\n' + text },
      ],
    })
    return e.json(200, { text: reply.choices[0].message.content })
  } catch (err) {
    return e.json(500, { error: String(err) })
  }
})

// ---------------------------------------------------------------------------
// Importação em lote do catálogo médico, executada no servidor.
// Evita o rate limit do PocketBase (uma requisição por lote de 1.000 linhas).
// rows: [[name, substance, presentation, laboratory, ggrem, ean, registration,
//         therapeutic_class, product_type, price_regime, tarja, pf, pmc, hospital_only]]
// ---------------------------------------------------------------------------
routerAdd('POST', '/backend/v1/import_catalog', (e) => {
  const body = e.requestInfo().body || {}
  const rows = body.rows || []
  const edition = String(body.edition || '2026-10-09')
  const source = String(body.source || 'CMED')

  if (!Array.isArray(rows) || rows.length === 0) {
    return e.json(400, { error: 'rows vazio' })
  }

  let col
  try {
    col = $app.findCollectionByNameOrId('med_catalog')
  } catch (err) {
    return e.json(500, { error: 'coleção med_catalog não existe: ' + String(err) })
  }

  let created = 0
  let failed = 0
  const errors = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
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
      $app.saveNoValidate(rec)
      created++
    } catch (err) {
      failed++
      if (errors.length < 3) errors.push(String(err).slice(0, 140))
    }
  }

  return e.json(200, { created: created, failed: failed, errors: errors })
})

// Contagem de registros do catálogo.
routerAdd('GET', '/backend/v1/catalog_count', (e) => {
  let total = 0
  try {
    total = $app.countRecords('med_catalog')
  } catch (_) {}
  return e.json(200, { total: total })
})

// Limpeza controlada do catálogo (para reimportação de uma nova edição).
routerAdd('POST', '/backend/v1/catalog_clear', (e) => {
  let deleted = 0
  for (let guard = 0; guard < 200; guard++) {
    let batch = []
    try {
      batch = $app.findRecordsByFilter('med_catalog', '', '', 500, 0)
    } catch (_) {
      break
    }
    if (!batch || batch.length === 0) break
    for (let i = 0; i < batch.length; i++) {
      try {
        $app.delete(batch[i])
        deleted++
      } catch (_) {}
    }
  }
  let remaining = 0
  try {
    remaining = $app.countRecords('med_catalog')
  } catch (_) {}
  return e.json(200, { deleted: deleted, remaining: remaining })
})
