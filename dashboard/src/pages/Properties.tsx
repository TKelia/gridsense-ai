import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { PageTitle } from './Prose'
import { useLandlord, unitBill, unitTotalDue, type Property, type Unit, type TariffType } from '../landlord'
import { useAuth } from '../auth'
import { useTheme } from '../theme'
import { useI18n } from '../i18n'
import { RWF } from '../lib/tariff'
import {
  whatsappLink,
  smsLink,
  emailLink,
  downloadICS,
  reminderSlots,
  dueDateLabel,
  periodLabel,
} from '../lib/billing'
import { DocumentView, type DocKind } from '../components/Documents'
import { IcBuilding, IcUser, IcBolt, IcReceipt, IcDoc, IcBell, IcWhatsApp, IcSend, IcCalendar, IcCheck, IcArrow, IcChart } from '../components/icons'

const today = () => new Date().toISOString().slice(0, 10)

// ---------- Stat card ----------
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="gs-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent ? 'text-emerald-500' : 'text-heading'}`}>{value}</p>
    </div>
  )
}

function field(v: string, set: (s: string) => void, ph: string, type = 'text', extra = '') {
  return (
    <input
      value={v}
      onChange={(e) => set(e.target.value)}
      placeholder={ph}
      type={type}
      className={`w-full rounded-xl gs-input px-3.5 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${extra}`}
    />
  )
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted">{children}</span>
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </div>
  )
}

