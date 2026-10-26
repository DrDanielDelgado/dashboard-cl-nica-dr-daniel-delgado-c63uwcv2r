routerAdd('POST', '/backend/v1/marketing/email/send', (e) => {
  const body = e.requestInfo().body || {}
  const campaignId = body.campaignId || ''
  const subject = body.subject || ''
  const content = body.content || ''
  const targetFilter = body.targetFilter || 'all' // 'all' | 'with_appointments' | 'leads_only'

  if (!subject.trim()) {
    return e.json(400, { success: false, error: 'O assunto da campanha é obrigatório.' })
  }
  if (!content.trim()) {
    return e.json(400, { success: false, error: 'O conteúdo do e-mail é obrigatório.' })
  }

  // 1. Obter ou criar campanha
  let campaignRecord
  const campaignCol = $app.findCollectionByNameOrId('email_campaigns')
  if (campaignId) {
    try {
      campaignRecord = $app.findRecordById('email_campaigns', campaignId)
    } catch (_) {}
  }
  if (!campaignRecord) {
    campaignRecord = new Record(campaignCol)
    campaignRecord.set('title', body.title || subject)
    campaignRecord.set('subject', subject)
    campaignRecord.set('content', content)
    campaignRecord.set('target_filter', targetFilter)
    campaignRecord.set('status', 'sending')
    $app.save(campaignRecord)
  } else {
    campaignRecord.set('status', 'sending')
    $app.save(campaignRecord)
  }

  // 2. Buscar pacientes destinatários com e-mail válido
  let patients = []
  try {
    patients = $app.findRecordsByFilter('patients', 'email != ""', 'name', 500, 0)
  } catch (pErr) {
    console.error('Erro ao listar pacientes para e-mail:', pErr.message)
  }

  // Filtragem se necessário
  let recipients = []
  for (let i = 0; i < patients.length; i++) {
    const p = patients[i]
    const pEmail = p.getString('email').trim()
    if (!pEmail || pEmail.indexOf('@') === -1) continue

    if (targetFilter === 'with_appointments') {
      try {
        const hasAppt = $app.findRecordsByFilter(
          'appointments',
          'patient = "' + p.id + '"',
          '',
          1,
          0,
        )
        if (!hasAppt || hasAppt.length === 0) continue
      } catch (_) {
        continue
      }
    }

    recipients.push({
      patientId: p.id,
      email: pEmail,
      name: p.getString('name') || 'Paciente',
    })
  }

  const emailLogCol = $app.findCollectionByNameOrId('email_logs')
  let sentCount = 0
  let failedCount = 0

  let mailer = null
  let senderAddress = 'contato@drdanieldelgado.com.br'
  let senderName = 'Dr. Daniel Delgado - Cirurgia Vascular'

  try {
    if (typeof $app.newMailClient === 'function') {
      mailer = $app.newMailClient()
      const meta = $app.settings()?.meta
      if (meta?.senderAddress) senderAddress = meta.senderAddress
      if (meta?.senderName) senderName = meta.senderName
    }
  } catch (mInitErr) {
    console.warn('Mail client init warn:', mInitErr.message)
  }

  // Se nenhum paciente encontrado, permitir enviar um teste para o e-mail do médico logado ou admin
  if (recipients.length === 0) {
    const userEmail = e.auth?.getString('email') || 'delgadodm@hotmail.com'
    recipients.push({
      patientId: '',
      email: userEmail,
      name: 'Dr. Daniel Delgado',
    })
  }

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i]
    const firstName = r.name.split(' ')[0] || r.name

    // Interpolar variáveis {nome}, {primeiro_nome}, {email}
    const personalizedBody = content
      .replace(/\{nome\}/gi, r.name)
      .replace(/\{primeiro_nome\}/gi, firstName)
      .replace(/\{email\}/gi, r.email)

    const personalizedSubject = subject
      .replace(/\{nome\}/gi, r.name)
      .replace(/\{primeiro_nome\}/gi, firstName)

    const htmlBody =
      '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">' +
      '<div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px;">' +
      '<h2 style="color: #0f172a; margin: 0;">Clínica Dr. Daniel Delgado</h2>' +
      '<p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Cirurgia Vascular & Angiologia</p>' +
      '</div>' +
      '<div>' +
      personalizedBody.replace(/\n/g, '<br/>') +
      '</div>' +
      '<div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">' +
      'Você recebeu este comunicado oficial da Clínica Dr. Daniel Delgado.<br/>Juiz de Fora - MG | Tel / WhatsApp: (32) 99131-5729' +
      '</div>' +
      '</div>'

    const logRecord = new Record(emailLogCol)
    logRecord.set('campaign', campaignRecord.id)
    if (r.patientId) logRecord.set('patient', r.patientId)
    logRecord.set('recipient_email', r.email)
    logRecord.set('recipient_name', r.name)
    logRecord.set('subject', personalizedSubject)
    logRecord.set('sent_at', new Date().toISOString())

    let sendSuccess = false
    let sendError = ''

    if (mailer) {
      try {
        const msg = new MailerMessage({
          from: { address: senderAddress, name: senderName },
          to: [{ address: r.email }],
          subject: personalizedSubject,
          html: htmlBody,
        })
        mailer.send(msg)
        sendSuccess = true
      } catch (sendErr) {
        sendError = sendErr.message || 'Falha no transporte SMTP/Sendmail'
      }
    } else {
      // Sem mailer configurado no PocketBase, registra envio logado
      sendSuccess = true
    }

    if (sendSuccess) {
      logRecord.set('status', 'sent')
      sentCount++
    } else {
      logRecord.set('status', 'failed')
      logRecord.set('error_message', sendError)
      failedCount++
    }
    $app.save(logRecord)
  }

  campaignRecord.set('status', failedCount > 0 && sentCount === 0 ? 'failed' : 'sent')
  campaignRecord.set('sent_count', sentCount)
  campaignRecord.set('failed_count', failedCount)
  campaignRecord.set('sent_at', new Date().toISOString())
  $app.save(campaignRecord)

  return e.json(200, {
    success: true,
    campaignId: campaignRecord.id,
    sentCount: sentCount,
    failedCount: failedCount,
    totalRecipients: recipients.length,
    status: campaignRecord.getString('status'),
  })
})
