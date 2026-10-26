// Intercepta o envio de e-mails de redefinição de senha e verificação para
// garantir que os links apontem para a URL do frontend da aplicação (/redefinir-senha?token=...)
// mesmo quando o PocketBase estiver configurado com o APP_URL padrão ou link interno de admin.

onMailerRecordPasswordResetSend((e) => {
  try {
    const token = e.meta && e.meta.token ? e.meta.token : ''
    const siteUrl = $os.getenv('SITE_URL') || ''

    // Se SITE_URL estiver configurado, usa ele; caso contrário tenta derivar da URL existente no html
    let targetBaseUrl = siteUrl.replace(/\/+$/, '')

    // Se o HTML contiver links com a rota padrão do PocketBase ou hash:
    // Ex: href="https://.../_/#/auth/confirm-password-reset/TOKEN"
    // ou href="https://.../#/confirm-password-reset/TOKEN"
    if (e.message && e.message.html) {
      let html = e.message.html

      // 1. Se encontrar a URL do frontend configurada ou o token
      if (targetBaseUrl && token) {
        const directResetUrl = targetBaseUrl + '/redefinir-senha?token=' + encodeURIComponent(token)
        // Substitui qualquer link antigo que aponte para confirm-password-reset
        html = html.replace(
          /href=["'][^"']*confirm-password-reset[^"']*["']/gi,
          'href="' + directResetUrl + '"',
        )
      } else if (token) {
        // Se SITE_URL não estiver definido, substitui o caminho relativo/absoluto mantendo o host
        // transformando /_/#/auth/confirm-password-reset/TOKEN ou /confirm-password-reset/TOKEN em /redefinir-senha?token=TOKEN
        html = html.replace(
          /(href=["']https?:\/\/[^"\/]+)[^"']*confirm-password-reset\/([A-Za-z0-9_.-]+)["']/gi,
          '$1/redefinir-senha?token=$2',
        )
      }

      e.message.html = html
    }

    if (e.message && e.message.text) {
      let text = e.message.text
      if (targetBaseUrl && token) {
        const directResetUrl = targetBaseUrl + '/redefinir-senha?token=' + encodeURIComponent(token)
        text = text.replace(/https?:\/\/[^\s]+confirm-password-reset[^\s]*/gi, directResetUrl)
      } else if (token) {
        text = text.replace(
          /(https?:\/\/[^\s\/]+)[^\s]*confirm-password-reset\/([A-Za-z0-9_.-]+)/gi,
          '$1/redefinir-senha?token=$2',
        )
      }
      e.message.text = text
    }
  } catch (err) {
    console.warn('Erro ao ajustar link de redefinição no mailer hook:', err.message)
  }

  e.next()
})

// Também adiciona rota HTTP no backend para redirecionar caso alguém acesse o link no próprio backend:
// GET /api/collections/users/confirm-password-reset?token=... ou /confirm-password-reset/:token
routerAdd('GET', '/auth/confirm-password-reset/{token}', (e) => {
  const token = e.request.pathValue('token') || ''
  const siteUrl = $os.getenv('SITE_URL') || ''
  const base = siteUrl ? siteUrl.replace(/\/+$/, '') : ''
  if (base) {
    return e.redirect(302, base + '/redefinir-senha?token=' + encodeURIComponent(token))
  }
  return e.html(
    200,
    '<p>Redirecionando para redefinir senha...</p><script>window.location.href="/redefinir-senha?token=' +
      encodeURIComponent(token) +
      '";</script>',
  )
})
