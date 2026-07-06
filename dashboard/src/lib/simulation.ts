// Whole-home load simulation, grounded in sourced Kigali appliance data
// (see 05-build/appliance-load-data.md). Emits the same shape the real
// ESP32 + smart plugs will produce. Clearly labelled source: 'simulated'.

import type { ApplianceReading, HomeSnapshot } from './types'

export interface ApplianceModel {
  key: string
  label: string
  watts: number // nameplate while ON (sourced ranges, midpoints)
  // Expected ON-hours per day — drives the MONTHLY ENERGY estimate. Calibrated so
  // monthly kWh matches the sourced figures in appliance-load-data.md (fridge ~36,
  // water heater ~59, TV ~11, kettle/iron ~8, fan ~7, laptop ~6, lighting ~9).
  dutyHoursPerDay: number
  // probability the appliance is ON at a given hour (0..1), 24 entries — drives the
  // LIVE view only (instantaneous on/off), kept separate from the energy estimate.
  hourly: number[]
}

// Duty patterns: index 0 = 00:00 ... 23 = 23:00.
const evening = (peak: number) => [
  0.02, 0.02, 0.02, 0.02, 0.02, 0.05, 0.2, 0.3, 0.15, 0.05, 0.05, 0.05,
  0.08, 0.05, 0.05, 0.08, 0.2, 0.5, peak, peak, peak * 0.9, 0.6, 0.3, 0.1,
]

// Sourced midpoints + calibrated on-hours from appliance-load-data.md
export const APPLIANCES: ApplianceModel[] = [
  // Fridge: 100–300 W -> 150 W; ~8 compressor-hours/day -> ~36 kWh/mo.
  { key: 'fridge', label: 'Refrigerator', watts: 150, dutyHoursPerDay: 8, hourly: Array(24).fill(0.35) },
  // Water heater: 1500–3000 W -> 2200 W; ~0.9 h/day -> ~59 kWh/mo (biggest controllable).
  {
    key: 'water_heater',
    label: 'Water heater',
    watts: 2200,
    dutyHoursPerDay: 0.9,
    hourly: [0, 0, 0, 0, 0, 0.1, 0.4, 0.3, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.3, 0.25, 0.1, 0.02, 0, 0],
  },
  // TV + decoder: 30–150 W -> 110 W; ~3.3 h/day -> ~11 kWh/mo.
  { key: 'tv', label: 'TV + decoder', watts: 110, dutyHoursPerDay: 3.3, hourly: evening(0.85) },
  // Lighting (LED): ~60 W whole-home; ~5 h/day -> ~9 kWh/mo.
  { key: 'lighting', label: 'Lighting', watts: 60, dutyHoursPerDay: 5, hourly: evening(0.9) },
  // Iron: 1000–2000 W -> 1500 W; ~0.18 h/day (short bursts) -> ~8 kWh/mo.
  {
    key: 'iron',
    label: 'Electric iron',
    watts: 1500,
    dutyHoursPerDay: 0.18,
    hourly: [0, 0, 0, 0, 0, 0.05, 0.15, 0.1, 0.05, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02, 0.03, 0.05, 0.08, 0.06, 0.04, 0.02, 0, 0, 0],
  },
  // Kettle: 1500–2200 W -> 1800 W; ~0.15 h/day (brief) -> ~8 kWh/mo.
  {
    key: 'kettle',
    label: 'Kettle',
    watts: 1800,
    dutyHoursPerDay: 0.15,
    hourly: [0, 0, 0, 0, 0, 0.1, 0.2, 0.15, 0.05, 0.03, 0.03, 0.05, 0.05, 0.03, 0.03, 0.05, 0.08, 0.12, 0.1, 0.06, 0.03, 0.02, 0, 0],
  },
  // Fan: 40–120 W -> 80 W; ~2.9 h/day -> ~7 kWh/mo.
  { key: 'fan', label: 'Ceiling fan', watts: 80, dutyHoursPerDay: 2.9, hourly: evening(0.6) },
  // Laptop/phone charging: 45 W; ~4.4 h/day -> ~6 kWh/mo.
  { key: 'electronics', label: 'Laptop / charging', watts: 45, dutyHoursPerDay: 4.4, hourly: evening(0.5).map((h) => Math.max(h, 0.15)) },
]

