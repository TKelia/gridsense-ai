import { PageTitle } from './Prose'
import type { Route } from '../routes'
import { RWF } from '../lib/tariff'
import { IcUser, IcBolt, IcChip, IcCheck, IcArrow } from '../components/icons'

const TIERS = [
  {
    id: 'self',
    name: 'Self-report',
    icon: <IcUser />,
    price: 'Included',
    who: 'Every plan, every landlord.',
    body: 'Enter opening + current meter readings. GridSense computes the exact bill from the verified tariff. No hardware needed.',
    points: ['Manual meter readings', 'Exact per-tenant billing', 'Invoices, reminders, reports'],
  },
  {
    id: 'live',
    name: 'Live',
    icon: <IcBolt />,
    price: `${RWF(40100)} + ${RWF(2500)}/mo`,
    who: 'One device per property main line.',
    body: 'A non-invasive CT clamp + ESP32 on the incoming line streams real power automatically — no more manual readings for the whole property.',
    points: ['1 whole-home/property device', 'Automatic live data', 'Hardware one-time + small monthly'],
    featured: true,
  },
  {
    id: 'liveplus',
    name: 'Live+',
    icon: <IcChip />,
    price: `${RWF(69100)} + per-unit`,
    who: 'Big landlords, hotels, enterprise.',
    body: 'Per-unit sensors / smart plugs split consumption automatically by unit or area — the most accurate, lowest-effort setup.',
    points: ['Per-unit sensors / smart plugs', 'Automatic unit-level splits', 'Best for large portfolios'],
  },
]

export function Device({ go }: { go: (r: Route) => void }) {
  return (
    <div>
      <PageTitle title="Connected devices" sub="Manual readings power GridSense today. Add a device to make the data automatic and exact. Honest roadmap: the platform works now; devices are a clearly-scoped upgrade." />

      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.id} className={`flex flex-col gs-card p-6 ${t.featured ? 'ring-2 ring-emerald-500/60' : ''}`}>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500">{t.icon}</span>
            <h3 className="mt-4 text-lg font-bold text-heading">{t.name}</h3>
            <p className="text-sm font-semibold text-emerald-500">{t.price}</p>
            <p className="mt-1 text-xs text-muted">{t.who}</p>
            <p className="mt-3 text-sm text-soft">{t.body}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {t.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-soft"><span className="mt-0.5 text-emerald-500"><IcCheck size={15} /></span>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Ingestion contract */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="gs-card p-6">
          <h3 className="font-bold text-heading">The data contract</h3>
          <p className="mt-2 text-sm text-soft">Every device reading the platform ingests is a small JSON payload. Manual readings map onto the same shape, so software is ready before hardware ships.</p>
          <pre className="mt-4 overflow-x-auto rounded-xl gs-surface p-4 text-xs leading-relaxed text-soft"><code>{`{
  "deviceId": "gs-001",
  "ts": "2026-06-22T14:05:00Z",
  "watts": 1840,
  "source": "ct-clamp"   // or "manual"
}`}</code></pre>
        </div>
        <div className="gs-card p-6">
          <h3 className="font-bold text-heading">Install story</h3>
          <ol className="mt-3 space-y-3 text-sm text-soft">
            <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/15 font-bold text-emerald-500">1</span> Clip the CT sensor around the incoming line after the meter — no rewiring.</li>
            <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/15 font-bold text-emerald-500">2</span> The ESP32 samples power and sends readings over Wi-Fi (GSM in Phase 2).</li>
            <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/15 font-bold text-emerald-500">3</span> Readings appear in your workspace; billing and reports become automatic.</li>
          </ol>
          <p className="mt-4 rounded-lg gs-surface p-3 text-[11px] text-muted">Roadmap, stated honestly: live device fleet is Phase 2. Today the platform runs on manual/estimated readings — exact for the consumer bill against the verified tariff.</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl gs-card px-6 py-8 text-center">
        <h3 className="text-xl font-bold text-heading">Start with manual readings — upgrade any time</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-soft">Set up your property workspace now. Add a device later when you want live data.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button onClick={() => go('properties')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400">Open workspace <IcArrow size={15} /></button>
          <button onClick={() => go('pricing')} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-soft hover:text-main">See pricing</button>
        </div>
      </div>
    </div>
  )
}
