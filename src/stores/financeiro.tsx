import React, { createContext, useContext, useState } from 'react'
import { Budget } from '@/types/financeiro'

const now = new Date()
const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()
const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

const MOCK_BUDGETS: Budget[] = [
  {
    id: '1',
    patient: 'Ana Costa',
    procedure: 'Tratamento de Varizes (Laser)',
    value: 4500,
    discount: 500,
    finalValue: 4000,
    createdAt: lastMonth,
    validityDate: in10Days,
    paymentMethods: ['Cartão de Crédito', 'PIX'],
    observations: '10x sem juros no cartão.',
    status: 'pending',
    unit: 'Juiz de Fora',
  },
  {
    id: '2',
    patient: 'João Santos',
    procedure: 'Escleroterapia',
    value: 1200,
    discount: 0,
    finalValue: 1200,
    createdAt: lastMonth,
    validityDate: lastMonth,
    paymentMethods: ['PIX', 'Dinheiro'],
    observations: 'Pagamento à vista.',
    status: 'approved',
    unit: 'Leopoldina',
  },
  {
    id: '3',
    patient: 'Maria Silva',
    procedure: 'Espuma',
    value: 800,
    discount: 0,
    finalValue: 800,
    createdAt: lastMonth,
    validityDate: lastMonth,
    paymentMethods: ['Cartão de Débito'],
    observations: '',
    status: 'expired',
    unit: 'Além Paraíba',
  },
  {
    id: '4',
    patient: 'Carlos Almeida',
    procedure: 'Check-up Vascular',
    value: 600,
    discount: 0,
    finalValue: 600,
    createdAt: now.toISOString(),
    validityDate: in24h,
    paymentMethods: ['PIX'],
    observations: 'Paciente aguardando confirmação.',
    status: 'pending',
    unit: 'Juiz de Fora',
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
