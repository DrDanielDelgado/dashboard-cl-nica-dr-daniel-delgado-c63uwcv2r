routerAdd('GET', '/backend/v1/meta/config', (e) => {
  const bmId = $os.getenv('META_BM_ID') || '1423050816165289'
  const wabaId = $os.getenv('META_WABA_ID') || '895450846341386'
  const phoneId = $os.getenv('META_PHONE_NUMBER_ID') || ''
  const officialPhone = '32 991315729'
  const officialPhoneE164 = '5532991315729'
  const verifyToken = $os.getenv('META_VERIFY_TOKEN') || 'clinica_daniel_delgado_secret_token_2026'

  const hasAccessToken = !!$os.getenv('META_ACCESS_TOKEN')
  const baseUrl = $os.getenv('PB_INSTANCE_URL') || ''
  const webhookUrl = (baseUrl ? baseUrl.replace(/\/$/, '') : '') + '/backend/v1/meta/webhook'

  return e.json(200, {
    bmId: bmId,
    wabaId: wabaId,
    phoneId: phoneId,
    officialPhone: officialPhone,
    officialPhoneE164: officialPhoneE164,
    verifyToken: verifyToken,
    webhookUrl: webhookUrl,
    hasAccessToken: hasAccessToken,
  })
})
