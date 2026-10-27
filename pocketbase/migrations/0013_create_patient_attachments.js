migrate(
  (app) => {
    // 1. Resolver o ID da coleção patients
    const patientsCollection = app.findCollectionByNameOrId('patients')

    let attachmentsCollection
    try {
      attachmentsCollection = app.findCollectionByNameOrId('patient_attachments')
    } catch (_) {
      attachmentsCollection = new Collection({
        name: 'patient_attachments',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""',
        fields: [
          {
            name: 'patient',
            type: 'relation',
            required: true,
            collectionId: patientsCollection.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'file',
            type: 'file',
            required: true,
            maxSelect: 1,
            maxSize: 52428800, // 50MB
            protected: false,
          },
          {
            name: 'title',
            type: 'text',
          },
          {
            name: 'file_name',
            type: 'text',
          },
          {
            name: 'file_type',
            type: 'text',
          },
          {
            name: 'mime_type',
            type: 'text',
          },
          {
            name: 'category',
            type: 'select',
            values: ['exame', 'imagem', 'audio', 'video', 'dicom', 'documento', 'outro'],
            maxSelect: 1,
          },
          {
            name: 'exam_date',
            type: 'date',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'size_bytes',
            type: 'number',
          },
          {
            name: 'uploaded_by',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            maxSelect: 1,
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
          'CREATE INDEX idx_patient_attachments_patient ON patient_attachments (patient)',
          'CREATE INDEX idx_patient_attachments_created ON patient_attachments (created DESC)',
          'CREATE INDEX idx_patient_attachments_category ON patient_attachments (category)',
        ],
      })
      app.save(attachmentsCollection)
    }
  },
  (app) => {
    try {
      const attachmentsCollection = app.findCollectionByNameOrId('patient_attachments')
      app.delete(attachmentsCollection)
    } catch (_) {}
  },
)
