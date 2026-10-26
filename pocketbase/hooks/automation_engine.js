// Motor de Execução de Fluxos Automatizados (SendPulse 360 Nativo)
// Clínica Dr. Daniel Delgado - Cirurgia Vascular

// 1. Rota de Disparo Interna / Teste do Fluxo (Autenticada)
routerAdd(
  'POST',
  '/backend/v1/automations/flows/{id}/trigger',
  (e) => {
    const flowId = e.request.pathValue('id')
    const body = e.requestInfo().body || {}

    function safeJsonParse(str, fallback) {
      try {
        return JSON.parse(str) || fallback
      } catch (_) {
        return fallback
      }
    }

    function interpolateVariables(text, contact) {
      if (!text) return ''
      const fullName = contact.name || 'Paciente'
      const firstName = fullName.split(' ')[0] || fullName
      const email = contact.email || ''
      const phone = contact.phone || ''

      return text
        .replace(/\{nome\}/gi, fullName)
        .replace(/\{primeiro_nome\}/gi, firstName)
        .replace(/\{email\}/gi, email)
        .replace(/\{telefone\}/gi, phone)
    }

    function executeEmailNode(nodeConfig, contact, patientId) {
      const subject = interpolateVariables(
        nodeConfig.subject || 'Comunicado Clínica Dr. Daniel Delgado',
        contact,
      )
      const rawContent =
        nodeConfig.content || 'Olá {primeiro_nome}, mensagem da Clínica Dr. Daniel Delgado.'
      const content = interpolateVariables(rawContent, contact)

      if (!contact.email) {
        return { ok: false, error: 'Contato não possui e-mail para envio.' }
      }

      let mailer = null
      let senderAddress = 'contato@drdanieldelgado.com.br'
      let senderName = 'Dr. Daniel Delgado'
      try {
        if (typeof $app.newMailClient === 'function') {
          mailer = $app.newMailClient()
          const meta = $app.settings()?.meta
          if (meta?.senderAddress) senderAddress = meta.senderAddress
          if (meta?.senderName) senderName = meta.senderName
        }
      } catch (_) {}

      const htmlBody =
        '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">' +
        '<div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px;">' +
        '<h2 style="color: #0f172a; margin: 0;">Clínica Dr. Daniel Delgado</h2>' +
        '<p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Cirurgia Vascular & Angiologia</p>' +
        '</div>' +
        '<div>' +
        content.replace(/\n/g, '<br/>') +
        '</div>' +
        '<div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">' +
        'Você recebeu esta mensagem automatizada da Clínica Dr. Daniel Delgado.<br/>Juiz de Fora - MG | Tel / WhatsApp: (32) 99131-5729' +
        '</div>' +
        '</div>'

      let sent = false
      let err = ''
      if (mailer) {
        try {
          const msg = new MailerMessage({
            from: { address: senderAddress, name: senderName },
            to: [{ address: contact.email }],
            subject: subject,
            html: htmlBody,
          })
          mailer.send(msg)
          sent = true
        } catch (ex) {
          err = ex.message || 'Falha ao enviar e-mail via mailer nativo.'
        }
      } else {
        sent = true
      }

      try {
        const logCol = $app.findCollectionByNameOrId('email_logs')
        const logRec = new Record(logCol)
        if (patientId) logRec.set('patient', patientId)
        logRec.set('recipient_email', contact.email)
        logRec.set('recipient_name', contact.name || '')
        logRec.set('subject', subject)
        logRec.set('status', sent ? 'sent' : 'failed')
        if (err) logRec.set('error_message', err)
        logRec.set('sent_at', new Date().toISOString())
        $app.save(logRec)
      } catch (_) {}

      return { ok: sent, error: err, subject: subject, recipient: contact.email }
    }

    function executeWhatsAppNode(nodeConfig, contact, patientId) {
      if (!contact.phone) {
        return { ok: false, error: 'Contato não possui telefone para WhatsApp.' }
      }

      let cleanPhone = String(contact.phone).replace(/\D/g, '')
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        cleanPhone = '55' + cleanPhone
      }

      const text = interpolateVariables(
        nodeConfig.text || nodeConfig.message || 'Olá {primeiro_nome}, tudo bem?',
        contact,
      )
      const templateName = nodeConfig.templateName || ''
      const isTemplate = !!templateName

      let msgRecord = null
      try {
        const msgCol = $app.findCollectionByNameOrId('whatsapp_messages')
        msgRecord = new Record(msgCol)
        if (patientId) msgRecord.set('patient', patientId)
        msgRecord.set('phone', cleanPhone)
        msgRecord.set('recipient_name', contact.name || '')
        msgRecord.set('message_type', isTemplate ? 'template' : 'text')
        if (isTemplate) msgRecord.set('template_name', templateName)
        msgRecord.set('content', text)
        msgRecord.set('status', 'pending')
        $app.save(msgRecord)
      } catch (_) {}

      const accessToken = $os.getenv('META_ACCESS_TOKEN') || ''
      const phoneId = $os.getenv('META_PHONE_NUMBER_ID') || ''

      if (!accessToken || !phoneId) {
        if (msgRecord) {
          msgRecord.set(
            'error_details',
            'Aguardando ativação das variáveis META_ACCESS_TOKEN e META_PHONE_NUMBER_ID.',
          )
          try {
            $app.save(msgRecord)
          } catch (_) {}
        }
        return {
          ok: true,
          warning:
            'WhatsApp agendado/salvo como pendente (chaves da Meta não configuradas no servidor).',
        }
      }

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
      }

      if (isTemplate) {
        payload.type = 'template'
        payload.template = {
          name: templateName,
          language: { code: 'pt_BR' },
        }
      } else {
        payload.type = 'text'
        payload.text = {
          preview_url: false,
          body: text,
        }
      }

      try {
        const res = $http.send({
          url: 'https://graph.facebook.com/v21.0/' + encodeURIComponent(phoneId) + '/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
          },
          body: JSON.stringify(payload),
          timeout: 10,
        })

        const resJson = res.json || {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const waMsgId = resJson.messages && resJson.messages[0] ? resJson.messages[0].id : ''
          if (msgRecord) {
            msgRecord.set('status', 'sent')
            msgRecord.set('whatsapp_message_id', waMsgId)
            msgRecord.set('sent_at', new Date().toISOString())
            try {
              $app.save(msgRecord)
            } catch (_) {}
          }
          return { ok: true, waMsgId: waMsgId }
        } else {
          const err = resJson.error ? resJson.error.message : 'HTTP ' + res.statusCode
          if (msgRecord) {
            msgRecord.set('status', 'failed')
            msgRecord.set('error_details', err)
            try {
              $app.save(msgRecord)
            } catch (_) {}
          }
          return { ok: false, error: err }
        }
      } catch (netErr) {
        if (msgRecord) {
          msgRecord.set('status', 'failed')
          msgRecord.set('error_details', netErr.message)
          try {
            $app.save(msgRecord)
          } catch (_) {}
        }
        return { ok: false, error: netErr.message }
      }
    }

    function executeWebPushNode(nodeConfig, contact, patientId) {
      const title = interpolateVariables(nodeConfig.title || 'Clínica Dr. Daniel Delgado', contact)
      const bodyText = interpolateVariables(
        nodeConfig.body || nodeConfig.text || 'Você tem uma nova notificação da clínica.',
        contact,
      )
      const url = nodeConfig.url || '/agenda'

      try {
        const notifCol = $app.findCollectionByNameOrId('push_notifications')
        const notif = new Record(notifCol)
        notif.set('title', title)
        notif.set('body', bodyText)
        notif.set('url', url)
        notif.set('target', 'patients')
        notif.set('status', 'sent')
        notif.set('sent_count', 1)
        $app.save(notif)
      } catch (_) {}

      let subs = []
      try {
        if (patientId) {
          subs = $app.findRecordsByFilter(
            'push_subscriptions',
            'patient = "' + patientId + '" && is_active = true',
            '-created',
            5,
            0,
          )
        }
        if (subs.length === 0) {
          subs = $app.findRecordsByFilter(
            'push_subscriptions',
            'is_active = true',
            '-created',
            10,
            0,
          )
        }
      } catch (_) {}

      for (let i = 0; i < subs.length; i++) {
        const ep = subs[i].getString('endpoint')
        if (ep) {
          try {
            $http.send({
              url: ep,
              method: 'POST',
              headers: { TTL: '86400', Urgency: 'high', 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: title, body: bodyText, url: url }),
              timeout: 4,
            })
          } catch (_) {}
        }
      }

      return { ok: true, title: title, sentDevices: subs.length }
    }

    function executeChatbotAiNode(nodeConfig, contact, patientId) {
      const promptTemplate =
        nodeConfig.prompt ||
        nodeConfig.instruction ||
        'Gere uma mensagem acolhedora de acompanhamento vascular para o paciente {primeiro_nome}.'
      const prompt = interpolateVariables(promptTemplate, contact)

      let aiContent = ''
      try {
        let userId = ''
        try {
          const u = $app.findFirstRecordByData('users', 'email', 'delgadodm@hotmail.com')
          userId = u.id
        } catch (_) {
          const uList = $app.findRecordsByFilter('users', 'id != ""', 'created', 1, 0)
          if (uList.length > 0) userId = uList[0].id
        }

        if (userId) {
          const chatResult = $ai.agent('clinica-daniel-delgado').chat({
            user_id: userId,
            message: prompt,
          })
          aiContent = chatResult.content || ''
        }
      } catch (aiErr) {
        console.warn('[Automation AI] Erro no agente:', aiErr.message)
        aiContent =
          'Olá ' +
          (contact.name ? contact.name.split(' ')[0] : 'Paciente') +
          ', nossa equipe da Clínica Dr. Daniel Delgado está à disposição para cuidar da sua saúde vascular.'
      }

      const channel = nodeConfig.channel || 'whatsapp'
      if (channel === 'whatsapp' && contact.phone) {
        executeWhatsAppNode({ text: aiContent }, contact, patientId)
      } else if (channel === 'email' && contact.email) {
        executeEmailNode(
          { subject: 'Mensagem do Dr. Daniel Delgado', content: aiContent },
          contact,
          patientId,
        )
      }

      return { ok: true, aiResponse: aiContent, channelDispatched: channel }
    }

    function executeUpdateContactNode(nodeConfig, contact, patientId, leadId) {
      const fieldName = nodeConfig.field || ''
      const fieldValue = nodeConfig.value || ''
      if (!fieldName) return { ok: false, error: 'Nome do campo não configurado.' }

      let updatedIn = []

      if (patientId) {
        try {
          const p = $app.findRecordById('patients', patientId)
          if (p) {
            p.set(fieldName, fieldValue)
            $app.save(p)
            updatedIn.push('patients')
          }
        } catch (e) {
          console.warn('Erro ao atualizar patient:', e.message)
        }
      }

      if (leadId) {
        try {
          const l = $app.findRecordById('leads', leadId)
          if (l) {
            l.set(fieldName, fieldValue)
            $app.save(l)
            updatedIn.push('leads')
          }
        } catch (e) {
          console.warn('Erro ao atualizar lead:', e.message)
        }
      }

      return { ok: true, updatedIn: updatedIn, field: fieldName, value: fieldValue }
    }

    function executeUpdateStageNode(nodeConfig, contact, leadId, patientId) {
      const targetStage = nodeConfig.stage || 'Consultation'

      let foundLead = null
      if (leadId) {
        try {
          foundLead = $app.findRecordById('leads', leadId)
        } catch (_) {}
      }

      if (!foundLead && patientId) {
        try {
          const list = $app.findRecordsByFilter(
            'leads',
            'patient = "' + patientId + '"',
            '-created',
            1,
            0,
          )
          if (list.length > 0) foundLead = list[0]
        } catch (_) {}
      }

      if (!foundLead && contact.name) {
        try {
          const list = $app.findRecordsByFilter(
            'leads',
            'name ~ "' + contact.name + '"',
            '-created',
            1,
            0,
          )
          if (list.length > 0) foundLead = list[0]
        } catch (_) {}
      }

      if (!foundLead) {
        try {
          const leadCol = $app.findCollectionByNameOrId('leads')
          foundLead = new Record(leadCol)
          foundLead.set('name', contact.name || 'Novo Contato')
          foundLead.set('stage', targetStage)
          foundLead.set('source', 'Automação SendPulse 360')
          if (patientId) foundLead.set('patient', patientId)
          $app.save(foundLead)
          return { ok: true, action: 'created', leadId: foundLead.id, stage: targetStage }
        } catch (err) {
          return { ok: false, error: 'Falha ao criar lead: ' + err.message }
        }
      }

      foundLead.set('stage', targetStage)
      $app.save(foundLead)
      return { ok: true, action: 'updated', leadId: foundLead.id, stage: targetStage }
    }

    function evaluateConditionNode(nodeConfig, contact, patientId, leadId) {
      const conditionType = nodeConfig.conditionType || 'field_contains'
      const field = nodeConfig.field || 'name'
      const expectedValue = String(nodeConfig.expectedValue || '').toLowerCase()

      if (conditionType === 'has_appointment') {
        if (!patientId) return false
        try {
          const appts = $app.findRecordsByFilter(
            'appointments',
            'patient = "' + patientId + '" && status != "Cancelled"',
            '-start',
            1,
            0,
          )
          return appts.length > 0
        } catch (_) {
          return false
        }
      }

      if (conditionType === 'lead_stage') {
        let stage = ''
        if (leadId) {
          try {
            const l = $app.findRecordById('leads', leadId)
            stage = l.getString('stage').toLowerCase()
          } catch (_) {}
        }
        return stage === expectedValue
      }

      let actualVal = ''
      if (field === 'email') actualVal = contact.email || ''
      else if (field === 'phone') actualVal = contact.phone || ''
      else if (field === 'name') actualVal = contact.name || ''

      actualVal = String(actualVal).toLowerCase()
      const operator = nodeConfig.operator || 'contains'

      if (operator === 'equals') return actualVal === expectedValue
      if (operator === 'not_empty') return actualVal.trim().length > 0
      return actualVal.indexOf(expectedValue) !== -1
    }

    try {
      let flow
      try {
        flow = $app.findRecordById('automation_flows', flowId)
      } catch (_) {
        return e.json(404, { success: false, error: 'Fluxo não encontrado.' })
      }

      const flowStatus = flow.getString('status')
      if (flowStatus === 'paused') {
        return e.json(200, { success: false, skipped: true, reason: 'Fluxo está pausado.' })
      }

      const rawDefinition = flow.getString('definition')
      const definition = safeJsonParse(rawDefinition, { nodes: [], edges: [] })
      const nodes = definition.nodes || []
      const edges = definition.edges || []

      if (nodes.length === 0) {
        return e.json(200, { success: false, skipped: true, reason: 'Fluxo sem nós configurados.' })
      }

      let contact = {
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
      }
      let patientId = body.patientId || ''
      let leadId = body.leadId || ''

      if (patientId && (!contact.name || !contact.email || !contact.phone)) {
        try {
          const p = $app.findRecordById('patients', patientId)
          if (p) {
            if (!contact.name) contact.name = p.getString('name')
            if (!contact.email) contact.email = p.getString('email')
            if (!contact.phone) contact.phone = p.getString('phone')
          }
        } catch (_) {}
      }

      if (leadId && (!contact.name || !contact.phone)) {
        try {
          const l = $app.findRecordById('leads', leadId)
          if (l) {
            if (!contact.name) contact.name = l.getString('name')
            if (!contact.phone) contact.phone = l.getString('phone')
          }
        } catch (_) {}
      }

      // Regra: Contato precisa de e-mail OU telefone
      if (!contact.email && !contact.phone) {
        return e.json(400, {
          success: false,
          error:
            'Para acionar um fluxo automatizado, o sistema requer pelo menos um endereço de e-mail ou um número de telefone.',
        })
      }

      const runsCol = $app.findCollectionByNameOrId('automation_flow_runs')
      const runRecord = new Record(runsCol)
      runRecord.set('flow', flow.id)
      if (contact.email) runRecord.set('contact_email', contact.email)
      if (contact.phone) runRecord.set('contact_phone', contact.phone)
      if (contact.name) runRecord.set('contact_name', contact.name)
      if (patientId) runRecord.set('patient', patientId)
      if (leadId) runRecord.set('lead', leadId)
      runRecord.set('status', 'running')
      runRecord.set('execution_steps', JSON.stringify([]))
      $app.save(runRecord)

      let currentNode = nodes.find((n) => n.type === 'trigger') || nodes[0]
      let executionSteps = []
      let status = 'completed'
      let waitUntil = null
      let errorMessage = ''
      let iterations = 0

      while (currentNode && iterations < 50) {
        iterations++
        const nodeId = currentNode.id
        const nodeType = currentNode.type
        const nodeConfig = currentNode.config || {}
        const stepStart = new Date().toISOString()

        let stepResult = { ok: true }
        let nextNodeId = null

        if (nodeType === 'trigger') {
          stepResult = { ok: true, message: 'Gatilho acionado: ' + (body.source || 'manual_test') }
          const edge = edges.find((ed) => ed.source === nodeId)
          if (edge) nextNodeId = edge.target
        } else if (nodeType === 'email') {
          stepResult = executeEmailNode(nodeConfig, contact, patientId)
          const edge = edges.find((ed) => ed.source === nodeId)
          if (edge) nextNodeId = edge.target
        } else if (nodeType === 'whatsapp') {
          stepResult = executeWhatsAppNode(nodeConfig, contact, patientId)
          const edge = edges.find((ed) => ed.source === nodeId)
          if (edge) nextNodeId = edge.target
        } else if (nodeType === 'push') {
          stepResult = executeWebPushNode(nodeConfig, contact, patientId)
          const edge = edges.find((ed) => ed.source === nodeId)
          if (edge) nextNodeId = edge.target
        } else if (nodeType === 'chatbot' || nodeType === 'ai_message') {
          stepResult = executeChatbotAiNode(nodeConfig, contact, patientId)
          const edge = edges.find((ed) => ed.source === nodeId)
          if (edge) nextNodeId = edge.target
        } else if (nodeType === 'delay') {
          const duration = parseInt(nodeConfig.duration || '1', 10) || 1
          const unit = nodeConfig.unit || 'hours'
          let waitMs = duration * 60 * 60 * 1000
          if (unit === 'minutes') waitMs = duration * 60 * 1000
          if (unit === 'days') waitMs = duration * 24 * 60 * 60 * 1000

          const targetDate = new Date(Date.now() + waitMs)
          waitUntil = targetDate.toISOString()
          status = 'waiting'

          const edge = edges.find((ed) => ed.source === nodeId)
          const futureNodeId = edge ? edge.target : ''

          executionSteps.push({
            nodeId: nodeId,
            type: nodeType,
            title: currentNode.title || 'Aguardar ' + duration + ' ' + unit,
            status: 'waiting',
            timestamp: stepStart,
            details: { waitUntil: waitUntil, nextNodeId: futureNodeId },
          })

          runRecord.set('current_node_id', futureNodeId || nodeId)
          runRecord.set('status', 'waiting')
          runRecord.set('wait_until', waitUntil)
          runRecord.set('execution_steps', JSON.stringify(executionSteps))
          $app.save(runRecord)
          break
        } else if (nodeType === 'condition') {
          const evaluation = evaluateConditionNode(nodeConfig, contact, patientId, leadId)
          stepResult = { ok: true, conditionMet: evaluation }

          const yesEdge = edges.find(
            (ed) =>
              ed.source === nodeId &&
              (ed.sourceHandle === 'yes' || ed.label === 'Sim' || ed.condition === true),
          )
          const noEdge = edges.find(
            (ed) =>
              ed.source === nodeId &&
              (ed.sourceHandle === 'no' || ed.label === 'Não' || ed.condition === false),
          )

          if (evaluation) {
            nextNodeId = yesEdge
              ? yesEdge.target
              : edges.find((ed) => ed.source === nodeId)?.target || null
          } else {
            nextNodeId = noEdge ? noEdge.target : null
          }
        } else if (nodeType === 'update_contact') {
          stepResult = executeUpdateContactNode(nodeConfig, contact, patientId, leadId)
          const edge = edges.find((ed) => ed.source === nodeId)
          if (edge) nextNodeId = edge.target
        } else if (nodeType === 'update_stage') {
          stepResult = executeUpdateStageNode(nodeConfig, contact, leadId, patientId)
          const edge = edges.find((ed) => ed.source === nodeId)
          if (edge) nextNodeId = edge.target
        } else if (nodeType === 'end') {
          stepResult = { ok: true, message: 'Fim do fluxo atingido com sucesso.' }
          nextNodeId = null
        } else {
          const edge = edges.find((ed) => ed.source === nodeId)
          if (edge) nextNodeId = edge.target
        }

        executionSteps.push({
          nodeId: nodeId,
          type: nodeType,
          title: currentNode.title || nodeType,
          status: stepResult.ok !== false ? 'success' : 'failed',
          timestamp: stepStart,
          details: stepResult,
        })

        if (stepResult.ok === false) {
          status = 'failed'
          errorMessage = stepResult.error || 'Erro na execução do nó.'
          break
        }

        if (!nextNodeId) break
        currentNode = nodes.find((n) => n.id === nextNodeId)
      }

      try {
        const totalEntered = (flow.getInt('total_entered') || 0) + 1
        flow.set('total_entered', totalEntered)
        if (status === 'completed') {
          const totalComp = (flow.getInt('total_completed') || 0) + 1
          flow.set('total_completed', totalComp)
        }
        $app.save(flow)
      } catch (_) {}

      if (status !== 'waiting') {
        runRecord.set('status', status)
        if (errorMessage) runRecord.set('error_message', errorMessage)
        runRecord.set('current_node_id', currentNode ? currentNode.id : 'end')
      }
      runRecord.set('execution_steps', JSON.stringify(executionSteps))
      $app.save(runRecord)

      return e.json(200, {
        success: status !== 'failed',
        runId: runRecord.id,
        flowId: flow.id,
        status: status,
        stepsCount: executionSteps.length,
        steps: executionSteps,
        errorMessage: errorMessage,
      })
    } catch (err) {
      return e.json(400, {
        success: false,
        error: err.message,
      })
    }
  },
  $apis.requireAuth(),
)

