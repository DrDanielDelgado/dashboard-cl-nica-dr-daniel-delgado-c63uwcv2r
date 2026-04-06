migrate(
  (app) => {
    const patients = new Collection({
      name: 'patients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'birthdate', type: 'date' },
        { name: 'cpf', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(patients)

    const appointments = new Collection({
      name: 'appointments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'patient',
          type: 'relation',
          required: true,
          collectionId: patients.id,
          maxSelect: 1,
        },
        { name: 'title', type: 'text' },
        { name: 'start', type: 'date', required: true },
        { name: 'end', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['Scheduled', 'Confirmed', 'Cancelled', 'Completed'],
        },
        { name: 'type', type: 'select', values: ['Consultation', 'Surgery', 'Follow-up'] },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(appointments)

    const leads = new Collection({
      name: 'leads',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'patient', type: 'relation', collectionId: patients.id, maxSelect: 1 },
        { name: 'name', type: 'text' },
        {
          name: 'stage',
          type: 'select',
          values: ['Lead', 'Consultation', 'Pre-Op', 'Post-Op', 'Concluded'],
        },
        { name: 'value', type: 'number' },
        { name: 'source', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(leads)

    const budgets = new Collection({
      name: 'budgets',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'patient',
          type: 'relation',
          required: true,
          collectionId: patients.id,
          maxSelect: 1,
        },
        { name: 'amount', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['Draft', 'Pending', 'Sent', 'Approved', 'Rejected', 'Paid', 'Expired'],
        },
        { name: 'items', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(budgets)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('budgets'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('leads'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('appointments'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('patients'))
    } catch (_) {}
  },
)
