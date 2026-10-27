// Endpoint de teste: verifica se o gateway $ai aceita imagens (visão/OCR).
routerAdd('POST', '/backend/v1/vision_test', (e) => {
  const body = e.requestInfo().body || {}

  // 1) teste só texto, para isolar se o $ai funciona
  if (body.textOnly) {
    try {
      const r = $ai.chat({
        model: 'fast',
        messages: [{ role: 'user', content: body.text || 'responda OK' }],
      })
      return e.json(200, { ok: true, mode: 'text', text: r.choices[0].message.content })
    } catch (err) {
      return e.json(500, { ok: false, mode: 'text', error: String(err) })
    }
  }

  // 2) teste com imagem — formato escolhido pelo chamador
  const fmt = body.format || 'image_url'
  let imgPart
  if (fmt === 'image_url') {
    imgPart = { type: 'image_url', image_url: { url: body.image || '' } }
  } else if (fmt === 'image_url_flat') {
    imgPart = { type: 'image_url', image_url: body.image || '' }
  } else {
    imgPart = {
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: body.b64 || '' },
    }
  }

  try {
    const reply = $ai.chat({
      model: body.model || 'fast',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Descreva exatamente o texto que aparece na imagem.' },
            imgPart,
          ],
        },
      ],
    })
    return e.json(200, {
      ok: true,
      mode: 'image',
      format: fmt,
      text: reply.choices[0].message.content,
    })
  } catch (err) {
    return e.json(500, { ok: false, mode: 'image', format: fmt, error: String(err) })
  }
})