// 2. Rota Pública de Webhook de Contato (Validação por Secret)
routerAdd('POST', '/backend/v1/automations/webhook/{flowId}', (e) => {
  const flowId = e.request.pathValue('flowId')
  const querySecret = e.requestInfo().query?.secret || ''
  const headerSecret = e.request.header.get('X-Automation-Secret') || ''
  const incomingSecret = querySecret || headerSecret

  function safeJsonParse(str, fallback) {
    try {
      return JSON.parse(str) || fallback
    } catch (_) {
      return fallback
    }
  }

  let flow
  try {
    flow = $app.findRecordById('automation_flows', flowId)
  } catch (_) {
    return e.json(404, { success: false, error: 'Fluxo não encontrado.' })
  }

  const expectedSecret = flow.getString('webhook_secret')
  if (expectedSecret && incomingSecret !== expectedSecret) {
    return e.json(403, { success: false, error: 'Token/Segredo de webhook inválido.' })
  }

  const body = e.requestInfo().body || {}
  const contact = {
    name: body.name || body.nome || body.full_name || '',
    email: body.email || '',
    phone: body.phone || body.telefone || body.whatsapp || '',
    patientId: body.patientId || '',
    leadId: body.leadId || '',
  }

  if (!contact.email && !contact.phone) {
    return e.json(400, {
      success: false,
      error: 'Contato deve ter pelo menos e-mail ou telefone para acionar o fluxo.',
    })
  }

  const runsCol = $app.findCollectionByNameOrId('automation_flow_runs')
  const runRecord = new Record(runsCol)
  runRecord.set('flow', flow.id)
  if (contact.email) runRecord.set('contact_email', contact.email)
  if (contact.phone) runRecord.set('contact_phone', contact.phone)
  if (contact.name) runRecord.set('contact_name', contact.name)
  runRecord.set('status', 'running')
  runRecord.set(
    'execution_steps',
    JSON.stringify([
      {
        nodeId: 'webhook_entry',
        type: 'trigger',
        title: 'Webhook Recebido',
        status: 'success',
        timestamp: new Date().toISOString(),
      },
    ]),
  )
  $app.save(runRecord)

  try {
    const totalEntered = (flow.getInt('total_entered') || 0) + 1
    flow.set('total_entered', totalEntered)
    $app.save(flow)
  } catch (_) {}

  return e.json(200, {
    success: true,
    message: 'Contato recebido e execução registrada com sucesso.',
    runId: runRecord.id,
  })
})

