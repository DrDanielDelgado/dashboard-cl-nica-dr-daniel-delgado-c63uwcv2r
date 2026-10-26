import { useState, useRef } from 'react'
import {
  Play,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Mail,
  MessageSquare,
  Bell,
  Bot,
  Clock,
  Filter,
  UserCheck,
  TrendingUp,
  XCircle,
  HelpCircle,
  Sparkles,
  Link as LinkIcon,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AutomationFlowRecord,
  VisualFlowNode,
  VisualFlowEdge,
  FlowNodeType,
  updateAutomationFlow,
} from '@/services/automation'
import { useToast } from '@/hooks/use-toast'

interface VisualFlowBuilderProps {
  flow: AutomationFlowRecord
  onBack: () => void
  onSaveSuccess: (updated: AutomationFlowRecord) => void
  onOpenTestModal: (flow: AutomationFlowRecord) => void
}

const PALETTE_ITEMS: Array<{
  type: FlowNodeType
  title: string
  description: string
  icon: any
  category: 'gatilho' | 'comunicacao' | 'logica' | 'crm'
  badgeColor: string
}> = [
  {
    type: 'trigger',
    title: 'Gatilho do Fluxo',
    description: 'Ponto de entrada que dispara a automação.',
    icon: Play,
    category: 'gatilho',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    type: 'whatsapp',
    title: 'Enviar WhatsApp',
    description: 'Mensagem de texto ou template Meta Cloud API.',
    icon: MessageSquare,
    category: 'comunicacao',
    badgeColor: 'bg-emerald-500 text-white',
  },
  {
    type: 'email',
    title: 'Enviar E-mail',
    description: 'E-mail marketing nativo com layout oficial.',
    icon: Mail,
    category: 'comunicacao',
    badgeColor: 'bg-sky-500 text-white',
  },
  {
    type: 'push',
    title: 'Enviar Web Push',
    description: 'Notificação imediata no navegador do paciente.',
    icon: Bell,
    category: 'comunicacao',
    badgeColor: 'bg-amber-500 text-white',
  },
  {
    type: 'chatbot',
    title: 'Assistente IA',
    description: 'Resposta inteligente com o agente da clínica.',
    icon: Bot,
    category: 'comunicacao',
    badgeColor: 'bg-purple-600 text-white',
  },
  {
    type: 'delay',
    title: 'Atraso / Espera',
    description: 'Aguarde X minutos, horas ou dias.',
    icon: Clock,
    category: 'logica',
    badgeColor: 'bg-slate-700 text-white',
  },
  {
    type: 'condition',
    title: 'Condição (If / Else)',
    description: 'Bifurque o fluxo por dados, estágio ou agendamento.',
    icon: Filter,
    category: 'logica',
    badgeColor: 'bg-indigo-600 text-white',
  },
  {
    type: 'update_contact',
    title: 'Atualizar Contato',
    description: 'Grava campo ou variável no paciente/lead.',
    icon: UserCheck,
    category: 'crm',
    badgeColor: 'bg-teal-600 text-white',
  },
  {
    type: 'update_stage',
    title: 'Atualizar Etapa CRM',
    description: 'Move o card no Pipeline Kanban (ex: Consulta).',
    icon: TrendingUp,
    category: 'crm',
    badgeColor: 'bg-blue-600 text-white',
  },
  {
    type: 'end',
    title: 'Fim do Fluxo',
    description: 'Encerra a jornada deste contato.',
    icon: XCircle,
    category: 'logica',
    badgeColor: 'bg-rose-600 text-white',
  },
]

