// Notifica o Maestro em tempo real quando um agendamento é criado/editado.
// O Maestro executa então a sincronização bidirecional com o Google Calendar.
// Falhas são silenciosas: a varredura periódica cobre o que escapar.

const SYNC_WEBHOOK_URL =
  $os.getenv('SYNC_WEBHOOK_URL') ||
  'https://maestro.adapta.one/webhooks/generic/fe449a7728e661fefc6710442f81150df49ef1226b1dabb9192d8ce0f93e1f0e'
const SYNC_WEBHOOK_SECRET = $os.getenv('SYNC_WEBHOOK_SECRET') || ''

onRecordAfterCreateSuccess((e) => {
  try {
    $http.send({
      url: SYNC_WEBHOOK_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': SYNC_WEBHOOK_SECRET,
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
    $http.send({
      url: SYNC_WEBHOOK_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': SYNC_WEBHOOK_SECRET,
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
