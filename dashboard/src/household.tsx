import { createContext, useContext, useState, type ReactNode } from 'react'
import { APPLIANCES } from './lib/simulation'

export type HomeType = 'apartment' | 'house' | 'shared' | 'business'

export interface ApplianceChoice {
  owned: boolean
  hoursPerDay: number
}

export interface HouseholdProfile {
  setupComplete: boolean
  demo: boolean
  homeType: HomeType
  occupants: number
  appliances: Record<string, ApplianceChoice>
  monthlySpendRWF?: number
}

interface HouseholdCtx {
  profile: HouseholdProfile
  save: (p: HouseholdProfile) => void
  reset: () => void
  setProfile: (p: HouseholdProfile) => void
}

const Ctx = createContext<HouseholdCtx | null>(null)
const KEY = 'gridsense_household'

/** Build an appliance map from the catalog defaults. `owned` controls ownership. */
function applianceMap(owned: boolean): Record<string, ApplianceChoice> {
  const map: Record<string, ApplianceChoice> = {}
  for (const a of APPLIANCES) {
    map[a.key] = { owned, hoursPerDay: a.dutyHoursPerDay }
  }
  return map
}

// Demo: ALL appliances owned at their sourced default duty hours.
export const DEMO_PROFILE: HouseholdProfile = {
  setupComplete: true,
  demo: true,
  homeType: 'house',
  occupants: 4,
  appliances: applianceMap(true),
}

// Real users start here: nothing set up yet, sensible appliance defaults pre-filled
// (common appliances pre-checked) so the form is fast to complete.
export const DEFAULT_NEW_PROFILE: HouseholdProfile = {
  setupComplete: false,
  demo: false,
  homeType: 'apartment',
  occupants: 2,
  appliances: {
    ...applianceMap(false),
    fridge: { owned: true, hoursPerDay: 8 },
    tv: { owned: true, hoursPerDay: 3.3 },
    lighting: { owned: true, hoursPerDay: 5 },
    electronics: { owned: true, hoursPerDay: 4.4 },
  },
}

function readInitial(): HouseholdProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<HouseholdProfile>
      // Merge with defaults so a stored profile from an older schema still works.
      return {
        ...DEFAULT_NEW_PROFILE,
        ...parsed,
        appliances: { ...applianceMap(false), ...(parsed.appliances ?? {}) },
      }
    }
  } catch {
    /* storage unavailable / malformed */
  }
  return DEFAULT_NEW_PROFILE
}

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<HouseholdProfile>(readInitial)

  const persist = (p: HouseholdProfile) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* keep in-memory only */
    }
  }

  const save = (p: HouseholdProfile) => {
    persist(p)
    setProfileState(p)
  }

  const setProfile = (p: HouseholdProfile) => setProfileState(p)

  const reset = () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setProfileState(DEFAULT_NEW_PROFILE)
  }

  return <Ctx.Provider value={{ profile, save, reset, setProfile }}>{children}</Ctx.Provider>
}

export function useHousehold(): HouseholdCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useHousehold must be used within HouseholdProvider')
  return c
}
