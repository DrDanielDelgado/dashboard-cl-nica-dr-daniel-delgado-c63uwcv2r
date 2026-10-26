import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import {
  Stethoscope,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { confirmPasswordReset } = useAuth()

  // O PocketBase envia o token no query param `token` no link de redefinição
  const token = useMemo(() => {
    return searchParams.get('token') || searchParams.get('t') || ''
  }, [searchParams])

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token de recuperação não encontrado na URL. Utilize o link enviado por e-mail.')
      return
    }

    if (password.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (password !== passwordConfirm) {
      setError('As senhas não conferem. Por favor, digite a mesma senha em ambos os campos.')
      return
    }

    setLoading(true)
    try {
      const res = await confirmPasswordReset(token, password, passwordConfirm)
      if (res.error) {
        // Tratar erro do PocketBase (token expirado, inválido, etc.)
        const rawMsg = res.error?.data?.data?.token?.message || res.error?.message || ''
        if (
          rawMsg.toLowerCase().includes('token') ||
          rawMsg.toLowerCase().includes('expired') ||
          rawMsg.toLowerCase().includes('invalid') ||
          res.error?.status === 400
        ) {
          setError(
            'O link de recuperação expirou ou é inválido. Por favor, solicite um novo link na tela de login.',
          )
        } else {
          setError('Não foi possível redefinir a senha. Tente novamente mais tarde.')
        }
        return
      }

      setSuccess(true)
    } catch (_err) {
      setError('Ocorreu um erro inesperado ao redefinir sua senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center">
            {success ? (
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            ) : (
              <KeyRound className="h-7 w-7 text-brand-blue" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            {success ? 'Senha alterada!' : 'Redefinir senha'}
          </CardTitle>
          <CardDescription>
            {success
              ? 'Sua senha foi redefinida com sucesso. Você já pode acessar a plataforma.'
              : 'Defina uma nova senha para acessar o Dashboard Clínica Dr. Daniel Delgado.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md p-3">
                Tudo pronto! Você já pode entrar utilizando seu e-mail e sua nova senha.
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
              >
                Ir para o login
              </Button>
            </div>
          ) : !token ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Link de recuperação incompleto</div>
                  <div className="text-xs text-amber-700 mt-1">
                    Não foi detectado um token de segurança nesta página. Certifique-se de clicar no
                    link completo recebido em seu e-mail de recuperação.
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo de 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPasswordConfirm ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-brand-red bg-brand-red/5 border border-brand-red/20 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando nova senha...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" /> Salvar nova senha
                  </>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs text-slate-500 hover:text-brand-blue transition-colors gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Voltar para a tela de login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
