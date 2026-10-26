routerAdd('GET', '/backend/v1/agenda.ics', (e) => {
  const query = e.requestInfo().query || {}
  const token = query['token'] || ''
  const expected = $os.getenv('ICS_TOKEN') || 'ics-clinica-dd-2026'

  if (token !== expected) {
    return e.json(403, { error: 'Token inválido' })
  }

  const toICSDate = (s) => {
    const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/)
    if (!m) return ''
    // O banco grava hora de parede de São Paulo (UTC-3) com sufixo Z.
    // Converte para UTC real (soma 3h) antes de emitir o ICS.
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]))
    d.setUTCHours(d.getUTCHours() + 3)
    const p = (n) => String(n).padStart(2, '0')
    return (
      d.getUTCFullYear() +
      p(d.getUTCMonth() + 1) +
      p(d.getUTCDate()) +
      'T' +
      p(d.getUTCHours()) +
      p(d.getUTCMinutes()) +
      p(d.getUTCSeconds()) +
      'Z'
    )
  }

  const esc = (s) =>
    String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n')

  let lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Clinica Dr Daniel Delgado//Dashboard//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Agenda Clinica Dr. Daniel Delgado',
    'X-WR-TIMEZONE:America/Sao_Paulo',
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M',
  ]

  try {
    const records = $app.findRecordsByFilter('appointments', '1=1', 'start', 500, 0)
    const now = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
    for (const r of records) {
      const start = toICSDate(r.getString('start'))
      const end = toICSDate(r.getString('end'))
      if (!start || !end) continue

      let patientName = ''
      try {
        const p = $app.findRecordById('patients', r.getString('patient'))
        patientName = p.getString('name')
      } catch (_) {}

      const status = r.getString('status')
      const type = r.getString('type')
      const typeLabel =
        type === 'Consultation' ? 'Consulta' : type === 'Surgery' ? 'Procedimento' : 'Retorno'

      lines.push('BEGIN:VEVENT')
      lines.push('UID:appt-' + r.getString('id') + '@dashboard-clinica')
      lines.push('DTSTAMP:' + now)
      lines.push('DTSTART:' + start)
      lines.push('DTEND:' + end)
      lines.push(
        'SUMMARY:' +
          esc((r.getString('title') || typeLabel) + (patientName ? ' - ' + patientName : '')),
      )
      lines.push(
        'DESCRIPTION:' +
          esc('Tipo: ' + typeLabel + (patientName ? '\nPaciente: ' + patientName : '')),
      )
      lines.push('STATUS:' + (status === 'Cancelled' ? 'CANCELLED' : 'CONFIRMED'))
      lines.push('END:VEVENT')
    }
  } catch (err) {
    return e.json(500, { error: 'Falha ao gerar agenda: ' + err })
  }

  lines.push('END:VCALENDAR')
  const body = lines.join('\r\n')

  try {
    e.response.header().set('Content-Type', 'text/calendar; charset=utf-8')
  } catch (_) {}

  return e.string(200, body)
})
