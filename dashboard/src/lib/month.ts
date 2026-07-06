// Build a believable daily cumulative-kWh curve for the current month from the
// month-to-date scalar, plus a run-rate projection to month end. Deterministic
// (no randomness) so the chart is stable across renders.

export interface DayPoint {
  day: number
  kwh: number
  cumulative: number
  projected: boolean
}

export function monthlySeries(monthToDateKwh: number, today: number, daysInMonth = 30): DayPoint[] {
  const t = Math.max(1, today)
  // mild, deterministic day-to-day variation
  const weights = Array.from({ length: t }, (_, i) => 0.8 + 0.4 * Math.abs(Math.sin(i * 1.3)))
  const sum = weights.reduce((a, b) => a + b, 0)
  const points: DayPoint[] = []
  let cum = 0
  for (let i = 0; i < t; i++) {
    const kwh = (monthToDateKwh * weights[i]) / sum
    cum += kwh
    points.push({ day: i + 1, kwh: +kwh.toFixed(2), cumulative: +cum.toFixed(1), projected: false })
  }
  const rate = monthToDateKwh / t
  for (let d = t + 1; d <= daysInMonth; d++) {
    cum += rate
    points.push({ day: d, kwh: +rate.toFixed(2), cumulative: +cum.toFixed(1), projected: true })
  }
  return points
}
