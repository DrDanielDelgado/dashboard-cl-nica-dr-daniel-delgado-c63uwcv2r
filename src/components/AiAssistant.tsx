import { useState } from 'react'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    {
      role: 'ai',
      text: 'Olá! Sou a assistente virtual nativa da clínica do Dr. Daniel Delgado. Posso tirar dúvidas sobre procedimentos vasculares ou consultar agenda e pacientes.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

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

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: data.content || 'Resposta processada com sucesso.',
        },
      ])
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Não foi possível consultar o agente no momento. Tente novamente em instantes.',
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
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-background border rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold">Assistente IA</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex w-full',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-xl p-3 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-muted rounded-tl-none',
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-background flex gap-2">
            <Input
              placeholder="Digite sua dúvida..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
