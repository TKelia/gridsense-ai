// Printable, branded documents: Invoice, Receipt, Consumption Report.
// Print-to-PDF via window.print() on a dedicated print view (app chrome hidden).
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import type { Unit } from '../landlord'
import { unitBill, RWANDA_BLOCKS } from '../landlord'
import { RWANDA_RESIDENTIAL_TIERS, tariffCost, RWF } from '../lib/tariff'
import { periodLabel, dueDateLabel } from '../lib/billing'
import { IcArrow } from './icons'
import { useI18n } from '../i18n'
import { buildMonthlyReport } from '../lib/report'
import {
  findAnchorForUnitPeriod,
  saveAnchor,
  periodYYYYMM,
  BASE_SEPOLIA,
  IPFS_GATEWAY,
  type StoredAnchor,
} from '../lib/verifiable'

export type DocKind = 'invoice' | 'receipt' | 'report'

const SUPPORT = { email: 'support@gridsense.rw', phone: '+250 783 619 522' }

function DocLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="GridSense AI" className="h-9 w-9 rounded-lg" />
      <div>
        <p className="text-base font-bold tracking-tight" style={{ color: '#0f172a' }}>
          GridSense AI
        </p>
        <p className="text-[11px] doc-muted">Energy billing · Kigali, Rwanda</p>
      </div>
    </div>
  )
}

/** Residential block breakdown lines for an invoice. */
function blockLines(kWh: number): { label: string; kwh: number; rate: number; amount: number }[] {
  let lower = 0
  let remaining = kWh
  const out: { label: string; kwh: number; rate: number; amount: number }[] = []
  for (const tier of RWANDA_RESIDENTIAL_TIERS) {
    const upper = tier.upTo ?? Infinity
    const width = upper - lower
    const used = Math.min(remaining, width)
    if (used <= 0) break
    out.push({ label: tier.label, kwh: used, rate: tier.rate, amount: used * tier.rate })
    remaining -= used
    lower = upper
  }
  return out
}

