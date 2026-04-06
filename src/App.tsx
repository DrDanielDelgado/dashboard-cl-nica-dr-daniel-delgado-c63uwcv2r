import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import Atendimento from '@/pages/Atendimento'
import CRM from '@/pages/CRM'
import Estoque from '@/pages/Estoque'
import Automations from '@/pages/Automations'
import Prontuario from '@/pages/Prontuario'
import Financeiro from '@/pages/Financeiro'
import Configuracoes from '@/pages/Configuracoes'
import Agenda from '@/pages/Agenda'

import { AppProvider } from '@/stores/app'
import { AuditProvider } from '@/stores/audit'

export default function App() {
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
              <Route path="/prontuario" element={<Prontuario />} />
              <Route path="/agenda" element={<Agenda />} />

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
          <Toaster />
        </Router>
      </AuditProvider>
    </AppProvider>
  )
}
