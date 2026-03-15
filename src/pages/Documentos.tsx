import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Download, Printer } from 'lucide-react'

const TEMPLATES = [
  { id: '1', title: 'Termo de Consentimento Informado' },
  { id: '2', title: 'Contrato de Prestação de Serviços' },
  { id: '3', title: 'Atestado de Comparecimento' },
  { id: '4', title: 'Laudo Pós-Operatório' },
]

export default function Documentos() {
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0])
  const [content, setContent] = useState(
    `Eu, [NOME_PACIENTE], portador(a) do CPF [CPF], autorizo o Dr. Daniel Delgado a realizar o procedimento de [PROCEDIMENTO]...\n\nData: [DATA]\nAssinatura: ___________________________`,
  )

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Documentos</h1>
        <p className="text-muted-foreground">
          Crie e exporte documentos com timbre da clínica utilizando campos automáticos.
        </p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <Card className="w-64 flex flex-col hidden md:flex shrink-0">
          <div className="p-4 border-b bg-muted/20">
            <h3 className="font-semibold">Modelos</h3>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setActiveTemplate(tmpl)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors ${activeTemplate.id === tmpl.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tmpl.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="flex-1 flex flex-col">
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4 bg-muted/10">
            <div className="space-y-1 flex-1">
              <Input
                value={activeTemplate.title}
                className="font-semibold text-lg border-transparent px-0 bg-transparent focus-visible:ring-0"
                readOnly
              />
              <div className="flex gap-2 text-xs">
                <span className="bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80">
                  [NOME_PACIENTE]
                </span>
                <span className="bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80">
                  [CPF]
                </span>
                <span className="bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80">
                  [DATA]
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" /> Imprimir
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" /> Exportar PDF
              </Button>
            </div>
          </div>
          <CardContent className="flex-1 p-0 relative">
            <div className="absolute inset-0 bg-secondary/30 p-4 sm:p-8 overflow-auto">
              <div className="mx-auto max-w-[800px] min-h-[1056px] bg-white shadow-sm border border-border p-12">
                <div className="border-b-2 border-primary pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="text-primary font-bold text-2xl tracking-tight">
                    DR. DANIEL DELGADO
                  </div>
                  <div className="text-xs sm:text-right text-muted-foreground uppercase tracking-widest leading-relaxed">
                    <span className="font-semibold">Cirurgia Vascular, Angiologia</span>
                    <br />e Ecografia Vascular
                    <br />
                    CRM: 37.525
                  </div>
                </div>

                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[500px] border-none shadow-none resize-none bg-transparent focus-visible:ring-0 p-0 text-base text-foreground leading-relaxed"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
