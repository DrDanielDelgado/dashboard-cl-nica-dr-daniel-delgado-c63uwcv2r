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
    phone: '+55 31 99999-1111',
    treatment: 'Avaliação Vascular',
  },
  {
    id: 'L2',
    name: 'João Santos',
    status: 'contacted',
    phone: '+55 31 98888-2222',
    treatment: 'Escleroterapia',
  },
  {
    id: 'L3',
    name: 'Ana Costa',
    status: 'scheduled',
    phone: '+55 31 97777-3333',
    treatment: 'Doppler',
  },
  {
    id: 'L4',
    name: 'Pedro Alves',
    status: 'qualified',
    phone: '+55 31 96666-4444',
    treatment: 'Cirurgia Varizes',
  },
]

export const MOCK_TASKS = [
  { id: 'T1', title: 'Verificar validade dos anestésicos', assignee: 'Enfermeira', status: 'todo' },
  { id: 'T2', title: 'Ligar para leads de ontem', assignee: 'Secretária', status: 'in-progress' },
  { id: 'T3', title: 'Aprovar folha de pagamento', assignee: 'Gerenciador', status: 'done' },
]

export const MOCK_APPOINTMENTS = [
  { id: 1, patient: 'Carlos Alberto', time: '09:00', type: 'Consulta', status: 'confirmed' },
  { id: 2, patient: 'Fernanda Lima', time: '10:30', type: 'Retorno', status: 'pending' },
  { id: 3, patient: 'Ricardo Gomes', time: '14:00', type: 'Procedimento', status: 'confirmed' },
  { id: 4, patient: 'Luciana M.', time: '16:00', type: 'Avaliação', status: 'cancelled' },
]
