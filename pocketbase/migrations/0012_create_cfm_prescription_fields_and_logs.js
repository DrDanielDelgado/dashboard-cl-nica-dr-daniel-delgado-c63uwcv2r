migrate(
  (app) => {
    // 1. Adicionar campos ao perfil do usuário (auth collection users)
    // crm_numero: número do CRM do médico (lembrete)
    // crm_uf: UF do CRM do médico
    // last_cfm_access: timestamp do último acesso direcionado ao portal do CFM
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('crm_numero')) {
      users.fields.add(
        new TextField({
          name: 'crm_numero',
          max: 20,
        }),
      )
    }

    if (!users.fields.getByName('crm_uf')) {
      users.fields.add(
        new TextField({
          name: 'crm_uf',
          max: 2,
        }),
      )
    }

    if (!users.fields.getByName('last_cfm_access')) {
      users.fields.add(
        new DateField({
          name: 'last_cfm_access',
        }),
      )
    }

    app.save(users)

    // 2. Criar coleção integration_access_logs para trilha de auditoria leve sem dados de saúde
    // Registra cliques/aberturas de acessos direcionados e integrações
    let logsCollection
    try {
      logsCollection = app.findCollectionByNameOrId('integration_access_logs')
    } catch (_) {
      logsCollection = new Collection({
        name: 'integration_access_logs',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'user',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            maxSelect: 1,
          },
          {
            name: 'user_name',
            type: 'text',
          },
          {
            name: 'action',
            type: 'text',
            required: true,
          },
          {
            name: 'integration_name',
            type: 'text',
            required: true,
          },
          {
            name: 'target_url',
            type: 'text',
          },
          {
            name: 'ip_address',
            type: 'text',
          },
          {
            name: 'details',
            type: 'text',
          },
          {
            name: 'created',
            type: 'autodate',
            onCreate: true,
            onUpdate: false,
          },
          {
            name: 'updated',
            type: 'autodate',
            onCreate: true,
            onUpdate: true,
          },
        ],
        indexes: [
          'CREATE INDEX idx_int_access_action ON integration_access_logs (action)',
          'CREATE INDEX idx_int_access_created ON integration_access_logs (created DESC)',
        ],
      })
      app.save(logsCollection)
    }
  },
  (app) => {
    try {
      const logsCollection = app.findCollectionByNameOrId('integration_access_logs')
      app.delete(logsCollection)
    } catch (_) {}

    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      users.fields.removeByName('crm_numero')
      users.fields.removeByName('crm_uf')
      users.fields.removeByName('last_cfm_access')
      app.save(users)
    } catch (_) {}
  },
)
