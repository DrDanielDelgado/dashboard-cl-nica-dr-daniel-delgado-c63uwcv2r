import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/stores/app'
import { FinanceiroProvider } from '@/stores/financeiro'

import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import Index from './pages/Index'
import Agenda from './pages/Agenda'
import Financeiro from './pages/Financeiro'
import Estoque from './pages/Estoque'
import CRM from './pages/CRM'
import Chatbot from './pages/Chatbot'
import Prontuario from './pages/Prontuario'
import Automacoes from './pages/Automacoes'
import Documentos from './pages/Documentos'
import Equipe from './pages/Equipe'
import Configuracoes from './pages/Configuracoes'

const App = () => (
  <AppProvider>
    <FinanceiroProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/prontuario" element={<Prontuario />} />
              <Route path="/automacoes" element={<Automacoes />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/equipe" element={<Equipe />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </FinanceiroProvider>
  </AppProvider>
)

export default App
