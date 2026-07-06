import { ShareButton } from '../components/ShareButton'
import { useI18n } from '../i18n'
import { useAuth } from '../auth'
import { useHousehold, DEMO_PROFILE } from '../household'
import type { Route } from '../routes'
import { IcHome, IcBell, IcShield, IcArrow, IcCheck } from '../components/icons'

export function Home({ go }: { go: (r: Route) => void }) {
  const { t } = useI18n()
  const { user, signIn } = useAuth()
  const { save } = useHousehold()

  const onGetStarted = () => {
    if (user) go('dashboard')
    else go('login')
  }

  const onTryDemo = () => {
    save(DEMO_PROFILE)
    signIn({ name: 'Guest', email: '' })
    go('dashboard')
  }

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl gs-card px-6 py-12 sm:px-12 sm:py-16">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />
        <div className="relative max-w-2xl">
          <span className="inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-500">
            Kigali · Rwanda · built local
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight text-heading sm:text-5xl">
            See your power. Spend less. No surprises.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-soft">
            GridSense turns your home's electricity into clear numbers — live usage, the cost across
            Rwanda's real RURA tariff (89 / 310 / 369 RWF/kWh), a warning before you cross into a pricier
            tier, and personalized ways to save.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 font-semibold text-slate-900 transition-colors hover:from-emerald-400 hover:to-cyan-400"
            >
              {t('get_started')} <IcArrow size={16} />
            </button>
            <button
              onClick={onTryDemo}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-medium text-main transition-colors hover:border-emerald-500/50"
            >
              {t('try_demo')}
            </button>
            <ShareButton variant="primary" />
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <IcShield size={14} /> Data protected · Law 058/2021 aligned · no card charged in this demo
          </p>
        </div>
      </section>

      {/* What is GridSense AI? */}
      <section className="mt-10 rounded-3xl gs-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-heading">{t('what_is_title')}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-soft sm:text-base">{t('what_is_body')}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-soft">{t('what_is_value')}</p>
      </section>

      {/* What your home gets */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-heading">What your home gets</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { icon: <IcHome />, title: 'Live consumption', body: 'See live power and month-to-date cost across the 89 / 310 / 369 RWF tiers, appliance by appliance.', cta: 'Set up my home →', go: () => go('setup') },
            { icon: <IcBell />, title: 'Tier-cliff alerts', body: 'Get warned the moment you approach a pricier tier — before the next unit costs up to 3.5× more.', cta: 'See the demo →', go: onTryDemo },
            { icon: <IcShield />, title: 'AI savings + verifiable reports', body: 'Personalized, honest ways to cut the bill — and every monthly report is tamper-evident, verifiable on-chain.', cta: 'Verify a report →', go: () => go('verify') },
          ].map((c) => (
            <button key={c.title} onClick={c.go} className="group flex flex-col gs-card p-6 text-left transition-colors hover:border-emerald-500/50">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500">{c.icon}</span>
              <h3 className="mt-4 font-semibold text-heading">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm text-soft">{c.body}</p>
              <span className="mt-4 text-sm font-semibold text-emerald-500 group-hover:underline">{c.cta}</span>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-heading">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { n: '1', title: 'Readings in', body: 'Enter your meter readings, or stream them live with a GridSense sensor on the ESP32 + clamp.' },
            { n: '2', title: 'The app does the math', body: 'GridSense applies the verified RURA tariff, tracks your tier, forecasts the month, and flags waste.' },
            { n: '3', title: 'Save & verify', body: 'Get personalized savings tips and a monthly report you can prove was never altered — in English or Kinyarwanda.' },
          ].map((s) => (
            <div key={s.n} className="gs-card p-6">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 font-bold text-emerald-500">{s.n}</div>
              <h3 className="mt-3 font-semibold text-heading">{s.title}</h3>
              <p className="mt-2 text-sm text-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[t('login_feat_tariff'), t('login_feat_alerts'), t('login_feat_ai')].map((f) => (
          <div key={f} className="flex items-start gap-3 gs-card p-5">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-500"><IcCheck size={14} /></span>
            <span className="text-sm text-main">{f}</span>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-12 rounded-3xl gs-card px-6 py-10 text-center sm:px-12">
        <h2 className="text-2xl font-bold text-heading">Start free today</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-soft">Set up your home in under a minute, or explore the live demo first.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={onGetStarted} className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 font-semibold text-slate-900 transition-colors hover:from-emerald-400 hover:to-cyan-400">{t('get_started')}</button>
          <button onClick={onTryDemo} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-medium text-main transition-colors hover:border-emerald-500/50">{t('try_demo')}</button>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm font-semibold text-heading">See your power. Spend less.</p>
          <div className="flex gap-2">
            <button onClick={onTryDemo} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-soft">Live demo</button>
            <button onClick={onGetStarted} className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-2 text-xs font-semibold text-slate-900">Start free</button>
          </div>
        </div>
      </div>
    </div>
  )
}