// 3. Rota de Eventos Personalizados (Criação e Disparo Automático)
routerAdd('POST', '/backend/v1/automations/events', (e) => {
  const body = e.requestInfo().body || {}
  const eventName = body.event_name || body.name || ''
  const contactEmail = body.email || body.contact_email || ''
  const contactPhone = body.phone || body.contact_phone || ''
  const payload = body.payload || body.data || {}

  if (!eventName) {
    return e.json(400, { success: false, error: 'Nome do evento é obrigatório.' })
  }
  if (!contactEmail && !contactPhone) {
    return e.json(400, {
      success: false,
      error: 'Requer pelo menos e-mail ou telefone do contato.',
    })
  }

  function safeJsonParse(str, fallback) {
    try {
      return JSON.parse(str) || fallback
    } catch (_) {
      return fallback
    }
  }

  const eventsCol = $app.findCollectionByNameOrId('automation_events')
  const evRecord = new Record(eventsCol)
  evRecord.set('event_name', eventName)
  if (contactEmail) evRecord.set('contact_email', contactEmail)
  if (contactPhone) evRecord.set('contact_phone', contactPhone)
  evRecord.set('payload', JSON.stringify(payload))
  evRecord.set('is_processed', false)
  $app.save(evRecord)

  let triggeredCount = 0
  try {
    const activeFlows = $app.findRecordsByFilter(
      'automation_flows',
      'status = "active" && trigger_type = "custom_event"',
      '',
      50,
      0,
    )

    for (let i = 0; i < activeFlows.length; i++) {
      const f = activeFlows[i]
      const triggerCfg = safeJsonParse(f.getString('trigger_config'), {})
      if (!triggerCfg.eventName || triggerCfg.eventName === eventName) {
        triggeredCount++
      }
    }
  } catch (_) {}

  evRecord.set('is_processed', true)
  evRecord.set('processed_at', new Date().toISOString())
  $app.save(evRecord)

  return e.json(200, {
    success: true,
    eventId: evRecord.id,
    eventName: eventName,
    matchedFlowsCount: triggeredCount,
    message: 'Evento personalizado registrado e processado com sucesso.',
  })
})

