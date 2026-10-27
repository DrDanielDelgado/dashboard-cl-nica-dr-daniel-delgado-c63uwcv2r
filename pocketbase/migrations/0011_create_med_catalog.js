migrate(
  (app) => {
    // ---------- Biblioteca de produtos médicos (catálogo de referência) ----------
    const catalog = new Collection({
      name: 'med_catalog',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'substance', type: 'text' },
        { name: 'presentation', type: 'text' },
        { name: 'laboratory', type: 'text' },
        { name: 'ggrem', type: 'text' },
        { name: 'ean', type: 'text' },
        { name: 'registration', type: 'text' },
        { name: 'therapeutic_class', type: 'text' },
        { name: 'product_type', type: 'text' },
        { name: 'price_regime', type: 'text' },
        { name: 'tarja', type: 'text' },
        { name: 'pf', type: 'number' },
        { name: 'pf_0', type: 'number' },
        { name: 'pmc', type: 'number' },
        { name: 'pmc_0', type: 'number' },
        { name: 'hospital_only', type: 'bool' },
        {
          name: 'source',
          type: 'select',
          values: ['CMED', 'ANVISA', 'BRASINDICE', 'MANUAL'],
        },
        { name: 'source_edition', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_med_catalog_name ON med_catalog (name)',
        'CREATE INDEX idx_med_catalog_substance ON med_catalog (substance)',
        'CREATE INDEX idx_med_catalog_ean ON med_catalog (ean)',
      ],
    })
    app.save(catalog)

    // ---------- Fontes de dados (permite plugar ANVISA/Brasíndice no futuro) ----------
    const sources = new Collection({
      name: 'catalog_sources',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'kind', type: 'select', values: ['CMED', 'ANVISA', 'BRASINDICE', 'OUTRO'] },
        { name: 'url', type: 'url' },
        { name: 'edition', type: 'text' },
        { name: 'record_count', type: 'number' },
        { name: 'last_sync', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(sources)

    // ---------- Vínculo do item de estoque com o catálogo ----------
    const items = app.findCollectionByNameOrId('inventory_items')
    items.fields.add(
      new RelationField({
        name: 'catalog_item',
        collectionId: catalog.id,
        maxSelect: 1,
      }),
    )
    items.fields.add(new TextField({ name: 'ean', max: 20 }))
    items.fields.add(new TextField({ name: 'substance' }))
    app.save(items)
  },
  (app) => {
    try {
      const items = app.findCollectionByNameOrId('inventory_items')
      items.fields.removeByName('catalog_item')
      items.fields.removeByName('ean')
      items.fields.removeByName('substance')
      app.save(items)
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalog_sources'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('med_catalog'))
    } catch (_) {}
  },
)
