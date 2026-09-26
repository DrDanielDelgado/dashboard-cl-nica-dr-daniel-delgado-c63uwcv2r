migrate(
  (app) => {
    const patients = app.findCollectionByNameOrId('patients')
    let appointmentsId = ''
    try {
      appointmentsId = app.findCollectionByNameOrId('appointments').id
    } catch (_) {}

    const whatsappMessages = new Collection({
      name: 'whatsapp_messages',
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
          collectionId: patients.id,
          maxSelect: 1,
        },
        ...(appointmentsId
          ? [
              {
                name: 'appointment',
                type: 'relation',
                collectionId: appointmentsId,
                maxSelect: 1,
              },
            ]
          : []),
        { name: 'phone', type: 'text', required: true },
        { name: 'recipient_name', type: 'text' },
        {
          name: 'message_type',
          type: 'select',
          values: ['text', 'template', 'reminder'],
          required: true,
        },
        { name: 'template_name', type: 'text' },
        { name: 'content', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'sent', 'delivered', 'read', 'failed'],
          required: true,
        },
        { name: 'whatsapp_message_id', type: 'text' },
        { name: 'error_details', type: 'text' },
        { name: 'sent_at', type: 'date' },
        { name: 'delivered_at', type: 'date' },
        { name: 'read_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_wamsg_status ON whatsapp_messages (status)',
        'CREATE INDEX idx_wamsg_wa_id ON whatsapp_messages (whatsapp_message_id)',
        'CREATE INDEX idx_wamsg_phone ON whatsapp_messages (phone)',
      ],
    })
    app.save(whatsappMessages)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('whatsapp_messages'))
    } catch (_) {}
  },
)
