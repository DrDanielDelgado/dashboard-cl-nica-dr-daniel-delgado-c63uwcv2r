export interface Budget {
  id: string
  patient: string
  procedure: string
  value: number
  discount: number
  finalValue: number
  validityDate: string
  paymentMethods: string[]
  observations: string
  status: 'pending' | 'approved' | 'expired' | 'draft'
}