// ---------- Add Property (guided) ----------
function AddPropertyWizard({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { addProperty, addUnit } = useLandlord()
  const [step, setStep] = useState(0)
  const [pName, setPName] = useState('')
  const [pAddr, setPAddr] = useState('')

  // first unit
  const [label, setLabel] = useState('')
  const [tariff, setTariff] = useState<TariffType>('residential')
  const [tName, setTName] = useState('')
  const [tPhone, setTPhone] = useState('')
  const [tEmail, setTEmail] = useState('')
  const [opening, setOpening] = useState('')
  const [current, setCurrent] = useState('')
  const [rDate, setRDate] = useState(today())
  const [rent, setRent] = useState('')
  const [dueDay, setDueDay] = useState('5')
  const [err, setErr] = useState('')

  const next = () => {
    setErr('')
    if (step === 0) {
      if (!pName.trim()) return setErr('Please give the property a name.')
      if (!pAddr.trim()) return setErr('Please add the address.')
    }
    if (step === 1) {
      if (!label.trim()) return setErr('Please label the unit (e.g. "Unit A1").')
    }
    if (step === 2) {
      if (!tName.trim()) return setErr("Please enter the tenant's name.")
      if (!/^[+0-9 ()-]{7,}$/.test(tPhone.trim())) return setErr('Enter a valid phone number (e.g. +250788…).')
      if (tEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(tEmail.trim())) return setErr('Enter a valid email address.')
    }
    if (step === 3) {
      const o = Number(opening), c = Number(current)
      if (Number.isNaN(o) || opening === '') return setErr('Enter the opening meter reading (kWh).')
      if (Number.isNaN(c) || current === '') return setErr('Enter the current meter reading (kWh).')
      if (c < o) return setErr('Current reading must be ≥ opening reading.')
      // finish
      const propId = addProperty({ name: pName.trim(), address: pAddr.trim() })
      addUnit(propId, {
        label: label.trim(),
        tariffType: tariff,
        tenant: { id: 'ten_' + Date.now().toString(36), name: tName.trim(), phone: tPhone.trim(), email: tEmail.trim() },
        openingKwh: o,
        currentKwh: c,
        readingDate: rDate,
        rentRWF: rent ? Number(rent) : undefined,
        dueDay: Math.min(28, Math.max(1, Number(dueDay) || 1)),
      })
      onDone()
      return
    }
    setStep((s) => s + 1)
  }

  const steps = ['Property', 'Unit', 'Tenant', 'Readings']
  return (
    <div className="gs-card p-6">
      <div className="mb-5 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${i <= step ? 'bg-emerald-500 text-slate-900' : 'gs-surface text-muted'}`}>{i + 1}</span>
            <span className={`text-sm ${i === step ? 'font-semibold text-heading' : 'text-muted'}`}>{s}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-5 bg-[var(--border)]" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-sm text-soft">Let's add your first property. You can add more units and tenants any time.</p>
          <div><FieldLabel hint="A name you recognise.">Property name</FieldLabel>{field(pName, setPName, 'e.g. Kacyiru Apartments')}</div>
          <div><FieldLabel>Address</FieldLabel>{field(pAddr, setPAddr, 'e.g. KG 7 Ave, Kacyiru, Kigali')}</div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-soft">Add a unit (an apartment, room, or shop) inside this property.</p>
          <div><FieldLabel>Unit label</FieldLabel>{field(label, setLabel, 'e.g. Unit A1 / Shop B2')}</div>
          <div>
            <FieldLabel hint="Residential uses 89 / 310 / 369 RWF blocks; non-residential uses 355 RWF/kWh.">Tariff type</FieldLabel>
            <div className="flex gap-2">
              {(['residential', 'nonresidential'] as TariffType[]).map((t) => (
                <button key={t} onClick={() => setTariff(t)} className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${tariff === t ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-500' : 'border-[var(--border)] bg-[var(--surface)] text-soft'}`}>
                  {t === 'residential' ? 'Residential' : 'Non-residential'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-soft">Who lives or trades here? We use the phone & email to send the bill and reminders.</p>
          <div><FieldLabel>Tenant name</FieldLabel>{field(tName, setTName, 'e.g. Aline U.')}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><FieldLabel>Phone</FieldLabel>{field(tPhone, setTPhone, '+250 788 000 000', 'tel')}</div>
            <div><FieldLabel hint="Optional but recommended.">Email</FieldLabel>{field(tEmail, setTEmail, 'tenant@example.com', 'email')}</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-soft">Enter the meter readings so GridSense can compute the exact bill.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><FieldLabel hint="Reading at start of period.">Opening kWh</FieldLabel>{field(opening, setOpening, 'e.g. 1240', 'number')}</div>
            <div><FieldLabel hint="Latest meter reading.">Current kWh</FieldLabel>{field(current, setCurrent, 'e.g. 1305', 'number')}</div>
            <div><FieldLabel>Reading date</FieldLabel>{field(rDate, setRDate, '', 'date')}</div>
            <div><FieldLabel hint="Optional.">Monthly rent (RWF)</FieldLabel>{field(rent, setRent, 'e.g. 120000', 'number')}</div>
            <div><FieldLabel hint="1–28.">Payment due day</FieldLabel>{field(dueDay, setDueDay, '5', 'number')}</div>
          </div>
        </div>
      )}

      {err && <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{err}</p>}

      <div className="mt-6 flex items-center justify-between">
        <button onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-soft hover:text-main">
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <button onClick={next} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400">
          {step === 3 ? 'Create property' : 'Continue'} <IcArrow size={16} />
        </button>
      </div>
    </div>
  )
}

// ---------- Add Unit (to existing property) ----------
function AddUnitForm({ propertyId, onDone }: { propertyId: string; onDone: () => void }) {
  const { addUnit } = useLandlord()
  const [label, setLabel] = useState('')
  const [tariff, setTariff] = useState<TariffType>('residential')
  const [tName, setTName] = useState('')
  const [tPhone, setTPhone] = useState('')
  const [tEmail, setTEmail] = useState('')
  const [opening, setOpening] = useState('')
  const [current, setCurrent] = useState('')
  const [rent, setRent] = useState('')
  const [dueDay, setDueDay] = useState('5')
  const [err, setErr] = useState('')

  const submit = () => {
    setErr('')
    if (!label.trim()) return setErr('Unit label required.')
    if (!tName.trim()) return setErr('Tenant name required.')
    if (!/^[+0-9 ()-]{7,}$/.test(tPhone.trim())) return setErr('Valid phone required.')
    const o = Number(opening), c = Number(current)
    if (opening === '' || Number.isNaN(o)) return setErr('Opening kWh required.')
    if (current === '' || Number.isNaN(c)) return setErr('Current kWh required.')
    if (c < o) return setErr('Current must be ≥ opening.')
    addUnit(propertyId, {
      label: label.trim(),
      tariffType: tariff,
      tenant: { id: 'ten_' + Date.now().toString(36), name: tName.trim(), phone: tPhone.trim(), email: tEmail.trim() },
      openingKwh: o,
      currentKwh: c,
      readingDate: today(),
      rentRWF: rent ? Number(rent) : undefined,
      dueDay: Math.min(28, Math.max(1, Number(dueDay) || 1)),
    })
    onDone()
  }

  return (
    <div className="mt-3 gs-surface rounded-xl p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><FieldLabel>Unit label</FieldLabel>{field(label, setLabel, 'Unit A3')}</div>
        <div>
          <FieldLabel>Tariff</FieldLabel>
          <div className="flex gap-2">
            {(['residential', 'nonresidential'] as TariffType[]).map((t) => (
              <button key={t} onClick={() => setTariff(t)} className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium ${tariff === t ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-500' : 'border-[var(--border)] text-soft'}`}>{t === 'residential' ? 'Residential' : 'Non-res'}</button>
            ))}
          </div>
        </div>
        <div><FieldLabel>Tenant name</FieldLabel>{field(tName, setTName, 'Aline U.')}</div>
        <div><FieldLabel>Phone</FieldLabel>{field(tPhone, setTPhone, '+250788…', 'tel')}</div>
        <div><FieldLabel>Email</FieldLabel>{field(tEmail, setTEmail, 'tenant@example.com', 'email')}</div>
        <div><FieldLabel>Rent (RWF)</FieldLabel>{field(rent, setRent, '120000', 'number')}</div>
        <div><FieldLabel>Opening kWh</FieldLabel>{field(opening, setOpening, '1240', 'number')}</div>
        <div><FieldLabel>Current kWh</FieldLabel>{field(current, setCurrent, '1305', 'number')}</div>
        <div><FieldLabel>Due day (1–28)</FieldLabel>{field(dueDay, setDueDay, '5', 'number')}</div>
      </div>
      {err && <p className="mt-3 text-sm text-rose-500">{err}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={submit} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400">Add unit</button>
        <button onClick={onDone} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-soft">Cancel</button>
      </div>
    </div>
  )
}

// ---------- Tenant detail (drawer-ish panel) ----------
function UnitDetail({ property, unit, landlordName, onClose }: { property: Property; unit: Unit; landlordName: string; onClose: () => void }) {
  const { markPaid, markUnpaid, updateUnit, removeUnit } = useLandlord()
  const [doc, setDoc] = useState<DocKind | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [method, setMethod] = useState('MTN MoMo')
  const [ref, setRef] = useState('')
  const [reading, setReading] = useState(String(unit.currentKwh))
  const bill = unitBill(unit)
  const total = unitTotalDue(unit)
  const slots = reminderSlots(unit)

  return (
    <div className="gs-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500"><IcUser /></span>
          <div>
            <h3 className="text-lg font-bold text-heading">{unit.tenant?.name ?? 'Tenant'}</h3>
            <p className="text-xs text-muted">{property.name} · {unit.label} · {unit.tariffType === 'residential' ? 'Residential' : 'Non-residential'}</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-soft hover:text-main">Close</button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="gs-surface rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">Consumption</p>
          <p className="text-xl font-bold tabular-nums text-heading">{bill.consumptionKwh.toFixed(0)} kWh</p>
          <p className="text-[11px] text-muted">{unit.openingKwh} → {unit.currentKwh}</p>
        </div>
        <div className="gs-surface rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">Amount due</p>
          <p className="text-xl font-bold tabular-nums text-emerald-500">{RWF(total)}</p>
          <p className="text-[11px] text-muted">elec {RWF(bill.amountRWF)}{unit.rentRWF ? ` + rent ${RWF(unit.rentRWF)}` : ''}</p>
        </div>
        <div className="gs-surface rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">Due date</p>
          <p className="text-sm font-bold text-heading">{dueDateLabel(unit.dueDay)}</p>
          <p className="text-[11px] text-muted">12:00 · {periodLabel()}</p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-muted">Rate basis: {bill.rateLabel}. Period: {periodLabel()}.</p>

      {/* Update reading */}
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <FieldLabel hint="Enter a new current reading to re-bill.">Update current kWh</FieldLabel>
          <input value={reading} onChange={(e) => setReading(e.target.value)} type="number" className="rounded-lg gs-input px-3 py-2 text-sm" />
        </div>
        <button
          onClick={() => { const n = Number(reading); if (!Number.isNaN(n) && n >= unit.openingKwh) updateUnit(property.id, unit.id, { currentKwh: n, readingDate: today() }) }}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-soft hover:text-main"
        >Save reading</button>
      </div>

      {/* Documents */}
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">Documents</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={() => setDoc('invoice')} className="inline-flex items-center gap-2 rounded-lg gs-surface px-3 py-2 text-sm text-soft hover:text-main"><IcDoc size={16} /> Invoice</button>
        <button onClick={() => setDoc('receipt')} disabled={!unit.paid} className={`inline-flex items-center gap-2 rounded-lg gs-surface px-3 py-2 text-sm ${unit.paid ? 'text-soft hover:text-main' : 'text-muted opacity-50'}`}><IcReceipt size={16} /> Receipt</button>
        <button onClick={() => setDoc('report')} className="inline-flex items-center gap-2 rounded-lg gs-surface px-3 py-2 text-sm text-soft hover:text-main"><IcChart size={16} /> Report</button>
      </div>

      {/* Send */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Send to tenant</p>
      <p className="text-[11px] text-muted">Opens a prefilled message. Attach the downloaded invoice PDF in WhatsApp.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a href={whatsappLink(unit, landlordName)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-500 hover:bg-emerald-500/25"><IcWhatsApp size={16} /> WhatsApp</a>
        <a href={smsLink(unit, landlordName)} className="inline-flex items-center gap-2 rounded-lg gs-surface px-3 py-2 text-sm text-soft hover:text-main"><IcSend size={16} /> SMS</a>
        <a href={emailLink(unit, landlordName)} className="inline-flex items-center gap-2 rounded-lg gs-surface px-3 py-2 text-sm text-soft hover:text-main"><IcSend size={16} /> Email</a>
      </div>

      {/* Reminders */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Payment reminders</p>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {slots.map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-lg gs-surface px-3 py-1.5 text-xs">
            <span className="text-emerald-500"><IcBell size={14} /></span>
            <span className="text-soft">{s.label}</span>
            <span className="ml-auto text-muted">{s.when.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {s.when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
      <button onClick={() => downloadICS(unit)} className="mt-3 inline-flex items-center gap-2 rounded-lg gs-surface px-3 py-2 text-sm text-soft hover:text-main"><IcCalendar size={16} /> Add reminders to calendar (.ics)</button>

      {/* Payment status */}
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">Payment status</p>
      {unit.paid ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-500"><IcCheck size={15} /> Paid {unit.paidDate} · {unit.paidMethod}{unit.paidRef ? ` · ${unit.paidRef}` : ''}</span>
          <button onClick={() => markUnpaid(property.id, unit.id)} className="text-xs text-muted underline hover:text-main">Mark unpaid</button>
        </div>
      ) : payOpen ? (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div><FieldLabel>Method</FieldLabel><input value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-lg gs-input px-3 py-2 text-sm" /></div>
          <div><FieldLabel>Reference</FieldLabel><input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="txn id" className="rounded-lg gs-input px-3 py-2 text-sm" /></div>
          <button onClick={() => { markPaid(property.id, unit.id, { method, ref }); setPayOpen(false) }} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400">Confirm paid</button>
        </div>
      ) : (
        <button onClick={() => setPayOpen(true)} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400"><IcCheck size={16} /> Mark as paid</button>
      )}

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <button onClick={() => { if (confirm('Remove this unit?')) { removeUnit(property.id, unit.id); onClose() } }} className="text-xs text-rose-500/80 hover:text-rose-500">Remove unit</button>
      </div>

      {doc && <DocumentView kind={doc} unit={unit} landlordName={landlordName} onClose={() => setDoc(null)} />}
    </div>
  )
}

// ---------- Property card ----------
function PropertyCard({ property, onOpenUnit }: { property: Property; onOpenUnit: (u: Unit) => void }) {
  const { removeProperty } = useLandlord()
  const [adding, setAdding] = useState(false)
  const totalDue = property.units.reduce((s, u) => s + unitTotalDue(u), 0)
  const totalKwh = property.units.reduce((s, u) => s + unitBill(u).consumptionKwh, 0)

  return (
    <div className="gs-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500"><IcBuilding /></span>
          <div>
            <h3 className="font-bold text-heading">{property.name}</h3>
            <p className="text-xs text-muted">{property.address}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums text-emerald-500">{RWF(totalDue)}</p>
          <p className="text-[11px] text-muted">{property.units.length} units · {totalKwh.toFixed(0)} kWh</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {property.units.map((u) => {
          const b = unitBill(u)
          return (
            <button key={u.id} onClick={() => onOpenUnit(u)} className="flex w-full items-center gap-3 rounded-xl gs-surface px-3 py-2.5 text-left transition-colors hover:border-emerald-500/40">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500"><IcBolt size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-main">{u.label} · {u.tenant?.name ?? 'No tenant'}</p>
                <p className="text-[11px] text-muted">{b.consumptionKwh.toFixed(0)} kWh · due {dueDateLabel(u.dueDay).split(',')[0]}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-heading">{RWF(unitTotalDue(u))}</p>
                {u.paid ? <span className="text-[11px] text-emerald-500">Paid ✓</span> : <span className="text-[11px] text-amber-500">Unpaid</span>}
              </div>
            </button>
          )
        })}
        {property.units.length === 0 && <p className="rounded-lg gs-surface px-3 py-3 text-center text-xs text-muted">No units yet.</p>}
      </div>

      {adding ? (
        <AddUnitForm propertyId={property.id} onDone={() => setAdding(false)} />
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <button onClick={() => setAdding(true)} className="text-sm font-medium text-emerald-500 hover:text-emerald-400">+ Add unit</button>
          <button onClick={() => { if (confirm('Remove this property and all its units?')) removeProperty(property.id) }} className="text-xs text-muted hover:text-rose-500">Remove</button>
        </div>
      )}
    </div>
  )
}

// ---------- Main page ----------
export function Properties() {
  const { portfolio, seedSample } = useLandlord()
  const { user } = useAuth()
  const { charts } = useTheme()
  useI18n()
  const [wizard, setWizard] = useState(false)
  const [openUnit, setOpenUnit] = useState<{ p: Property; u: Unit } | null>(null)
  const landlordName = user?.name && user.name !== 'Guest' ? user.name : 'Your name'

  const allUnits = useMemo(() => portfolio.properties.flatMap((p) => p.units.map((u) => ({ p, u }))), [portfolio])
  const totals = useMemo(() => {
    const units = allUnits.length
    const due = allUnits.reduce((s, x) => s + unitTotalDue(x.u), 0)
    const paid = allUnits.filter((x) => x.u.paid).length
    const kwh = allUnits.reduce((s, x) => s + unitBill(x.u).consumptionKwh, 0)
    return { units, due, paid, unpaid: units - paid, kwh }
  }, [allUnits])

  const chartData = useMemo(
    () => allUnits.map((x) => ({ name: x.u.label, kwh: +unitBill(x.u).consumptionKwh.toFixed(0), paid: !!x.u.paid })),
    [allUnits],
  )

  // keep openUnit fresh after edits
  const live = openUnit ? portfolio.properties.find((p) => p.id === openUnit.p.id)?.units.find((u) => u.id === openUnit.u.id) : null
  const liveProp = openUnit ? portfolio.properties.find((p) => p.id === openUnit.p.id) : null

  const empty = portfolio.properties.length === 0

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageTitle title="Property workspace" sub="Bill every tenant fairly from the real RURA/REG tariff, send the invoice, and get paid on time." />
        {!empty && !wizard && (
          <button onClick={() => setWizard(true)} className="mb-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400">
            <IcBuilding size={16} /> Add property
          </button>
        )}
      </div>

      {wizard && <div className="mb-8"><AddPropertyWizard onDone={() => setWizard(false)} onCancel={() => setWizard(false)} /></div>}

      {empty && !wizard && (
        <div className="gs-card p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-500"><IcBuilding size={28} /></span>
          <h3 className="mt-4 text-lg font-bold text-heading">Set up your first property</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-soft">Add a property, its units, your tenants, and meter readings. GridSense computes the exact bill, builds the invoice, and schedules reminders — all stored locally on this device.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => setWizard(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400"><IcBuilding size={16} /> Add property</button>
            <button onClick={seedSample} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-soft hover:text-main">Load a sample (labelled)</button>
          </div>
        </div>
      )}

      {!empty && (
        <>
          {/* Portfolio overview */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total units" value={String(totals.units)} />
            <Stat label="Total due" value={RWF(totals.due)} accent />
            <Stat label="Paid / unpaid" value={`${totals.paid} / ${totals.unpaid}`} />
            <Stat label="Total consumption" value={`${totals.kwh.toFixed(0)} kWh`} />
          </div>

          {chartData.length > 0 && (
            <div className="mt-4 gs-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Consumption per unit (kWh)</p>
              <div style={{ height: 220 }} className="mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={charts.grid} />
                    <XAxis dataKey="name" stroke={charts.axis} fontSize={11} tickLine={false} />
                    <YAxis stroke={charts.axis} fontSize={11} tickLine={false} width={40} />
                    <Tooltip contentStyle={{ background: charts.tipBg, border: `1px solid ${charts.tipBd}`, borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="kwh" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => (<Cell key={i} fill={d.paid ? '#10b981' : '#22d3ee'} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tenant detail or property list */}
          {live && liveProp ? (
            <div className="mt-6">
              <UnitDetail property={liveProp} unit={live} landlordName={landlordName} onClose={() => setOpenUnit(null)} />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {portfolio.properties.map((p) => (
                <PropertyCard key={p.id} property={p} onOpenUnit={(u) => setOpenUnit({ p, u })} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
