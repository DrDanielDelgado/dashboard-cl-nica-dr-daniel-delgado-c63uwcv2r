import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; text: string; isUrgent?: boolean }[]
  >([
    {
      role: 'ai',
      text: 'Olá! Sou o assistente virtual da Clínica Dr. Daniel Delgado. Estou aqui para ajudar com agendamentos e informações sobre nossos serviços — a avaliação de saúde fica sempre com nossos médicos. 😊 Como posso te ajudar hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isUrgent, setIsUrgent] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          conversation_id: conversationId,
        }),
      })

      const data = await res.json()
      if (data.conversation_id) setConversationId(data.conversation_id)
      if (data.is_urgent) setIsUrgent(true)

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: data.content || 'Resposta processada com sucesso.',
          isUrgent: data.is_urgent,
        },
      ])
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Não foi possível consultar o agente no momento. Equipe WhatsApp: 32 99131-5729.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elevation z-50 animate-bounce hover:animate-none"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-84 sm:w-96 h-[460px] bg-background border rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-slide-up">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between p-3.5 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <h3 className="font-semibold text-sm leading-tight">Assistente Virtual</h3>
                <p className="text-[10px] text-primary-foreground/80">
                  Dr. Daniel Delgado • Vascular
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Alerta se Urgência Detectada */}
          {isUrgent && (
            <div className="bg-red-50 text-red-900 border-b border-red-200 px-3 py-1.5 text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
              <span>Sintoma agudo ou urgência? Chame o SAMU 192 ou vá a uma emergência.</span>
            </div>
          )}

          {/* Mensagens */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : msg.isUrgent
                        ? 'bg-red-50 text-red-950 border border-red-200 rounded-tl-none'
                        : 'bg-muted rounded-tl-none',
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Aviso LGPD */}
            {messages.length > 2 && (
              <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Para agendamentos coletamos apenas nome e telefone conforme nossa{' '}
                  <a
                    href="/politica-privacidade"
                    target="_blank"
                    className="underline font-medium text-sky-600"
                  >
                    Política de Privacidade
                  </a>
                  . Dados clínicos não são armazenados no chat.
                </span>
              </div>
            )}
          </div>

          {/* Entrada de texto */}
          <div className="p-2.5 border-t bg-background space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua dúvida ou agendamento..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="text-xs h-9"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Links das Políticas */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <a
                href="/politica-cancelamento"
                target="_blank"
                className="hover:underline hover:text-foreground"
              >
                Política de Cancelamento
              </a>
              <span>•</span>
              <a
                href="/politica-privacidade"
                target="_blank"
                className="hover:underline hover:text-foreground"
              >
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
