import { describe, expect, it } from 'vitest'
import { forecastMonthEndKwh, marginalRate, nextCliff, tariffCost } from './tariff'

// Cross-checks against the hand-computed bills in 04-business/capex-opex.md §4
// (verified RURA tiers: 0–20 @89, 20–50 @310, >50 @369).
describe('tariffCost — matches the sourced capex-opex bills', () => {
  it('20 kWh = lifeline only', () => {
    expect(tariffCost(20)).toBe(20 * 89) // 1,780
  })
  it('100 kWh = 29,530 RWF', () => {
    expect(tariffCost(100)).toBe(29_530)
  })
  it('150 kWh = 47,980 RWF', () => {
    expect(tariffCost(150)).toBe(47_980)
  })
  it('200 kWh = 66,430 RWF', () => {
    expect(tariffCost(200)).toBe(66_430)
  })
  it('0 kWh = 0', () => {
    expect(tariffCost(0)).toBe(0)
  })
})

describe('marginalRate', () => {
  it('charges 89 / 310 / 369 across the bands', () => {
    expect(marginalRate(10)).toBe(89)
    expect(marginalRate(35)).toBe(310)
    expect(marginalRate(80)).toBe(369)
  })
})

describe('nextCliff — the signature tier-cliff feature', () => {
  it('warns approaching the 50 kWh cliff', () => {
    const c = nextCliff(47.6)!
    expect(c.nextThreshold).toBe(50)
    expect(c.kWhToCliff).toBeCloseTo(2.4)
    expect(c.rateAfter).toBe(369)
  })
  it('returns null once in the top band', () => {
    expect(nextCliff(80)).toBeNull()
  })
})

describe('forecastMonthEndKwh', () => {
  it('projects run-rate to a 30-day month', () => {
    expect(forecastMonthEndKwh(50, 15, 30)).toBe(100)
  })
})
