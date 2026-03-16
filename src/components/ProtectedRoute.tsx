import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '@/stores/app'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

interface Props {
  allowedRoles?: string[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { role } = useAppStore()

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-10 animate-fade-in-up">
        <Alert variant="destructive" className="border-brand-red/50 bg-brand-red/5 shadow-sm">
          <ShieldAlert className="h-5 w-5 !text-brand-red" />
          <AlertTitle className="text-lg font-semibold text-brand-red tracking-tight">
            Acesso Restrito
          </AlertTitle>
          <AlertDescription className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
            O seu perfil atual (<strong>{role}</strong>) não tem permissão para acessar ou
            visualizar as informações deste módulo.
            <br />
            <br />
            Caso precise de acesso, entre em contato com o administrador da clínica para solicitar o
            ajuste de permissões na aba de Configurações.
            <div className="mt-6">
              <Button
                asChild
                variant="outline"
                className="border-brand-red/20 text-brand-red hover:bg-brand-red/10"
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" /> Voltar ao Início
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <Outlet />
}
