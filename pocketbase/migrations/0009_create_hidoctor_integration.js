migrate(
  (app) => {
    // 1. hidoctor_settings: Configurações seguras e status de sincronização HiDoctor
    const hiSettings = new Collection({
      name: 'hidoctor_settings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'serial', type: 'text' },
        { name: 'crm', type: 'text' },
        { name: 'password', type: 'text' },
        { name: 'api_url', type: 'text' },
        { name: 'is_active', type: 'bool' },
        {
          name: 'last_sync_status',
          type: 'select',
          values: ['never', 'success', 'warning', 'failed', 'running'],
          maxSelect: 1,
        },
        { name: 'last_sync_at', type: 'date' },
        { name: 'last_sync_message', type: 'text' },
        { name: 'synced_patients_count', type: 'number' },
        { name: 'connection_test_details', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_hidoctor_settings_name ON hidoctor_settings (name)'],
    })
    app.save(hiSettings)

    // Seed das configurações de integração padrão da clínica
    try {
      const existing = app.findRecordsByFilter(
        'hidoctor_settings',
        'name = "HiDoctor Clinica"',
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const seed = new Record(hiSettings)
        seed.set('name', 'HiDoctor Clinica')
        seed.set('serial', 'H80ARQW43')
        seed.set('crm', '37525')
        seed.set('password', 'CPV2406')
        seed.set('api_url', 'https://api.hinetx.com.br/v2/prontuarios/sync')
        seed.set('is_active', false)
        seed.set('last_sync_status', 'never')
        seed.set('synced_patients_count', 0)
        app.save(seed)
      }
    } catch (_) {}

    // 2. hidoctor_sync_logs: Histórico de sincronizações para auditoria e diagnóstico
    const hiLogs = new Collection({
      name: 'hidoctor_sync_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'trigger_type',
          type: 'select',
          required: true,
          values: ['manual', 'scheduled', 'file_import', 'test'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['success', 'failed', 'partial'],
          maxSelect: 1,
        },
        { name: 'records_imported', type: 'number' },
        { name: 'records_updated', type: 'number' },
        { name: 'duration_seconds', type: 'number' },
        { name: 'message', type: 'text' },
        { name: 'error_details', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_hidoctor_logs_created ON hidoctor_sync_logs (created DESC)',
        'CREATE INDEX idx_hidoctor_logs_status ON hidoctor_sync_logs (status)',
      ],
    })
    app.save(hiLogs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('hidoctor_sync_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('hidoctor_settings'))
    } catch (_) {}
  },
)
