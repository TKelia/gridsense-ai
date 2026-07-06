import { PageTitle, Section } from './Prose'
import type { Route } from '../routes'
import { useI18n } from '../i18n'

const STEPS = [
  {
    n: '1',
    title: 'Sign in',
    body: 'Use the demo sign-in (no password). Your name and email stay on your device — there is no server account in this demo.',
  },
  {
    n: '2',
    title: 'Set up your home',
    body: 'Tell GridSense your home type, how many people live there, and which appliances you use. A live preview shows your estimated monthly kWh and bill as you go.',
  },
  {
    n: '3',
    title: 'Read your tabs',
    body: 'Live Now shows real-time power and where you sit in the tariff tiers. This Month tracks cumulative usage versus the 20 and 50 kWh thresholds. Appliances ranks your biggest consumers.',
  },
  {
    n: '4',
    title: 'Act on Save tips',
    body: 'The Save tab turns your usage into specific, tariff-aware actions — like easing off the water heater before a tier cliff — with estimated RWF ranges.',
  },
  {
    n: '5',
    title: 'Connect the device (coming soon)',
    body: 'In the full product, a CT clamp + ESP32 on your main line replaces the simulation with live readings. The app stays exactly the same — only the data source changes.',
  },
]

const FAQ = [
  {
    q: 'Are the costs my real bill?',
    a: 'They are estimates from a sourced load model and the published RURA tariff. They are not an official bill — REG/EUCL and your meter are the source of truth.',
  },
  {
    q: 'Why does the demo start near a tier cliff?',
    a: 'The guest demo seeds usage near 50 kWh so you can see the tier-cliff alert and the high-rate band in action.',
  },
  {
    q: 'Does it work offline / in Kinyarwanda?',
    a: 'The app runs entirely in your browser and includes a Kinyarwanda interface (draft translation, clearly badged).',
  },
]

export function HowToUse({ go }: { go: (r: Route) => void }) {
  const { t } = useI18n()
  return (
    <div className="max-w-3xl">
      <PageTitle title="How to use GridSense" sub="From sign-in to savings in five short steps." />

      <div className="space-y-4">
        {STEPS.map((s) => (
          <div key={s.n} className="flex gap-4 gs-card p-5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 font-bold text-emerald-500">
              {s.n}
            </div>
            <div>
              <h3 className="font-semibold text-heading">{s.title}</h3>
              <p className="mt-1 text-sm text-soft">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => go('setup')}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 font-semibold text-slate-900 transition-colors hover:from-emerald-400 hover:to-cyan-400"
        >
          {t('setup_my_home')}
        </button>
        <button
          onClick={() => go('dashboard')}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 font-medium text-main transition-colors hover:border-emerald-500/50"
        >
          {t('nav_dashboard')}
        </button>
      </div>

      <div className="mt-12">
        <Section title="FAQ">
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="gs-card p-5">
                <p className="font-semibold text-heading">{f.q}</p>
                <p className="mt-1.5 text-sm text-soft">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
