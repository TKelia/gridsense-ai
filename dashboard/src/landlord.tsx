import { createContext, useContext, useState, type ReactNode } from 'react'
import { tariffCost } from './lib/tariff'

// ---- Verified non-residential (commercial) tariffs, RWF/kWh ----
// Source: 02-strategy/platform-expansion.md §A / REG tariffs. Non-residential is
// effectively a low/high-voltage flat structure; we use a single representative
// rate per profile rather than a re-implemented block engine.
export const NONRES_RATE_LOW = 355 // RWF/kWh
export const NONRES_RATE_HIGH = 376 // RWF/kWh

/** Verified rate constants surfaced for UI/documents (residential blocks live in lib/tariff). */
export const RWANDA_BLOCKS = {
  res1: 89,
  res2: 310,
  res3: 369,
  nonResLow: NONRES_RATE_LOW,
  nonResHigh: NONRES_RATE_HIGH,
} as const

export type TariffType = 'residential' | 'nonresidential'

export interface Tenant {
  id: string
  name: string
  phone: string
  email: string
}

export interface Unit {
  id: string
  label: string
  tenant?: Tenant
  tariffType: TariffType
  openingKwh: number
  currentKwh: number
  readingDate: string // ISO yyyy-mm-dd
  rentRWF?: number
  dueDay: number // 1-31
  /** Marked paid for the current period (demo-local flag). */
  paid?: boolean
  paidDate?: string
  paidMethod?: string
  paidRef?: string
}

export interface Property {
  id: string
  name: string
  address: string
  units: Unit[]
}

export interface Portfolio {
  properties: Property[]
}

// ---- Billing math (reuses the tested tariff engine for residential) ----
export interface UnitBill {
  consumptionKwh: number
  amountRWF: number
  tariffType: TariffType
  rateLabel: string
}

/** Exact bill for a unit: consumption × the verified tariff. */
export function unitBill(unit: Unit): UnitBill {
  const consumptionKwh = Math.max(0, unit.currentKwh - unit.openingKwh)
  if (unit.tariffType === 'nonresidential') {
    // Flat commercial rate (low-voltage representative). Honest, simple.
    const amountRWF = consumptionKwh * NONRES_RATE_LOW
    return { consumptionKwh, amountRWF, tariffType: 'nonresidential', rateLabel: `${NONRES_RATE_LOW} RWF/kWh (non-residential)` }
  }
  // Residential: marginal block tariff from the tested engine.
  const amountRWF = tariffCost(consumptionKwh)
  return { consumptionKwh, amountRWF, tariffType: 'residential', rateLabel: '89 / 310 / 369 RWF/kWh (residential blocks)' }
}

/** Total due across a unit = utility bill (+ rent if set). */
export function unitTotalDue(unit: Unit): number {
  return unitBill(unit).amountRWF + (unit.rentRWF ?? 0)
}

// ---- Context ----
interface LandlordCtx {
  portfolio: Portfolio
  addProperty: (p: Omit<Property, 'id' | 'units'>) => string
  updateProperty: (id: string, patch: Partial<Omit<Property, 'id' | 'units'>>) => void
  removeProperty: (id: string) => void
  addUnit: (propertyId: string, u: Omit<Unit, 'id'>) => string
  updateUnit: (propertyId: string, unitId: string, patch: Partial<Unit>) => void
  removeUnit: (propertyId: string, unitId: string) => void
  markPaid: (propertyId: string, unitId: string, info: { method: string; ref: string }) => void
  markUnpaid: (propertyId: string, unitId: string) => void
  seedSample: () => void
  reset: () => void
}

const Ctx = createContext<LandlordCtx | null>(null)
const KEY = 'gridsense_portfolio'

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

function readInitial(): Portfolio {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Portfolio
      if (parsed && Array.isArray(parsed.properties)) return parsed
    }
  } catch {
    /* malformed / unavailable */
  }
  return { properties: [] }
}

