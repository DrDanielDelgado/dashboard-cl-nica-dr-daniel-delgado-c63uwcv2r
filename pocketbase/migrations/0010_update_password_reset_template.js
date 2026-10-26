migrate(
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

      const siteUrl = $os.getenv('SITE_URL') || ''
      const actionBase = siteUrl ? siteUrl.replace(/\/+$/, '') : '{APP_URL}'

      // Personaliza o template de redefinição de senha para direcionar diretamente para o frontend
      usersCol.resetPasswordTemplate = {
        subject: 'Redefinição de senha - Clínica Dr. Daniel Delgado',
        body:
          '<p>Olá,</p>' +
          '<p>Recebemos uma solicitação para redefinir sua senha de acesso ao <strong>Dashboard Clínica Dr. Daniel Delgado</strong>.</p>' +
          '<p style="margin: 24px 0;">' +
          '<a href="' +
          actionBase +
          '/redefinir-senha?token={TOKEN}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-family: Arial, sans-serif;">Redefinir minha senha</a>' +
          '</p>' +
          '<p style="color: #64748b; font-size: 13px;">Se o botão acima não funcionar, copie e cole o link abaixo em seu navegador:<br/>' +
          '<span style="word-break: break-all; color: #0284c7;">' +
          actionBase +
          '/redefinir-senha?token={TOKEN}</span></p>' +
          '<p style="color: #64748b; font-size: 13px;"><i>Se você não solicitou a alteração da sua senha, pode desconsiderar este e-mail em segurança.</i></p>' +
          '<p>Atenciosamente,<br/><strong>Equipe Clínica Dr. Daniel Delgado</strong></p>',
      }

      app.save(usersCol)
    } catch (err) {
      console.warn('Não foi possível atualizar resetPasswordTemplate na migration:', err.message)
    }
  },
  (app) => {},
)
