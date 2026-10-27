migrate(
  (app) => {
    // ---------- Estoque: itens ----------
    const items = new Collection({
      name: 'inventory_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          values: ['Medicamento', 'Material', 'Descartável', 'Equipamento', 'Outro'],
        },
        { name: 'unit', type: 'text' },
        { name: 'batch', type: 'text' },
        { name: 'expiry', type: 'date' },
        { name: 'current_qty', type: 'number' },
        { name: 'min_qty', type: 'number' },
        { name: 'unit_cost', type: 'number' },
        { name: 'supplier', type: 'text' },
        { name: 'location', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'image', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(items)

    // ---------- Estoque: movimentações ----------
    const movements = new Collection({
      name: 'stock_movements',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'item',
          type: 'relation',
          required: true,
          collectionId: items.id,
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['entrada', 'saida', 'ajuste'],
        },
        { name: 'qty', type: 'number', required: true },
        { name: 'unit_cost', type: 'number' },
        { name: 'total_cost', type: 'number' },
        { name: 'patient', type: 'relation', collectionId: 'patients', maxSelect: 1 },
        { name: 'supplier', type: 'text' },
        { name: 'note', type: 'text' },
        {
          name: 'source',
          type: 'select',
          values: ['manual', 'ocr', 'importacao'],
        },
        { name: 'moved_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(movements)

    // ---------- Financeiro: despesas ----------
    const expenses = new Collection({
      name: 'expenses',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'description', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          values: ['Material', 'Medicamento', 'Equipamento', 'Pessoal', 'Estrutura', 'Outro'],
        },
        { name: 'amount', type: 'number' },
        { name: 'paid_at', type: 'date' },
        { name: 'due_date', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['Pendente', 'Pago', 'Atrasado', 'Cancelado'],
        },
        { name: 'supplier', type: 'text' },
        { name: 'movement', type: 'relation', collectionId: movements.id, maxSelect: 1 },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(expenses)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('expenses'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('stock_movements'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('inventory_items'))
    } catch (_) {}
  },
)
