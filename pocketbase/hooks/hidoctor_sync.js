routerAdd('POST', '/backend/v1/hidoctor/sync', (e) => {
  const body = e.requestInfo().body || {}
  const authHeader = e.requestInfo().headers['authorization'] || ''

  try {
    const res = $http.send({
      url: 'https://api.hinetx.com.br/v2/prontuarios/sync',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
      timeout: 10,
    })

    return e.json(res.statusCode, res.json || {})
  } catch (err) {
    // Return 502 Bad Gateway to signify the external API could not be reached
    // Frontend catches this transparently to generate mock responses
    return e.json(502, { message: 'Bad Gateway', error: err.message })
  }
})
