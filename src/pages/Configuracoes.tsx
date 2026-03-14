import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, FileSignature, MessageSquare, Landmark } from 'lucide-react'
import { DomainSettings } from '@/components/settings/DomainSettings'
import { NFeSettings } from '@/components/settings/NFeSettings'
import { WhatsAppSettings } from '@/components/settings/WhatsAppSettings'
import { BankSettings } from '@/components/settings/BankSettings'

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Produção</h1>
        <p className="text-muted-foreground">
          Gerencie domínios e chaves de API para integrações reais (Fazenda MG, C6 Bank, WhatsApp).
        </p>
      </div>

      <Tabs defaultValue="dominio" className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto w-fit max-w-full justify-start">
          <TabsTrigger value="dominio" className="gap-2 py-2">
            <Globe className="h-4 w-4" /> Geral (Domínio)
          </TabsTrigger>
          <TabsTrigger value="nfe" className="gap-2 py-2">
            <FileSignature className="h-4 w-4" /> Fiscal (NF-e MG)
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2 py-2">
            <MessageSquare className="h-4 w-4" /> Comunicação (WhatsApp)
          </TabsTrigger>
          <TabsTrigger value="banco" className="gap-2 py-2">
            <Landmark className="h-4 w-4" /> Financeiro (C6 Bank)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dominio" className="outline-none">
          <DomainSettings />
        </TabsContent>

        <TabsContent value="nfe" className="outline-none">
          <NFeSettings />
        </TabsContent>

        <TabsContent value="whatsapp" className="outline-none">
          <WhatsAppSettings />
        </TabsContent>

        <TabsContent value="banco" className="outline-none">
          <BankSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
