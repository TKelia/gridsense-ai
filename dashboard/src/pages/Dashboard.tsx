import { useMemo } from 'react'
import { Header, HonestyBadge } from '../components/ui'
import { Nav, type ScreenId } from '../components/Nav'
import { ShareButton } from '../components/ShareButton'
import { LiveNow } from '../screens/LiveNow'
import { ThisMonth } from '../screens/ThisMonth'
import { Appliances } from '../screens/Appliances'
import { Save } from '../screens/Save'
import { useHomeData } from '../lib/useHomeData'
import { activeAppliances, expectedMonthlyKwh } from '../lib/simulation'
import { useI18n } from '../i18n'
import { useAuth } from '../auth'
import { useHousehold } from '../household'
import type { Route } from '../routes'

export function Dashboard({
  screen,
  setScreen,
  go,
}: {
  screen: ScreenId
  setScreen: (s: ScreenId) => void
  go: (r: Route) => void
}) {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const { profile } = useHousehold()

  // Active appliance list + seed derived from the household profile.
  const appliances = useMemo(() => activeAppliances(profile), [profile])
  const seedKwh = useMemo(() => {
    if (profile.demo) return 47.5 // preserve the near-cliff demo
    const totalMonthly = expectedMonthlyKwh(appliances).reduce((s, e) => s + e.monthlyKwh, 0)
    const now = new Date()
    const day = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return +(totalMonthly * (day / daysInMonth)).toFixed(1)
  }, [profile, appliances])

  const { snap, history } = useHomeData(appliances, seedKwh)

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-7 max-w-5xl mx-auto text-main">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <Header />
        <div className="flex items-center gap-2 no-print">
          <ShareButton />
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-soft hover:text-main transition-colors"
          >
            🖨 {t('print_summary')}
          </button>
          <HonestyBadge />
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-sm text-soft">{t('greeting', { name: user?.name ?? 'You' })} 👋</p>
        <button
          onClick={() => go('setup')}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-soft hover:text-main transition-colors no-print"
        >
          {t('setup_my_home')}
        </button>
      </div>

      {lang === 'rw' && <p className="text-[11px] text-amber-500/90 mb-3">⚠ {t('rw_draft_note')}</p>}

      <div className="no-print">
        <Nav active={screen} onChange={setScreen} />
      </div>

      <main>
        {!snap ? (
          <div className="grid place-items-center py-24 text-muted">{t('booting')}</div>
        ) : (
          <>
            {screen === 'live' && <LiveNow snap={snap} history={history} />}
            {screen === 'month' && <ThisMonth snap={snap} />}
            {screen === 'appliances' && <Appliances snap={snap} appliances={appliances} />}
            {screen === 'save' && <Save snap={snap} appliances={appliances} />}
          </>
        )}
      </main>

      <footer className="text-center text-xs text-muted mt-7">
        {t('footer_note', { source: snap?.source ?? '—' })}
      </footer>
    </div>
  )
}
