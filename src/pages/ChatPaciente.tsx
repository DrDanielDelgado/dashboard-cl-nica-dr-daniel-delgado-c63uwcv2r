import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, RefreshCw, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import brandLogo from '@/assets/captura-de-tela-2026-03-15-as-21.39.36-d4190.png'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPaciente() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Olá! Sou a assistente virtual da Clínica Dr. Daniel Delgado (Cirurgia Vascular & Angiologia). Posso tirar dúvidas sobre procedimentos (varizes, vasinhos, escleroterapia com espuma, endolaser), exames como ecodoppler e orientações para sua consulta. Como posso te ajudar hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (quickPrompt?: string) => {
    const textToSend = quickPrompt || input
    if (!textToSend.trim() || loading) return

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: textToSend.trim(),
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
          message: textToSend.trim(),
          conversation_id: conversationId,
        }),
      })

      const data = await res.json()
      if (data.conversation_id) setConversationId(data.conversation_id)

      setMessages((prev) => [
        ...prev,
        {
          id: data.message_id || Math.random().toString(36).substring(7),
          role: 'assistant',
          content: data.content || 'Em que mais posso te ajudar?',
        },
      ])
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content:
            'No momento estou com lentidão para processar sua mensagem. Você também pode falar diretamente com nossa recepção pelo WhatsApp (32) 99131-5729.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6">
      <Card className="w-full max-w-2xl shadow-xl flex flex-col h-[90vh] max-h-[800px] border rounded-2xl overflow-hidden bg-card">
        {/* Cabeçalho */}
        <CardHeader className="border-b bg-white dark:bg-slate-900 py-4 px-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white shadow-xs p-1.5 border flex items-center justify-center">
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
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online 24h
          </div>
        </CardHeader>

        {/* Mensagens */}
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex gap-2.5', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {m.role === 'assistant' && (
                <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-1 text-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-2xl p-3.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-sky-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-bl-xs',
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2 border">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Digitando orientações...
              </div>
            </div>
          )}
        </CardContent>

        {/* Sugestões Rápidas */}
        <div className="px-4 py-2 border-t bg-slate-50/70 dark:bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            Dúvidas rápidas:
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 shrink-0 rounded-full"
            onClick={() => handleSend('Como funciona a escleroterapia com espuma?')}
          >
            Escleroterapia com Espuma
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 shrink-0 rounded-full"
            onClick={() => handleSend('Preciso de jejum para o Ecodoppler?')}
          >
            Preparo para Ecodoppler
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 shrink-0 rounded-full"
            onClick={() => handleSend('Quero agendar uma consulta com o Dr. Daniel')}
          >
            Agendar Consulta
          </Button>
        </div>

        {/* Campo de Envio */}
        <div className="p-3 border-t bg-white dark:bg-slate-900">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Digite sua dúvida sobre varizes, exames ou agendamento..."
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
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Orientação informativa da Clínica Dr. Daniel Delgado. Em caso de dor súbita ou urgência,
            procure pronto atendimento.
          </p>
        </div>
      </Card>
    </div>
  )
}
