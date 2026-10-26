import { ArrowLeft, CalendarX2, Clock, Phone, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import brandLogo from '@/assets/captura-de-tela-2026-03-15-as-21.39.36-d4190.png'

export default function PoliticaCancelamento() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Barra superior de navegação */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.history.length > 1 ? window.history.back() : (window.location.href = '/')
            }
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <a
            href="/chat-paciente"
            className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium hover:underline"
          >
            Ir para Atendimento Virtual
          </a>
        </div>

        {/* Cartão principal do documento */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-6 sm:p-10 space-y-8">
            {/* Cabeçalho Oficial */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white shadow-xs p-1.5 border border-slate-100 flex items-center justify-center shrink-0">
                  <img
                    src={brandLogo}
                    alt="Dr. Daniel Delgado"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    POLÍTICA DE CANCELAMENTO E REAGENDAMENTO
                  </h1>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Clínica Dr. Daniel Delgado — Clínica de Patologias Vasculares
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                <Clock className="h-3.5 w-3.5" />
                <span>Última atualização: março de 2026</span>
              </div>
            </div>

            {/* Texto Verbatim dos itens oficiais */}
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold text-sm shrink-0">
                  1
                </span>
                <p className="pt-0.5">
                  Cancelar ou reagendar sua consulta ou exame é gratuito, em qualquer situação.
                </p>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold text-sm shrink-0">
                  2
                </span>
                <p className="pt-0.5">
                  Pedimos apenas aviso com antecedência mínima de 24 horas, pelo WhatsApp 32
                  99131-5729 ou pelo telefone 32 99131-5729. Assim, o horário pode ser oferecido a
                  outro paciente que aguarda atendimento.
                </p>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold text-sm shrink-0">
                  3
                </span>
                <p className="pt-0.5">
                  Avisos com menos de 24 horas ou ausências sem aviso não geram cobrança. Pedimos
                  apenas que comunique quando for possível, para organizarmos a agenda.
                </p>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold text-sm shrink-0">
                  4
                </span>
                <p className="pt-0.5">
                  Imprevistos e emergências de última hora serão sempre compreendidos — basta avisar
                  quando puder.
                </p>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold text-sm shrink-0">
                  5
                </span>
                <p className="pt-0.5">
                  No dia da consulta, chegue com pelo menos 10 minutos de antecedência, com
                  documento com foto, cartão do convênio (se houver) e exames anteriores, quando
                  existirem.
                </p>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold text-sm shrink-0">
                  6
                </span>
                <p className="pt-0.5">
                  Você pode remarcar quantas vezes precisar, respeitando a antecedência de 24 horas
                  e a disponibilidade da agenda.
                </p>
              </div>
            </div>

            {/* Rodapé institucional com links de contato */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-sky-600" />
                <span>Central de Atendimento & WhatsApp: 32 99131-5729</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/politica-privacidade"
                  className="hover:text-slate-900 dark:hover:text-slate-200 underline"
                >
                  Política de Privacidade
                </a>
                <a
                  href="/chat-paciente"
                  className="hover:text-slate-900 dark:hover:text-slate-200 underline"
                >
                  Chat com Assistente Virtual
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
