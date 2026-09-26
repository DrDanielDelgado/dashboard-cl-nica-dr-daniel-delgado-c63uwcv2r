routerAdd('POST', '/backend/v1/meta/webhook', (e) => {
  const body = e.requestInfo().body || {}

  if (body.object !== 'whatsapp_business_account') {
    return e.json(200, { status: 'ignored' })
  }

  const entries = body.entry || []
  for (let i = 0; i < entries.length; i++) {
    const changes = entries[i].changes || []
    for (let j = 0; j < changes.length; j++) {
      const change = changes[j]
      const value = change.value || {}

      // Handle delivery status updates (sent, delivered, read, failed)
      const statuses = value.statuses || []
      for (let s = 0; s < statuses.length; s++) {
        const item = statuses[s]
        const wamid = item.id
        const waStatus = item.status // 'sent' | 'delivered' | 'read' | 'failed'
        const timestamp = item.timestamp
          ? new Date(parseInt(item.timestamp, 10) * 1000).toISOString()
          : new Date().toISOString()

        try {
          const record = $app.findFirstRecordByData(
            'whatsapp_messages',
            'whatsapp_message_id',
            wamid,
          )
          if (record) {
            record.set('status', waStatus)
            if (waStatus === 'sent' && !record.getString('sent_at')) {
              record.set('sent_at', timestamp)
            } else if (waStatus === 'delivered' && !record.getString('delivered_at')) {
              record.set('delivered_at', timestamp)
            } else if (waStatus === 'read') {
              record.set('read_at', timestamp)
            } else if (waStatus === 'failed') {
              const errs = item.errors ? JSON.stringify(item.errors) : 'Delivery failed'
              record.set('error_details', errs)
            }
            $app.save(record)

            // If related to an appointment and status is delivered or read, keep note
            const apptId = record.getString('appointment')
            if (apptId && waStatus === 'delivered') {
              try {
                const appt = $app.findRecordById('appointments', apptId)
                if (appt && appt.getString('status') === 'Scheduled') {
                  // Keep as Scheduled or note delivery
                  $app.save(appt)
                }
              } catch (_) {}
            }
          }
        } catch (_) {}
      }

      // Handle incoming messages / replies from patient (e.g., patient replies "SIM" or confirms)
      const messages = value.messages || []
      for (let m = 0; m < messages.length; m++) {
        const msg = messages[m]
        const from = msg.from // phone e.g. 5532991315729
        const textObj = msg.text || {}
        const textBody = (textObj.body || '').trim().toLowerCase()

        // Check if patient replied "sim", "confirmar", "confirmo", "ok", "com certeza"
        const isConfirming = [
          'sim',
          'confirmo',
          'confirmar',
          'confirmado',
          'ok',
          'certo',
          'sim, confirmo',
          '1',
        ].includes(textBody)
        const isCancelling = ['não', 'nao', 'cancelar', 'cancela', 'desmarcar', '2'].includes(
          textBody,
        )

        if (from && (isConfirming || isCancelling)) {
          // Normalize phone search: check with or without country code 55
          const normalized = from.replace(/\D/g, '')
          const shortNumber = normalized.startsWith('55') ? normalized.substring(2) : normalized

          // Find patient by phone containing shortNumber
          try {
            const patients = $app.findRecordsByFilter(
              'patients',
              'phone ~ {:short}',
              '-created',
              5,
              0,
              { short: shortNumber.slice(-8) },
            )

            for (let pIdx = 0; pIdx < patients.length; pIdx++) {
              const p = patients[pIdx]
              // Find scheduled appointments for this patient
              const appts = $app.findRecordsByFilter(
                'appointments',
                'patient = {:pid} && status = "Scheduled"',
                '-start',
                5,
                0,
                { pid: p.id },
              )

              for (let aIdx = 0; aIdx < appts.length; aIdx++) {
                const appt = appts[aIdx]
                if (isConfirming) {
                  appt.set('status', 'Confirmed')
                  $app.save(appt)
                } else if (isCancelling) {
                  appt.set('status', 'Cancelled')
                  $app.save(appt)
                }
              }
            }
          } catch (_) {}
        }
      }
    }
  }

  return e.json(200, { status: 'success' })
})
