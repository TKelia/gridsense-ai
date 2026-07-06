import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, Label } from '../components/ui'
import { TierGauge } from '../components/TierGauge'
import { RWF, forecastMonthEndKwh, marginalRate, nextCliff, tariffCost } from '../lib/tariff'
import type { HomeSnapshot } from '../lib/types'
import type { ChartPoint } from '../lib/useHomeData'
import { APPLIANCE_I18N, useI18n } from '../i18n'
import { useTheme } from '../theme'

export function LiveNow({ snap, history }: { snap: HomeSnapshot; history: ChartPoint[] }) {
  const { t } = useI18n()
  const { charts } = useTheme()
  const kWh = snap.monthToDateKwh
  const cost = tariffCost(kWh)
  const rate = marginalRate(kWh)
  const cliff = nextCliff(kWh)
  const day = new Date().getDate()
  const forecastKwh = forecastMonthEndKwh(kWh, day)
  const forecastCost = tariffCost(forecastKwh)
  const topAppliances = [...snap.appliances].sort((a, b) => b.watts - a.watts).slice(0, 6)
  const maxW = Math.max(...topAppliances.map((a) => a.watts), 1)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card>
          <Label>{t('live_power')}</Label>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold tabular-nums text-heading">{(snap.totalWatts / 1000).toFixed(2)}</span>
            <span className="text-lg text-muted mb-1.5">kW</span>
          </div>
          <p className="text-xs text-muted mt-1">{t('whole_home')}</p>
        </Card>
        <Card>
          <Label>{t('month_so_far')}</Label>
          <div className="text-3xl font-bold tabular-nums text-heading">
            {kWh.toFixed(1)} <span className="text-base text-muted">kWh</span>
          </div>
          <div className="text-2xl font-semibold text-emerald-500 mt-1 tabular-nums">{RWF(cost)}</div>
          <p className="text-xs text-muted mt-1">{t('next_unit', { rate })}</p>
        </Card>
        <Card>
          <Label>{t('forecast_month_end')}</Label>
          <div className="text-3xl font-bold tabular-nums text-heading">
            {forecastKwh.toFixed(0)} <span className="text-base text-muted">kWh</span>
          </div>
          <div className="text-2xl font-semibold mt-1 tabular-nums text-heading">{RWF(forecastCost)}</div>
          <p className="text-xs text-muted mt-1">{t('at_run_rate')}</p>
        </Card>
      </div>

      {cliff && (
        <div
          className={`mb-4 rounded-2xl px-5 py-4 border ${
            cliff.kWhToCliff <= 5
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
              : 'gs-card text-main'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {cliff.kWhToCliff <= 5 ? t('tier_cliff_ahead') : t('tier_status')}
          </div>
          <p className="text-sm mt-1">
            {t('cliff_body', { n: cliff.kWhToCliff.toFixed(1), rate: cliff.rateAfter, current: cliff.currentRate })}{' '}
            {cliff.kWhToCliff <= 5 && t('cliff_hint')}
          </p>
        </div>
      )}

      <Card className="mb-4">
        <Label>{t('where_in_tiers')}</Label>
        <TierGauge kWh={kWh} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <Label>{t('live_power_chart')}</Label>
          <div className="h-48 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis width={34} tick={{ fill: charts.axis, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: charts.tipBg, border: `1px solid ${charts.tipBd}`, borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: charts.axis }}
                />
                <Area type="monotone" dataKey="kw" stroke="#34d399" fill="url(#g)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Label>{t('biggest_movers')}</Label>
          <div className="space-y-2.5 mt-1">
            {topAppliances.map((a) => (
              <div key={a.key}>
                <div className="flex justify-between text-sm">
                  <span className="text-soft">{t(APPLIANCE_I18N[a.key] ?? 'refrigerator')}</span>
                  <span className="tabular-nums text-muted">{a.watts} W</span>
                </div>
                <div className="h-2 rounded-full gs-track mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                    style={{ width: `${(a.watts / maxW) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">{t('movers_sub')}</p>
        </Card>
      </div>
    </>
  )
}
