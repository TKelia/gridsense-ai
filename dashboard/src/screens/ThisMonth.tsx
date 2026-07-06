import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, Label } from '../components/ui'
import { monthlySeries } from '../lib/month'
import { RWF, forecastMonthEndKwh, nextCliff, tariffCost } from '../lib/tariff'
import type { HomeSnapshot } from '../lib/types'
import { useI18n } from '../i18n'
import { useTheme } from '../theme'

export function ThisMonth({ snap }: { snap: HomeSnapshot }) {
  const { t } = useI18n()
  const { charts } = useTheme()
  const kWh = snap.monthToDateKwh
  const day = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const series = monthlySeries(kWh, day, daysInMonth)
  const forecastKwh = forecastMonthEndKwh(kWh, day)
  const cost = tariffCost(kWh)
  const forecastCost = tariffCost(forecastKwh)
  const cliff = nextCliff(kWh)
  const crossing = series.find((p) => p.cumulative >= 50)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <Card>
          <Label>{t('used_to_date')}</Label>
          <div className="text-2xl font-bold tabular-nums text-heading">{kWh.toFixed(1)} kWh</div>
        </Card>
        <Card>
          <Label>{t('spent_to_date')}</Label>
          <div className="text-2xl font-bold text-emerald-500 tabular-nums">{RWF(cost)}</div>
        </Card>
        <Card>
          <Label>{t('forecast_use')}</Label>
          <div className="text-2xl font-bold tabular-nums text-heading">{forecastKwh.toFixed(0)} kWh</div>
        </Card>
        <Card>
          <Label>{t('forecast_bill')}</Label>
          <div className="text-2xl font-bold tabular-nums text-heading">{RWF(forecastCost)}</div>
        </Card>
      </div>

      <Card className="mb-4">
        <Label>{t('cumulative_title')}</Label>
        <div className="h-64 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={charts.grid} />
              <XAxis dataKey="day" tick={{ fill: charts.axis, fontSize: 11 }} tickLine={false} />
              <YAxis width={38} tick={{ fill: charts.axis, fontSize: 11 }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: charts.tipBg, border: `1px solid ${charts.tipBd}`, borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: charts.axis }}
                formatter={(v) => [`${v} kWh`, 'cumulative']}
                labelFormatter={(d) => `Day ${d}`}
              />
              <ReferenceLine y={20} stroke="#10b981" strokeDasharray="4 4" label={{ value: '20 kWh → 310', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={50} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '50 kWh → 369', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine x={day} stroke={charts.axis} strokeDasharray="2 2" />
              <Line type="monotone" dataKey="cumulative" stroke="#38bdf8" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted mt-2">{t('cumulative_note')}</p>
      </Card>

      {cliff && (
        <Card>
          <Label>{t('tier_crossing')}</Label>
          <p className="text-sm text-soft">
            {t('crossing_body', { current: cliff.currentRate, n: cliff.kWhToCliff.toFixed(1), rate: cliff.rateAfter })}{' '}
            {crossing ? t('crossing_day', { day: crossing.day }) : t('crossing_under')}
          </p>
        </Card>
      )}
    </>
  )
}
