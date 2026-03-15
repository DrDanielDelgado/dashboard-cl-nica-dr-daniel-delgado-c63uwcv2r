export interface Budget {
  id: string
  patient: string
  procedure: string
  value: number
  discount: number
  finalValue: number
  validityDate: string
  createdAt: string
  paymentMethods: string[]
  observations: string
  status: 'pending' | 'approved' | 'expired' | 'draft' | 'sent' | 'declined'
  unit: 'Juiz de Fora' | 'Leopoldina' | 'Além Paraíba'
}
