// GridSense tariff engine — RWANDA RESIDENTIAL, verified RURA/REG tiers
// effective 1 October 2025 (see 01-research/research-findings.md §1).
// Pure functions only — unit-testable, no side effects.

export interface TariffTier {
  upTo: number | null // upper kWh bound of the band (null = unbounded)
  rate: number // RWF per kWh on the marginal unit in this band
  label: string
}

// Source: REG tariffs, RURA press release (research-findings §1).
export const RWANDA_RESIDENTIAL_TIERS: TariffTier[] = [
  { upTo: 20, rate: 89, label: 'Lifeline (0–20 kWh)' },
  { upTo: 50, rate: 310, label: 'Mid (20–50 kWh)' },
  { upTo: null, rate: 369, label: 'High (>50 kWh)' },
]

/** Total RWF cost for a given cumulative monthly consumption, applying marginal tiers. */
export function tariffCost(kWh: number, tiers = RWANDA_RESIDENTIAL_TIERS): number {
  let remaining = Math.max(0, kWh)
  let lower = 0
  let cost = 0
  for (const tier of tiers) {
    const upper = tier.upTo ?? Infinity
    const bandWidth = upper - lower
    const used = Math.min(remaining, bandWidth)
    if (used <= 0) break
    cost += used * tier.rate
    remaining -= used
    lower = upper
  }
  return cost
}

/** The marginal RWF/kWh the next unit will cost at this cumulative consumption. */
export function marginalRate(kWh: number, tiers = RWANDA_RESIDENTIAL_TIERS): number {
  for (const tier of tiers) {
    const upper = tier.upTo ?? Infinity
    if (kWh < upper) return tier.rate
  }
  return tiers[tiers.length - 1].rate
}

export interface CliffInfo {
  nextThreshold: number // kWh at which the rate jumps
  kWhToCliff: number
  currentRate: number
  rateAfter: number
}

/** Distance to the next tier "cliff" (where the marginal price jumps), or null if in the top band. */
export function nextCliff(kWh: number, tiers = RWANDA_RESIDENTIAL_TIERS): CliffInfo | null {
  for (let i = 0; i < tiers.length; i++) {
    const upper = tiers[i].upTo
    if (upper === null) return null // already in the unbounded top band
    if (kWh < upper) {
      return {
        nextThreshold: upper,
        kWhToCliff: upper - kWh,
        currentRate: tiers[i].rate,
        rateAfter: tiers[i + 1].rate,
      }
    }
  }
  return null
}

/** Simple run-rate forecast of month-end kWh from month-to-date usage. */
export function forecastMonthEndKwh(monthToDateKwh: number, dayOfMonth: number, daysInMonth = 30): number {
  if (dayOfMonth <= 0) return monthToDateKwh
  return (monthToDateKwh / dayOfMonth) * daysInMonth
}

export const RWF = (n: number): string =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' RWF'
