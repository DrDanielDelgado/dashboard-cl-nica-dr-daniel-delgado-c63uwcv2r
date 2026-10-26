// PocketBase Hook: Sincronização e Diagnóstico HiDoctor (HiNetX)
// Endpoints:
// - POST /backend/v1/hidoctor/test: Testa a conectividade com o endpoint HiDoctor e retorna diagnóstico técnico
// - POST /backend/v1/hidoctor/sync: Tenta sincronização com a API HiDoctor com retries, timeout e paginação
// - POST /backend/v1/hidoctor/import-batch: Importa lote de prontuários com upsert na coleção patients do PocketBase

// 1. Endpoint de Teste de Conectividade e Diagnóstico
routerAdd('POST', '/backend/v1/hidoctor/test', (e) => {
  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const targetUrl = (body.url || 'https://api.hinetx.com.br/v2/prontuarios/sync').trim()
  const serial = (body.serial || 'H80ARQW43').trim()
  const crm = (body.crm || '37525').trim()
  const password = body.password || 'CPV2406'

  const startTime = Date.now()
  let status = 'failed'
  let responseCode = 0
  let message = ''
  let technicalDetail = ''

  try {
    const res = $http.send({
      url: targetUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + serial + '-' + crm,
        'User-Agent': 'HiDoctor-Sync-Bridge/1.0 (DrDanielDelgado)',
      },
      body: JSON.stringify({ password: password, limit: 1 }),
      timeout: 10,
    })

    responseCode = res.statusCode
    if (res.statusCode >= 200 && res.statusCode < 300) {
      status = 'connected'
      message = 'Conexão com a API HiDoctor estabelecida com sucesso.'
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      status = 'unauthorized'
      message = 'Credenciais recusadas pelo servidor HiDoctor (Serial/CRM ou Senha incorretos).'
      technicalDetail = res.raw || res.status
    } else {
      status = 'server_error'
      message = 'Servidor HiDoctor respondeu com status HTTP ' + res.statusCode
      technicalDetail = res.raw || ''
    }
  } catch (err) {
    status = 'unreachable'
    technicalDetail = err.message || 'Falha de rede/DNS'
    if (
      technicalDetail.indexOf('no such host') !== -1 ||
      technicalDetail.indexOf('lookup') !== -1
    ) {
      message =
        'Host da API (' + targetUrl + ') não encontrado nos servidores de DNS públicos (NXDOMAIN).'
    } else if (technicalDetail.indexOf('timeout') !== -1) {
      message = 'Tempo limite esgotado ao tentar alcançar o servidor HiDoctor (Timeout após 10s).'
    } else {
      message = 'Não foi possível alcançar o servidor externo da HiDoctor: ' + technicalDetail
    }
  }

  const durationMs = Date.now() - startTime

  // Atualiza ou registra status na coleção hidoctor_settings se existir
  try {
    const settingsList = e.app.findRecordsByFilter(
      'hidoctor_settings',
      'name = "HiDoctor Clinica"',
      '',
      1,
      0,
    )
    if (settingsList && settingsList.length > 0) {
      const setting = settingsList[0]
      setting.set('connection_test_details', {
        tested_at: new Date().toISOString(),
        status: status,
        target_url: targetUrl,
        response_code: responseCode,
        duration_ms: durationMs,
        message: message,
        technical_detail: technicalDetail,
      })
      if (status === 'connected') {
        setting.set('is_active', true)
      } else {
        setting.set('is_active', false)
      }
      e.app.save(setting)
    }
  } catch (_) {}

  return e.json(200, {
    status: status,
    target_url: targetUrl,
    response_code: responseCode,
    duration_ms: durationMs,
    message: message,
    technical_detail: technicalDetail,
    diagnostic: {
      is_online: status === 'connected',
      auth_valid: status === 'connected',
      action_recommendation:
        status === 'connected'
          ? 'API ativa e pronta para sincronização.'
          : 'O endpoint da API HiDoctor não está respondendo publicamente. O HiDoctor tradicional utiliza software desktop ou acesso web via portal (app.hidoctor.com.br/hinet). Para importar prontuários para o sistema, utilize também a importação de arquivo/backup exportado do HiDoctor (CSV/JSON/XML) ou atualize a URL da API da sua clínica.',
    },
  })
})

