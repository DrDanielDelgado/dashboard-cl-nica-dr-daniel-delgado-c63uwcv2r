routerAdd('GET', '/backend/v1/meta/webhook', (e) => {
  const query = e.requestInfo().query || {}
  const mode = query['hub.mode'] || ''
  const token = query['hub.verify_token'] || ''
  const challenge = query['hub.challenge'] || ''

  const expectedToken =
    $os.getenv('META_VERIFY_TOKEN') || 'clinica_daniel_delgado_secret_token_2026'

  if (mode === 'subscribe' && token === expectedToken) {
    return e.string(200, challenge)
  }

  return e.json(403, { error: 'Verification failed' })
})
