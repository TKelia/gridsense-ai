import { Card, Label } from '../components/ui'
import { recommend } from '../lib/recommendations'
import type { ApplianceModel } from '../lib/simulation'
import type { HomeSnapshot } from '../lib/types'
import { useI18n, type StringKey } from '../i18n'

const SEV: Record<string, { ring: string; chip: string; key: StringKey }> = {
  high: { ring: 'border-rose-500/40', chip: 'bg-rose-500/15 text-rose-500', key: 'high_impact' },
  medium: { ring: 'border-amber-500/40', chip: 'bg-amber-500/15 text-amber-600', key: 'medium' },
  low: { ring: 'gs-border', chip: 'bg-slate-500/15 text-soft', key: 'easy_win' },
}

export function Save({ snap, appliances }: { snap: HomeSnapshot; appliances?: ApplianceModel[] }) {
  const { t } = useI18n()
  const day = new Date().getDate()
  const recs = recommend(snap, day, t, appliances)

  return (
    <>
      <Card className="mb-4">
        <Label>{t('savings_advice')}</Label>
        <p className="text-sm text-soft">{t('save_intro')}</p>
      </Card>

      <div className="space-y-3">
        {recs.map((r) => {
          const s = SEV[r.severity]
          return (
            <div key={r.id} className={`gs-card border ${s.ring} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-heading">{r.title}</h3>
                <span className={`shrink-0 text-[11px] px-2 py-1 rounded-full ${s.chip}`}>{t(s.key)}</span>
              </div>
              <p className="text-sm text-muted mt-1.5">{r.detail}</p>
              <p className="text-sm font-medium text-emerald-500 mt-2">{r.impact}</p>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted mt-4">{t('save_roadmap')}</p>
    </>
  )
}