// 2. Endpoint de Sincronização com Retry e Paginação
routerAdd('POST', '/backend/v1/hidoctor/sync', (e) => {
  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const authHeader = reqInfo.headers['authorization'] || ''
  const targetUrl = (body.api_url || 'https://api.hinetx.com.br/v2/prontuarios/sync').trim()
  const password = body.password || 'CPV2406'
  const page = body.page || 1
  const limit = body.limit || 100

  const maxRetries = 2
  let attempt = 0
  let lastError = null
  let apiResponse = null

  while (attempt < maxRetries) {
    attempt++
    try {
      const res = $http.send({
        url: targetUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader || 'Bearer H80ARQW43-37525',
          'User-Agent': 'HiDoctor-Sync-Bridge/1.0',
        },
        body: JSON.stringify({
          password: password,
          page: page,
          limit: limit,
        }),
        timeout: 12,
      })

      if (res.statusCode >= 200 && res.statusCode < 300) {
        apiResponse = res
        break
      } else {
        lastError = new Error(
          'HTTP ' + res.statusCode + ': ' + (res.raw || 'Erro na resposta do servidor HiDoctor'),
        )
        // Se for erro de credencial (401/403), não adianta tentar novamente
        if (res.statusCode === 401 || res.statusCode === 403) break
      }
    } catch (err) {
      lastError = err
    }
  }

  if (apiResponse && apiResponse.statusCode >= 200 && apiResponse.statusCode < 300) {
    return e.json(apiResponse.statusCode, apiResponse.json || {})
  }

  // Falha na API externa HiDoctor
  const errMsg = lastError ? lastError.message : 'Falha desconhecida de conexão'
  let userFriendly = 'O serviço da API HiDoctor não pôde ser contatado.'
  let statusReason = 'network_error'

  if (errMsg.indexOf('no such host') !== -1 || errMsg.indexOf('lookup') !== -1) {
    userFriendly =
      'O endereço da API HiDoctor (' +
      targetUrl +
      ') não foi localizado no DNS da internet (domínio inativo ou reservado para rede interna).'
    statusReason = 'dns_unresolved'
  } else if (errMsg.indexOf('HTTP 401') !== -1 || errMsg.indexOf('HTTP 403') !== -1) {
    userFriendly = 'As credenciais informadas foram recusadas pelo servidor HiDoctor.'
    statusReason = 'unauthorized'
  } else if (errMsg.indexOf('timeout') !== -1) {
    userFriendly = 'O servidor HiDoctor demorou muito para responder e a conexão expirou.'
    statusReason = 'timeout'
  }

  // Registra log da tentativa
  try {
    const logsCol = e.app.findCollectionByNameOrId('hidoctor_sync_logs')
    const logRec = new Record(logsCol)
    logRec.set('trigger_type', 'manual')
    logRec.set('status', 'failed')
    logRec.set('records_imported', 0)
    logRec.set('records_updated', 0)
    logRec.set('duration_seconds', 0)
    logRec.set('message', userFriendly)
    logRec.set('error_details', errMsg)
    e.app.save(logRec)
  } catch (_) {}

  // Atualiza hidoctor_settings
  try {
    const settingsList = e.app.findRecordsByFilter(
      'hidoctor_settings',
      'name = "HiDoctor Clinica"',
      '',
      1,
      0,
    )
    if (settingsList && settingsList.length > 0) {
      const setting = settingsList[0]
      setting.set('last_sync_status', 'failed')
      setting.set('last_sync_at', new Date().toISOString())
      setting.set('last_sync_message', userFriendly)
      e.app.save(setting)
    }
  } catch (_) {}

  return e.json(502, {
    success: false,
    reason: statusReason,
    message: userFriendly,
    technical_error: errMsg,
    target_url: targetUrl,
  })
})

