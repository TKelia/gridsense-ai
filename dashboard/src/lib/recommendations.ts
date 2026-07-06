// Rule-based, honestly-scoped recommendation engine (02-strategy §D3).
// Each rec is tied to data + the verified tariff. RWF impacts are RANGES (10–20%)
// because the savings % is not yet a cited figure — never a single fabricated number.
// Text is produced via the i18n t() passed in, so recs translate with the UI.

import { expectedMonthlyKwh, type ApplianceModel } from './simulation'
import { RWF, forecastMonthEndKwh, marginalRate, nextCliff } from './tariff'
import type { HomeSnapshot } from './types'
import { APPLIANCE_I18N, type StringKey } from '../i18n/strings'

export interface Recommendation {
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
  detail: string
  impact: string
}

type T = (key: StringKey, params?: Record<string, string | number>) => string

const LOW = 0.1
const HIGH = 0.2

export function recommend(
  snap: HomeSnapshot,
  day: number,
  t: T,
  appliances?: ApplianceModel[],
): Recommendation[] {
  const recs: Recommendation[] = []
  const kWh = snap.monthToDateKwh
  const forecast = forecastMonthEndKwh(kWh, day)
  const rate = marginalRate(forecast)
  const estimates = expectedMonthlyKwh(appliances).sort((a, b) => b.monthlyKwh - a.monthlyKwh)
  const range = (kwh: number) =>
    t('rec_impact_range', { lo: RWF(kwh * LOW * rate), hi: RWF(kwh * HIGH * rate) })

  // 1) Tier-cliff / forecast crossing
  const cliff = nextCliff(kWh)
  if (cliff && forecast >= cliff.nextThreshold) {
    const extra = (forecast - cliff.nextThreshold) * (cliff.rateAfter - cliff.currentRate)
    recs.push({
      id: 'cliff',
      severity: 'high',
      title: t('rec_cliff_title', { rate: cliff.rateAfter }),
      detail: t('rec_cliff_detail', {
        forecast: forecast.toFixed(0),
        threshold: cliff.nextThreshold,
        rate: cliff.rateAfter,
        current: cliff.currentRate,
      }),
      impact: t('rec_cliff_impact', { amount: RWF(extra) }),
    })
  }

  // 2) Biggest controllable load (usually water heater, else fridge)
  const top = estimates.find((e) => e.key === 'water_heater' && e.monthlyKwh > 20) ?? estimates[0]
  if (top) {
    const controllable = ['water_heater', 'iron', 'kettle'].includes(top.key)
    const label = t(APPLIANCE_I18N[top.key] ?? 'refrigerator')
    recs.push({
      id: `top-${top.key}`,
      severity: controllable ? 'high' : 'medium',
      title: t('rec_top_title', { label, kwh: top.monthlyKwh.toFixed(0) }),
      detail: controllable ? t('rec_top_detail_flex', { label }) : t('rec_top_detail_fridge', { label }),
      impact: range(top.monthlyKwh),
    })
  }

  // 3) High-power spike appliances (batch them)
  const spikes = estimates.filter((e) => ['kettle', 'iron'].includes(e.key) && e.monthlyKwh > 1)
  if (spikes.length) {
    const totalKwh = spikes.reduce((s, e) => s + e.monthlyKwh, 0)
    recs.push({
      id: 'spikes',
      severity: 'medium',
      title: t('rec_spikes_title'),
      detail: t('rec_spikes_detail'),
      impact: range(totalKwh),
    })
  }

  // 4) Standby / electronics
  const electronics = estimates.find((e) => e.key === 'electronics')
  if (electronics) {
    recs.push({
      id: 'standby',
      severity: 'low',
      title: t('rec_standby_title'),
      detail: t('rec_standby_detail'),
      impact: range(electronics.monthlyKwh),
    })
  }

  return recs
}
