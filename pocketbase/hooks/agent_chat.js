routerAdd('POST', '/backend/v1/agent/chat', (e) => {
  try {
    const body = e.requestInfo().body || {}
    let userId = e.auth?.id

    // Fallback: se for chat público de paciente, usar um usuário de serviço da clínica
    if (!userId) {
      try {
        const u = $app.findFirstRecordByData('users', 'email', 'delgadodm@hotmail.com')
        userId = u.id
      } catch (_) {
        // Tentar qualquer usuário existente
        const allUsers = $app.findRecordsByFilter('users', 'id != ""', 'created', 1, 0)
        if (allUsers.length > 0) {
          userId = allUsers[0].id
        }
      }
    }

    if (!userId) {
      return e.unauthorizedError('Nenhum usuário autenticado ou cadastrado para o agente.')
    }

    if (!body.message || !body.message.trim()) {
      return e.badRequestError('Mensagem é obrigatória.')
    }

    const result = $ai.agent('clinica-daniel-delgado').chat({
      user_id: userId,
      conversation_id: body.conversation_id || null,
      message: body.message,
    })

    return e.json(200, {
      conversation_id: result.conversation_id,
      content: result.content,
      citations: result.citations || [],
      message_id: result.message_id,
    })
  } catch (err) {
    if (err instanceof SkipAiConfigError) {
      return e.json(503, { error: 'Serviço de IA temporariamente indisponível' })
    }
    if (err instanceof SkipAiAgentsError) {
      const status = err.status || 500
      return e.json(status, {
        error: status >= 500 ? 'Falha na resposta do assistente' : err.message,
      })
    }
    if (err instanceof SkipAiError) {
      const status = err.status || 502
      return e.json(status, {
        error: status >= 500 ? 'IA temporariamente indisponível' : err.message,
      })
    }
    return e.json(500, { error: err.message || 'Erro inesperado no agente IA' })
  }
})

routerAdd('GET', '/backend/v1/agent/conversations', (e) => {
  let userId = e.auth?.id
  if (!userId) {
    try {
      const u = $app.findFirstRecordByData('users', 'email', 'delgadodm@hotmail.com')
      userId = u.id
    } catch (_) {
      const allUsers = $app.findRecordsByFilter('users', 'id != ""', 'created', 1, 0)
      if (allUsers.length > 0) userId = allUsers[0].id
    }
  }

  if (!userId) return e.unauthorizedError('Usuário não localizado.')

  const limit = parseInt(e.requestInfo().query?.limit || '20', 10) || 20
  try {
    const res = $ai
      .agent('clinica-daniel-delgado')
      .listConversations({ user_id: userId, limit: limit })
    return e.json(200, res)
  } catch (err) {
    return e.json(200, { conversations: [] })
  }
})

routerAdd('GET', '/backend/v1/agent/conversations/{conversationId}/messages', (e) => {
  let userId = e.auth?.id
  if (!userId) {
    try {
      const u = $app.findFirstRecordByData('users', 'email', 'delgadodm@hotmail.com')
      userId = u.id
    } catch (_) {
      const allUsers = $app.findRecordsByFilter('users', 'id != ""', 'created', 1, 0)
      if (allUsers.length > 0) userId = allUsers[0].id
    }
  }

  if (!userId) return e.unauthorizedError('Usuário não localizado.')

  try {
    const res = $ai.agent('clinica-daniel-delgado').listMessages({
      conversation_id: e.request.pathValue('conversationId'),
      user_id: userId,
    })
    return e.json(200, res)
  } catch (err) {
    return e.json(404, { error: 'Conversa não encontrada ou expirada.' })
  }
})
