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
import Agenda from '@/pages/Agenda'
import { AppProvider } from '@/stores/app'
import { FinanceiroProvider } from '@/stores/financeiro'
import { HiDoctorProvider } from '@/stores/hidoctor'
import { AuditProvider } from '@/stores/audit'
import { AgendaProvider } from '@/stores/agenda'

export default function App() {
  return (
    <AppProvider>
      <FinanceiroProvider>
        <HiDoctorProvider>
          <AuditProvider>
            <AgendaProvider>
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
                    <Route path="/agenda" element={<Agenda />} />

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
            </AgendaProvider>
          </AuditProvider>
        </HiDoctorProvider>
      </FinanceiroProvider>
    </AppProvider>
  )
}
