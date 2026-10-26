import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import RedefinirSenha from '@/pages/RedefinirSenha'
import NotFound from '@/pages/NotFound'
import Atendimento from '@/pages/Atendimento'
import CRM from '@/pages/CRM'
import Estoque from '@/pages/Estoque'
import Automations from '@/pages/Automations'
import Marketing from '@/pages/Marketing'
import AssistenteIA from '@/pages/AssistenteIA'
import ChatPaciente from '@/pages/ChatPaciente'
import PoliticaCancelamento from '@/pages/PoliticaCancelamento'
import PoliticaPrivacidade from '@/pages/PoliticaPrivacidade'
import Prontuario from '@/pages/Prontuario'
import Financeiro from '@/pages/Financeiro'
import Configuracoes from '@/pages/Configuracoes'
import Agenda from '@/pages/Agenda'
import ConexoesApi from '@/pages/ConexoesApi'

import { AppProvider } from '@/stores/app'
import { AuditProvider } from '@/stores/audit'
import { AuthProvider, useAuth } from '@/lib/auth'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-sm font-medium">Carregando...</div>
      </div>
    )
  }

  // Rotas de recuperação de senha disponíveis tanto anônimo quanto autenticado
  const passwordResetRoutes = (
    <>
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
      <Route path="/reset-password" element={<RedefinirSenha />} />
      <Route path="/reset-password/:token" element={<RedefinirSenha />} />
      {/* Compatibilidade com todos os formatos de links enviados pelo PocketBase padrão */}
      <Route path="/auth/confirm-password-reset/:token" element={<RedefinirSenha />} />
      <Route path="/auth/confirm-password-reset" element={<RedefinirSenha />} />
      <Route path="/confirm-password-reset/:token" element={<RedefinirSenha />} />
      <Route path="/confirm-password-reset" element={<RedefinirSenha />} />
    </>
  )

  // Rotas públicas institucionais (acessíveis sem autenticação e com autenticação)
  const publicPagesRoutes = (
    <>
      <Route path="/chat-paciente" element={<ChatPaciente />} />
      <Route path="/politica-cancelamento" element={<PoliticaCancelamento />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
    </>
  )

  if (!user) {
    return (
      <Routes>
        {passwordResetRoutes}
        {publicPagesRoutes}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <AppProvider>
      <AuditProvider>
        <Routes>
          {passwordResetRoutes}
          {publicPagesRoutes}

          <Route element={<Layout />}>
            {/* Common Routes - Accessible by Secretary and others */}
            <Route path="/" element={<Index />} />
            <Route path="/atendimento" element={<Atendimento />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/assistente-ia" element={<AssistenteIA />} />
            <Route path="/prontuario" element={<Prontuario />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/conexoes-api" element={<ConexoesApi />} />

            {/* Highly Protected Route - Financeiro (No Secretary) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['Médico', 'Administrador', 'Gerente', 'Gerenciador', 'Contador']}
                />
              }
            >
              <Route path="/financeiro" element={<Financeiro />} />
            </Route>

            {/* Admin/Manager Route - Configuracoes */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['Médico', 'Administrador', 'Gerente', 'Gerenciador']}
                />
              }
            >
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuditProvider>
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </AuthProvider>
  )
}
