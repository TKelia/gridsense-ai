import { useState } from 'react'
import { PageTitle } from './Prose'
import { useCart, lineTotal } from '../cart'
import { RWF } from '../lib/tariff'
import type { Route } from '../routes'
import { SubscriptionInvoice } from '../components/Documents'
import { IcLock, IcShield, IcCheck, IcArrow } from '../components/icons'

export function Checkout({ go }: { go: (r: Route) => void }) {
  const { items, remove, clear, totalToday } = useCart()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState<{ name: string; email: string; lines: { name: string; amount: string; note?: string }[]; total: string } | null>(null)
  const [err, setErr] = useState('')

  const lineFmt = (id: string) => {
    const it = items.find((i) => i.id === id)!
    return RWF(lineTotal(it))
  }

  const submit = () => {
    setErr('')
    if (!name.trim()) return setErr('Please enter your name.')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setErr('Please enter a valid email.')
    if (items.length === 0) return setErr('Your cart is empty.')
    setDone({
      name: name.trim(),
      email: email.trim(),
      lines: items.map((i) => ({ name: i.name, amount: RWF(lineTotal(i)), note: i.note })),
      total: RWF(totalToday),
    })
    clear()
  }

  if (done) {
    return (
      <div className="max-w-3xl">
        <div className="gs-card p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-500"><IcCheck size={30} /></span>
          <h2 className="mt-4 text-2xl font-bold text-heading">You're all set, {done.name.split(' ')[0]}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-soft">Your GridSense subscription is reserved. A confirmation invoice is below.</p>
          <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-4 py-1.5 text-xs text-amber-500">
            <IcLock size={14} /> Demo — no card charged. Billing activates when a payment provider (MTN MoMo / Flutterwave / Stripe) is connected.
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => go('properties')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400">Go to your workspace <IcArrow size={15} /></button>
            <button onClick={() => window.print()} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-soft hover:text-main">Print invoice</button>
          </div>
        </div>
        <div className="mt-6">
          <SubscriptionInvoice buyer={done.name} email={done.email} lines={done.lines} total={done.total} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageTitle title="Checkout" sub="Review your plan and confirm. This is a secure, integration-ready demo — no card details are collected." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <div className="gs-card p-6">
          <h3 className="font-bold text-heading">Your details</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jean P." className="w-full rounded-xl gs-input px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full rounded-xl gs-input px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>

          <div className="mt-5 rounded-xl gs-surface p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-main"><IcShield size={16} /> Payment</p>
            <p className="mt-1.5 text-xs text-soft">We never ask for card numbers in this demo. When a licensed provider (MTN MoMo, Flutterwave, or Stripe) is connected, you'll complete payment securely there.</p>
          </div>

          {err && <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{err}</p>}

          <button onClick={submit} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400">
            <IcLock size={16} /> Confirm (demo) — {RWF(totalToday)}
          </button>
          <p className="mt-2 text-center text-[11px] text-muted">By confirming you agree to our Terms. No charge is made.</p>
        </div>

        {/* Summary */}
        <div className="gs-card h-fit p-6">
          <h3 className="font-bold text-heading">Order summary</h3>
          {items.length === 0 ? (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted">Your cart is empty.</p>
              <button onClick={() => go('pricing')} className="mt-3 text-sm font-medium text-emerald-500 hover:text-emerald-400">Browse plans →</button>
            </div>
          ) : (
            <>
              <ul className="mt-4 space-y-3">
                {items.map((i) => (
                  <li key={i.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-main">{i.name}</p>
                      {i.note && <p className="text-[11px] text-muted">{i.note}</p>}
                      <button onClick={() => remove(i.id)} className="text-[11px] text-muted underline hover:text-rose-500">Remove</button>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-heading">{lineFmt(i.id)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="text-sm text-soft">Total today</span>
                <span className="text-lg font-black tabular-nums text-emerald-500">{RWF(totalToday)}</span>
              </div>
            </>
          )}
          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted"><IcShield size={14} /> Data protected · Law N° 058/2021 aligned</div>
        </div>
      </div>
    </div>
  )
}
