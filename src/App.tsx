import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/ui/sonner'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import { AutomationBuilder } from '@/components/settings/automation/AutomationBuilder'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route
            path="/automations"
            element={
              <div className="p-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold tracking-tight text-brand-blue">Automações</h1>
                  <p className="text-muted-foreground mt-1">
                    Crie e gerencie fluxos de automação para sua clínica.
                  </p>
                </div>
                <AutomationBuilder />
              </div>
            }
          />
          {/* Mock routes for demonstration */}
          <Route path="/agenda" element={<div className="p-6">Agenda</div>} />
          <Route path="/pacientes" element={<div className="p-6">Pacientes</div>} />
          <Route path="/prontuarios" element={<div className="p-6">Prontuários</div>} />
          <Route path="/financeiro" element={<div className="p-6">Financeiro</div>} />
          <Route path="/estoque" element={<div className="p-6">Estoque</div>} />
          <Route path="/settings" element={<div className="p-6">Configurações</div>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  )
}
