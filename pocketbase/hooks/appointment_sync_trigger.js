// Notifica o Maestro em tempo real quando um agendamento é criado/editado.
// O Maestro executa então a sincronização bidirecional com o Google Calendar.
// Falhas são silenciosas: a varredura periódica cobre o que escapar.

const WEBHOOK_URL =
  $os.getenv('SYNC_WEBHOOK_URL') ||
  'https://maestro.adapta.one/webhooks/generic/fe449a7728e661fefc6710442f81150df49ef1226b1dabb9192d8ce0f93e1f0e'
const WEBHOOK_SECRET = $os.getenv('SYNC_WEBHOOK_SECRET') || ''

function notifySync(recordId, action) {
  try {
    $http.send({
      url: WEBHOOK_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        source: 'pocketbase',
        collection: 'appointments',
        action: action,
        id: recordId,
        ts: new Date().toISOString(),
      }),
      timeout: 5,
    })
  } catch (err) {
    console.log('sync webhook falhou: ' + (err && err.message ? err.message : err))
  }
}

onRecordAfterCreateSuccess((e) => {
  notifySync(e.record.id, 'create')
}, 'appointments')

onRecordAfterUpdateSuccess((e) => {
  notifySync(e.record.id, 'update')
}, 'appointments')
