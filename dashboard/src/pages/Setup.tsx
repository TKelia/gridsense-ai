import { useMemo, useState } from 'react'
import { PageTitle } from './Prose'
import { useI18n, APPLIANCE_I18N, type StringKey } from '../i18n'
import { useHousehold, DEMO_PROFILE, type HomeType, type HouseholdProfile } from '../household'
import { useAuth } from '../auth'
import { APPLIANCES, activeAppliances, expectedMonthlyKwh } from '../lib/simulation'
import { RWF, tariffCost } from '../lib/tariff'
import type { Route } from '../routes'

const HOME_TYPES: { id: HomeType; key: StringKey; icon: string }[] = [
  { id: 'apartment', key: 'ht_apartment', icon: '🏢' },
  { id: 'house', key: 'ht_house', icon: '🏠' },
  { id: 'shared', key: 'ht_shared', icon: '🛏️' },
  { id: 'business', key: 'ht_business', icon: '🏪' },
]

export function Setup({ go }: { go: (r: Route) => void }) {
  const { t } = useI18n()
  const { profile, save } = useHousehold()
  const { user, signIn } = useAuth()
  const [draft, setDraft] = useState<HouseholdProfile>(() => ({
    ...profile,
    appliances: { ...profile.appliances },
  }))

  // Live preview: estimate from the currently-owned appliances × the real tariff.
  const preview = useMemo(() => {
    const list = activeAppliances(draft)
    const kwh = expectedMonthlyKwh(list).reduce((s, e) => s + e.monthlyKwh, 0)
    return { kwh, cost: tariffCost(kwh) }
  }, [draft])

  const setHomeType = (homeType: HomeType) => setDraft((d) => ({ ...d, homeType }))
  const setOccupants = (n: number) => setDraft((d) => ({ ...d, occupants: Math.max(1, Math.min(20, n)) }))
  const setSpend = (v: string) => {
    const n = Number(v.replace(/[^\d]/g, ''))
    setDraft((d) => ({ ...d, monthlySpendRWF: v === '' || Number.isNaN(n) ? undefined : n }))
  }
  const toggleOwned = (key: string) =>
    setDraft((d) => ({
      ...d,
      appliances: {
        ...d.appliances,
        [key]: { ...d.appliances[key], owned: !d.appliances[key]?.owned },
      },
    }))
  const setHours = (key: string, hoursPerDay: number) =>
    setDraft((d) => ({
      ...d,
      appliances: { ...d.appliances, [key]: { ...d.appliances[key], hoursPerDay } },
    }))

  const onSave = () => {
    if (!user) signIn({ name: 'You', email: '' })
    save({ ...draft, demo: false, setupComplete: true })
    go('dashboard')
  }

  const onDemo = () => {
    save(DEMO_PROFILE)
    if (!user) signIn({ name: 'Guest', email: '' })
    go('dashboard')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <PageTitle title={t('setup_title')} sub={t('setup_sub')} />

        {/* Home type */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{t('setup_hometype')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HOME_TYPES.map((h) => {
              const active = draft.homeType === h.id
              return (
                <button
                  key={h.id}
                  onClick={() => setHomeType(h.id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    active
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-emerald-500/40'
                  }`}
                >
                  <div className="text-2xl">{h.icon}</div>
                  <div className={`mt-2 text-sm font-medium ${active ? 'text-emerald-500' : 'text-main'}`}>
                    {t(h.key)}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Occupants */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{t('setup_occupants')}</h2>
          <div className="inline-flex items-center gap-4 rounded-2xl gs-card px-4 py-3">
            <button
              onClick={() => setOccupants(draft.occupants - 1)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-lg text-soft hover:text-main"
              aria-label="decrease"
            >
              −
            </button>
            <span className="w-14 text-center text-2xl font-bold tabular-nums text-heading">{draft.occupants}</span>
            <button
              onClick={() => setOccupants(draft.occupants + 1)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-lg text-soft hover:text-main"
              aria-label="increase"
            >
              +
            </button>
            <span className="text-sm text-muted">{t('setup_occupants_unit')}</span>
          </div>
        </section>

        {/* Appliances */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{t('setup_appliances')}</h2>
          <p className="mb-3 mt-1 text-xs text-muted">{t('setup_appliances_hint')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {APPLIANCES.map((a) => {
              const choice = draft.appliances[a.key] ?? { owned: false, hoursPerDay: a.dutyHoursPerDay }
              const owned = choice.owned
              return (
                <div
                  key={a.key}
                  className={`rounded-2xl border p-4 transition-colors ${
                    owned ? 'border-emerald-500/50 bg-emerald-500/[0.06]' : 'border-[var(--border)] bg-[var(--surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-main">{t(APPLIANCE_I18N[a.key] ?? 'refrigerator')}</p>
                      <p className="text-[11px] text-muted">{a.watts} W</p>
                    </div>
                    <button
                      onClick={() => toggleOwned(a.key)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        owned ? 'bg-emerald-500/20 text-emerald-500' : 'border border-[var(--border)] text-muted'
                      }`}
                    >
                      {owned ? `✓ ${t('setup_owned')}` : t('setup_not_owned')}
                    </button>
                  </div>
                  {owned && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-muted">
                        <span>{t('setup_hours')}</span>
                        <span className="tabular-nums text-soft">{choice.hoursPerDay.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={12}
                        step={0.1}
                        value={choice.hoursPerDay}
                        onChange={(e) => setHours(a.key, Number(e.target.value))}
                        className="mt-1 w-full accent-emerald-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Monthly spend */}
        <section className="mb-8">
          <label htmlFor="spend" className="mb-2 block text-sm font-semibold uppercase tracking-wider text-muted">
            {t('setup_spend')}
          </label>
          <input
            id="spend"
            inputMode="numeric"
            value={draft.monthlySpendRWF ?? ''}
            onChange={(e) => setSpend(e.target.value)}
            placeholder={t('setup_spend_ph')}
            className="w-full max-w-xs rounded-xl gs-input px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </section>
      </div>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="gs-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('setup_preview')}</p>
          <div className="mt-4">
            <p className="text-xs text-muted">{t('setup_preview_kwh')}</p>
            <p className="text-3xl font-bold tabular-nums text-heading">
              {preview.kwh.toFixed(0)} <span className="text-base text-muted">kWh</span>
            </p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted">{t('setup_preview_cost')}</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-500">{RWF(preview.cost)}</p>
          </div>
          {draft.monthlySpendRWF != null && draft.monthlySpendRWF > 0 && (
            <p className="mt-3 text-xs text-soft">
              You said you spend ~{RWF(draft.monthlySpendRWF)}/mo.
            </p>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-muted">{t('setup_preview_note')}</p>

          <button
            onClick={onSave}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-semibold text-slate-900 transition-colors hover:from-emerald-400 hover:to-cyan-400"
          >
            {t('setup_save')} →
          </button>
          <button
            onClick={onDemo}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-soft transition-colors hover:text-main"
          >
            {t('setup_skip_demo')}
          </button>
        </div>
      </aside>
    </div>
  )
}
