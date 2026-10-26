migrate(
  (app) => {
    // 1. api_keys (Chave de API de serviço do Dashboard)
    const apiKeys = new Collection({
      name: 'api_keys',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'key', type: 'text', required: true },
        { name: 'is_active', type: 'bool' },
        { name: 'last_used_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_api_keys_key ON api_keys (key)'],
    })
    app.save(apiKeys)

    // Seeding da chave de serviço do Dashboard caso não exista
    try {
      const existing = app.findRecordsByFilter(
        'api_keys',
        'name = "Dashboard Service Key"',
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const seedKey = new Record(apiKeys)
        seedKey.set('name', 'Dashboard Service Key')
        seedKey.set('key', 'cld_live_' + $security.randomString(32))
        seedKey.set('is_active', true)
        app.save(seedKey)
      }
    } catch (_) {}

    // 2. partner_api_keys (Acessos compartilhados de parceiros)
    const partnerKeys = new Collection({
      name: 'partner_api_keys',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'key', type: 'text', required: true },
        { name: 'masked_hint', type: 'text' },
        { name: 'is_active', type: 'bool' },
        { name: 'permissions', type: 'json' }, // { patients: { read: bool, write: bool }, appointments: {...}, leads: {...}, budgets: {...} }
        { name: 'last_used_at', type: 'date' },
        { name: 'call_count', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_partner_keys_key ON partner_api_keys (key)',
        'CREATE INDEX idx_partner_keys_active ON partner_api_keys (is_active)',
      ],
    })
    app.save(partnerKeys)

    // 3. partner_api_logs (Auditoria de chamadas de parceiros)
    const partnerLogs = new Collection({
      name: 'partner_api_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'partner',
          type: 'relation',
          collectionId: partnerKeys.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'partner_name', type: 'text' },
        { name: 'collection_accessed', type: 'text', required: true },
        { name: 'method', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['success', 'error', 'unauthorized', 'forbidden'],
          maxSelect: 1,
        },
        { name: 'status_code', type: 'number' },
        { name: 'ip', type: 'text' },
        { name: 'endpoint', type: 'text' },
        { name: 'error_details', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_partner_logs_partner ON partner_api_logs (partner)',
        'CREATE INDEX idx_partner_logs_created ON partner_api_logs (created DESC)',
        'CREATE INDEX idx_partner_logs_status ON partner_api_logs (status)',
      ],
    })
    app.save(partnerLogs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('partner_api_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('partner_api_keys'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('api_keys'))
    } catch (_) {}
  },
)
