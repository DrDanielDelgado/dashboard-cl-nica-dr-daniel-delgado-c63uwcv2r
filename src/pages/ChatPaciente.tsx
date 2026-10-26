import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Phone,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import brandLogo from '@/assets/captura-de-tela-2026-03-15-as-21.39.36-d4190.png'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isUrgent?: boolean
}

export default function ChatPaciente() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou o assistente virtual da Clínica Dr. Daniel Delgado. Estou aqui para ajudar com agendamentos e informações sobre nossos serviços — a avaliação de saúde fica sempre com nossos médicos. 😊 Como posso te ajudar hoje?\n\n1) Agendar consulta ou exame\n2) Informações sobre serviços e convênios\n3) Dúvidas sobre preparo e procedimentos\n4) Outro assunto',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [hasUrgentAlert, setHasUrgentAlert] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Rastrear se a IA já solicitou ou o paciente já forneceu nome/telefone
  const hasContactInfoPrompt = messages.some(
    (m) =>
      m.role === 'assistant' &&
      (m.content.toLowerCase().includes('nome e telefone') ||
        m.content.toLowerCase().includes('qual é o seu nome') ||
        m.content.toLowerCase().includes('informe seu nome')),
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (quickPrompt?: string) => {
    const textToSend = quickPrompt || input
    if (!textToSend.trim() || loading) return

    // Sanitização e salvaguarda LGPD no frontend:
    // Não persistir dados clínicos confidenciais no estado de envio
    const cleanUserText = textToSend.trim()

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: cleanUserText,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!quickPrompt) setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: cleanUserText,
          conversation_id: conversationId,
        }),
      })

      const data = await res.json()
      if (data.conversation_id) setConversationId(data.conversation_id)

      if (data.is_urgent) {
        setHasUrgentAlert(true)
      }

      setMessages((prev) => [
        ...prev,
        {
          id: data.message_id || Math.random().toString(36).substring(7),
          role: 'assistant',
          content: data.content || 'Em que mais posso te ajudar?',
          isUrgent: data.is_urgent,
        },
      ])
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content:
            'No momento estou com lentidão para processar sua mensagem. Você também pode falar diretamente com nossa equipe pelo WhatsApp 32 99131-5729.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6">
      <Card className="w-full max-w-2xl shadow-xl flex flex-col h-[92vh] max-h-[820px] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-card">
        {/* Cabeçalho */}
        <CardHeader className="border-b bg-white dark:bg-slate-900 py-3.5 px-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white shadow-xs p-1.5 border flex items-center justify-center">
              <img
                src={brandLogo}
                alt="Dr. Daniel Delgado"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Clínica Dr. Daniel Delgado
                <Sparkles className="h-4 w-4 text-sky-600" />
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Assistente Virtual • Cirurgia Vascular & Angiologia
              </CardDescription>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online 24h
          </div>
        </CardHeader>

        {/* Alerta de Urgência (se acionado pela Etapa 5A) */}
        {hasUrgentAlert && (
          <div className="bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-900 px-4 py-2.5 flex items-center gap-2.5 text-xs text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <div className="flex-1">
              <strong>Atenção a Sinais de Alarme:</strong> Se apresentar dor súbita intensa, falta
              de ar ou inchaço agudo, dirija-se imediatamente a uma emergência hospitalar ou acione
              o SAMU (192).
            </div>
          </div>
        )}

        {/* Mensagens */}
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex gap-2.5', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {m.role === 'assistant' && (
                <div
                  className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-1 text-xs',
                    m.isUrgent
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                  )}
                >
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-2xl p-3.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-sky-600 text-white rounded-br-xs'
                    : m.isUrgent
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-100 border border-red-200 dark:border-red-800 rounded-bl-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700 rounded-bl-xs',
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {/* Aviso Oficial LGPD de Coleta de Dados (Item 5 do Protocolo) */}
          {(hasContactInfoPrompt || messages.length > 2) && (
            <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="leading-relaxed">
                  <strong>Privacidade & Proteção de Dados (LGPD):</strong> Para te ajudar com o
                  agendamento ou encaminhamento, precisamos apenas do seu nome e telefone. Eles
                  serão usados somente para este atendimento, conforme nossa{' '}
                  <a
                    href="/politica-privacidade"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 dark:text-sky-400 underline font-medium hover:text-sky-700"
                  >
                    Política de Privacidade
                  </a>
                  . Você pode pedir acesso ou exclusão dos dados a qualquer momento pelo e-mail{' '}
                  <span className="font-mono text-[11px]">danieldelgadovascular@gmail.com</span>.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2 border border-slate-200/60">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Processando orientação oficial...
              </div>
            </div>
          )}
        </CardContent>

        {/* Sugestões Rápidas */}
        <div className="px-4 py-2 border-t bg-slate-50/70 dark:bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            Opções rápidas:
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 shrink-0 rounded-full"
            onClick={() => handleSend('Quero agendar uma consulta')}
          >
            1. Agendar Consulta
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 shrink-0 rounded-full"
            onClick={() => handleSend('Quais são os serviços e convênios da clínica?')}
          >
            2. Serviços & Convênios
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 shrink-0 rounded-full"
            onClick={() => handleSend('Como funciona o cancelamento ou reagendamento?')}
          >
            Política de Cancelamento
          </Button>
        </div>

        {/* Campo de Envio */}
        <div className="p-3 border-t bg-white dark:bg-slate-900 space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Digite sua dúvida sobre horários, serviços ou agendamento..."
              disabled={loading}
              className="text-sm"
            />
            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-sky-600 hover:bg-sky-700 text-white shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Links para as Políticas Oficiais e Aviso Ético */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <a
                href="/politica-cancelamento"
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-600 underline"
              >
                Política de Cancelamento
              </a>
              <span>•</span>
              <a
                href="/politica-privacidade"
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-600 underline"
              >
                Política de Privacidade
              </a>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Info className="h-3 w-3" />
              <span>Não substitui consulta médica. WhatsApp: 32 99131-5729</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
