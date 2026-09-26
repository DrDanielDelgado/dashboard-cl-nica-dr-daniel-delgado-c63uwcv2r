routerAdd('POST', '/backend/v1/meta/whatsapp/send', (e) => {
  const body = e.requestInfo().body || {}
  const patientId = body.patientId || ''
  const appointmentId = body.appointmentId || ''
  let recipientPhone = body.to || ''
  const recipientName = body.recipientName || ''
  const messageType = body.type || 'text' // 'text' | 'template' | 'reminder'
  const customText = body.text || ''
  const templateName = body.templateName || 'lembrete_consulta_24h'
  const templateParams = body.templateParams || []

  // Resolve credentials from secrets or request
  const accessToken = body.token || $os.getenv('META_ACCESS_TOKEN') || ''
  let phoneId = body.phoneId || $os.getenv('META_PHONE_NUMBER_ID') || ''

  if (!recipientPhone && patientId) {
    try {
      const p = $app.findRecordById('patients', patientId)
      if (p) {
        recipientPhone = p.getString('phone')
      }
    } catch (_) {}
  }

  if (!recipientPhone) {
    return e.json(400, {
      success: false,
      error: 'Número de telefone do destinatário é obrigatório.',
      code: 'MISSING_PHONE',
    })
  }

  // Format recipient phone to international E.164 (Brazil standard 55DDD9XXXXXXXX)
  let cleanPhone = recipientPhone.replace(/\D/g, '')
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = '55' + cleanPhone
  }

  // Create message record in database (initial status 'pending')
  const msgCol = $app.findCollectionByNameOrId('whatsapp_messages')
  const msgRecord = new Record(msgCol)
  if (patientId) msgRecord.set('patient', patientId)
  if (appointmentId) msgRecord.set('appointment', appointmentId)
  msgRecord.set('phone', cleanPhone)
  msgRecord.set('recipient_name', recipientName)
  msgRecord.set('message_type', messageType)
  msgRecord.set('template_name', templateName)
  msgRecord.set('status', 'pending')

  let messageBodyContent = customText
  if (!messageBodyContent && messageType === 'reminder') {
    messageBodyContent =
      'Olá ' +
      (recipientName || 'Paciente') +
      ', confirmamos sua consulta com Dr. Daniel Delgado amanhã. Responda SIM para confirmar presença.'
  }
  msgRecord.set('content', messageBodyContent)
  $app.save(msgRecord)

  // If Meta Access Token is not configured, keep as pending and return graceful status
  if (!accessToken) {
    msgRecord.set('status', 'pending')
    msgRecord.set(
      'error_details',
      'Meta Access Token não configurado no servidor. O envio está aguardando ativação das variáveis META_ACCESS_TOKEN e META_PHONE_NUMBER_ID.',
    )
    $app.save(msgRecord)

    return e.json(200, {
      success: false,
      status: 'pending',
      pendingConfig: true,
      messageId: msgRecord.id,
      warning:
        'WhatsApp Cloud API não configurada com token permanente. O registro foi salvo como pendente no sistema para disparo assim que as chaves forem salvas.',
    })
  }

  // Try auto-resolving phoneId if not configured
  if (!phoneId) {
    const wabaId = $os.getenv('META_WABA_ID') || '895450846341386'
    try {
      const resWaba = $http.send({
        url:
          'https://graph.facebook.com/v21.0/' +
          encodeURIComponent(wabaId) +
          '?fields=phone_numbers{id,display_phone_number}&access_token=' +
          encodeURIComponent(accessToken),
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeout: 8,
      })
      if (
        resWaba.statusCode === 200 &&
        resWaba.json.phone_numbers &&
        resWaba.json.phone_numbers.data &&
        resWaba.json.phone_numbers.data.length > 0
      ) {
        phoneId = resWaba.json.phone_numbers.data[0].id
      }
    } catch (_) {}
  }

  if (!phoneId) {
    msgRecord.set('status', 'failed')
    msgRecord.set('error_details', 'Phone Number ID não encontrado ou não informado.')
    $app.save(msgRecord)

    return e.json(400, {
      success: false,
      status: 'failed',
      messageId: msgRecord.id,
      error:
        'Phone Number ID do WhatsApp não encontrado. Configure META_PHONE_NUMBER_ID no painel.',
    })
  }

  // Build Meta Cloud API payload
  let metaPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
  }

  if (messageType === 'template') {
    metaPayload.type = 'template'
    metaPayload.template = {
      name: templateName,
      language: { code: 'pt_BR' },
    }
    if (templateParams && templateParams.length > 0) {
      metaPayload.template.components = [
        {
          type: 'body',
          parameters: templateParams.map((p) => ({ type: 'text', text: String(p) })),
        },
      ]
    }
  } else {
    metaPayload.type = 'text'
    metaPayload.text = {
      preview_url: false,
      body: messageBodyContent,
    }
  }

  try {
    const metaRes = $http.send({
      url: 'https://graph.facebook.com/v21.0/' + encodeURIComponent(phoneId) + '/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
      body: JSON.stringify(metaPayload),
      timeout: 15,
    })

    const resJson = metaRes.json || {}

    if (metaRes.statusCode >= 200 && metaRes.statusCode < 300) {
      const waMsgId = resJson.messages && resJson.messages[0] ? resJson.messages[0].id : ''
      msgRecord.set('status', 'sent')
      msgRecord.set('whatsapp_message_id', waMsgId)
      msgRecord.set('sent_at', new Date().toISOString())
      $app.save(msgRecord)

      return e.json(200, {
        success: true,
        status: 'sent',
        messageId: msgRecord.id,
        whatsappMessageId: waMsgId,
        metaResponse: resJson,
      })
    } else {
      const errDetails = resJson.error ? resJson.error.message : 'HTTP ' + metaRes.statusCode
      msgRecord.set('status', 'failed')
      msgRecord.set('error_details', errDetails)
      $app.save(msgRecord)

      return e.json(metaRes.statusCode, {
        success: false,
        status: 'failed',
        messageId: msgRecord.id,
        error: errDetails,
        metaError: resJson.error,
      })
    }
  } catch (netErr) {
    msgRecord.set('status', 'failed')
    msgRecord.set('error_details', netErr.message)
    $app.save(msgRecord)

    return e.json(502, {
      success: false,
      status: 'failed',
      messageId: msgRecord.id,
      error: 'Erro de comunicação ao enviar para a WhatsApp Cloud API: ' + netErr.message,
    })
  }
})
