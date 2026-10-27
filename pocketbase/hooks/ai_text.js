// Endpoint de apoio à leitura de rótulos: tradução e interpretação de texto (sem imagem).
// O gateway $ai do Skip aceita apenas texto; o OCR roda no navegador do usuário.
routerAdd('POST', '/backend/v1/ai_text', (e) => {
  const body = e.requestInfo().body || {}
  const text = String(body.text || '').slice(0, 4000)
  const action = body.action || 'translate'

  if (!text.trim()) return e.json(400, { error: 'texto vazio' })

  const prompts = {
    translate:
      'Traduza o texto de rótulo/embalagem abaixo para português do Brasil. ' +
      'Se já estiver em português, apenas devolva o texto organizado. ' +
      'Responda SOMENTE com a tradução, sem comentários.',
    explain:
      'Explique em português do Brasil, em no máximo 5 linhas curtas, o que é o produto descrito ' +
      'no texto de rótulo abaixo, para que serve e cuidados principais. ' +
      'Se não for possível identificar, diga isso.',
    structured:
      'Extraia do texto de rótulo abaixo, em português do Brasil, os campos: produto, principio_ativo, ' +
      'lote, validade (AAAA-MM), quantidade e fabricante. ' +
      'Responda apenas as linhas "campo: valor"; use "-" quando não encontrar.',
  }

  try {
    const reply = $ai.chat({
      model: 'fast',
      messages: [
        {
          role: 'system',
          content:
            'Você apoia uma clínica médica na conferência de materiais e medicamentos. Seja objetivo e não invente dados.',
        },
        { role: 'user', content: prompts[action] + '\n\n---\n' + text },
      ],
    })
    return e.json(200, { text: reply.choices[0].message.content })
  } catch (err) {
    return e.json(500, { error: String(err) })
  }
})
