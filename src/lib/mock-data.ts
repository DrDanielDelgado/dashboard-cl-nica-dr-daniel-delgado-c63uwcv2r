import { Flow } from '@/types/automation'

export const MOCK_REVENUE_DATA = [
  { name: 'Seg', income: 4000, expenses: 2400 },
  { name: 'Ter', income: 3000, expenses: 1398 },
  { name: 'Qua', income: 2000, expenses: 9800 },
  { name: 'Qui', income: 2780, expenses: 3908 },
  { name: 'Sex', income: 1890, expenses: 4800 },
  { name: 'Sáb', income: 2390, expenses: 3800 },
  { name: 'Dom', income: 3490, expenses: 4300 },
]

export const MOCK_INVENTORY = [
  {
    id: '1',
    name: 'Seringa Descartável 5ml',
    qty: 1500,
    batch: 'L-2023-A',
    expiry: '2025-10-12',
    status: 'normal',
  },
  {
    id: '2',
    name: 'Luva de Procedimento (M)',
    qty: 50,
    batch: 'L-2023-B',
    expiry: '2024-05-01',
    status: 'warning',
  },
  {
    id: '3',
    name: 'Anestésico Local 2%',
    qty: 5,
    batch: 'L-2022-X',
    expiry: '2024-03-15',
    status: 'critical',
  },
  {
    id: '4',
    name: 'Gaze Estéril',
    qty: 300,
    batch: 'L-2024-C',
    expiry: '2026-01-20',
    status: 'normal',
  },
  {
    id: '5',
    name: 'Agulha 30G',
    qty: 20,
    batch: 'L-2023-Y',
    expiry: '2024-04-10',
    status: 'warning',
  },
]

export const MOCK_CRM_LEADS = [
  {
    id: 'L1',
    name: 'Maria Silva',
    status: 'qualified',
    phone: '+55 32 99999-1111',
    treatment: 'Tratamento de Varizes',
  },
  {
    id: 'L2',
    name: 'João Santos',
    status: 'contacted',
    phone: '+55 32 98888-2222',
    treatment: 'Cirurgia de Aneurisma',
  },
  {
    id: 'L3',
    name: 'Ana Costa',
    status: 'scheduled',
    phone: '+55 32 97777-3333',
    treatment: 'Check-up Vascular',
  },
  {
    id: 'L4',
    name: 'Pedro Alves',
    status: 'qualified',
    phone: '+55 32 96666-4444',
    treatment: 'Tratamento Carotídea',
  },
]

export const MOCK_TASKS = [
  { id: 'T1', title: 'Verificar validade dos anestésicos', assignee: 'Enfermeira', status: 'todo' },
  { id: 'T2', title: 'Ligar para leads de ontem', assignee: 'Secretária', status: 'in-progress' },
  { id: 'T3', title: 'Aprovar folha de pagamento', assignee: 'Gerenciador', status: 'done' },
]

export const MOCK_APPOINTMENTS = [
  {
    id: 1,
    patient: 'Carlos Alberto',
    time: '09:00',
    type: 'Check-up Vascular',
    status: 'confirmed',
  },
  {
    id: 2,
    patient: 'Fernanda Lima',
    time: '10:30',
    type: 'Tratamento de Pé Diabético',
    status: 'pending',
  },
  {
    id: 3,
    patient: 'Ricardo Gomes',
    time: '14:00',
    type: 'Trombose Venosa Profunda',
    status: 'confirmed',
  },
  {
    id: 4,
    patient: 'Luciana M.',
    time: '16:00',
    type: 'Tratamento de Varizes',
    status: 'cancelled',
  },
]

export const MOCK_AUTOMATION_FLOWS: Flow[] = [
  {
    id: 'f1',
    name: 'Confirmação de Consulta (Teste A/B)',
    isActive: true,
    triggerType: 'appointment_reminder',
    rootId: 'n1',
    metrics: {
      entries: 1250,
      conversions: 875,
      conversionRate: 70,
      abTest: {
        a: { entries: 625, conversions: 350, name: 'Modelo A (Formal)' },
        b: { entries: 625, conversions: 525, name: 'Modelo B (Casual)' },
      },
      chartData: [
        { date: '10/Mar', a: 45, b: 50 },
        { date: '11/Mar', a: 52, b: 68 },
        { date: '12/Mar', a: 48, b: 72 },
        { date: '13/Mar', a: 60, b: 90 },
        { date: '14/Mar', a: 65, b: 110 },
        { date: '15/Mar', a: 80, b: 135 },
      ],
    },
    nodes: {
      n1: {
        id: 'n1',
        type: 'trigger',
        title: 'Lembrete 24h',
        config: { triggerType: 'appointment_reminder' },
        nextId: 'n2',
      },
      n2: {
        id: 'n2',
        type: 'ab_test',
        title: 'Teste A/B de Abordagem',
        config: {},
        nextTrueId: 'n3',
        nextFalseId: 'n4',
      },
      n3: {
        id: 'n3',
        type: 'template',
        title: 'Mensagem Formal (A)',
        config: {
          content: 'Olá {{nome_do_paciente}}. Confirmamos sua consulta no dia {{data_consulta}}.',
        },
        nextId: null,
      },
      n4: {
        id: 'n4',
        type: 'template',
        title: 'Mensagem Casual (B)',
        config: {
          content:
            'Oi {{nome_do_paciente}}! Passando pra lembrar da nossa consulta em {{data_consulta}}. Te esperamos!',
        },
        nextId: null,
      },
    },
  },
  {
    id: 'f2',
    name: 'Boas-vindas Hub Social',
    isActive: true,
    triggerType: 'social_message',
    rootId: 'n1',
    metrics: {
      entries: 340,
      conversions: 85,
      conversionRate: 25,
      chartData: [
        { date: '10/Mar', a: 10 },
        { date: '11/Mar', a: 15 },
        { date: '12/Mar', a: 12 },
        { date: '13/Mar', a: 20 },
        { date: '14/Mar', a: 18 },
        { date: '15/Mar', a: 25 },
      ],
    },
    nodes: {
      n1: {
        id: 'n1',
        type: 'trigger',
        title: 'Nova Mensagem',
        config: { triggerType: 'social_message' },
        nextId: 'n2',
      },
      n2: {
        id: 'n2',
        type: 'message',
        title: 'Resposta Automática',
        config: {
          channel: 'instagram',
          content:
            'Olá {{nome_do_paciente}}! Agradecemos o contato. Nossa equipe responderá em breve.',
        },
        nextId: null,
      },
    },
  },
]
