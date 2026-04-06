import { create } from 'zustand'

export interface Budget {
  id: string
  patient: string
  patientId: string
  procedure: string
  value: number
  discount: number
  finalValue: number
  validityDate: string
  paymentMethods: string[]
  paymentLink?: string
  status: string
  observations?: string
  unit: string
  createdAt: string
}

interface FinanceiroState {
  budgets: Budget[]
  setBudgets: (b: Budget[]) => void
}

const useFinanceiroStore = create<FinanceiroState>((set) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
}))

export default useFinanceiroStore