export function VisualFlowBuilder({
  flow,
  onBack,
  onSaveSuccess,
  onOpenTestModal,
}: VisualFlowBuilderProps) {
  const { toast } = useToast()
  const [nodes, setNodes] = useState<VisualFlowNode[]>(
    flow.definition?.nodes && flow.definition.nodes.length > 0
      ? flow.definition.nodes
      : [
          {
            id: 'n_trigger',
            type: 'trigger',
            title: 'Gatilho Inicial',
            description: 'Entrada do fluxo SendPulse 360',
            position: { x: 340, y: 50 },
            config: {},
          },
        ],
  )
  const [edges, setEdges] = useState<VisualFlowEdge[]>(flow.definition?.edges || [])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null)
  const [connectingCondition, setConnectingCondition] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [flowName, setFlowName] = useState(flow.name)
  const [flowStatus, setFlowStatus] = useState(flow.status)
  const [flowTriggerType, setFlowTriggerType] = useState(flow.trigger_type)

  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const node = nodes.find((n) => n.id === id)
    if (!node) return
    const currentPos = node.position || { x: 100, y: 100 }
    setDraggingNodeId(id)
    setDragOffset({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    })
    setSelectedNodeId(id)
  }

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingNodeId) return
    const newX = Math.max(20, e.clientX - dragOffset.x)
    const newY = Math.max(20, e.clientY - dragOffset.y)
    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, position: { x: newX, y: newY } } : n)),
    )
  }

  const handleMouseUpCanvas = () => {
    setDraggingNodeId(null)
  }

  const handleAddNode = (type: FlowNodeType) => {
    const palette = PALETTE_ITEMS.find((p) => p.type === type)
    const newId = `node_${Math.random().toString(36).substring(2, 9)}`
    // Encontrar uma posição inteligente abaixo do último nó
    const lastNode = nodes[nodes.length - 1]
    const nextY = lastNode && lastNode.position ? lastNode.position.y + 140 : 100
    const nextX = lastNode && lastNode.position ? lastNode.position.x : 340

    const newNode: VisualFlowNode = {
      id: newId,
      type: type,
      title: palette ? palette.title : 'Novo Elemento',
      description: palette ? palette.description : '',
      position: { x: nextX, y: nextY },
      config:
        type === 'delay'
          ? { duration: 1, unit: 'hours' }
          : type === 'condition'
            ? { conditionType: 'has_appointment', operator: 'equals', expectedValue: '' }
            : type === 'update_stage'
              ? { stage: 'Consultation' }
              : type === 'update_contact'
                ? { field: 'notes', value: 'Lead qualificado via automação' }
                : type === 'chatbot'
                  ? {
                      instruction: 'Gere uma mensagem acolhedora de acompanhamento.',
                      channel: 'whatsapp',
                    }
                  : type === 'whatsapp'
                    ? { text: 'Olá {primeiro_nome}, como você está? Dr. Daniel Delgado aqui.' }
                    : type === 'email'
                      ? {
                          subject: 'Comunicado Especial - Clínica Dr. Daniel Delgado',
                          content: 'Olá {primeiro_nome},\n\nConteúdo personalizado da mensagem.',
                        }
                      : type === 'push'
                        ? {
                            title: 'Lembrete Clínica Dr. Daniel Delgado',
                            text: 'Você tem uma atualização importante sobre seu tratamento.',
                            url: '/agenda',
                          }
                        : {},
    }

    setNodes([...nodes, newNode])
    setSelectedNodeId(newId)

    // Se houver um nó anterior que não seja end e nem condition, conectar automaticamente
    if (lastNode && lastNode.type !== 'end' && lastNode.type !== 'condition') {
      const alreadyConnected = edges.some((e) => e.source === lastNode.id)
      if (!alreadyConnected) {
        setEdges((prev) => [
          ...prev,
          {
            id: `edge_${Math.random().toString(36).substring(2, 8)}`,
            source: lastNode.id,
            target: newId,
          },
        ])
      }
    }

    toast({
      title: 'Elemento Adicionado',
      description: `${palette?.title} adicionado à área de trabalho.`,
    })
  }

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id))
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id))
    if (selectedNodeId === id) setSelectedNodeId(null)
  }

  const handleStartConnect = (sourceId: string, conditionBranch?: boolean) => {
    setConnectingSourceId(sourceId)
    setConnectingCondition(conditionBranch !== undefined ? conditionBranch : null)
    toast({
      title: 'Modo de Conexão Ativo',
      description: 'Agora clique no elemento de destino para criar a ligação.',
    })
  }

  const handleTargetClick = (targetId: string) => {
    if (!connectingSourceId) return
    if (connectingSourceId === targetId) {
      setConnectingSourceId(null)
      return
    }

    // Evitar conexões duplicadas exatamente iguais
    const exists = edges.some(
      (e) =>
        e.source === connectingSourceId &&
        e.target === targetId &&
        e.condition === connectingCondition,
    )

    if (!exists) {
      const newEdge: VisualFlowEdge = {
        id: `e_${Math.random().toString(36).substring(2, 8)}`,
        source: connectingSourceId,
        target: targetId,
        condition: connectingCondition !== null ? connectingCondition : undefined,
        label:
          connectingCondition === true ? 'Sim' : connectingCondition === false ? 'Não' : undefined,
        sourceHandle:
          connectingCondition === true ? 'yes' : connectingCondition === false ? 'no' : undefined,
      }
      setEdges([...edges, newEdge])
      toast({
        title: 'Elementos Conectados',
        description: 'Fluxo vinculado com sucesso.',
      })
    }
    setConnectingSourceId(null)
    setConnectingCondition(null)
  }

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateAutomationFlow(flow.id, {
        name: flowName,
        status: flowStatus,
        trigger_type: flowTriggerType,
        definition: {
          nodes,
          edges,
        },
      })
      toast({
        title: 'Fluxo Salvo com Sucesso!',
        description: 'As definições do fluxo visual foram atualizadas no Skip Cloud.',
      })
      onSaveSuccess(updated)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar fluxo',
        description: err.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const updateNodeConfig = (id: string, newConfig: Record<string, any>, title?: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            title: title || n.title,
            config: { ...n.config, ...newConfig },
          }
        }
        return n
      }),
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[640px] bg-slate-50 border rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      {/* Top Bar */}
      <div className="h-16 px-6 bg-white border-b flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-slate-600">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="font-semibold text-base w-72 h-9 border-transparent hover:border-slate-300 focus:border-brand-blue"
            />
            <Badge
              variant="outline"
              className={
                flowStatus === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }
            >
              {flowStatus === 'active' ? 'Ativo' : flowStatus === 'paused' ? 'Pausado' : 'Rascunho'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border text-xs">
            <span className="text-muted-foreground">Status:</span>
            <Select value={flowStatus} onValueChange={(v: any) => setFlowStatus(v)}>
              <SelectTrigger className="h-7 border-none bg-transparent font-medium text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo (Executando)</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => onOpenTestModal(flow)}
            className="text-brand-blue border-brand-blue/30 hover:bg-brand-blue/10 gap-2 h-9"
          >
            <Play className="h-4 w-4" />
            Testar com Contato
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-red hover:bg-brand-red/90 text-white gap-2 shadow-sm h-9"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Fluxo'}
          </Button>
        </div>
      </div>

      {/* Main Area: Palette + Canvas + Property Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Palette */}
        <div className="w-72 bg-white border-r flex flex-col z-10 select-none">
          <div className="p-4 border-b bg-slate-50/70">
            <h3 className="font-semibold text-sm text-slate-800">Elementos do Fluxo</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clique para adicionar blocos ao seu fluxo automatizado.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {PALETTE_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.type}
                  onClick={() => handleAddNode(item.type)}
                  className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-blue/50 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3 group"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${item.badgeColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-800 group-hover:text-brand-blue">
                        {item.title}
                      </h4>
                      <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3 bg-blue-50/50 border-t text-[11px] text-blue-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-blue shrink-0" />
            <span>
              Suporta variáveis {`{nome}`}, {`{primeiro_nome}`} em e-mails e WhatsApp.
            </span>
          </div>
        </div>

        {/* Central Canvas */}
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          onClick={() => {
            if (connectingSourceId) setConnectingSourceId(null)
          }}
          className="flex-1 bg-grid-pattern relative overflow-auto p-12 min-h-full cursor-crosshair"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {connectingSourceId && (
            <div className="absolute top-4 left-4 z-30 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
              <LinkIcon className="h-3.5 w-3.5" />
              Clique no elemento de destino para concluir a conexão...
            </div>
          )}

          {/* SVG Connections (Edges) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ minWidth: '2000px', minHeight: '2000px' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#0284c7" />
              </marker>
              <marker
                id="arrowhead-yes"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
              <marker
                id="arrowhead-no"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const srcNode = nodes.find((n) => n.id === edge.source)
              const tgtNode = nodes.find((n) => n.id === edge.target)
              if (!srcNode || !tgtNode) return null

              const srcPos = srcNode.position || { x: 300, y: 100 }
              const tgtPos = tgtNode.position || { x: 300, y: 300 }

              // Ponto central inferior do source e superior do target
              const x1 = srcPos.x + 120
              const y1 = srcPos.y + 70
              const x2 = tgtPos.x + 120
              const y2 = tgtPos.y

              const midY = (y1 + y2) / 2
              const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`

              const isConditionYes = edge.condition === true
              const isConditionNo = edge.condition === false
              const strokeColor = isConditionYes ? '#10b981' : isConditionNo ? '#ef4444' : '#0284c7'
              const markerId = isConditionYes
                ? 'url(#arrowhead-yes)'
                : isConditionNo
                  ? 'url(#arrowhead-no)'
                  : 'url(#arrowhead)'

              return (
                <g key={edge.id} className="pointer-events-auto group">
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                    strokeDasharray={isConditionNo ? '4 4' : 'none'}
                    markerEnd={markerId}
                  />
                  {edge.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 6}
                      fill={strokeColor}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-white px-1"
                    >
                      {edge.label}
                    </text>
                  )}
                  {/* Botão de remoção da linha */}
                  <circle
                    cx={(x1 + x2) / 2}
                    cy={(y1 + y2) / 2}
                    r="8"
                    fill="#ffffff"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    className="cursor-pointer hover:fill-red-500 hover:stroke-red-500"
                    onClick={() => handleDeleteEdge(edge.id)}
                  />
                </g>
              )
            })}
          </svg>

          {/* Nodes Rendering */}
          {nodes.map((node) => {
            const palette = PALETTE_ITEMS.find((p) => p.type === node.type)
            const Icon = palette?.icon || Sparkles
            const pos = node.position || { x: 300, y: 100 }
            const isSelected = selectedNodeId === node.id
            const isConnectingSource = connectingSourceId === node.id

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                onClick={(e) => {
                  e.stopPropagation()
                  if (connectingSourceId) {
                    handleTargetClick(node.id)
                  } else {
                    setSelectedNodeId(node.id)
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: '240px',
                }}
                className={`bg-white rounded-xl border-2 p-3.5 shadow-md cursor-move select-none transition-shadow z-10 ${
                  isSelected
                    ? 'border-brand-red ring-4 ring-brand-red/10 shadow-lg'
                    : isConnectingSource
                      ? 'border-amber-500 ring-4 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg text-white ${palette ? palette.badgeColor : 'bg-slate-700'}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {node.type}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-rose-600 -mr-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNode(node.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <h4 className="font-semibold text-xs text-slate-800 leading-snug line-clamp-1">
                  {node.title}
                </h4>

                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {node.type === 'whatsapp'
                    ? node.config?.text || 'Mensagem WhatsApp...'
                    : node.type === 'email'
                      ? node.config?.subject || 'E-mail oficial...'
                      : node.type === 'delay'
                        ? `Aguardar ${node.config?.duration || 1} ${node.config?.unit || 'horas'}`
                        : node.type === 'condition'
                          ? `Condição: ${node.config?.conditionType || 'verificação'}`
                          : node.type === 'update_stage'
                            ? `Pipeline -> ${node.config?.stage || 'Consultation'}`
                            : node.description || palette?.description}
                </p>

                {/* Connection Anchors / Handles */}
                {node.type !== 'end' && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    {node.type === 'condition' ? (
                      <div className="w-full flex items-center justify-between gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-emerald-700 hover:bg-emerald-50 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartConnect(node.id, true)
                          }}
                        >
                          Conectar [Sim]
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-rose-700 hover:bg-rose-50 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartConnect(node.id, false)
                          }}
                        >
                          Conectar [Não]
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-6 text-brand-blue hover:bg-brand-blue/10 text-[10px] gap-1 justify-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartConnect(node.id)
                        }}
                      >
                        <LinkIcon className="h-3 w-3" />
                        Conectar ao próximo
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Property Sidebar */}
        {selectedNode && (
          <div className="w-80 bg-white border-l flex flex-col z-10 shadow-lg animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-800">Propriedades do Nó</h3>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  Tipo: {selectedNode.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400"
                onClick={() => setSelectedNodeId(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs">Título de Exibição</Label>
                <Input
                  value={selectedNode.title}
                  onChange={(e) => updateNodeConfig(selectedNode.id, {}, e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Trigger config */}
              {selectedNode.type === 'trigger' && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border">
                  <Label className="text-xs font-semibold">Tipo de Gatilho SendPulse 360</Label>
                  <Select value={flowTriggerType} onValueChange={(v: any) => setFlowTriggerType(v)}>
                    <SelectTrigger className="h-8 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contact_created">Novo Contato Criado</SelectItem>
                      <SelectItem value="birthday">Aniversário do Paciente</SelectItem>
                      <SelectItem value="deal_stage_changed">Mudança de Etapa CRM</SelectItem>
                      <SelectItem value="custom_event">Evento Personalizado</SelectItem>
                      <SelectItem value="contact_webhook">Webhook Externo</SelectItem>
                      <SelectItem value="manual">Manual / Teste</SelectItem>
                    </SelectContent>
                  </Select>

                  {flowTriggerType === 'contact_webhook' && (
                    <div className="space-y-1 pt-2">
                      <Label className="text-[11px] text-muted-foreground">
                        Endpoint Webhook do Fluxo
                      </Label>
                      <Input
                        readOnly
                        value={`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/automations/webhook/${flow.id}?secret=${flow.webhook_secret}`}
                        className="h-7 text-[10px] font-mono bg-white"
                      />
                    </div>
                  )}

                  {flowTriggerType === 'custom_event' && (
                    <div className="space-y-1 pt-2">
                      <Label className="text-[11px] text-muted-foreground">Nome do Evento</Label>
                      <Input
                        placeholder="ex: formulario_preenchido"
                        value={selectedNode.config?.eventName || ''}
                        onChange={(e) =>
                          updateNodeConfig(selectedNode.id, { eventName: e.target.value })
                        }
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp Config */}
              {selectedNode.type === 'whatsapp' && (
                <div className="space-y-3 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp Cloud API</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Template ou Texto Livre</Label>
                    <Textarea
                      placeholder="Mensagem com variáveis {nome}, {primeiro_nome}..."
                      value={selectedNode.config?.text || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { text: e.target.value })}
                      className="h-28 text-xs resize-none bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Dica: use {'{primeiro_nome}'} para cumprimentar o paciente pelo primeiro nome.
                  </p>
                </div>
              )}

              {/* E-mail Config */}
              {selectedNode.type === 'email' && (
                <div className="space-y-3 bg-sky-50/40 p-3 rounded-lg border border-sky-100">
                  <div className="flex items-center gap-2 text-sky-800 font-semibold">
                    <Mail className="h-4 w-4" />
                    <span>E-mail Marketing Nativo</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Assunto do E-mail</Label>
                    <Input
                      placeholder="Assunto oficial da clínica..."
                      value={selectedNode.config?.subject || ''}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode.id, { subject: e.target.value })
                      }
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Conteúdo da Mensagem</Label>
                    <Textarea
                      placeholder="Olá {primeiro_nome}, segue comunicado do Dr. Daniel Delgado..."
                      value={selectedNode.config?.content || ''}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode.id, { content: e.target.value })
                      }
                      className="h-32 text-xs resize-none bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Push Config */}
              {selectedNode.type === 'push' && (
                <div className="space-y-3 bg-amber-50/40 p-3 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <Bell className="h-4 w-4" />
                    <span>Web Push Nativo</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Título</Label>
                    <Input
                      value={selectedNode.config?.title || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { title: e.target.value })}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Texto da Notificação</Label>
                    <Textarea
                      value={selectedNode.config?.text || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { text: e.target.value })}
                      className="h-20 text-xs resize-none bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Chatbot IA Config */}
              {selectedNode.type === 'chatbot' && (
                <div className="space-y-3 bg-purple-50/40 p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-800 font-semibold">
                    <Bot className="h-4 w-4" />
                    <span>Agente IA da Clínica</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Instrução para a IA gerar</Label>
                    <Textarea
                      placeholder="Ex: Crie um lembrete com tom médico empático sobre consulta..."
                      value={selectedNode.config?.instruction || ''}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode.id, { instruction: e.target.value })
                      }
                      className="h-24 text-xs resize-none bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Canal de Envio da Resposta</Label>
                    <Select
                      value={selectedNode.config?.channel || 'whatsapp'}
                      onValueChange={(v) => updateNodeConfig(selectedNode.id, { channel: v })}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Delay Config */}
              {selectedNode.type === 'delay' && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>Tempo de Espera</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={selectedNode.config?.duration || 1}
                        onChange={(e) =>
                          updateNodeConfig(selectedNode.id, {
                            duration: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unidade</Label>
                      <Select
                        value={selectedNode.config?.unit || 'hours'}
                        onValueChange={(v) => updateNodeConfig(selectedNode.id, { unit: v })}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutos</SelectItem>
                          <SelectItem value="hours">Horas</SelectItem>
                          <SelectItem value="days">Dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Condition If / Else Config */}
              {selectedNode.type === 'condition' && (
                <div className="space-y-3 bg-indigo-50/40 p-3 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-800 font-semibold">
                    <Filter className="h-4 w-4" />
                    <span>Condição Lógica</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Critério</Label>
                    <Select
                      value={selectedNode.config?.conditionType || 'has_appointment'}
                      onValueChange={(v) => updateNodeConfig(selectedNode.id, { conditionType: v })}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="has_appointment">Possui Consulta Agendada</SelectItem>
                        <SelectItem value="field_contains">Campo do Contato Contém</SelectItem>
                        <SelectItem value="lead_stage">Etapa Atual no CRM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedNode.config?.conditionType === 'field_contains' && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Campo</Label>
                        <Input
                          placeholder="email ou phone ou name"
                          value={selectedNode.config?.field || 'email'}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, { field: e.target.value })
                          }
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Valor Esperado</Label>
                        <Input
                          value={selectedNode.config?.expectedValue || ''}
                          onChange={(e) =>
                            updateNodeConfig(selectedNode.id, { expectedValue: e.target.value })
                          }
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Update Stage CRM Config */}
              {selectedNode.type === 'update_stage' && (
                <div className="space-y-3 bg-blue-50/40 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-800 font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    <span>Pipeline CRM / Kanban</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mover para Estágio</Label>
                    <Select
                      value={selectedNode.config?.stage || 'Consultation'}
                      onValueChange={(v) => updateNodeConfig(selectedNode.id, { stage: v })}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lead">1. Lead Inicial</SelectItem>
                        <SelectItem value="Consultation">2. Consulta / Avaliação</SelectItem>
                        <SelectItem value="Pre-Op">3. Pré-Op / Orçamento</SelectItem>
                        <SelectItem value="Post-Op">4. Pós-Operatório</SelectItem>
                        <SelectItem value="Concluded">5. Concluído / Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-slate-50 flex justify-end">
              <Button
                size="sm"
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white text-xs h-8"
                onClick={() => setSelectedNodeId(null)}
              >
                Concluir Configuração
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
