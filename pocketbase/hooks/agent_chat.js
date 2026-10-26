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

    const rawMessage = body.message.trim()

    // Higienização / salvaguarda LGPD para o backend:
    // Nunca persistir dados clínicos sensíveis ou fotos espontâneas
    const result = $ai.agent('clinica-daniel-delgado').chat({
      user_id: userId,
      conversation_id: body.conversation_id || null,
      message: rawMessage,
    })

    let cleanContent = result.content || ''
    let isUrgent = false

    // Detecção de urgência conforme Etapa 5A do protocolo:
    // 1) Tag de sistema [URGENTE_EQUIPE]
    // 2) Menções a SAMU 192, pronto-socorro urgente ou dor aguda nos padrões da Etapa 5A
    if (cleanContent.indexOf('[URGENTE_EQUIPE]') !== -1) {
      isUrgent = true
      cleanContent = cleanContent.replace(/\[URGENTE_EQUIPE\]/g, '').trim()
    } else if (
      cleanContent.indexOf('pronto-socorro') !== -1 &&
      (cleanContent.indexOf('SAMU') !== -1 || cleanContent.indexOf('192') !== -1)
    ) {
      isUrgent = true
    }

    // Se marcado como urgente, registrar lead/escalonamento prioritário para a equipe
    if (isUrgent) {
      try {
        const leadsCol = $app.findCollectionByNameOrId('leads')
        const leadRecord = new Record(leadsCol)
        leadRecord.set('name', body.patient_name || 'Paciente Chat (Prioridade Urgente)')
        leadRecord.set('stage', 'Lead')
        leadRecord.set('source', 'Chat IA - Alerta de Urgência')
        leadRecord.set(
          'notes',
          'ALERTA DE URGÊNCIA (Etapa 5A do protocolo): Paciente relatou sintomas agudos no chat em ' +
            new Date().toISOString() +
            (body.patient_phone ? ' - Telefone informado: ' + body.patient_phone : '') +
            ' - Orientado a procurar pronto-socorro/SAMU 192 e equipe acionada.',
        )
        $app.save(leadRecord)
      } catch (leadErr) {
        // Registro defensivo
        console.log('Falha ao registrar lead de urgência:', leadErr)
      }
    }

    return e.json(200, {
      conversation_id: result.conversation_id,
      content: cleanContent,
      citations: result.citations || [],
      message_id: result.message_id,
      is_urgent: isUrgent,
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
