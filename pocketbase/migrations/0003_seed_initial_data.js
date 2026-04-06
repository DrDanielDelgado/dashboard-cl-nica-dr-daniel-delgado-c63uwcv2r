migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'delgadodm@hotmail.com')
    } catch (_) {
      const user = new Record(users)
      user.setEmail('delgadodm@hotmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Admin')
      app.save(user)
    }

    const patientsCol = app.findCollectionByNameOrId('patients')
    let p1, p2, p3
    try {
      p1 = app.findFirstRecordByData('patients', 'cpf', '111.111.111-11')
    } catch (_) {
      p1 = new Record(patientsCol)
      p1.set('name', 'Ana Silva')
      p1.set('phone', '(32) 99999-1111')
      p1.set('cpf', '111.111.111-11')
      app.save(p1)
    }
    try {
      p2 = app.findFirstRecordByData('patients', 'cpf', '222.222.222-22')
    } catch (_) {
      p2 = new Record(patientsCol)
      p2.set('name', 'Carlos Santos')
      p2.set('phone', '(32) 98888-2222')
      p2.set('cpf', '222.222.222-22')
      app.save(p2)
    }
    try {
      p3 = app.findFirstRecordByData('patients', 'cpf', '333.333.333-33')
    } catch (_) {
      p3 = new Record(patientsCol)
      p3.set('name', 'Marcos Paulo')
      p3.set('phone', '(32) 97777-3333')
      p3.set('cpf', '333.333.333-33')
      app.save(p3)
    }

    const apptsCol = app.findCollectionByNameOrId('appointments')
    if (app.countRecords('appointments') === 0) {
      const today = new Date()
      for (let i = 0; i < 5; i++) {
        const a = new Record(apptsCol)
        a.set('patient', i % 2 === 0 ? p1.id : p2.id)
        a.set('title', 'Consulta ' + (i + 1))
        const d1 = new Date(today)
        d1.setHours(9 + i, 0, 0, 0)
        const d2 = new Date(today)
        d2.setHours(10 + i, 0, 0, 0)
        a.set('start', d1.toISOString().replace('T', ' '))
        a.set('end', d2.toISOString().replace('T', ' '))
        a.set('status', 'Scheduled')
        a.set('type', 'Consultation')
        app.save(a)
      }
    }

    const leadsCol = app.findCollectionByNameOrId('leads')
    if (app.countRecords('leads') === 0) {
      const stages = ['Lead', 'Consultation', 'Pre-Op', 'Post-Op']
      for (let i = 0; i < 4; i++) {
        const l = new Record(leadsCol)
        l.set('patient', p3.id)
        l.set('name', 'Lead ' + (i + 1))
        l.set('stage', stages[i])
        l.set('value', 500 * (i + 1))
        app.save(l)
      }
    }

    const budgetsCol = app.findCollectionByNameOrId('budgets')
    if (app.countRecords('budgets') === 0) {
      const b = new Record(budgetsCol)
      b.set('patient', p1.id)
      b.set('amount', 1500)
      b.set('status', 'Pending')
      b.set('items', {
        procedure: 'Laser',
        validityDate: new Date().toISOString(),
        paymentMethods: ['PIX'],
      })
      app.save(b)
    }
  },
  (app) => {},
)
