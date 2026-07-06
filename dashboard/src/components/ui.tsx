import type { ReactNode } from 'react'
import { useI18n } from '../i18n'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`gs-card p-5 ${className}`}>{children}</div>
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="text-xs uppercase tracking-wider text-muted mb-2">{children}</p>
}

export function HonestyBadge() {
  const { t } = useI18n()
  return (
    <span className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-500 border border-amber-400/30">
      ● {t('simulated_badge')}
    </span>
  )
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  return <img src="/favicon.svg" alt="GridSense AI" className={`${dim} rounded-xl`} />
}

export function Header() {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-3">
      <Logo />
      <div>
        <h1 className="text-xl font-bold tracking-tight text-heading">GridSense AI</h1>
        <p className="text-xs text-muted -mt-0.5">{t('subtitle')}</p>
      </div>
    </div>
  )
}
