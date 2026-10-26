import { ArrowLeft, Clock, ShieldCheck, Mail, Building2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import brandLogo from '@/assets/captura-de-tela-2026-03-15-as-21.39.36-d4190.png'

export default function PoliticaPrivacidade() {
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
                    POLÍTICA DE PRIVACIDADE
                  </h1>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Clínica Dr. Daniel Delgado — Clínica de Patologias Vasculares
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mattos Delgado Clínica Médica LTDA
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                <Clock className="h-3.5 w-3.5" />
                <span>Última atualização: março de 2026</span>
              </div>
            </div>

            {/* Seções Verbatim com placeholders oficiais preenchidos */}
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {/* Seção 1 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  1. SOBRE ESTA POLÍTICA
                </h2>
                <p>
                  Esta política explica como coletamos, usamos, guardamos e protegemos seus dados
                  pessoais, em cumprimento à Lei nº 13.709/2018 (LGPD). Ela vale para todos os
                  canais da clínica: chat do site/dashboard, WhatsApp, telefone, e-mail e
                  atendimento presencial.
                </p>
              </section>

              {/* Seção 2 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  2. QUEM SOMOS (CONTROLADOR)
                </h2>
                <p>
                  Mattos Delgado Clínica Médica LTDA, razão social da Clínica Dr. Daniel Delgado, é
                  a responsável pelo tratamento dos seus dados.
                </p>
                <p>
                  Contato para assuntos de proteção de dados:{' '}
                  <a
                    href="mailto:danieldelgadovascular@gmail.com"
                    className="text-sky-600 dark:text-sky-400 font-medium underline"
                  >
                    danieldelgadovascular@gmail.com
                  </a>
                  .
                </p>
              </section>

              {/* Seção 3 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  3. QUAIS DADOS COLETAMOS
                </h2>
                <p>
                  <strong>Dados de identificação e contato:</strong> nome, telefone/WhatsApp e
                  e-mail, quando você os fornece.
                </p>
                <p>
                  <strong>Dados de agendamento:</strong> serviço desejado, data, horário e
                  preferência de período.
                </p>
                <p>
                  <strong>Dados de saúde:</strong> coletados apenas durante a consulta médica ou
                  solicitação de exames, registrados em prontuário e arquivos clínicos conforme as
                  normas do CFM. O assistente virtual do chat não coleta nem registra dados
                  clínicos: se você relatar sintomas espontaneamente no chat, a informação não é
                  armazenada e você é orientado à avaliação médica presencial.
                </p>
                <p>
                  <strong>Dados de pagamento:</strong> tratados somente na recepção ou em sistemas
                  financeiros contratados; nunca são solicitados no chat.
                </p>
              </section>

              {/* Seção 4 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  4. PARA QUE USAMOS (FINALIDADES E BASES LEGAIS)
                </h2>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>
                    <strong>
                      Responder solicitações e agendar, reagendar ou cancelar consultas
                    </strong>{' '}
                    — base legal: execução de contrato ou procedimentos preliminares (art. 7º, V) e,
                    quando aplicável, seu consentimento (art. 7º, I).
                  </li>
                  <li>
                    <strong>Prestar cuidado e tratamento médico</strong> — base legal: tutela da
                    saúde (art. 11, II, f) e execução de contrato (art. 7º, V).
                  </li>
                  <li>
                    <strong>Cumprir obrigações legais e regulatórias</strong>, como guarda de
                    prontuários e comunicação com operadoras de saúde — base legal: cumprimento de
                    obrigação legal ou regulatória (art. 7º, II).
                  </li>
                  <li>
                    <strong>
                      Melhorar o atendimento por meio de análise agregada das demandas
                    </strong>{' '}
                    — base legal: legítimo interesse (art. 7º, IX).
                  </li>
                </ul>
              </section>

              {/* Seção 5 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  5. COMPARTILHAMENTO
                </h2>
                <p>
                  Seus dados podem ser compartilhados apenas quando necessário: com os profissionais
                  de saúde envolvidos no seu atendimento; com operadoras de convênio, para
                  autorização e faturamento; com fornecedores de sistemas que apoiam a clínica
                  (agenda, chat e armazenamento), que atuam como operadores sob contratos com
                  obrigação de confidencialidade e segurança; e com autoridades públicas, em
                  cumprimento de obrigação legal. Nunca utilizamos seus dados para publicidade sem
                  seu consentimento expresso.
                </p>
              </section>

              {/* Seção 6 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  6. TEMPO DE CONSERVAÇÃO
                </h2>
                <p>
                  Prontuários e arquivos individuais: conservados pelo prazo mínimo exigido pelas
                  normas do Conselho Federal de Medicina (20 anos). Dados de contato coletados no
                  chat para agendamento: conservados apenas pelo tempo necessário à finalidade e,
                  depois disso, eliminados ou anonimizados.
                </p>
              </section>

              {/* Seção 7 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  7. SEGURANÇA DA INFORMAÇÃO
                </h2>
                <p>
                  Aplicamos medidas técnicas e organizacionais adequadas para proteger seus dados:
                  acesso restrito por função e senha, canais de comunicação criptografados,
                  contratos de proteção de dados com fornecedores e supervisão das práticas de
                  segurança dos sistemas utilizados pela clínica.
                </p>
              </section>

              {/* Seção 8 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  8. SEUS DIREITOS
                </h2>
                <p>
                  Você pode, a qualquer momento e sem custo: confirmar a existência de tratamento
                  dos seus dados; acessá-los; corrigir dados incompletos ou desatualizados; pedir
                  anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em
                  desacordo com a lei (ressalvada a conservação obrigatória do prontuário); pedir a
                  portabilidade dos dados; saber com quem foram compartilhados; revogar o
                  consentimento; e ser informado sobre a possibilidade de não fornecer consentimento
                  e as consequências disso. Faça pedidos pelo e-mail{' '}
                  <a
                    href="mailto:danieldelgadovascular@gmail.com"
                    className="text-sky-600 dark:text-sky-400 font-medium underline"
                  >
                    danieldelgadovascular@gmail.com
                  </a>{' '}
                  — responderemos em até 15 dias, conforme a LGPD.
                </p>
              </section>

              {/* Seção 9 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  9. COOKIES E FERRAMENTAS DO SITE
                </h2>
                <p>
                  O site e o dashboard podem usar ferramentas de navegação e chat para funcionar e
                  melhorar sua experiência. Os dados coletados por essas ferramentas seguem esta
                  política.
                </p>
              </section>

              {/* Seção 10 */}
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  10. MUDANÇAS NESTA POLÍTICA
                </h2>
                <p>
                  Podemos atualizar esta política para refletir melhorias ou mudanças legais. A
                  versão vigente estará sempre nesta página, com a data de atualização indicada.
                </p>
              </section>
            </div>

            {/* Rodapé institucional */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-sky-600" />
                <span>Contato Encarregado LGPD: danieldelgadovascular@gmail.com</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/politica-cancelamento"
                  className="hover:text-slate-900 dark:hover:text-slate-200 underline"
                >
                  Política de Cancelamento
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
