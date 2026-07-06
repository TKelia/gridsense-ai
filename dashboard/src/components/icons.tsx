// Lightweight inline-SVG icon set. No external URLs (no network at build, no
// copyright risk). Each icon inherits currentColor via stroke/fill.
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 20, ...rest }: P) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  }
}

export function IcBuilding(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="3" width="11" height="18" rx="1" />
      <path d="M15 8h5v13H4" />
      <path d="M8 7h.01M11 7h.01M8 11h.01M11 11h.01M8 15h.01M11 15h.01M18 12h.01M18 16h.01" />
    </svg>
  )
}

export function IcHome(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  )
}

export function IcEnterprise(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="9" width="7" height="12" rx="1" />
      <rect x="10" y="3" width="11" height="18" rx="1" />
      <path d="M14 7h.01M17 7h.01M14 11h.01M17 11h.01M14 15h.01M17 15h.01" />
    </svg>
  )
}

export function IcBolt(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  )
}

export function IcUser(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

export function IcReceipt(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  )
}

export function IcDoc(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h4M9 13h6M9 17h6" />
    </svg>
  )
}

export function IcBell(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function IcChart(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M4 4v16h16" />
      <path d="M8 16v-4M12 16V8M16 16v-7" />
    </svg>
  )
}

export function IcShield(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function IcLock(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function IcCheck(p: P) {
  return (
    <svg {...base(p)}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

export function IcSend(p: P) {
  return (
    <svg {...base(p)}>
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

export function IcCalendar(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function IcWhatsApp(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3 21l1.6-4.4A8 8 0 1 1 8 19.4z" />
      <path d="M9 9c0 4 2 6 6 6 .7 0 1-.8.6-1.3l-1-1.2-1.6.6c-1-.5-1.9-1.4-2.4-2.4l.6-1.6-1.2-1C9.8 6 9 6.3 9 7z" />
    </svg>
  )
}

export function IcChip(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M9 3v2M12 3v2M15 3v2M9 19v2M12 19v2M15 19v2M3 9h2M3 12h2M3 15h2M19 9h2M19 12h2M19 15h2" />
    </svg>
  )
}

export function IcArrow(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
