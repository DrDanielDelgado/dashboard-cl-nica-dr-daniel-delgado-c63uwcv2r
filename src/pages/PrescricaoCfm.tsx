import { useState, useEffect, useCallback } from 'react'
import {
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  HelpCircle,
  KeyRound,
  FileText,
  Lock,
  ArrowUpRight,
  Info,
  Building2,
  RefreshCw,
  Sparkles,
  Save,
  LogIn,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  CFM_PRESCRIPTION_URL,
  CFM_SERVICES_URL,
  CFM_SUPPORT_URL,
  CFM_RDC1000_URL,
  getDoctorProfile,
  updateDoctorCrm,
  logCfmAccess,
  logCfmServicesAccess,
  getCfmAccessLogs,
  IntegrationAccessLog,
} from '@/services/prescricaoCfm'

const BRAZILIAN_UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

export default function PrescricaoCfm() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [savingCrm, setSavingCrm] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [openingServices, setOpeningServices] = useState(false)
  const [activeTab, setActiveTab] = useState('prescricao')

  // CRM state
  const [crmNumero, setCrmNumero] = useState('')
  const [crmUf, setCrmUf] = useState('MG')
  const [savedCrmNumero, setSavedCrmNumero] = useState('')
  const [savedCrmUf, setSavedCrmUf] = useState('MG')

  // Copy feedback states
  const [copiedNumero, setCopiedNumero] = useState(false)
  const [copiedUf, setCopiedUf] = useState(false)
  const [copiedFullCrm, setCopiedFullCrm] = useState(false)

  // Audit state
  const [lastAccess, setLastAccess] = useState<string | null>(null)
  const [accessLogs, setAccessLogs] = useState<IntegrationAccessLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const profile = await getDoctorProfile()
      if (profile) {
        const num = profile.crm_numero || ''
        const uf = profile.crm_uf || 'MG'
        setCrmNumero(num)
        setCrmUf(uf)
        setSavedCrmNumero(num)
        setSavedCrmUf(uf)
        setLastAccess(profile.last_cfm_access || null)
      }
      const logs = await getCfmAccessLogs(8)
      setAccessLogs(logs)
    } catch (err) {
      console.error('Erro ao carregar dados do CFM:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveCrm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingCrm(true)
    try {
      await updateDoctorCrm(crmNumero, crmUf)
      setSavedCrmNumero(crmNumero.trim().replace(/[^0-9]/g, ''))
      setSavedCrmUf(crmUf.trim().toUpperCase())
      toast({
        title: 'CRM Atualizado com Sucesso',
        description: `CRM ${crmNumero}-${crmUf} salvo no seu perfil para lembrete e cópia rápida.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar CRM',
        description: err.message || 'Não foi possível salvar o CRM no perfil.',
      })
    } finally {
      setSavingCrm(false)
    }
  }

  const handleOpenCfmPortal = async () => {
    setOpeningPortal(true)
    try {
      // 1. Grava no banco PocketBase
      const log = await logCfmAccess('open_cfm_prescription')
      const nowIso = new Date().toISOString()
      setLastAccess(nowIso)
      if (log) {
        setAccessLogs((prev) => [log, ...prev.slice(0, 7)])
      }

      // 2. Abre nova aba com isolamento seguro para a URL oficial da Prescrição
      const win = window.open(CFM_PRESCRIPTION_URL, '_blank', 'noopener,noreferrer')
      if (win) {
        win.opener = null
      }

      toast({
        title: 'Plataforma Oficial do CFM Aberta',
        description:
          'Acesse com seu CRM/UF + senha do Portal de Serviços ou Certificado Digital ICP-Brasil.',
      })
    } catch (err) {
      console.error('Falha ao abrir portal CFM:', err)
      toast({
        variant: 'destructive',
        title: 'Aviso de Navegação',
        description: 'Verifique se o bloqueador de pop-ups do navegador não impediu a abertura.',
      })
    } finally {
      setOpeningPortal(false)
    }
  }

  const handleOpenCfmServices = async () => {
    setOpeningServices(true)
    try {
      // 1. Grava log de auditoria
      const log = await logCfmServicesAccess()
      const nowIso = new Date().toISOString()
      setLastAccess(nowIso)
      if (log) {
        setAccessLogs((prev) => [log, ...prev.slice(0, 7)])
      }

      // 2. Abre nova aba com isolamento seguro para a URL oficial do Portal de Serviços
      const win = window.open(CFM_SERVICES_URL, '_blank', 'noopener,noreferrer')
      if (win) {
        win.opener = null
      }

      toast({
        title: 'Portal de Serviços CFM Aberto',
        description: 'Navegando com segurança para https://servicos.cfm.org.br/ em nova aba.',
      })
    } catch (err) {
      console.error('Falha ao abrir Portal de Serviços CFM:', err)
      toast({
        variant: 'destructive',
        title: 'Aviso de Navegação',
        description: 'Verifique se o bloqueador de pop-ups do navegador não impediu a abertura.',
      })
    } finally {
      setOpeningServices(false)
    }
  }

  const handleCopyText = (text: string, type: 'numero' | 'uf' | 'full') => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (type === 'numero') {
      setCopiedNumero(true)
      setTimeout(() => setCopiedNumero(false), 2000)
    } else if (type === 'uf') {
      setCopiedUf(true)
      setTimeout(() => setCopiedUf(false), 2000)
    } else {
      setCopiedFullCrm(true)
      setTimeout(() => setCopiedFullCrm(false), 2000)
    }
    toast({
      title: 'Copiado para a área de transferência',
      description: `"${text}" pronto para colar no portal oficial do CFM.`,
    })
  }

  const refreshLogs = async () => {
    setLoadingLogs(true)
    try {
      const logs = await getCfmAccessLogs(8)
      setAccessLogs(logs)
    } finally {
      setLoadingLogs(false)
    }
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Nenhum acesso registrado'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const hasCrmSaved = Boolean(savedCrmNumero)

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Estratégia B — Acesso Direcionado Seguro
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Portal Oficial CFM
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Prescrição Eletrônica CFM
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-2xl">
            Ambiente oficial do Conselho Federal de Medicina para emissão de receitas, atestados,
            laudos e relatórios médicos em conformidade sanitária e com validade jurídica nacional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleOpenCfmPortal}
            disabled={openingPortal}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            {openingPortal ? 'Abrindo CFM...' : 'Abrir Prescrição Eletrônica'}
          </Button>
          <Button
            onClick={handleOpenCfmServices}
            disabled={openingServices}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Building2 className="w-5 h-5 text-brand-blue" />
            {openingServices ? 'Abrindo Serviços...' : 'Portal de Serviços CFM'}
            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Navegação por Abas: Prescrição Direta vs. Portal de Serviços CFM (Contingência) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid grid-cols-2 max-w-md h-11 p-1 bg-muted/80">
          <TabsTrigger
            value="prescricao"
            className="text-xs md:text-sm font-medium gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Prescrição Direta
          </TabsTrigger>
          <TabsTrigger
            value="portal-servicos"
            className="text-xs md:text-sm font-medium gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Building2 className="w-4 h-4 text-brand-blue" />
            Portal de Serviços CFM
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: Prescrição Direta */}
        <TabsContent value="prescricao" className="space-y-6 mt-0">
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-primary/5 shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Acesso Direto Homologado
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Emissão Oficial de Receituários & Atestados
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Por diretriz do CFM e da LGPD, a autenticação ocorre com suas credenciais
                    médicas diretamente no portal oficial. O dashboard da clínica nunca coleta,
                    armazena ou transmite sua senha, seu CPF em texto plano ou chave de certificado.
                  </p>

                  {/* Status do CRM Cadastrado */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 shadow-sm text-sm">
                      <span className="text-muted-foreground font-medium">Seu CRM:</span>
                      <span className="font-mono font-bold text-foreground">
                        {hasCrmSaved ? `${savedCrmNumero}-${savedCrmUf}` : 'Não cadastrado'}
                      </span>
                      {hasCrmSaved && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopyText(`${savedCrmNumero}/${savedCrmUf}`, 'full')}
                          title="Copiar CRM/UF"
                        >
                          {copiedFullCrm ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 shadow-sm text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">Último Acesso:</span>
                      <span className="font-semibold text-foreground text-xs md:text-sm">
                        {formatDate(lastAccess)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                  <Button
                    onClick={handleOpenCfmPortal}
                    disabled={openingPortal}
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base shadow-md gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {openingPortal ? 'Carregando...' : 'Abrir Prescrição CFM'}
                  </Button>
                  <Button
                    onClick={handleOpenCfmServices}
                    disabled={openingServices}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                    {openingServices ? 'Abrindo...' : 'Portal de Serviços CFM'}
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: Portal de Serviços CFM (Acesso de Contingência e Gestão) */}
        <TabsContent value="portal-servicos" className="space-y-6 mt-0">
          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300 text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    Acesso de Contingência & Central de Serviços
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Portal de Serviços do CFM (servicos.cfm.org.br)
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    O Portal de Serviços é a central unificada do Conselho Federal de Medicina. Em
                    caso de indisponibilidade momentânea da rota direta de prescrição, você pode
                    acessar todos os serviços médicos — incluindo o módulo de prescrição eletrônica,
                    certidões de regularidade e atualização cadastral — a partir deste portal.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 shadow-sm text-sm">
                      <span className="text-muted-foreground font-medium">Endereço Oficial:</span>
                      <a
                        href={CFM_SERVICES_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-semibold text-brand-blue hover:underline inline-flex items-center gap-1"
                      >
                        https://servicos.cfm.org.br/
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 shadow-sm text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">Último Acesso:</span>
                      <span className="font-semibold text-foreground text-xs md:text-sm">
                        {formatDate(lastAccess)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                  <Button
                    onClick={handleOpenCfmServices}
                    disabled={openingServices}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base shadow-md gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {openingServices ? 'Carregando Portal...' : 'Acessar servicos.cfm.org.br'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={() => setActiveTab('prescricao')}
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Voltar à Prescrição Direta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guia Passo a Passo de Autenticação no Portal de Serviços */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <LogIn className="w-4.5 h-4.5 text-brand-blue" />
                Passo a Passo: Como Acessar a Prescrição pelo Portal de Serviços
              </CardTitle>
              <CardDescription>
                Roteiro de contingência quando a rota direta prescricao.cfm.org.br apresentar
                lentidão ou manutenção.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border bg-card space-y-2 relative">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <span className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Acesse o Portal
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Clique em &quot;Acessar servicos.cfm.org.br&quot;. A página oficial abrirá em
                    nova aba segura.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-2 relative">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <span className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    Autenticação Médica
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Informe seu CRM ({savedCrmNumero || '...'}), UF ({savedCrmUf || 'MG'}), CPF e
                    senha, ou use seu Certificado ICP-Brasil.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-2 relative">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <span className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    Selecione o Módulo
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No menu principal de serviços do CFM, clique no item &quot;Prescrição
                    Eletrônica&quot;.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-2 relative">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    Emita a Receita
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Preencha o receituário, anexe assinatura digital ICP-Brasil e envie o documento
                    ao paciente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Main Grid: CRM Fast Copy + Audit History */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* CRM Quick Copy & Profile Setting (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                Lembrete de CRM / UF do Médico
              </CardTitle>
              <CardDescription>
                Informe o número e estado do seu registro profissional uma vez. O app guarda apenas
                para agilizar a cópia e preenchimento na tela de login do CFM.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveCrm}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="crm_numero" className="text-xs font-semibold">
                      Número do CRM
                    </Label>
                    <div className="relative">
                      <Input
                        id="crm_numero"
                        value={crmNumero}
                        onChange={(e) => setCrmNumero(e.target.value)}
                        placeholder="Ex: 54321"
                        className="font-mono pr-9"
                      />
                      {crmNumero && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(crmNumero, 'numero')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          title="Copiar número do CRM"
                        >
                          {copiedNumero ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="crm_uf" className="text-xs font-semibold">
                      UF
                    </Label>
                    <div className="relative">
                      <select
                        id="crm_uf"
                        value={crmUf}
                        onChange={(e) => setCrmUf(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono font-bold"
                      >
                        {BRAZILIAN_UFS.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quick copy shortcuts */}
                {hasCrmSaved && (
                  <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      Atalhos para Cópia Rápida:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs font-mono h-8"
                        onClick={() => handleCopyText(savedCrmNumero, 'numero')}
                      >
                        {copiedNumero ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : null}
                        Número: {savedCrmNumero}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs font-mono h-8"
                        onClick={() => handleCopyText(savedCrmUf, 'uf')}
                      >
                        {copiedUf ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : null}
                        UF: {savedCrmUf}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs font-mono h-8"
                        onClick={() => handleCopyText(`${savedCrmNumero}/${savedCrmUf}`, 'full')}
                      >
                        {copiedFullCrm ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : null}
                        {savedCrmNumero}/{savedCrmUf}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Security notice */}
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 p-3 rounded-md">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Garantia de Segurança CFM/LGPD:</strong> Este aplicativo <u>nunca</u>{' '}
                    solicita ou grava sua senha do CFM, CPF ou chaves de certificado digital.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t bg-muted/20 py-3">
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingCrm || !crmNumero.trim()}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingCrm ? 'Salvando...' : 'Salvar CRM no Perfil'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Quick Guidance Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-brand-blue" />
                Como Autenticar no Portal do CFM
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <p>
                  <strong className="text-foreground">Opção A (Senha CFM):</strong> Informe seu{' '}
                  <span className="font-mono text-foreground font-semibold">CRM/UF</span> +{' '}
                  <span className="font-mono text-foreground font-semibold">CPF</span> + Senha do{' '}
                  <em>Portal de Serviços do CFM</em>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <p>
                  <strong className="text-foreground">
                    Opção B (Certificado Digital ICP-Brasil):
                  </strong>{' '}
                  Utilize seu certificado digital em nuvem (ex.: Certillion, BirdID) ou token físico
                  A1/A3 conectado.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </div>
                <p>
                  <strong className="text-foreground">Assinatura Digital de Receitas:</strong> Para
                  receitas de medicamentos de controle especial (RDC 1.000/25), assine com
                  ICP-Brasil diretamente dentro da ferramenta do CFM.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Trail (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-blue" />
                  Trilha de Auditoria de Acessos
                </CardTitle>
                <CardDescription>
                  Registro seguro dos acessos direcionados ao CFM realizados a partir desta clínica.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLogs}
                disabled={loadingLogs}
                className="h-8 gap-1.5 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Carregando registros de auditoria...
                </div>
              ) : accessLogs.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/10 space-y-2">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-sm font-medium text-foreground">
                    Nenhum acesso registrado ainda
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Ao clicar no botão &quot;Abrir Prescrição Eletrônica do CFM&quot;, o evento é
                    registrado aqui para conformidade de auditoria.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accessLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[11px] font-mono bg-primary/5">
                            {log.action}
                          </Badge>
                          <span className="text-xs font-semibold text-foreground">
                            {log.user_name || 'Dr. Daniel Delgado'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-md">
                          {log.integration_name} — {log.target_url}
                        </p>
                      </div>
                      <div className="text-right sm:shrink-0">
                        <span className="text-xs font-mono text-muted-foreground block">
                          {formatDate(log.created)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                          <Check className="w-3 h-3" /> Registrado
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/10 text-xs text-muted-foreground py-2.5 flex items-center justify-between">
              <span>
                Coleção: <code className="text-foreground">integration_access_logs</code>
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero dados clínicos armazenados
              </span>
            </CardFooter>
          </Card>

          {/* Contingency / Fallback Methods */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                Fluxos de Contingência & Suporte Oficial CFM
              </CardTitle>
              <CardDescription>
                Canais e métodos alternativos em caso de indisponibilidade da rota principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-brand-blue" />
                      Acesso Alternativo
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      Contingência 1
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Acesso direto pelo Portal de Serviços centralizado do CFM. Permite emitir
                    certidões, atualizar dados e navegar aos módulos.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenCfmServices}
                      disabled={openingServices}
                      className="text-xs h-7 px-2.5 gap-1 text-brand-blue hover:text-brand-blue"
                    >
                      <Building2 className="w-3 h-3" />
                      {openingServices ? 'Abrindo...' : 'Abrir servicos.cfm.org.br'}
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                    <a
                      href={CFM_SERVICES_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                    >
                      (link direto)
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      Canal de Suporte Oficial
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      Fale Conosco
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Formulário direto de contato para dúvidas sobre certificado digital,
                    instabilidade ou emissão de receituários eletrônicos.
                  </p>
                  <a
                    href={CFM_SUPPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-semibold text-xs pt-1"
                  >
                    Contato Prescrição Eletrônica CFM
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Information & Regulatory Compliance Section */}
      <Card className="border-border/60 bg-muted/20 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-brand-blue font-semibold text-sm">
            <Info className="w-4 h-4" />
            Conformidade Técnica, Regulatória e LGPD
          </div>
          <CardTitle className="text-xl">Sobre esta Integração</CardTitle>
          <CardDescription>
            Fundamentação regulatória e arquitetura de segurança adotada no Dashboard da Clínica Dr.
            Daniel Delgado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Motivo de não haver login automático */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                Por que não há Login Automático?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O CFM <strong>não disponibiliza API pública</strong> para envio automatizado de
                prescrições por clínicas privadas individuais. Parcerias de integração são
                institucionais bilaterais. Qualquer robô que guardasse sua senha ou automatizasse
                cliques violaria normas éticas e de segurança da informação (CFM/ISO 27001).
              </p>
            </div>

            {/* RDC Anvisa 1.000/25 */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-blue" />
                RDC Anvisa nº 1.000/2025 & SNCR
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Determina o <strong>documento nato-digital</strong> obrigatório (scans e fotos não
                são válidos), exige <strong>assinatura ICP-Brasil</strong> para Notificações de
                Receita (A, B e Controle Especial) e estabelece prazo até{' '}
                <strong>30/09/2026</strong> para integração das plataformas ao SNCR da Anvisa.
              </p>
              <a
                href={CFM_RDC1000_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-brand-blue hover:underline inline-flex items-center gap-1 font-medium"
              >
                Ver orientações do CFM sobre a RDC 1.000/25
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Garantias LGPD */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Garantias LGPD e Privacidade
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Adoção integral do princípio da <em>minimização de dados</em> (Art. 6º, III, LGPD).
                Nenhum dado sensível de saúde (CID, dosagem, paciente ou histórico clínico) transita
                pelo nosso servidor nesta operação. Apenas a trilha de auditoria de abertura é
                registrada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
