// Notifica o Maestro em tempo real quando um agendamento é criado/editado.
// O Maestro executa então a sincronização bidirecional com o Google Calendar.
// Falhas são silenciosas: a varredura periódica cobre o que escapar.

onRecordAfterCreateSuccess((e) => {
  try {
    const url =
      $os.getenv('SYNC_WEBHOOK_URL') ||
      'https://maestro.adapta.one/webhooks/generic/fe449a7728e661fefc6710442f81150df49ef1226b1dabb9192d8ce0f93e1f0e'
    const secret = $os.getenv('SYNC_WEBHOOK_SECRET') || ''
    $http.send({
      url: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret,
      },
      body: JSON.stringify({
        source: 'pocketbase',
        collection: 'appointments',
        action: 'create',
        id: e.record.id,
        ts: new Date().toISOString(),
      }),
      timeout: 5,
    })
  } catch (err) {
    console.log('sync webhook falhou (create): ' + (err && err.message ? err.message : err))
  }
}, 'appointments')

onRecordAfterUpdateSuccess((e) => {
  try {
    const url =
      $os.getenv('SYNC_WEBHOOK_URL') ||
      'https://maestro.adapta.one/webhooks/generic/fe449a7728e661fefc6710442f81150df49ef1226b1dabb9192d8ce0f93e1f0e'
    const secret = $os.getenv('SYNC_WEBHOOK_SECRET') || ''
    $http.send({
      url: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret,
      },
      body: JSON.stringify({
        source: 'pocketbase',
        collection: 'appointments',
        action: 'update',
        id: e.record.id,
        ts: new Date().toISOString(),
      }),
      timeout: 5,
    })
  } catch (err) {
    console.log('sync webhook falhou (update): ' + (err && err.message ? err.message : err))
  }
}, 'appointments')

onRecordAfterDeleteSuccess((e) => {
  try {
    const url =
      $os.getenv('SYNC_WEBHOOK_URL') ||
      'https://maestro.adapta.one/webhooks/generic/fe449a7728e661fefc6710442f81150df49ef1226b1dabb9192d8ce0f93e1f0e'
    const secret = $os.getenv('SYNC_WEBHOOK_SECRET') || ''
    $http.send({
      url: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret,
      },
      body: JSON.stringify({
        source: 'pocketbase',
        collection: 'appointments',
        action: 'delete',
        id: e.record.id,
        ts: new Date().toISOString(),
      }),
      timeout: 5,
    })
  } catch (err) {
    console.log('sync webhook falhou (delete): ' + (err && err.message ? err.message : err))
  }
}, 'appointments')