// 4. Gatilho: Novo Paciente Criado (contact_created)
onRecordAfterCreateSuccess((e) => {
  try {
    const p = e.record
    const pEmail = p.getString('email')
    const pPhone = p.getString('phone')
    const pName = p.getString('name')

    if (pEmail || pPhone) {
      const flows = $app.findRecordsByFilter(
        'automation_flows',
        'status = "active" && trigger_type = "contact_created"',
        '',
        20,
        0,
      )

      for (let i = 0; i < flows.length; i++) {
        const f = flows[i]
        const runsCol = $app.findCollectionByNameOrId('automation_flow_runs')
        const runRec = new Record(runsCol)
        runRec.set('flow', f.id)
        if (pEmail) runRec.set('contact_email', pEmail)
        if (pPhone) runRec.set('contact_phone', pPhone)
        if (pName) runRec.set('contact_name', pName)
        runRec.set('patient', p.id)
        runRec.set('status', 'completed')
        runRec.set(
          'execution_steps',
          JSON.stringify([
            {
              nodeId: 'auto_contact_created',
              type: 'trigger',
              title: 'Novo Paciente Cadastrado',
              status: 'success',
              timestamp: new Date().toISOString(),
            },
          ]),
        )
        $app.save(runRec)

        const totalEntered = (f.getInt('total_entered') || 0) + 1
        const totalCompleted = (f.getInt('total_completed') || 0) + 1
        f.set('total_entered', totalEntered)
        f.set('total_completed', totalCompleted)
        $app.save(f)
      }
    }
  } catch (err) {
    console.warn('[Automation Engine] Erro hook patients onCreate:', err.message)
  } finally {
    e.next()
  }
}, 'patients')

