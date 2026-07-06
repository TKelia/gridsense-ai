// Finalized monthly report JSON for a landlord unit — the exact bytes that get
// canonicalized, hashed, encrypted, and anchored (schema mirrors the proven PoC
// fixture 07-blockchain/scripts/sample-report.json).
//
// PRIVACY: personal fields (tenant, unit label, readings) live ONLY in this
// off-chain file, which is encrypted before pinning. On-chain goes nothing but
// the SHA-256 hash + CID + an opaque homeRef + period (Law N° 058/2021).
import type { Unit } from '../landlord'
import { unitBill, RWANDA_BLOCKS } from '../landlord'
import { RWANDA_RESIDENTIAL_TIERS } from './tariff'

export interface MonthlyReport {
  schema: 'gridsense.monthly-report.v1'
  reportType: 'residential-monthly' | 'nonresidential-monthly'
  generatedAt: string
  period: { year: number; month: number; label: string }
  home: { internalId: string; label: string }
  tenant?: { name: string; phone: string; email: string }
  tariff: { authority: string; currency: 'RWF'; tiers: { label: string; rate: number }[] }
  meter: { openingKwh: number; currentKwh: number; readingDate: string }
  consumptionKwh: number
  blocks: { label: string; kwh: number; rate: number; amountRWF: number }[]
  totalRWF: number
  disclaimer: string
}

/** Residential block breakdown (same math the Invoice shows; tariff engine untouched). */
function blockBreakdown(kWh: number): MonthlyReport['blocks'] {
  let lower = 0
  let remaining = kWh
  const out: MonthlyReport['blocks'] = []
  for (const tier of RWANDA_RESIDENTIAL_TIERS) {
    const upper = tier.upTo ?? Infinity
    const used = Math.min(remaining, upper - lower)
    if (used <= 0) break
    out.push({ label: tier.label, kwh: used, rate: tier.rate, amountRWF: used * tier.rate })
    remaining -= used
    lower = upper
  }
  return out
}

/** Build the finalized report for a unit's current billing period. */
export function buildMonthlyReport(unit: Unit, now = new Date()): MonthlyReport {
  const bill = unitBill(unit)
  const residential = unit.tariffType === 'residential'
  return {
    schema: 'gridsense.monthly-report.v1',
    reportType: residential ? 'residential-monthly' : 'nonresidential-monthly',
    generatedAt: now.toISOString(),
    period: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      label: now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    },
    home: { internalId: unit.id, label: unit.label },
    tenant: unit.tenant
      ? { name: unit.tenant.name, phone: unit.tenant.phone, email: unit.tenant.email }
      : undefined,
    tariff: residential
      ? {
          authority: 'RURA (Rwanda), residential tiers effective 2025-10-01',
          currency: 'RWF',
          tiers: RWANDA_RESIDENTIAL_TIERS.map((t) => ({ label: t.label, rate: t.rate })),
        }
      : {
          authority: 'RURA (Rwanda), non-residential low-voltage',
          currency: 'RWF',
          tiers: [{ label: 'flat', rate: RWANDA_BLOCKS.nonResLow }],
        },
    meter: {
      openingKwh: unit.openingKwh,
      currentKwh: unit.currentKwh,
      readingDate: unit.readingDate,
    },
    consumptionKwh: bill.consumptionKwh,
    blocks: residential
      ? blockBreakdown(bill.consumptionKwh)
      : [
          {
            label: 'flat',
            kwh: bill.consumptionKwh,
            rate: RWANDA_BLOCKS.nonResLow,
            amountRWF: bill.amountRWF,
          },
        ],
    totalRWF: bill.amountRWF,
    disclaimer:
      'GridSense estimate from meter readings and the official RURA/REG tariff — not an official utility bill (REG/EUCL is the billing authority). The on-chain anchor proves this report was not altered after issuance, not that the reading was correct.',
  }
}
