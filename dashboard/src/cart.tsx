import { createContext, useContext, useState, type ReactNode } from 'react'

export type BillingCycle = 'monthly' | 'annual'

export interface CartItem {
  id: string // unique line id
  kind: 'plan' | 'device'
  name: string
  // For plans: monthly RWF (annual handled by cycle). For devices: one-time RWF unless `recurring`.
  priceRWF: number
  cycle?: BillingCycle
  recurring?: boolean // true = per-month
  note?: string
}

interface CartCtx {
  items: CartItem[]
  add: (item: Omit<CartItem, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
  /** Effective charge today (annual plans = 10× monthly; one-time devices billed once). */
  totalToday: number
}

const Ctx = createContext<CartCtx | null>(null)

function uid(): string {
  return `ci_${Math.random().toString(36).slice(2, 9)}`
}

/** Effective charge for a single line item at checkout time. */
export function lineTotal(item: CartItem): number {
  if (item.kind === 'plan' && item.cycle === 'annual') return item.priceRWF * 10 // 2 months free
  return item.priceRWF
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add: CartCtx['add'] = (item) => {
    // Plans are single-select: replace any existing plan line.
    setItems((prev) => {
      const filtered = item.kind === 'plan' ? prev.filter((i) => i.kind !== 'plan') : prev
      return [...filtered, { id: uid(), ...item }]
    })
  }

  const remove: CartCtx['remove'] = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clear = () => setItems([])

  const totalToday = items.reduce((s, i) => s + lineTotal(i), 0)

  return <Ctx.Provider value={{ items, add, remove, clear, totalToday }}>{children}</Ctx.Provider>
}

export function useCart(): CartCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used within CartProvider')
  return c
}