// 3. Endpoint de Importação em Lote para a Coleção patients do PocketBase
// Permite salvar registros reais de prontuários/pacientes no banco com deduplicação por CPF ou nome
routerAdd('POST', '/backend/v1/hidoctor/import-batch', (e) => {
  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const rawPatients = body.patients || []
  const triggerType = body.trigger_type || 'file_import' // 'manual' | 'file_import'

  if (!Array.isArray(rawPatients) || rawPatients.length === 0) {
    return e.json(400, { success: false, message: 'Nenhum paciente fornecido para importação.' })
  }

  const startTime = Date.now()
  const patientsCol = e.app.findCollectionByNameOrId('patients')
  let importedCount = 0
  let updatedCount = 0
  const errors = []

  for (let i = 0; i < rawPatients.length; i++) {
    const item = rawPatients[i]
    const name = (item.fullName || item.name || '').trim()
    if (!name) continue

    const cpf = (item.cpf || '').trim()
    const phone = (item.phone || '').trim()
    const email = (item.email || '').trim()
    const birthdate = item.dob || item.birthdate || ''
    const notes = item.clinicalNotes || item.notes || item.history || ''

    try {
      // Busca paciente existente por CPF (se informado) ou nome exato
      let existingRecord = null
      if (cpf && cpf.length >= 11) {
        const found = e.app.findRecordsByFilter('patients', 'cpf = {:cpf}', '', 1, 0, { cpf: cpf })
        if (found && found.length > 0) existingRecord = found[0]
      }
      if (!existingRecord && name) {
        const foundByName = e.app.findRecordsByFilter('patients', 'name = {:name}', '', 1, 0, {
          name: name,
        })
        if (foundByName && foundByName.length > 0) existingRecord = foundByName[0]
      }

      if (existingRecord) {
        // Atualiza campos vazios com os dados vindos do prontuário
        let changed = false
        if (!existingRecord.getString('phone') && phone) {
          existingRecord.set('phone', phone)
          changed = true
        }
        if (!existingRecord.getString('email') && email) {
          existingRecord.set('email', email)
          changed = true
        }
        if (!existingRecord.getString('cpf') && cpf) {
          existingRecord.set('cpf', cpf)
          changed = true
        }
        if (notes) {
          const currentNotes = existingRecord.getString('notes')
          if (!currentNotes) {
            existingRecord.set('notes', notes)
            changed = true
          } else if (currentNotes.indexOf(notes) === -1) {
            existingRecord.set('notes', currentNotes + '\n\n[HiDoctor]: ' + notes)
            changed = true
          }
        }
        if (changed) {
          e.app.save(existingRecord)
          updatedCount++
        }
      } else {
        // Cria novo registro de paciente
        const newRecord = new Record(patientsCol)
        newRecord.set('name', name)
        if (cpf) newRecord.set('cpf', cpf)
        if (phone) newRecord.set('phone', phone)
        if (email) newRecord.set('email', email)
        if (birthdate) {
          try {
            newRecord.set('birthdate', new Date(birthdate).toISOString().split('T')[0])
          } catch (_) {}
        }
        if (notes) newRecord.set('notes', notes)
        e.app.save(newRecord)
        importedCount++
      }
    } catch (saveErr) {
      errors.push({ name: name, error: saveErr.message })
    }
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000)

  // Atualiza contadores em hidoctor_settings
  try {
    const totalPatientsInDb = e.app.countRecords('patients')
    const settingsList = e.app.findRecordsByFilter(
      'hidoctor_settings',
      'name = "HiDoctor Clinica"',
      '',
      1,
      0,
    )
    if (settingsList && settingsList.length > 0) {
      const setting = settingsList[0]
      setting.set('synced_patients_count', totalPatientsInDb)
      setting.set('last_sync_status', errors.length > 0 ? 'warning' : 'success')
      setting.set('last_sync_at', new Date().toISOString())
      setting.set(
        'last_sync_message',
        'Lote processado: ' +
          importedCount +
          ' criados, ' +
          updatedCount +
          ' atualizados no banco de pacientes.',
      )
      e.app.save(setting)
    }
  } catch (_) {}

  // Grava log
  try {
    const logsCol = e.app.findCollectionByNameOrId('hidoctor_sync_logs')
    const logRec = new Record(logsCol)
    logRec.set('trigger_type', triggerType)
    logRec.set(
      'status',
      errors.length > 0 && importedCount === 0
        ? 'failed'
        : errors.length > 0
          ? 'partial'
          : 'success',
    )
    logRec.set('records_imported', importedCount)
    logRec.set('records_updated', updatedCount)
    logRec.set('duration_seconds', durationSec)
    logRec.set(
      'message',
      'Importação concluída: ' + importedCount + ' novos, ' + updatedCount + ' sincronizados.',
    )
    if (errors.length > 0) {
      logRec.set('error_details', JSON.stringify(errors.slice(0, 10)))
    }
    e.app.save(logRec)
  } catch (_) {}

  return e.json(200, {
    success: true,
    imported: importedCount,
    updated: updatedCount,
    total_processed: rawPatients.length,
    duration_seconds: durationSec,
    errors_count: errors.length,
    sample_errors: errors.slice(0, 5),
  })
})
