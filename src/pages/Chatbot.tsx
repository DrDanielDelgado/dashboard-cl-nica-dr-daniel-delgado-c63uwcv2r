import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatbotPlatforms } from '@/components/chatbot/ChatbotPlatforms'
import { ChatbotFlows } from '@/components/chatbot/ChatbotFlows'
import { ChatbotKeywords } from '@/components/chatbot/ChatbotKeywords'
import { ChatbotHandoff } from '@/components/chatbot/ChatbotHandoff'
import { Network, BotMessageSquare, MessageSquareText, HandHelping } from 'lucide-react'

export default function Chatbot() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chatbot Omnichannel</h1>
        <p className="text-muted-foreground">
          Gerencie o assistente virtual integrado para WhatsApp, Instagram e Facebook Messenger.
        </p>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto w-fit max-w-full justify-start">
          <TabsTrigger value="platforms" className="gap-2 py-2">
            <Network className="h-4 w-4" /> Plataformas & API
          </TabsTrigger>
          <TabsTrigger value="flows" className="gap-2 py-2">
            <BotMessageSquare className="h-4 w-4" /> Fluxos & IA
          </TabsTrigger>
          <TabsTrigger value="keywords" className="gap-2 py-2">
            <MessageSquareText className="h-4 w-4" /> Palavras-chave
          </TabsTrigger>
          <TabsTrigger value="handoff" className="gap-2 py-2">
            <HandHelping className="h-4 w-4" /> Transbordo Humano
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="outline-none">
          <ChatbotPlatforms />
        </TabsContent>

        <TabsContent value="flows" className="outline-none">
          <ChatbotFlows />
        </TabsContent>

        <TabsContent value="keywords" className="outline-none">
          <ChatbotKeywords />
        </TabsContent>

        <TabsContent value="handoff" className="outline-none">
          <ChatbotHandoff />
        </TabsContent>
      </Tabs>
    </div>
  )
}
