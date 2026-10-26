import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Atendimento from '@/pages/Atendimento'
import CRM from '@/pages/CRM'
import Estoque from '@/pages/Estoque'
import Automations from '@/pages/Automations'
import Marketing from '@/pages/Marketing'
import AssistenteIA from '@/pages/AssistenteIA'
import ChatPaciente from '@/pages/ChatPaciente'
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

  if (!user) {
    return (
      <>
        <Login />
        <Toaster />
      </>
    )
  }

  return (
    <AppProvider>
      <AuditProvider>
        <Router>
          <Routes>
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
            {/* Rota pública para chat de paciente */}
            <Route path="/chat-paciente" element={<ChatPaciente />} />
          </Routes>
          <Toaster />
        </Router>
      </AuditProvider>
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
