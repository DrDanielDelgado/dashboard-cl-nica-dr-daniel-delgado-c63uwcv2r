migrate(
  (app) => {
    const patients = app.findCollectionByNameOrId('patients')

    // 1. email_campaigns
    const emailCampaigns = new Collection({
      name: 'email_campaigns',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'subject', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        {
          name: 'target_filter',
          type: 'select',
          values: ['all', 'with_appointments', 'leads_only'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['draft', 'sending', 'sent', 'failed'],
          maxSelect: 1,
        },
        { name: 'sent_count', type: 'number' },
        { name: 'failed_count', type: 'number' },
        { name: 'sent_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_ecampaign_status ON email_campaigns (status)',
        'CREATE INDEX idx_ecampaign_created ON email_campaigns (created DESC)',
      ],
    })
    app.save(emailCampaigns)

    // 2. email_logs
    const emailLogs = new Collection({
      name: 'email_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'campaign',
          type: 'relation',
          collectionId: emailCampaigns.id,
          maxSelect: 1,
        },
        {
          name: 'patient',
          type: 'relation',
          collectionId: patients.id,
          maxSelect: 1,
        },
        { name: 'recipient_email', type: 'email', required: true },
        { name: 'recipient_name', type: 'text' },
        { name: 'subject', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['sent', 'failed', 'opened'],
          maxSelect: 1,
        },
        { name: 'error_message', type: 'text' },
        { name: 'sent_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_elog_campaign ON email_logs (campaign)',
        'CREATE INDEX idx_elog_status ON email_logs (status)',
      ],
    })
    app.save(emailLogs)

    // 3. push_subscriptions
    const pushSubscriptions = new Collection({
      name: 'push_subscriptions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'patient',
          type: 'relation',
          collectionId: patients.id,
          maxSelect: 1,
        },
        { name: 'endpoint', type: 'text', required: true },
        { name: 'p256dh', type: 'text', required: true },
        { name: 'auth_key', type: 'text', required: true },
        { name: 'user_agent', type: 'text' },
        { name: 'is_active', type: 'bool' },
        { name: 'last_notified', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_psub_endpoint ON push_subscriptions (endpoint)',
        'CREATE INDEX idx_psub_active ON push_subscriptions (is_active)',
      ],
    })
    app.save(pushSubscriptions)

    // 4. push_notifications (log de disparos)
    const pushNotifications = new Collection({
      name: 'push_notifications',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'text', required: true },
        { name: 'url', type: 'text' },
        { name: 'target', type: 'select', values: ['all', 'staff', 'patients'], maxSelect: 1 },
        { name: 'sent_count', type: 'number' },
        { name: 'status', type: 'select', values: ['sent', 'failed'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_pnotif_created ON push_notifications (created DESC)'],
    })
    app.save(pushNotifications)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('push_notifications'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('push_subscriptions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('email_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('email_campaigns'))
    } catch (_) {}
  },
)
