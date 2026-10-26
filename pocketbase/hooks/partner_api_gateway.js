// Gateway de API para Parceiros (Laboratórios, Convênios, n8n, Make)
// Clínica Dr. Daniel Delgado - Cirurgia Vascular

// 1. GET /backend/v1/partner-api/:collection
routerAdd('GET', '/backend/v1/partner-api/{collection}', (e) => {
  const collectionName = e.request.pathValue('collection')
  const clientIp = e.request.remoteAddr || ''
  const endpoint = '/backend/v1/partner-api/' + collectionName

  function extractKey() {
    let k = e.request.header.get('X-Partner-Key') || e.request.header.get('X-API-Key')
    if (!k) {
      const authHeader = e.request.header.get('Authorization') || ''
      if (authHeader.toLowerCase().startsWith('bearer ')) {
        k = authHeader.substring(7).trim()
      } else if (authHeader.toLowerCase().startsWith('apikey ')) {
        k = authHeader.substring(7).trim()
      }
    }
    return k || ''
  }

  function recordLog(partnerRecord, status, statusCode, errDetails) {
    try {
      const logCol = $app.findCollectionByNameOrId('partner_api_logs')
      const log = new Record(logCol)
      if (partnerRecord) {
        log.set('partner', partnerRecord.id)
        log.set('partner_name', partnerRecord.getString('name'))
      } else {
        log.set('partner_name', 'Chave Não Identificada')
      }
      log.set('collection_accessed', collectionName || 'unknown')
      log.set('method', 'GET')
      log.set('status', status)
      log.set('status_code', statusCode)
      log.set('ip', clientIp)
      log.set('endpoint', endpoint)
      if (errDetails) log.set('error_details', String(errDetails))
      $app.save(log)

      if (partnerRecord) {
        const calls = (partnerRecord.getInt('call_count') || 0) + 1
        partnerRecord.set('call_count', calls)
        partnerRecord.set('last_used_at', new Date().toISOString())
        $app.save(partnerRecord)
      }
    } catch (logErr) {
      console.warn('[Partner Gateway Log] Erro ao gravar log:', logErr.message)
    }
  }

  function getPermissions(partnerRecord) {
    try {
      const raw = partnerRecord.getString('permissions')
      return JSON.parse(raw) || {}
    } catch (_) {
      return {}
    }
  }

  const allowedCollections = ['patients', 'appointments', 'leads', 'budgets']
  if (!allowedCollections.includes(collectionName)) {
    recordLog(null, 'error', 400, 'Coleção não suportada pelo gateway.')
    return e.json(400, {
      success: false,
      error:
        'Coleção não disponível na API de parceiros. Disponíveis: patients, appointments, leads, budgets',
    })
  }

  const apiKey = extractKey()
  if (!apiKey) {
    recordLog(null, 'unauthorized', 401, 'Chave de API ausente.')
    return e.json(401, {
      success: false,
      error:
        'Chave de API do parceiro não fornecida no header X-Partner-Key ou Authorization: Bearer <key>.',
    })
  }

  let partner = null
  try {
    const records = $app.findRecordsByFilter(
      'partner_api_keys',
      'key = "' + apiKey.replace(/"/g, '') + '"',
      '',
      1,
      0,
    )
    if (records.length > 0) partner = records[0]
  } catch (err) {
    console.warn('[Partner Gateway] Erro busca chave:', err.message)
  }

  if (!partner) {
    recordLog(null, 'unauthorized', 401, 'Chave de parceiro inexistente ou inválida.')
    return e.json(401, { success: false, error: 'Chave de API inválida ou inexistente.' })
  }

  const isActive = partner.getBool('is_active')
  if (!isActive) {
    recordLog(partner, 'forbidden', 403, 'Chave de API revogada ou inativa.')
    return e.json(403, {
      success: false,
      error: 'Esta chave de parceiro foi desativada ou revogada pela clínica.',
    })
  }

  const permissions = getPermissions(partner)
  const colPerm = permissions[collectionName] || {}
  if (!colPerm.read) {
    recordLog(partner, 'forbidden', 403, 'Parceiro sem permissão de leitura nesta coleção.')
    return e.json(403, {
      success: false,
      error:
        'Permissão negada. Sua chave não possui permissão de leitura (read) para ' + collectionName,
    })
  }

  try {
    const q = e.requestInfo().query || {}
    const limit = Math.min(parseInt(q.limit || '50', 10) || 50, 100)
    const page = Math.max(parseInt(q.page || '1', 10) || 1, 1)
    const offset = (page - 1) * limit
    const filter = q.filter || ''
    const sort = q.sort || '-created'

    const records = $app.findRecordsByFilter(collectionName, filter, sort, limit, offset)
    const total = $app.countRecords(collectionName)

    recordLog(partner, 'success', 200, null)

    const items = records.map((r) => {
      const data = {}
      const schemaCol = $app.findCollectionByNameOrId(collectionName)
      const fieldNames = schemaCol.fields.map((f) => f.name)
      data.id = r.id
      data.created = r.getString('created')
      data.updated = r.getString('updated')
      for (let i = 0; i < fieldNames.length; i++) {
        const fn = fieldNames[i]
        try {
          data[fn] = r.get(fn)
        } catch (_) {
          data[fn] = r.getString(fn)
        }
      }
      return data
    })

    return e.json(200, {
      success: true,
      partner: partner.getString('name'),
      collection: collectionName,
      page: page,
      limit: limit,
      total: total,
      items: items,
    })
  } catch (err) {
    recordLog(partner, 'error', 500, err.message)
    return e.json(500, { success: false, error: 'Erro ao consultar dados: ' + err.message })
  }
})

// 2. POST /backend/v1/partner-api/:collection
routerAdd('POST', '/backend/v1/partner-api/{collection}', (e) => {
  const collectionName = e.request.pathValue('collection')
  const clientIp = e.request.remoteAddr || ''
  const endpoint = '/backend/v1/partner-api/' + collectionName

  function extractKey() {
    let k = e.request.header.get('X-Partner-Key') || e.request.header.get('X-API-Key')
    if (!k) {
      const authHeader = e.request.header.get('Authorization') || ''
      if (authHeader.toLowerCase().startsWith('bearer ')) {
        k = authHeader.substring(7).trim()
      } else if (authHeader.toLowerCase().startsWith('apikey ')) {
        k = authHeader.substring(7).trim()
      }
    }
    return k || ''
  }

  function recordLog(partnerRecord, status, statusCode, errDetails) {
    try {
      const logCol = $app.findCollectionByNameOrId('partner_api_logs')
      const log = new Record(logCol)
      if (partnerRecord) {
        log.set('partner', partnerRecord.id)
        log.set('partner_name', partnerRecord.getString('name'))
      } else {
        log.set('partner_name', 'Chave Não Identificada')
      }
      log.set('collection_accessed', collectionName || 'unknown')
      log.set('method', 'POST')
      log.set('status', status)
      log.set('status_code', statusCode)
      log.set('ip', clientIp)
      log.set('endpoint', endpoint)
      if (errDetails) log.set('error_details', String(errDetails))
      $app.save(log)

      if (partnerRecord) {
        const calls = (partnerRecord.getInt('call_count') || 0) + 1
        partnerRecord.set('call_count', calls)
        partnerRecord.set('last_used_at', new Date().toISOString())
        $app.save(partnerRecord)
      }
    } catch (logErr) {
      console.warn('[Partner Gateway Log] Erro ao gravar log:', logErr.message)
    }
  }

  function getPermissions(partnerRecord) {
    try {
      const raw = partnerRecord.getString('permissions')
      return JSON.parse(raw) || {}
    } catch (_) {
      return {}
    }
  }

  const allowedCollections = ['patients', 'appointments', 'leads', 'budgets']
  if (!allowedCollections.includes(collectionName)) {
    recordLog(null, 'error', 400, 'Coleção não suportada pelo gateway.')
    return e.json(400, {
      success: false,
      error:
        'Coleção não disponível na API de parceiros. Disponíveis: patients, appointments, leads, budgets',
    })
  }

  const apiKey = extractKey()
  if (!apiKey) {
    recordLog(null, 'unauthorized', 401, 'Chave de API ausente.')
    return e.json(401, {
      success: false,
      error: 'Chave de API do parceiro não fornecida no header X-Partner-Key ou Authorization.',
    })
  }

  let partner = null
  try {
    const records = $app.findRecordsByFilter(
      'partner_api_keys',
      'key = "' + apiKey.replace(/"/g, '') + '"',
      '',
      1,
      0,
    )
    if (records.length > 0) partner = records[0]
  } catch (err) {
    console.warn('[Partner Gateway] Erro busca chave:', err.message)
  }

  if (!partner) {
    recordLog(null, 'unauthorized', 401, 'Chave de parceiro inexistente ou inválida.')
    return e.json(401, { success: false, error: 'Chave de API inválida ou inexistente.' })
  }

  const isActive = partner.getBool('is_active')
  if (!isActive) {
    recordLog(partner, 'forbidden', 403, 'Chave de API revogada ou inativa.')
    return e.json(403, {
      success: false,
      error: 'Esta chave de parceiro foi desativada ou revogada pela clínica.',
    })
  }

  const permissions = getPermissions(partner)
  const colPerm = permissions[collectionName] || {}
  if (!colPerm.write) {
    recordLog(partner, 'forbidden', 403, 'Parceiro sem permissão de escrita nesta coleção.')
    return e.json(403, {
      success: false,
      error:
        'Permissão negada. Sua chave não possui permissão de escrita (write) para ' +
        collectionName,
    })
  }

  try {
    const body = e.requestInfo().body || {}
    const col = $app.findCollectionByNameOrId(collectionName)
    const record = new Record(col)

    const schemaFields = col.fields.map((f) => f.name)
    for (let k in body) {
      if (schemaFields.includes(k) && k !== 'id' && k !== 'created' && k !== 'updated') {
        record.set(k, body[k])
      }
    }

    $app.save(record)

    recordLog(partner, 'success', 201, null)

    return e.json(201, {
      success: true,
      partner: partner.getString('name'),
      collection: collectionName,
      id: record.id,
      message: 'Registro criado com sucesso no dashboard da clínica.',
    })
  } catch (err) {
    recordLog(partner, 'error', 400, err.message)
    return e.json(400, { success: false, error: 'Falha ao registrar dados: ' + err.message })
  }
})
