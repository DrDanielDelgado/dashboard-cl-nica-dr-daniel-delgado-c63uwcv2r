import React, { createContext, useContext, useState } from 'react'
import { Budget } from '@/types/financeiro'

interface FinanceiroState {
  budgets: Budget[]
  addBudget: (budget: Budget) => void
  updateBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  updateBudgetStatus: (id: string, status: Budget['status']) => void
}

const FinanceiroContext = createContext<FinanceiroState | undefined>(undefined)

export function FinanceiroProvider({ children }: { children: React.ReactNode }) {
  // Banco de dados financeiro limpo, sem registros fictícios/mockados
  const [budgets, setBudgets] = useState<Budget[]>([])

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