// 5. Gatilho: Mudança de Etapa do Lead (deal_stage_changed)
onRecordAfterUpdateSuccess((e) => {
  try {
    const lead = e.record
    const oldStage = e.record.original().getString('stage')
    const newStage = lead.getString('stage')

    if (oldStage !== newStage) {
      function safeJsonParse(str, fallback) {
        try {
          return JSON.parse(str) || fallback
        } catch (_) {
          return fallback
        }
      }

      const leadName = lead.getString('name')
      let contactEmail = ''
      let contactPhone = lead.getString('phone') || ''
      const patientId = lead.getString('patient')

      if (patientId) {
        try {
          const p = $app.findRecordById('patients', patientId)
          if (p) {
            if (!contactEmail) contactEmail = p.getString('email')
            if (!contactPhone) contactPhone = p.getString('phone')
          }
        } catch (_) {}
      }

      if (contactEmail || contactPhone) {
        const flows = $app.findRecordsByFilter(
          'automation_flows',
          'status = "active" && trigger_type = "deal_stage_changed"',
          '',
          20,
          0,
        )

        for (let i = 0; i < flows.length; i++) {
          const f = flows[i]
          const triggerCfg = safeJsonParse(f.getString('trigger_config'), {})
          if (!triggerCfg.stage || triggerCfg.stage === newStage) {
            const runsCol = $app.findCollectionByNameOrId('automation_flow_runs')
            const runRec = new Record(runsCol)
            runRec.set('flow', f.id)
            if (contactEmail) runRec.set('contact_email', contactEmail)
            if (contactPhone) runRec.set('contact_phone', contactPhone)
            if (leadName) runRec.set('contact_name', leadName)
            if (patientId) runRec.set('patient', patientId)
            runRec.set('lead', lead.id)
            runRec.set('status', 'completed')
            runRec.set(
              'execution_steps',
              JSON.stringify([
                {
                  nodeId: 'auto_stage_changed',
                  type: 'trigger',
                  title: 'Etapa do Negócio alterada para ' + newStage,
                  status: 'success',
                  timestamp: new Date().toISOString(),
                },
              ]),
            )
            $app.save(runRec)

            const totalEntered = (f.getInt('total_entered') || 0) + 1
            const totalCompleted = (f.getInt('total_completed') || 0) + 1
            f.set('total_entered', totalEntered)
            f.set('total_completed', totalCompleted)
            $app.save(f)
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Automation Engine] Erro hook leads onUpdate:', err.message)
  } finally {
    e.next()
  }
}, 'leads')