/** The catalog of appliances the simulation knows about (sourced load model). */
export function applianceCatalog(): ApplianceModel[] {
  return APPLIANCES
}

// Minimal shape of a household profile (defined fully in household.tsx) — kept
// structural here to avoid an import cycle between simulation and household.
interface ApplianceChoiceLike {
  owned: boolean
  hoursPerDay: number
}
interface ProfileLike {
  appliances: Record<string, ApplianceChoiceLike>
}

/**
 * Catalog entries that are OWNED in the profile, with each appliance's
 * dutyHoursPerDay overridden by the user's chosen hoursPerDay.
 */
export function activeAppliances(profile: ProfileLike): ApplianceModel[] {
  return APPLIANCES.filter((a) => profile.appliances[a.key]?.owned).map((a) => {
    const choice = profile.appliances[a.key]
    return { ...a, dutyHoursPerDay: choice ? choice.hoursPerDay : a.dutyHoursPerDay }
  })
}

function hourFraction(ts: number): { hour: number; frac: number } {
  const d = new Date(ts)
  return { hour: d.getHours(), frac: d.getMinutes() / 60 }
}

/** Instantaneous appliance readings for a moment in time. */
export function sampleAppliances(ts: number, list: ApplianceModel[] = APPLIANCES): ApplianceReading[] {
  const { hour } = hourFraction(ts)
  return list.map((a) => {
    const p = a.hourly[hour]
    // Smooth the on/off probability into a believable analogue wattage with jitter.
    const jitter = 0.85 + Math.random() * 0.3
    const on = Math.random() < p ? 1 : p > 0.3 ? 0.6 : 0 // partial duty when likely-on
    const watts = Math.round(a.watts * on * jitter)
    return { key: a.key, label: a.label, watts }
  })
}

export interface SimState {
  monthToDateKwh: number
  lastTs: number
}

/**
 * Advance the simulation. Accumulates month-to-date kWh from instantaneous power.
 * Seed monthToDateKwh near the 50 kWh cliff to make the tier-cliff alert vivid on load.
 */
export function tick(
  state: SimState,
  now: number,
  list: ApplianceModel[] = APPLIANCES,
): { snapshot: HomeSnapshot; state: SimState } {
  const appliances = sampleAppliances(now, list)
  const totalWatts = appliances.reduce((s, a) => s + a.watts, 0)
  const dtHours = Math.max(0, (now - state.lastTs) / 3_600_000)
  // Demo time compression: 1 real second ≈ a few minutes of usage so the meter visibly moves.
  const DEMO_SPEEDUP = 180
  const addedKwh = (totalWatts / 1000) * dtHours * DEMO_SPEEDUP
  const monthToDateKwh = state.monthToDateKwh + addedKwh
  return {
    snapshot: { ts: now, source: 'simulated', totalWatts, appliances, monthToDateKwh },
    state: { monthToDateKwh, lastTs: now },
  }
}

export function initState(seedKwh = 47.5): SimState {
  const now = Date.now()
  return { monthToDateKwh: seedKwh, lastTs: now }
}

export interface ApplianceEstimate {
  key: string
  label: string
  watts: number
  monthlyKwh: number // expected kWh/month from the sourced duty model
}

/** Expected monthly kWh per appliance = nameplate × sourced on-hours/day × days.
 *  Uses dutyHoursPerDay (calibrated to appliance-load-data.md), NOT the live
 *  on/off probability — so short-burst appliances aren't overcounted. */
export function expectedMonthlyKwh(
  list: ApplianceModel[] = APPLIANCES,
  daysInMonth = 30,
): ApplianceEstimate[] {
  return list.map((a) => {
    const monthlyKwh = (a.watts / 1000) * a.dutyHoursPerDay * daysInMonth
    return { key: a.key, label: a.label, watts: a.watts, monthlyKwh: +monthlyKwh.toFixed(1) }
  })
}
