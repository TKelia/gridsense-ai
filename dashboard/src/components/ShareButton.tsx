import { useState } from 'react'
import { useI18n } from '../i18n'

const PAYLOAD = {
  title: 'GridSense AI',
  text: 'GridSense AI — live home electricity insight for Rwandan homes, across the real RURA tariff.',
}

/** Share button: uses the Web Share API when available, else copies the URL. */
export function ShareButton({ variant = 'bar', className = '' }: { variant?: 'bar' | 'primary'; className?: string }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ ...PAYLOAD, url })
        return
      } catch {
        /* user cancelled or unsupported — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const base =
    variant === 'primary'
      ? 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-4 py-2 text-sm font-semibold hover:bg-emerald-500/25 transition-colors'
      : 'inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-soft hover:text-main transition-colors'

  return (
    <button onClick={onShare} className={`${base} ${className}`} aria-label={t('share')}>
      <span aria-hidden>🔗</span>
      <span>{copied ? t('share_copied') : t('share')}</span>
    </button>
  )
}
