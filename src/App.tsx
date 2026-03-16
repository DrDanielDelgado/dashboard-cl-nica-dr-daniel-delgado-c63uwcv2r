import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/ui/sonner'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import Atendimento from '@/pages/Atendimento'
import Estoque from '@/pages/Estoque'
import Automations from '@/pages/Automations'
import Prontuario from '@/pages/Prontuario'
import Financeiro from '@/pages/Financeiro'
import Configuracoes from '@/pages/Configuracoes'
import { AppProvider } from '@/stores/app'
import { FinanceiroProvider } from '@/stores/financeiro'
import { HiDoctorProvider } from '@/stores/hidoctor'
import { AuditProvider } from '@/stores/audit'

export default function App() {
  return (
    <AppProvider>
      <FinanceiroProvider>
        <HiDoctorProvider>
          <AuditProvider>
            <Router>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/atendimento" element={<Atendimento />} />
                  <Route path="/estoque" element={<Estoque />} />
                  <Route path="/automations" element={<Automations />} />
                  <Route path="/prontuario" element={<Prontuario />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />

                  {/* Mock routes for demonstration */}
                  <Route
                    path="/agenda"
                    element={
                      <div className="p-6 text-xl font-medium text-brand-blue animate-fade-in">
                        Agenda (Em Desenvolvimento)
                      </div>
                    }
                  />
                  <Route
                    path="/pacientes"
                    element={
                      <div className="p-6 text-xl font-medium text-brand-blue animate-fade-in">
                        Pacientes (Em Desenvolvimento)
                      </div>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <Toaster />
            </Router>
          </AuditProvider>
        </HiDoctorProvider>
      </FinanceiroProvider>
    </AppProvider>
  )
}
