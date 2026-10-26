import { create } from 'zustand'

export interface Budget {
  id: string
  patient: string
  patientId?: string
  procedure: string
  value: number
  discount: number
  finalValue: number
  validityDate: string
  paymentMethods: string[]
  paymentLink?: string
  status: 'pending' | 'approved' | 'expired' | 'draft' | 'sent' | 'declined' | 'paid' | 'refunded' | string
  observations?: string
  unit: 'Juiz de Fora' | 'Leopoldina' | 'Além Paraíba' | string
  createdAt: string
}

interface FinanceiroState {
  budgets: Budget[]
  setBudgets: (b: Budget[]) => void
  generatePaymentLink?: (id: string) => void
}

const useFinanceiroStore = create<FinanceiroState>((set) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
}))

export default useFinanceiroStore
