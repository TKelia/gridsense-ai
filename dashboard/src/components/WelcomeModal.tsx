import { useI18n } from '../i18n'
import { mailtoLink, whatsappLink, smsLink, type WelcomeVars } from '../lib/welcome'
import { IcArrow, IcSend, IcWhatsApp } from './icons'

export interface WelcomeModalProps {
  name: string
  email?: string
  phone?: string
  onClose: () => void
  onGoToDashboard: () => void
}

/** Post-signup celebration modal with one-tap "send to me" deep links.
 *  Honest: automatic email/SMS is sent by the server only once a provider is
 *  connected — these buttons open the user's own apps, pre-filled. */
export function WelcomeModal({ name, email, phone, onClose, onGoToDashboard }: WelcomeModalProps) {
  const { t } = useI18n()
  const vars: WelcomeVars & { phone?: string } = { name, email, phone }

  const actions = [
    { href: mailtoLink(vars), label: t('welcome_send_email'), icon: <IcSend size={16} /> },
    { href: whatsappLink(vars), label: t('welcome_send_whatsapp'), icon: <IcWhatsApp size={16} /> },
    { href: smsLink(vars), label: t('welcome_send_sms'), icon: <IcSend size={16} /> },
  ]

  return (
    <div
      className="no-print fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t('welcome_title', { name })}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl gs-card p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-muted hover:text-main"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="relative">
          <div className="text-4xl">🎉</div>
          <h2 className="mt-3 text-2xl font-black text-heading">{t('welcome_title', { name })}</h2>
          <p className="mt-2 text-sm text-soft">{t('welcome_body')}</p>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('welcome_send_label')}</p>
            <div className="mt-3 grid gap-2">
              {actions.map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-main transition-colors hover:border-emerald-500/50"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500">{a.icon}</span>
                  {a.label}
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={onGoToDashboard}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-semibold text-slate-900 transition-colors hover:from-emerald-400 hover:to-cyan-400"
          >
            {t('welcome_go_dashboard')} <IcArrow size={16} />
          </button>

          <p className="mt-4 text-[11px] leading-relaxed text-muted">{t('welcome_auto_note')}</p>
        </div>
      </div>
    </div>
  )
}