export function LandlordProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<Portfolio>(readInitial)

  const persist = (p: Portfolio) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* keep in-memory */
    }
    setPortfolio(p)
  }

  const addProperty: LandlordCtx['addProperty'] = (p) => {
    const id = uid('prop')
    persist({ properties: [...portfolio.properties, { id, units: [], ...p }] })
    return id
  }

  const updateProperty: LandlordCtx['updateProperty'] = (id, patch) => {
    persist({ properties: portfolio.properties.map((pr) => (pr.id === id ? { ...pr, ...patch } : pr)) })
  }

  const removeProperty: LandlordCtx['removeProperty'] = (id) => {
    persist({ properties: portfolio.properties.filter((pr) => pr.id !== id) })
  }

  const addUnit: LandlordCtx['addUnit'] = (propertyId, u) => {
    const id = uid('unit')
    persist({
      properties: portfolio.properties.map((pr) =>
        pr.id === propertyId ? { ...pr, units: [...pr.units, { id, ...u }] } : pr,
      ),
    })
    return id
  }

  const updateUnit: LandlordCtx['updateUnit'] = (propertyId, unitId, patch) => {
    persist({
      properties: portfolio.properties.map((pr) =>
        pr.id === propertyId
          ? { ...pr, units: pr.units.map((un) => (un.id === unitId ? { ...un, ...patch } : un)) }
          : pr,
      ),
    })
  }

  const removeUnit: LandlordCtx['removeUnit'] = (propertyId, unitId) => {
    persist({
      properties: portfolio.properties.map((pr) =>
        pr.id === propertyId ? { ...pr, units: pr.units.filter((un) => un.id !== unitId) } : pr,
      ),
    })
  }

  const markPaid: LandlordCtx['markPaid'] = (propertyId, unitId, info) => {
    updateUnit(propertyId, unitId, {
      paid: true,
      paidDate: new Date().toISOString().slice(0, 10),
      paidMethod: info.method,
      paidRef: info.ref,
    })
  }

  const markUnpaid: LandlordCtx['markUnpaid'] = (propertyId, unitId) => {
    updateUnit(propertyId, unitId, { paid: false, paidDate: undefined, paidMethod: undefined, paidRef: undefined })
  }

  const seedSample = () => {
    const today = new Date().toISOString().slice(0, 10)
    const sample: Property = {
      id: uid('prop'),
      name: 'Kacyiru Apartments (sample)',
      address: 'KG 7 Ave, Kacyiru, Kigali',
      units: [
        {
          id: uid('unit'),
          label: 'Unit A1',
          tenant: { id: uid('ten'), name: 'Aline U.', phone: '+250788000001', email: 'aline@example.com' },
          tariffType: 'residential',
          openingKwh: 1240,
          currentKwh: 1305,
          readingDate: today,
          rentRWF: 120000,
          dueDay: 5,
        },
        {
          id: uid('unit'),
          label: 'Unit A2',
          tenant: { id: uid('ten'), name: 'Eric M.', phone: '+250788000002', email: 'eric@example.com' },
          tariffType: 'residential',
          openingKwh: 880,
          currentKwh: 918,
          readingDate: today,
          rentRWF: 100000,
          dueDay: 1,
        },
        {
          id: uid('unit'),
          label: 'Shop B1',
          tenant: { id: uid('ten'), name: 'Bralirwa Kiosk', phone: '+250788000003', email: 'shop@example.com' },
          tariffType: 'nonresidential',
          openingKwh: 5400,
          currentKwh: 5612,
          readingDate: today,
          rentRWF: 250000,
          dueDay: 10,
        },
      ],
    }
    persist({ properties: [...portfolio.properties, sample] })
  }

  const reset = () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setPortfolio({ properties: [] })
  }

  return (
    <Ctx.Provider
      value={{
        portfolio,
        addProperty,
        updateProperty,
        removeProperty,
        addUnit,
        updateUnit,
        removeUnit,
        markPaid,
        markUnpaid,
        seedSample,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useLandlord(): LandlordCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useLandlord must be used within LandlordProvider')
  return c
}
