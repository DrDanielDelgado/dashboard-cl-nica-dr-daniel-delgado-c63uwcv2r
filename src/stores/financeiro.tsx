import React, { createContext, useContext, useState } from 'react'
import { Budget } from '@/types/financeiro'

const MOCK_BUDGETS: Budget[] = [
  {
    id: '1',
    patient: 'Ana Costa',
    procedure: 'Tratamento de Varizes (Laser)',
    value: 4500,
    discount: 500,
    finalValue: 4000,
    validityDate: '2026-04-15T12:00:00.000Z',
    paymentMethods: ['Cartão de Crédito', 'PIX'],
    observations: '10x sem juros no cartão.',
    status: 'pending',
  },
  {
    id: '2',
    patient: 'João Santos',
    procedure: 'Escleroterapia',
    value: 1200,
    discount: 0,
    finalValue: 1200,
    validityDate: '2026-03-20T12:00:00.000Z',
    paymentMethods: ['PIX', 'Dinheiro'],
    observations: 'Pagamento à vista.',
    status: 'approved',
  },
  {
    id: '3',
    patient: 'Maria Silva',
    procedure: 'Espuma',
    value: 800,
    discount: 0,
    finalValue: 800,
    validityDate: '2024-01-10T12:00:00.000Z',
    paymentMethods: ['Cartão de Débito'],
    observations: '',
    status: 'expired',
  },
]

interface FinanceiroState {
  budgets: Budget[]
  addBudget: (budget: Budget) => void
  updateBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  updateBudgetStatus: (id: string, status: Budget['status']) => void
}

const FinanceiroContext = createContext<FinanceiroState | undefined>(undefined)

export function FinanceiroProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS)

  const addBudget = (b: Budget) => {
    setBudgets((prev) => [...prev, { ...b, id: Math.random().toString(36).substring(7) }])
  }

  const updateBudget = (b: Budget) => {
    setBudgets((prev) => prev.map((old) => (old.id === b.id ? b : old)))
  }

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  const updateBudgetStatus = (id: string, status: Budget['status']) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  return (
    <FinanceiroContext.Provider
      value={{ budgets, addBudget, updateBudget, deleteBudget, updateBudgetStatus }}
    >
      {children}
    </FinanceiroContext.Provider>
  )
}

export default function useFinanceiroStore() {
  const context = useContext(FinanceiroContext)
  if (!context) throw new Error('useFinanceiroStore must be used within FinanceiroProvider')
  return context
}
