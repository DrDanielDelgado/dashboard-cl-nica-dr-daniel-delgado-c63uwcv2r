import React, { createContext, useContext, useState, useEffect } from 'react'
import { Budget } from '@/types/financeiro'

interface FinanceiroState {
  budgets: Budget[]
  addBudget: (budget: Budget) => void
  updateBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  updateBudgetStatus: (id: string, status: Budget['status']) => void
}

const loadBudgets = (): Budget[] => {
  try {
    const stored = localStorage.getItem('@db_financeiro')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && parsed.length > 0) return parsed
    }
  } catch {
    // fallback to default below
  }

  // Initial mock data to prevent empty states and demonstrate the dashboard
  const now = new Date()
  const currentMonthStr = now.toISOString().substring(0, 7)
  return [
    {
      id: 'mock-1',
      patient: 'Maria Silva',
      procedure: 'Escleroterapia Espuma',
      value: 1500,
      discount: 0,
      finalValue: 1500,
      validityDate: '2026-12-31',
      createdAt: `${currentMonthStr}-05T10:00:00.000Z`,
      paymentMethods: ['Pix'],
      observations: '',
      status: 'approved',
      unit: 'Juiz de Fora',
    },
    {
      id: 'mock-2',
      patient: 'João Santos',
      procedure: 'Consulta Inicial',
      value: 450,
      discount: 0,
      finalValue: 450,
      validityDate: '2026-12-31',
      createdAt: `${currentMonthStr}-10T14:30:00.000Z`,
      paymentMethods: ['Cartão de Crédito'],
      observations: '',
      status: 'approved',
      unit: 'Juiz de Fora',
    },
    {
      id: 'mock-3',
      patient: 'Ana Costa',
      procedure: 'Laser Transdérmico',
      value: 2500,
      discount: 100,
      finalValue: 2400,
      validityDate: '2026-12-31',
      createdAt: now.toISOString(),
      paymentMethods: ['Boleto'],
      observations: '',
      status: 'pending',
      unit: 'Leopoldina',
    },
  ]
}

const FinanceiroContext = createContext<FinanceiroState | undefined>(undefined)

export function FinanceiroProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgets)

  useEffect(() => {
    localStorage.setItem('@db_financeiro', JSON.stringify(budgets))
  }, [budgets])

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
