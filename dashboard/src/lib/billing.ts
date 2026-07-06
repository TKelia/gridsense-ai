// Send + reminder helpers for the landlord workspace.
// No backend: WhatsApp/SMS/email deep links + downloadable .ics calendar events.
import type { Unit } from '../landlord'
import { unitBill } from '../landlord'
import { RWF } from './tariff'

/** Current billing period label, e.g. "June 2026". */
export function periodLabel(d = new Date()): string {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/** Due date for a unit: dueDay of the current month at 12:00 local. */
export function dueDate(dueDay: number, base = new Date()): Date {
  const day = Math.min(Math.max(1, Math.round(dueDay)), 28)
  const d = new Date(base.getFullYear(), base.getMonth(), day, 12, 0, 0, 0)
  return d
}

export function dueDateLabel(dueDay: number, base = new Date()): string {
  return dueDate(dueDay, base).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Plain-text message summarizing the bill for a tenant. */
export function buildMessage(unit: Unit, landlordName = 'GridSense'): string {
  const bill = unitBill(unit)
  const total = bill.amountRWF + (unit.rentRWF ?? 0)
  const lines = [
    `Hello ${unit.tenant?.name ?? 'tenant'},`,
    '',
    `Here is your ${periodLabel()} statement for ${unit.label}:`,
    `• Electricity used: ${bill.consumptionKwh.toFixed(0)} kWh`,
    `• Electricity charge: ${RWF(bill.amountRWF)}`,
  ]
  if (unit.rentRWF) lines.push(`• Rent: ${RWF(unit.rentRWF)}`)
  lines.push(
    `• Amount due: ${RWF(total)}`,
    `• Due: ${dueDateLabel(unit.dueDay)} by 12:00`,
    '',
    `Please review the attached GridSense invoice. Charges use the official RURA/REG tariff.`,
    `Thank you, ${landlordName}.`,
  )
  return lines.join('\n')
}

const enc = encodeURIComponent

export function whatsappLink(unit: Unit, landlordName?: string): string {
  const phone = (unit.tenant?.phone ?? '').replace(/[^\d]/g, '')
  return `https://wa.me/${phone}?text=${enc(buildMessage(unit, landlordName))}`
}

export function smsLink(unit: Unit, landlordName?: string): string {
  const phone = unit.tenant?.phone ?? ''
  return `sms:${phone}?body=${enc(buildMessage(unit, landlordName))}`
}

export function emailLink(unit: Unit, landlordName?: string): string {
  const email = unit.tenant?.email ?? ''
  const subject = `GridSense statement — ${unit.label} — ${periodLabel()}`
  return `mailto:${email}?subject=${enc(subject)}&body=${enc(buildMessage(unit, landlordName))}`
}

// ---- .ics reminder generation ----
function icsStamp(d: Date): string {
  // Local floating time (no Z) so device fires in the user's timezone.
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
}

export interface ReminderSlot {
  when: Date
  label: string
}

/** The reminder schedule: 5/3/2/1 days before (09:00), morning-of (08:00), due moment (12:00). */
export function reminderSlots(unit: Unit, base = new Date()): ReminderSlot[] {
  const due = dueDate(unit.dueDay, base)
  const at = (offsetDays: number, h: number, m: number): Date => {
    const d = new Date(due)
    d.setDate(d.getDate() - offsetDays)
    d.setHours(h, m, 0, 0)
    return d
  }
  return [
    { when: at(5, 9, 0), label: '5 days before' },
    { when: at(3, 9, 0), label: '3 days before' },
    { when: at(2, 9, 0), label: '2 days before' },
    { when: at(1, 9, 0), label: '1 day before' },
    { when: at(0, 8, 0), label: 'Morning of due day' },
    { when: due, label: 'Due now (12:00)' },
  ]
}

export function buildICS(unit: Unit, base = new Date()): string {
  const bill = unitBill(unit)
  const total = bill.amountRWF + (unit.rentRWF ?? 0)
  const tenant = unit.tenant?.name ?? 'tenant'
  const slots = reminderSlots(unit, base)
  const now = icsStamp(new Date())
  const fold = (s: string) => s.replace(/[\r\n]+/g, ' ')
  const events = slots
    .map((slot, i) => {
      const start = icsStamp(slot.when)
      const end = icsStamp(new Date(slot.when.getTime() + 15 * 60000))
      const summary = `GridSense: ${tenant} ${unit.rentRWF ? 'rent/utility' : 'utility'} due — ${RWF(total)}`
      return [
        'BEGIN:VEVENT',
        `UID:gridsense-${unit.id}-${i}@gridsense.rw`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${fold(summary)} (${slot.label})`,
        `DESCRIPTION:${fold(`${unit.label} · ${bill.consumptionKwh.toFixed(0)} kWh · due ${dueDateLabel(unit.dueDay, base)} 12:00`)}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:PT0M',
        `DESCRIPTION:${fold(summary)}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n')
    })
    .join('\r\n')
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GridSense AI//Reminders//EN', 'CALSCALE:GREGORIAN', events, 'END:VCALENDAR'].join('\r\n')
}

/** Trigger a client-side download of a text blob. */
export function downloadText(filename: string, content: string, mime = 'text/plain'): void {
  if (typeof document === 'undefined') return
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadICS(unit: Unit): void {
  const safe = (unit.tenant?.name ?? unit.label).replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  downloadText(`gridsense-reminders-${safe}.ics`, buildICS(unit), 'text/calendar')
}
