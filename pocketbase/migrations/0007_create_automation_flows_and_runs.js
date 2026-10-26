migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    let patientsColId = ''
    let leadsColId = ''
    try {
      patientsColId = app.findCollectionByNameOrId('patients').id
    } catch (_) {}
    try {
      leadsColId = app.findCollectionByNameOrId('leads').id
    } catch (_) {}

    // 1. automation_flows
    const flows = new Collection({
      name: 'automation_flows',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['draft', 'active', 'paused'],
          maxSelect: 1,
        },
        {
          name: 'trigger_type',
          type: 'select',
          required: true,
          values: [
            'contact_created',
            'birthday',
            'contact_webhook',
            'variable_updated',
            'deal_stage_changed',
            'custom_event',
            'manual',
          ],
          maxSelect: 1,
        },
        { name: 'trigger_config', type: 'json' },
        { name: 'webhook_secret', type: 'text' },
        { name: 'definition', type: 'json' }, // Nodes and edges / canvas definition
        { name: 'total_entered', type: 'number' },
        { name: 'total_completed', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_aflows_status ON automation_flows (status)',
        'CREATE INDEX idx_aflows_trigger ON automation_flows (trigger_type)',
      ],
    })
    app.save(flows)

    const flowsColId = flows.id

    // 2. automation_flow_runs
    const flowRunsFields = [
      {
        name: 'flow',
        type: 'relation',
        required: true,
        collectionId: flowsColId,
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: 'contact_email', type: 'email' },
      { name: 'contact_phone', type: 'text' },
      { name: 'contact_name', type: 'text' },
    ]

    if (patientsColId) {
      flowRunsFields.push({
        name: 'patient',
        type: 'relation',
        collectionId: patientsColId,
        cascadeDelete: false,
        maxSelect: 1,
      })
    }

    if (leadsColId) {
      flowRunsFields.push({
        name: 'lead',
        type: 'relation',
        collectionId: leadsColId,
        cascadeDelete: false,
        maxSelect: 1,
      })
    }

    flowRunsFields.push(
      { name: 'current_node_id', type: 'text' },
      {
        name: 'status',
        type: 'select',
        required: true,
        values: ['running', 'completed', 'failed', 'waiting'],
        maxSelect: 1,
      },
      { name: 'execution_steps', type: 'json' },
      { name: 'wait_until', type: 'date' },
      { name: 'error_message', type: 'text' },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    )

    const flowRuns = new Collection({
      name: 'automation_flow_runs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: flowRunsFields,
      indexes: [],
    })
    app.save(flowRuns)

    // 3. automation_events (Eventos personalizados)
    const eventsFields = [
      { name: 'event_name', type: 'text', required: true },
      { name: 'contact_email', type: 'email' },
      { name: 'contact_phone', type: 'text' },
      { name: 'payload', type: 'json' },
      { name: 'is_processed', type: 'bool' },
      { name: 'processed_at', type: 'date' },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    if (patientsColId) {
      eventsFields.push({
        name: 'patient',
        type: 'relation',
        collectionId: patientsColId,
        cascadeDelete: false,
        maxSelect: 1,
      })
    }

    const events = new Collection({
      name: 'automation_events',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: eventsFields,
      indexes: [],
    })
    app.save(events)
  },
  (app) => {
    try {
      const events = app.findCollectionByNameOrId('automation_events')
      app.delete(events)
    } catch (_) {}
    try {
      const flowRuns = app.findCollectionByNameOrId('automation_flow_runs')
      app.delete(flowRuns)
    } catch (_) {}
    try {
      const flows = app.findCollectionByNameOrId('automation_flows')
      app.delete(flows)
    } catch (_) {}
  },
)
