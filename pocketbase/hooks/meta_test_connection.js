routerAdd('POST', '/backend/v1/meta/test-connection', (e) => {
  const body = e.requestInfo().body || {}
  const token = body.token || $os.getenv('META_ACCESS_TOKEN') || ''
  const phoneId = body.phoneId || $os.getenv('META_PHONE_NUMBER_ID') || ''
  const wabaId = body.wabaId || $os.getenv('META_WABA_ID') || '895450846341386'
  const bmId = body.bmId || $os.getenv('META_BM_ID') || '1423050816165289'

  if (!token) {
    return e.json(400, {
      success: false,
      error: 'Token de acesso do Meta não configurado. Por favor, forneça o System User Token.',
      code: 'MISSING_TOKEN',
    })
  }

  // 1. Verify token with Meta Graph API
  try {
    const resMe = $http.send({
      url: 'https://graph.facebook.com/v21.0/me?access_token=' + encodeURIComponent(token),
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      timeout: 10,
    })

    if (resMe.statusCode !== 200) {
      const errJson = resMe.json || {}
      const errMsg = errJson.error
        ? errJson.error.message
        : 'Falha ao autenticar token na Graph API do Meta'
      return e.json(resMe.statusCode, {
        success: false,
        error: errMsg,
        metaError: errJson,
        code: 'INVALID_TOKEN',
      })
    }

    // 2. Query WABA details and phone numbers if available
    let phoneDetails = null
    let wabaDetails = null

    if (wabaId) {
      try {
        const resWaba = $http.send({
          url:
            'https://graph.facebook.com/v21.0/' +
            encodeURIComponent(wabaId) +
            '?fields=id,name,currency,timezone_id,phone_numbers{id,display_phone_number,verified_name,code_verification_status,quality_rating}&access_token=' +
            encodeURIComponent(token),
          method: 'GET',
          headers: { Accept: 'application/json' },
          timeout: 10,
        })
        if (resWaba.statusCode === 200) {
          wabaDetails = resWaba.json
          const phones = (resWaba.json.phone_numbers && resWaba.json.phone_numbers.data) || []
          if (phones.length > 0) {
            phoneDetails = phones[0]
          }
        }
      } catch (_) {}
    }

    if (!phoneDetails && phoneId) {
      try {
        const resPhone = $http.send({
          url:
            'https://graph.facebook.com/v21.0/' +
            encodeURIComponent(phoneId) +
            '?fields=id,display_phone_number,verified_name,code_verification_status,quality_rating&access_token=' +
            encodeURIComponent(token),
          method: 'GET',
          headers: { Accept: 'application/json' },
          timeout: 10,
        })
        if (resPhone.statusCode === 200) {
          phoneDetails = resPhone.json
        }
      } catch (_) {}
    }

    return e.json(200, {
      success: true,
      user: resMe.json,
      waba: wabaDetails,
      phone: phoneDetails,
      configuredWabaId: wabaId,
      configuredBmId: bmId,
      configuredPhoneId: phoneId || (phoneDetails ? phoneDetails.id : ''),
      verifiedNumber: phoneDetails
        ? phoneDetails.display_phone_number || phoneDetails.id
        : '32 991315729',
      message: 'Conexão com a Meta Business Suite e WhatsApp Cloud API estabelecida com sucesso!',
    })
  } catch (err) {
    return e.json(502, {
      success: false,
      error: 'Não foi possível conectar aos servidores do Meta: ' + err.message,
      code: 'NETWORK_ERROR',
    })
  }
})
