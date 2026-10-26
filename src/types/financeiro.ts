export interface Budget {
  id: string
  patient: string
  patientId?: string
  procedure: string
  value: number
  discount: number
  finalValue: number
  validityDate: string
  createdAt: string
  paymentMethods: string[]
  observations?: string
  status:
    | 'pending'
    | 'approved'
    | 'expired'
    | 'draft'
    | 'sent'
    | 'declined'
    | 'paid'
    | 'refunded'
    | string
  unit: 'Juiz de Fora' | 'Leopoldina' | 'Além Paraíba' | string
  paymentLink?: string
}
