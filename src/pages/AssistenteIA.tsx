import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  User,
  Database,
  ExternalLink,
  MessageSquare,
  Copy,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created?: string
}

interface ConversationItem {
  id: string
  title?: string
  created?: string
  updated?: string
}

export default function AssistenteIA() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá, Dr. Daniel e equipe! Sou o Assistente de Inteligência Artificial nativo da clínica. Tenho acesso às coleções de Pacientes, Agendamentos, Orçamentos e Leads do sistema, além da base de conhecimento vascular (escleroterapia, endolaser, ecodoppler, etc.). Como posso ajudar hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeTab, setActiveTab] = useState<'chat' | 'config' | 'public'>('chat')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const publicChatUrl = `${window.location.origin}/chat-paciente`

  // Carregar histórico de conversas
  const loadConversations = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/agent/conversations`,
        {
          headers: {
            Authorization: pb.authStore.token,
          },
        },
      )
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.conversations)) {
          setConversations(data.conversations)
        }
      }
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || loading) return

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: textToSend.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!messageText) setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token,
        },
        body: JSON.stringify({
          message: textToSend.trim(),
          conversation_id: conversationId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao comunicar com o agente de IA')
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }

      const aiMsg: ChatMessage = {
        id: data.message_id || Math.random().toString(36).substring(7),
        role: 'assistant',
        content: data.content || 'Resposta processada com sucesso.',
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Assistente',
        description: err.message,
      })
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content:
            'Desculpe, ocorreu uma instabilidade momentânea ao processar sua pergunta. Por favor tente novamente.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = () => {
    setConversationId(null)
    setMessages([
      {
        id: 'new',
        role: 'assistant',
        content:
          'Nova conversa iniciada. Estou pronto para tirar dúvidas vasculares, consultar prontuários ou agendamentos.',
      },
    ])
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            Assistente IA da Clínica
          </h1>
          <p className="text-muted-foreground mt-1">
            Agente nativo do Skip Cloud (
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              clinica-daniel-delgado
            </code>
            ). Substitui totalmente assinaturas externas como GPTmaker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1.5 px-3"
          >
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            Agente Skip Cloud Ativo
          </Badge>
          <Button variant="outline" size="sm" onClick={handleNewConversation}>
            Nova Conversa
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-lg grid-cols-3 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger
            value="chat"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Chat com Agente
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm gap-2"
          >
            <Database className="h-4 w-4" />
            Dados & Ferramentas
          </TabsTrigger>
          <TabsTrigger
            value="public"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Link para Pacientes
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CHAT DO MÉDICO / EQUIPE */}
        <TabsContent value="chat" className="m-0 focus-visible:outline-none">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sugestões e Histórico Rápido */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Consultas Frequentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-auto py-2 text-left whitespace-normal"
                    onClick={() => handleSend('Quais são as consultas agendadas para hoje?')}
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1.5 shrink-0 text-brand-blue" />
                    Ver agendamentos de hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-auto py-2 text-left whitespace-normal"
                    onClick={() =>
                      handleSend('Como funciona o preparo para o Ecodoppler vascular?')
                    }
                  >
                    <Stethoscope className="h-3.5 w-3.5 mr-1.5 shrink-0 text-brand-blue" />
                    Preparo para Ecodoppler
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-auto py-2 text-left whitespace-normal"
                    onClick={() =>
                      handleSend('Qual a recomendação pós-operatória para cirurgia de endolaser?')
                    }
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 shrink-0 text-brand-blue" />
                    Pós-operatório de Endolaser
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-auto py-2 text-left whitespace-normal"
                    onClick={() => handleSend('Quantos orçamentos pendentes existem no sistema?')}
                  >
                    <Database className="h-3.5 w-3.5 mr-1.5 shrink-0 text-brand-blue" />
                    Verificar orçamentos pendentes
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Memória RAG Integrada</CardTitle>
                  <CardDescription className="text-xs">
                    O agente utiliza FAQs cirúrgicos e dados em tempo real da clínica para
                    responder.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>Modelo:</span>
                    <span className="font-medium text-foreground">Fast (Skip AI Gateway)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Persistência:</span>
                    <span className="font-medium text-foreground">Tabelas Nativas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Acesso a Dados:</span>
                    <span className="font-medium text-emerald-600">Pacientes, Agenda, CRM</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Painel do Chat */}
            <div className="lg:col-span-3">
              <Card className="shadow-sm flex flex-col h-[600px]">
                <CardHeader className="border-b py-3 px-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-none">
                          Assistente Dr. Daniel Delgado
                        </h3>
                        <span className="text-[11px] text-emerald-600 font-medium">
                          ● Conectado ao Skip Cloud
                        </span>
                      </div>
                    </div>
                    {conversationId && (
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Thread: {conversationId.slice(0, 8)}...
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-3',
                          msg.role === 'user' ? 'justify-end' : 'justify-start',
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'rounded-2xl p-4 text-sm leading-relaxed max-w-[85%] shadow-xs whitespace-pre-wrap',
                            msg.role === 'user'
                              ? 'bg-brand-blue text-white rounded-br-xs'
                              : 'bg-muted/70 text-foreground border border-border/50 rounded-bl-xs',
                          )}
                        >
                          {msg.content}
                        </div>
                        {msg.role === 'user' && (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-3 justify-start">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted/70 rounded-2xl p-4 text-sm text-muted-foreground flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>
                            O assistente está consultando a base da clínica e gerando a resposta...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-4 border-t bg-card">
                  <div className="flex gap-2 max-w-3xl mx-auto">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Pergunte sobre cirurgias, pacientes, horários ou preparo..."
                      disabled={loading}
                      className="text-sm"
                    />
                    <Button
                      onClick={() => handleSend()}
                      disabled={loading || !input.trim()}
                      className="bg-brand-blue text-white hover:bg-brand-blue/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: FERRAMENTAS E DADOS DA CLÍNICA */}
        <TabsContent value="config" className="space-y-6 m-0 focus-visible:outline-none">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-5 w-5 text-brand-blue" />
                  Coleções Integradas como Ferramentas (Tools)
                </CardTitle>
                <CardDescription>
                  O agente possui permissão nativa para consultar e interagir com estas tabelas:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg bg-card flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">patients (Pacientes)</h4>
                    <p className="text-xs text-muted-foreground">
                      Leitura, busca e cadastro de pacientes
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    Totalmente Ativo
                  </Badge>
                </div>

                <div className="p-3 border rounded-lg bg-card flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">appointments (Consultas & Cirurgias)</h4>
                    <p className="text-xs text-muted-foreground">
                      Consulta de horários, confirmação e reagendamentos
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    Totalmente Ativo
                  </Badge>
                </div>

                <div className="p-3 border rounded-lg bg-card flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">
                      leads (Oportunidades & Novos Contatos)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Registro automático de novos pacientes interessados
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    Totalmente Ativo
                  </Badge>
                </div>

                <div className="p-3 border rounded-lg bg-card flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">budgets (Orçamentos Cirúrgicos)</h4>
                    <p className="text-xs text-muted-foreground">
                      Consulta de valores e status de propostas
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    Totalmente Ativo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-brand-blue" />
                  Base de Conhecimento Médico (RAG Nativo)
                </CardTitle>
                <CardDescription>
                  Protocolos vasculares indexados na memória vetorial do agente:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-muted/40 rounded-lg border">
                  <h5 className="font-semibold text-xs text-brand-blue mb-1">
                    Escleroterapia com Espuma Densa
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Orientações de repouso relativo, uso de meias elásticas de compressão graduada e
                    proteção solar para evitar hipercromias.
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border">
                  <h5 className="font-semibold text-xs text-brand-blue mb-1">
                    Endolaser & Termoablação
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Procedimento hospitalar/ambulatorial com anestesia local, rápida recuperação
                    (2-3 dias) e sem cortes extensos.
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border">
                  <h5 className="font-semibold text-xs text-brand-blue mb-1">
                    Ecodoppler Vascular Venoso & Arterial
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Mapeamento hemodinâmico completo em Juiz de Fora e unidades conveniadas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: LINK PÚBLICO PARA PACIENTES */}
        <TabsContent value="public" className="space-y-6 m-0 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-brand-blue" />
                Chat Público para Pacientes
              </CardTitle>
              <CardDescription>
                Exponha um link oficial ou botão no site da clínica para os pacientes tirarem
                dúvidas 24h por dia com a IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Link de Acesso Direto</span>
                <div className="flex gap-2">
                  <Input readOnly value={publicChatUrl} className="font-mono text-sm bg-muted/50" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(publicChatUrl, 'Link do chat')}
                  >
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copiar
                  </Button>
                  <Button
                    className="bg-brand-blue text-white"
                    onClick={() => window.open(publicChatUrl, '_blank')}
                  >
                    Abrir Página
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Você pode divulgar este link na bio do Instagram ou colocar um link direto no
                  WhatsApp para triagem automática.
                </p>
              </div>

              <div className="p-4 border rounded-xl bg-blue-50/50 dark:bg-blue-950/20 space-y-2 text-xs">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Substituição Completa de Plataformas Externas
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Diferente do GPTmaker (que cobrava mensalidade por tokens e dependia de webhooks
                  instáveis), o agente agora roda 100% dentro da infraestrutura do Skip Cloud com
                  latência mínima e privacidade total dos dados médicos da clínica.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
