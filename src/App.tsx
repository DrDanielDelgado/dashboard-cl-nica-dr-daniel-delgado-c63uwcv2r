import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/ui/sonner'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import Atendimento from '@/pages/Atendimento'
import Estoque from '@/pages/Estoque'
import Automations from '@/pages/Automations'
import { AppProvider } from '@/stores/app'

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/atendimento" element={<Atendimento />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/automations" element={<Automations />} />

            {/* Mock routes for demonstration */}
            <Route
              path="/agenda"
              element={
                <div className="p-6 text-xl font-medium text-brand-blue">
                  Agenda (Em Desenvolvimento)
                </div>
              }
            />
            <Route
              path="/pacientes"
              element={
                <div className="p-6 text-xl font-medium text-brand-blue">
                  Pacientes (Em Desenvolvimento)
                </div>
              }
            />
            <Route
              path="/prontuarios"
              element={
                <div className="p-6 text-xl font-medium text-brand-blue">
                  Prontuários (Em Desenvolvimento)
                </div>
              }
            />
            <Route
              path="/financeiro"
              element={
                <div className="p-6 text-xl font-medium text-brand-blue">
                  Financeiro (Em Desenvolvimento)
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="p-6 text-xl font-medium text-brand-blue">
                  Configurações (Em Desenvolvimento)
                </div>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </AppProvider>
  )
}
