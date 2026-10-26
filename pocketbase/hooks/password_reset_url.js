// Intercepta o envio de e-mails de redefinição de senha e verificação para
// garantir que os links apontem para a URL do frontend da aplicação (/redefinir-senha?token=...)
// mesmo quando o PocketBase estiver configurado com o APP_URL padrão ou link interno de admin.

onMailerRecordPasswordResetSend((e) => {
  try {
    const token = e.meta && e.meta.token ? e.meta.token : ''
    const siteUrl = $os.getenv('SITE_URL') || ''

    let targetBaseUrl = siteUrl.replace(/\/+$/, '')

    if (e.message && e.message.html) {
      let html = e.message.html

      if (targetBaseUrl && token) {
        const directResetUrl = targetBaseUrl + '/redefinir-senha?token=' + encodeURIComponent(token)
        // Substitui qualquer link que aponte para confirm-password-reset ou redefinir-senha antigo
        html = html.replace(
          /href=["'][^"']*(?:confirm-password-reset|redefinir-senha)[^"']*["']/gi,
          'href="' + directResetUrl + '"',
        )
      } else if (token) {
        // Substitui o caminho mantendo o host caso SITE_URL não esteja definido
        html = html.replace(
          /(href=["']https?:\/\/[^"\/]+)[^"']*(?:confirm-password-reset|redefinir-senha)[^"']*token=([A-Za-z0-9_.-]+)["']/gi,
          '$1/redefinir-senha?token=$2',
        )
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
        text = text.replace(
          /https?:\/\/[^\s]*(?:confirm-password-reset|redefinir-senha)[^\s]*/gi,
          directResetUrl,
        )
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

// Adiciona rotas HTTP no backend para redirecionar para o frontend caso alguém acesse link pelo backend
routerAdd('GET', '/auth/confirm-password-reset/{token}', (e) => {
  const token = e.request.pathValue('token') || ''
  const siteUrl = $os.getenv('SITE_URL') || ''
  const base = siteUrl ? siteUrl.replace(/\/+$/, '') : ''
  const destUrl = (base || '') + '/redefinir-senha?token=' + encodeURIComponent(token)
  if (base) {
    return e.redirect(302, destUrl)
  }
  return e.html(
    200,
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redefinir Senha</title></head><body>' +
      '<p>Redirecionando para a tela de redefinição de senha...</p>' +
      '<script>window.location.href="' +
      destUrl +
      '";</script></body></html>',
  )
})

routerAdd('GET', '/redefinir-senha', (e) => {
  const token = e.request.url.query().get('token') || ''
  const siteUrl = $os.getenv('SITE_URL') || ''
  const base = siteUrl ? siteUrl.replace(/\/+$/, '') : ''
  const destUrl = (base || '') + '/redefinir-senha?token=' + encodeURIComponent(token)
  if (base) {
    return e.redirect(302, destUrl)
  }
  return e.html(
    200,
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redefinir Senha</title></head><body>' +
      '<p>Redirecionando para a tela de redefinição de senha...</p>' +
      '<script>window.location.href="' +
      destUrl +
      '";</script></body></html>',
  )
})
