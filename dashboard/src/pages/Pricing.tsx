import { useState } from 'react'
import { PageTitle } from './Prose'
import { useCart, type BillingCycle } from '../cart'
import { RWF } from '../lib/tariff'
import type { Route } from '../routes'
import { IcHome, IcBuilding, IcEnterprise, IcChip, IcCheck, IcArrow, IcLock } from '../components/icons'

interface Plan {
  id: string
  name: string
  icon: React.ReactNode
  priceMonthly: number // RWF/mo (0 = free)
  tagline: string
  features: string[]
  cta: string
  popular?: boolean
  contact?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'home',
    name: 'Home',
    icon: <IcHome />,
    priceMonthly: 0,
    tagline: 'For your own household.',
    features: ['Live usage & cost', 'Tier-cliff alerts', 'Forecast & savings advice', 'English & Kinyarwanda'],
    cta: 'Start free',
  },
  {
    id: 'property_starter',
    name: 'Property · Starter',
    icon: <IcBuilding />,
    priceMonthly: 9900,
    tagline: 'Landlords up to 5 units.',
    features: ['Up to 5 units', 'Per-tenant exact billing', 'Invoice / receipt / report PDFs', 'WhatsApp / SMS / email send', 'Calendar reminders (.ics)'],
    cta: 'Choose Starter',
  },
  {
    id: 'property_growth',
    name: 'Property · Growth',
    icon: <IcBuilding />,
    priceMonthly: 29000,
    tagline: 'Growing portfolios up to 20 units.',
    features: ['Up to 20 units', 'Everything in Starter', 'Portfolio overview & charts', 'Paid / unpaid tracking', 'Priority email support'],
    cta: 'Choose Growth',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: <IcEnterprise />,
    priceMonthly: 150000,
    tagline: 'Hotels, estates, large blocks.',
    features: ['Unlimited units & properties', 'Multi-property roll-ups', 'Team seats & exports', 'Live+ device support', 'Dedicated support / SLA'],
    cta: 'Contact sales',
    contact: true,
  },
]

const DEVICES = [
  { id: 'device_core', name: 'GridSense Core device', priceRWF: 40100, note: 'one-time hardware', recurring: false },
  { id: 'device_kit', name: 'GridSense Full kit', priceRWF: 69100, note: 'one-time hardware', recurring: false },
  { id: 'device_data', name: 'Live data plan', priceRWF: 2500, note: 'per device / month', recurring: true },
]

export function Pricing({ go }: { go: (r: Route) => void }) {
  const { add } = useCart()
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  const priceLabel = (p: Plan): string => {
    if (p.priceMonthly === 0) return 'Free'
    if (cycle === 'annual') return `${RWF(p.priceMonthly * 10)}/yr`
    return `${RWF(p.priceMonthly)}/mo`
  }

  const choosePlan = (p: Plan) => {
    if (p.id === 'home') { go('setup'); return }
    if (p.contact) { window.location.href = 'mailto:support@gridsense.rw?subject=Enterprise%20enquiry'; return }
    add({ kind: 'plan', name: p.name, priceRWF: p.priceMonthly, cycle, note: cycle === 'annual' ? 'annual (2 months free)' : 'monthly' })
    go('checkout')
  }

  return (
    <div>
      <PageTitle title="Simple, fair pricing" sub="Home is free forever. Landlords and enterprises pay for the admin time saved and disputes avoided. All prices are indicative (RWF-first)." />

      {/* Cycle toggle */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="inline-flex rounded-xl gs-surface p-1 text-sm">
          {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
            <button key={c} onClick={() => setCycle(c)} className={`rounded-lg px-4 py-1.5 font-semibold transition-colors ${cycle === c ? 'bg-emerald-500/20 text-emerald-500' : 'text-muted hover:text-main'}`}>
              {c === 'monthly' ? 'Monthly' : 'Annual'}
            </button>
          ))}
        </div>
        {cycle === 'annual' && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-500">2 months free</span>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div key={p.id} className={`relative flex flex-col gs-card p-6 ${p.popular ? 'ring-2 ring-emerald-500/60' : ''}`}>
            {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1 text-[11px] font-bold text-slate-900">Most popular</span>}
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500">{p.icon}</span>
            <h3 className="mt-4 text-lg font-bold text-heading">{p.name}</h3>
            <p className="text-xs text-muted">{p.tagline}</p>
            <p className="mt-4 text-2xl font-black text-heading">{p.contact ? <span className="text-xl">From {RWF(p.priceMonthly)}/mo</span> : priceLabel(p)}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-soft"><span className="mt-0.5 text-emerald-500"><IcCheck size={15} /></span>{f}</li>
              ))}
            </ul>
            <button onClick={() => choosePlan(p)} className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${p.popular || p.id === 'home' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 hover:from-emerald-400 hover:to-cyan-400' : 'border border-[var(--border)] bg-[var(--surface)] text-main hover:border-emerald-500/50'}`}>
              {p.cta} <IcArrow size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Device add-on */}
      <div className="mt-10 gs-card p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-500/15 text-cyan-500"><IcChip /></span>
          <div>
            <h3 className="text-lg font-bold text-heading">Device add-on (optional)</h3>
            <p className="text-xs text-muted">Manual readings are included on every plan. Add a device for automatic, live data.</p>
          </div>
          <button onClick={() => go('device')} className="ml-auto hidden text-sm font-medium text-emerald-500 hover:text-emerald-400 sm:block">How devices work →</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {DEVICES.map((d) => (
            <div key={d.id} className="flex flex-col gs-surface rounded-xl p-4">
              <p className="text-sm font-semibold text-main">{d.name}</p>
              <p className="mt-1 text-lg font-bold text-heading">{RWF(d.priceRWF)}</p>
              <p className="text-[11px] text-muted">{d.note}</p>
              <button onClick={() => add({ kind: 'device', name: d.name, priceRWF: d.priceRWF, recurring: d.recurring, note: d.note })} className="mt-3 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-soft hover:text-main">Add to cart</button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><IcLock size={14} /> No card charged in this demo</span>
        <span>·</span>
        <span>Data protected · Law N° 058/2021 aligned</span>
        <span>·</span>
        <button onClick={() => go('checkout')} className="font-medium text-emerald-500 hover:text-emerald-400">View cart →</button>
      </div>
    </div>
  )
}
