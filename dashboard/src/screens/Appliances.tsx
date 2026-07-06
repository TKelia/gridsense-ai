import { Card, Label } from '../components/ui'
import { expectedMonthlyKwh, type ApplianceModel } from '../lib/simulation'
import { RWF, marginalRate } from '../lib/tariff'
import type { HomeSnapshot } from '../lib/types'
import { APPLIANCE_I18N, useI18n } from '../i18n'

export function Appliances({ snap, appliances }: { snap: HomeSnapshot; appliances?: ApplianceModel[] }) {
  const { t } = useI18n()
  const estimates = expectedMonthlyKwh(appliances).sort((a, b) => b.monthlyKwh - a.monthlyKwh)
  const totalKwh = estimates.reduce((s, e) => s + e.monthlyKwh, 0) || 1
  const rate = marginalRate(snap.monthToDateKwh)
  const liveByKey = new Map(snap.appliances.map((a) => [a.key, a.watts]))
  const maxKwh = Math.max(...estimates.map((e) => e.monthlyKwh), 1)

  return (
    <>
      <Card className="mb-4">
        <Label>{t('monthly_share')}</Label>
        <p className="text-xs text-muted mb-3">{t('appliances_sub', { rate })}</p>
        <div className="space-y-3">
          {estimates.map((e) => {
            const live = liveByKey.get(e.key) ?? 0
            const monthlyCost = e.monthlyKwh * rate
            const share = (e.monthlyKwh / totalKwh) * 100
            return (
              <div key={e.key}>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-main font-medium">{t(APPLIANCE_I18N[e.key] ?? 'refrigerator')}</span>
                  <span className="text-muted tabular-nums">
                    <b className="text-main">{e.monthlyKwh.toFixed(0)} kWh</b> · {RWF(monthlyCost)} · {share.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full gs-track mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{ width: `${(e.monthlyKwh / maxKwh) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  {t('live_now_label')}: {live} W · {live > 0 ? t('on') : t('idle')}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <Label>{t('why_matters')}</Label>
        <p className="text-sm text-soft">{t('why_body')}</p>
        <p className="text-xs text-muted mt-2">{t('appliances_foot')}</p>
      </Card>
    </>
  )
}