function Invoice({ unit, landlordName }: { unit: Unit; landlordName: string }) {
  const bill = unitBill(unit)
  const total = bill.amountRWF + (unit.rentRWF ?? 0)
  const lines = unit.tariffType === 'residential' ? blockLines(bill.consumptionKwh) : []
  return (
    <div className="gs-doc">
      <div className="flex items-start justify-between gap-4">
        <DocLogo />
        <div className="text-right">
          <p className="text-lg font-black" style={{ color: '#0f172a' }}>
            INVOICE
          </p>
          <p className="text-xs doc-muted">{periodLabel()}</p>
          <p className="text-xs doc-muted">No. INV-{unit.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider doc-muted">From</p>
          <p className="font-medium" style={{ color: '#0f172a' }}>{landlordName || 'Landlord'}</p>
          <p className="doc-muted">via GridSense AI</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider doc-muted">Bill to</p>
          <p className="font-medium" style={{ color: '#0f172a' }}>{unit.tenant?.name ?? '—'}</p>
          <p className="doc-muted">{unit.label}</p>
          {unit.tenant?.phone && <p className="doc-muted">{unit.tenant.phone}</p>}
          {unit.tenant?.email && <p className="doc-muted">{unit.tenant.email}</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg p-3" style={{ background: '#f0fdf9' }}>
        <div>
          <p className="text-[11px] doc-muted">Opening</p>
          <p className="font-semibold tabular-nums" style={{ color: '#0f172a' }}>{unit.openingKwh} kWh</p>
        </div>
        <div>
          <p className="text-[11px] doc-muted">Closing</p>
          <p className="font-semibold tabular-nums" style={{ color: '#0f172a' }}>{unit.currentKwh} kWh</p>
        </div>
        <div>
          <p className="text-[11px] doc-muted">Consumption</p>
          <p className="font-semibold tabular-nums" style={{ color: '#059669' }}>{bill.consumptionKwh.toFixed(0)} kWh</p>
        </div>
      </div>

      <table className="mt-5">
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ textAlign: 'right' }}>kWh</th>
            <th style={{ textAlign: 'right' }}>Rate</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {unit.tariffType === 'residential' ? (
            lines.map((l) => (
              <tr key={l.label}>
                <td style={{ color: '#0f172a' }}>{l.label}</td>
                <td style={{ textAlign: 'right' }} className="tabular-nums">{l.kwh.toFixed(0)}</td>
                <td style={{ textAlign: 'right' }} className="tabular-nums">{l.rate}</td>
                <td style={{ textAlign: 'right' }} className="tabular-nums">{RWF(l.amount)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ color: '#0f172a' }}>Non-residential electricity</td>
              <td style={{ textAlign: 'right' }} className="tabular-nums">{bill.consumptionKwh.toFixed(0)}</td>
              <td style={{ textAlign: 'right' }} className="tabular-nums">{RWANDA_BLOCKS.nonResLow}</td>
              <td style={{ textAlign: 'right' }} className="tabular-nums">{RWF(bill.amountRWF)}</td>
            </tr>
          )}
          <tr>
            <td className="font-medium" style={{ color: '#0f172a' }}>Electricity subtotal</td>
            <td />
            <td />
            <td style={{ textAlign: 'right' }} className="font-semibold tabular-nums">{RWF(bill.amountRWF)}</td>
          </tr>
          {unit.rentRWF ? (
            <tr>
              <td className="font-medium" style={{ color: '#0f172a' }}>Rent</td>
              <td />
              <td />
              <td style={{ textAlign: 'right' }} className="font-semibold tabular-nums">{RWF(unit.rentRWF)}</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="mt-4 flex items-end justify-between border-t doc-line pt-4">
        <div className="text-sm">
          <p className="doc-muted">Due date</p>
          <p className="font-semibold" style={{ color: '#0f172a' }}>{dueDateLabel(unit.dueDay)} · 12:00</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider doc-muted">Total due</p>
          <p className="text-2xl font-black tabular-nums" style={{ color: '#059669' }}>{RWF(total)}</p>
        </div>
      </div>

      <DocFooter note="estimate" />
    </div>
  )
}

function Receipt({ unit, landlordName }: { unit: Unit; landlordName: string }) {
  const bill = unitBill(unit)
  const total = bill.amountRWF + (unit.rentRWF ?? 0)
  return (
    <div className="gs-doc">
      <div className="flex items-start justify-between gap-4">
        <DocLogo />
        <div className="text-right">
          <p className="text-lg font-black" style={{ color: '#059669' }}>RECEIPT</p>
          <p className="text-xs doc-muted">No. RCP-{unit.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg p-4 text-center" style={{ background: '#f0fdf9' }}>
        <p className="text-[11px] uppercase tracking-wider doc-muted">Amount paid</p>
        <p className="text-3xl font-black tabular-nums" style={{ color: '#059669' }}>{RWF(total)}</p>
        <p className="text-xs doc-muted">{periodLabel()} · {unit.label}</p>
      </div>

      <table className="mt-5">
        <tbody>
          <tr><th>Tenant</th><td style={{ textAlign: 'right', color: '#0f172a' }}>{unit.tenant?.name ?? '—'}</td></tr>
          <tr><th>Received by</th><td style={{ textAlign: 'right', color: '#0f172a' }}>{landlordName || 'Landlord'}</td></tr>
          <tr><th>Date paid</th><td style={{ textAlign: 'right', color: '#0f172a' }}>{unit.paidDate ?? new Date().toISOString().slice(0, 10)}</td></tr>
          <tr><th>Method</th><td style={{ textAlign: 'right', color: '#0f172a' }}>{unit.paidMethod ?? '—'}</td></tr>
          <tr><th>Reference</th><td style={{ textAlign: 'right', color: '#0f172a' }}>{unit.paidRef ?? '—'}</td></tr>
          <tr><th>Electricity</th><td style={{ textAlign: 'right', color: '#0f172a' }}>{RWF(bill.amountRWF)} ({bill.consumptionKwh.toFixed(0)} kWh)</td></tr>
          {unit.rentRWF ? <tr><th>Rent</th><td style={{ textAlign: 'right', color: '#0f172a' }}>{RWF(unit.rentRWF)}</td></tr> : null}
        </tbody>
      </table>

      <p className="mt-5 text-center text-sm font-medium" style={{ color: '#059669' }}>Paid in full — thank you.</p>
      <DocFooter note="paid" />
    </div>
  )
}

function Report({ unit }: { unit: Unit }) {
  const bill = unitBill(unit)
  // Cost curve at a few consumption points to teach the tenant the tier shape.
  const curve = [10, 20, 30, 50, 75, 100, Math.max(100, Math.round(bill.consumptionKwh))]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((x, y) => x - y)
    .map((k) => ({ kwh: `${k}`, cost: unit.tariffType === 'residential' ? tariffCost(k) : k * RWANDA_BLOCKS.nonResLow, you: k === Math.round(bill.consumptionKwh) }))

  return (
    <div className="gs-doc">
      <div className="flex items-start justify-between gap-4">
        <DocLogo />
        <div className="text-right">
          <p className="text-lg font-black" style={{ color: '#0f172a' }}>CONSUMPTION REPORT</p>
          <p className="text-xs doc-muted">{periodLabel()} · {unit.label}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { l: 'Used this period', v: `${bill.consumptionKwh.toFixed(0)} kWh` },
          { l: 'Electricity cost', v: RWF(bill.amountRWF) },
          { l: 'Tariff', v: unit.tariffType === 'residential' ? 'Residential' : 'Non-residential' },
        ].map((s) => (
          <div key={s.l} className="rounded-lg p-3" style={{ background: '#f8fafc' }}>
            <p className="text-[11px] doc-muted">{s.l}</p>
            <p className="font-bold tabular-nums" style={{ color: '#0f172a' }}>{s.v}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider doc-muted">Cost vs. consumption</p>
      <div style={{ height: 220 }} className="mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={curve} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="kwh" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} width={48} />
            <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
              {curve.map((d, i) => (
                <Cell key={i} fill={d.you ? '#059669' : '#94d3c4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[11px] doc-muted">Green bar = your usage. Each unit above 50 kWh costs the most (369 RWF/kWh residential).</p>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider doc-muted">How to spend less</p>
      <ul className="mt-2 space-y-1.5 text-sm" style={{ color: '#334155' }}>
        <li>• Heating water and ironing are the biggest loads — batch them into one session.</li>
        <li>• Staying under 50 kWh/month keeps every unit at the lower 89–310 RWF rates.</li>
        <li>• Unplug idle chargers and electronics; switch off the geyser when not needed.</li>
      </ul>

      <DocFooter note="estimate" />
    </div>
  )
}

function DocFooter({ note }: { note: 'estimate' | 'paid' }) {
  return (
    <div className="mt-6 border-t doc-line pt-4 text-[11px] leading-relaxed doc-muted">
      {note === 'estimate' && (
        <p>
          This is an <b>estimate</b> generated by GridSense AI from meter readings and the official RURA/REG tariff
          (residential blocks 89 / 310 / 369 RWF/kWh; electricity is VAT-exempt in Rwanda). It is{' '}
          <b>not an official utility bill</b> — REG/EUCL is the billing authority and your meter is the authoritative
          record.
        </p>
      )}
      <p className="mt-1.5">
        Personal data (name, phone, email, consumption) is processed in line with Rwanda's Law N° 058/2021 on personal
        data protection (NCSA supervisory authority). In this demo, data is stored locally on the landlord's device.
      </p>
      <p className="mt-1.5">GridSense AI · {SUPPORT.email} · {SUPPORT.phone}</p>
    </div>
  )
}

/** On-chain tamper-evidence panel for the Consumption Report (testnet demo).
 *  Anchors the finalized report's SHA-256 + encrypted-file CID on Base Sepolia
 *  via the gasless serverless relayer — wallet-less for the user. Screen-only
 *  (no-print); shows an honest "not configured" note when relayer keys are
 *  absent, and never fabricates chain data. */
function AnchorPanel({ unit }: { unit: Unit }) {
  const { t } = useI18n()
  const now = new Date()
  const period = periodYYYYMM(now.getFullYear(), now.getMonth() + 1)
  const [stored, setStored] = useState<StoredAnchor | null>(() =>
    findAnchorForUnitPeriod(unit.id, period),
  )
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const anchor = async () => {
    setBusy(true)
    setNote(null)
    try {
      const report = buildMonthlyReport(unit)
      const res = await fetch('/api/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      })
      const out = (await res.json()) as {
        anchored?: boolean
        reason?: string
        reportId?: string
        sha256?: string
        ipfsCid?: string
        homeRef?: string
        period?: number
        chainId?: number
        registry?: string
        txHash?: string | null
        block?: number | null
        pinned?: boolean
        anchoredAt?: string
      }
      if (out.anchored && out.reportId) {
        const entry: StoredAnchor = {
          receipt: {
            reportId: out.reportId,
            sha256: out.sha256 ?? '',
            ipfsCid: out.ipfsCid ?? '',
            homeRef: out.homeRef ?? '',
            period: out.period ?? period,
            chainId: out.chainId ?? BASE_SEPOLIA.chainId,
            registry: out.registry ?? '',
            txHash: out.txHash ?? null,
            block: out.block ?? null,
            pinned: Boolean(out.pinned),
            anchoredAt: out.anchoredAt ?? new Date().toISOString(),
            unitId: unit.id,
          },
          report,
        }
        saveAnchor(entry)
        setStored(entry)
      } else if (out.reason === 'anchoring not configured') {
        setNote(t('verify_not_configured'))
      } else if ((out.reason ?? '').includes('already anchored')) {
        setNote(t('verify_already_other'))
      } else {
        setNote(out.reason ?? t('verify_rpc_error'))
      }
    } catch {
      setNote(t('verify_rpc_error'))
    }
    setBusy(false)
  }

  return (
    <div className="no-print mx-auto mb-4 max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-center gap-3">
        {stored ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-500">
            {t('verify_badge_verified')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-3 py-1 text-sm text-soft">
            {t('verify_badge_pending')}
          </span>
        )}
        {!stored && (
          <button
            onClick={anchor}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50"
          >
            {busy ? t('verify_anchor_busy') : t('verify_anchor_btn')}
          </button>
        )}
        {stored && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {stored.receipt.txHash && (
              <a
                href={`${BASE_SEPOLIA.explorer}/tx/${stored.receipt.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-500 underline hover:text-emerald-400"
              >
                {t('verify_view_basescan')}
              </a>
            )}
            {stored.receipt.pinned && stored.receipt.ipfsCid && (
              <a
                href={`${IPFS_GATEWAY}${stored.receipt.ipfsCid}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-500 underline hover:text-emerald-400"
              >
                {t('verify_view_ipfs')}
              </a>
            )}
            <a
              href={`/verify?report=${stored.receipt.reportId}`}
              className="text-emerald-500 underline hover:text-emerald-400"
            >
              {t('verify_open')}
            </a>
          </div>
        )}
      </div>
      {note && <p className="mt-2 text-xs text-amber-500">{note}</p>}
      <p className="mt-2 text-[11px] text-muted">
        {t('verify_limit')} · {t('verify_testnet')}
      </p>
    </div>
  )
}

/** Full-screen document view with Print/Close controls; print hides chrome. */
export function DocumentView({
  kind,
  unit,
  landlordName,
  onClose,
}: {
  kind: DocKind
  unit: Unit
  landlordName: string
  onClose: () => void
}) {
  return (
    <div className="print-root fixed inset-0 z-50 overflow-auto bg-app/95 backdrop-blur p-4 sm:p-8">
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between">
        <button onClick={onClose} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-soft hover:text-main">
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400"
        >
          Download / Print PDF <IcArrow size={16} />
        </button>
      </div>
      {kind === 'report' && <AnchorPanel unit={unit} />}
      {kind === 'invoice' && <Invoice unit={unit} landlordName={landlordName} />}
      {kind === 'receipt' && <Receipt unit={unit} landlordName={landlordName} />}
      {kind === 'report' && <Report unit={unit} />}
    </div>
  )
}

/** Small subscription-invoice doc for the checkout success page. */
export function SubscriptionInvoice({
  buyer,
  email,
  lines,
  total,
}: {
  buyer: string
  email: string
  lines: { name: string; amount: string; note?: string }[]
  total: string
}) {
  const [ref] = useState(() => 'SUB-' + Math.random().toString(36).slice(2, 8).toUpperCase())
  return (
    <div className="gs-doc">
      <div className="flex items-start justify-between gap-4">
        <DocLogo />
        <div className="text-right">
          <p className="text-lg font-black" style={{ color: '#0f172a' }}>SUBSCRIPTION INVOICE</p>
          <p className="text-xs doc-muted">No. {ref}</p>
          <p className="text-xs doc-muted">{periodLabel()}</p>
        </div>
      </div>
      <div className="mt-6 text-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider doc-muted">Billed to</p>
        <p className="font-medium" style={{ color: '#0f172a' }}>{buyer || '—'}</p>
        <p className="doc-muted">{email || '—'}</p>
      </div>
      <table className="mt-5">
        <thead>
          <tr><th>Item</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td style={{ color: '#0f172a' }}>{l.name}{l.note ? <span className="doc-muted"> · {l.note}</span> : null}</td>
              <td style={{ textAlign: 'right' }} className="tabular-nums">{l.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between border-t doc-line pt-4">
        <p className="text-[11px] uppercase tracking-wider doc-muted">Total</p>
        <p className="text-2xl font-black tabular-nums" style={{ color: '#059669' }}>{total}</p>
      </div>
      <div className="mt-5 rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: '#fffbeb', color: '#92400e' }}>
        <b>Demo — no card was charged.</b> Billing activates when a payment provider (MTN MoMo / Flutterwave / Stripe) is
        connected. No card numbers are collected.
      </div>
    </div>
  )
}
