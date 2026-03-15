export interface Patient {
  id: string
  fullName: string
  dob: string
  cpf: string
  phone: string
  unit: 'Juiz de Fora' | 'Leopoldina' | 'Além Paraíba'
  lastConsultation: string
  status: 'Ativo' | 'Em Tratamento' | 'Alta' | 'Inativo'
  clinicalNotes: string
  allergies: string
  history: string
}
