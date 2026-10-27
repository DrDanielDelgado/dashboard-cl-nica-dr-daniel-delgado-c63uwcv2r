// Endpoint de teste: verifica se o gateway $ai aceita imagens (visão/OCR).
routerAdd('POST', '/backend/v1/vision_test', (e) => {
  const body = e.requestInfo().body || {}

  const reply = $ai.chat({
    model: 'fast',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Descreva exatamente o texto que aparece na imagem.' },
          { type: 'image_url', image_url: { url: body.image || '' } },
        ],
      },
    ],
  })

  return e.json(200, { text: reply.choices[0].message.content })
})
