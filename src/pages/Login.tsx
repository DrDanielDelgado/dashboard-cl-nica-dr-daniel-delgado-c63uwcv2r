import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth'
import { Stethoscope, Loader2, ShieldCheck, Mail, CheckCircle2, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login, requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Estado do diálogo de recuperação de senha
  const [dialogOpen, setDialogOpen] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoverySubmitted, setRecoverySubmitted] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')

  const handleOpenRecovery = () => {
    // Se o usuário já digitou o e-mail no login, pré-preenche no modal
    setRecoveryEmail(email.trim())
    setRecoveryError('')
    setRecoverySubmitted(false)
    setDialogOpen(true)
  }

  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecoveryError('')

    const trimmed = recoveryEmail.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setRecoveryError('Por favor, informe um endereço de e-mail válido.')
      return
    }

    setRecoveryLoading(true)
    try {
      // O PocketBase não revela se o e-mail existe por padrão de segurança
      await requestPasswordReset(trimmed)
      // Exibe sempre feedback amigável de sucesso
      setRecoverySubmitted(true)
    } catch (_err) {
      // Mesmo com erro inesperado do lado do cliente, manter comportamento amigável
      setRecoverySubmitted(true)
    } finally {
      setRecoveryLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err: any) {
      // O PocketBase retorna 400 "Failed to authenticate." quando email ou senha não conferem
      const status = err?.status
      const rawMsg = err?.message || ''

      if (status === 400 || rawMsg.includes('Failed to authenticate')) {
        setError(
          'E-mail ou senha incorretos. Se você acabou de redefinir sua senha no e-mail, certifique-se de digitar a nova senha cadastrada.',
        )
      } else if (status === 0 || !navigator.onLine) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.')
      } else {
        setError(rawMsg || 'Falha ao autenticar. Verifique seus dados de acesso e tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center">
            <Stethoscope className="h-7 w-7 text-brand-blue" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Clínica Dr. Daniel Delgado
          </CardTitle>
          <CardDescription>
            Acesse o dashboard de gestão com suas credenciais da equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@clinica.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  onClick={handleOpenRecovery}
                  className="text-xs text-brand-blue hover:text-brand-blue/80 hover:underline transition-colors focus:outline-none"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="text-xs sm:text-sm text-brand-red bg-brand-red/5 border border-brand-red/20 rounded-md px-3 py-2 space-y-1">
                <div>{error}</div>
                <div className="text-[11px] text-slate-500 pt-0.5 border-t border-brand-red/10">
                  Esqueceu ou não tem certeza da sua senha?{' '}
                  <button
                    type="button"
                    onClick={handleOpenRecovery}
                    className="text-brand-blue font-medium underline hover:text-brand-blue/80"
                  >
                    Redefinir agora
                  </button>
                </div>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Rodapé com Links Oficiais de Políticas e Atendimento */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
        <a
          href="/politica-cancelamento"
          className="hover:text-slate-800 dark:hover:text-slate-300 underline transition-colors"
        >
          Política de Cancelamento
        </a>
        <span>•</span>
        <a
          href="/politica-privacidade"
          className="hover:text-slate-800 dark:hover:text-slate-300 underline transition-colors"
        >
          Política de Privacidade
        </a>
        <span>•</span>
        <a
          href="/chat-paciente"
          className="hover:text-slate-800 dark:hover:text-slate-300 underline transition-colors"
        >
          Chat com Assistente
        </a>
      </div>

      {/* Diálogo de Recuperação de Senha */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-2">
              {recoverySubmitted ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <Mail className="h-6 w-6 text-brand-blue" />
              )}
            </div>
            <DialogTitle className="text-center text-xl">
              {recoverySubmitted ? 'Verifique seu e-mail' : 'Recuperar senha'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {recoverySubmitted
                ? 'Se este e-mail estiver cadastrado, enviaremos um link de recuperação com as instruções.'
                : 'Informe o e-mail da sua conta para receber as instruções e o link de redefinição de senha.'}
            </DialogDescription>
          </DialogHeader>

          {recoverySubmitted ? (
            <div className="space-y-4 py-2">
              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
                <p>
                  Enviamos as instruções para <strong>{recoveryEmail}</strong>. Verifique sua caixa
                  de entrada e também a pasta de <em>Spam</em> ou <em>Lixo eletrônico</em>.
                </p>
                <p className="text-[11px] text-slate-500">
                  Nota do sistema: O envio depende das configurações de SMTP ativas no painel da
                  clínica.
                </p>
              </div>
              <DialogFooter className="sm:justify-center">
                <Button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                >
                  Entendi, voltar ao login
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSendRecovery} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">E-mail cadastrado</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="voce@clinica.com.br"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {recoveryError && (
                <div className="text-xs text-brand-red bg-brand-red/5 border border-brand-red/20 rounded-md px-3 py-2">
                  {recoveryError}
                </div>
              )}

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={recoveryLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={recoveryLoading}
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white flex-1"
                >
                  {recoveryLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" /> Enviar link de recuperação
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
