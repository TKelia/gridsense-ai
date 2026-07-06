import { Logo } from './ui'
import { useI18n } from '../i18n'
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  SUPPORT_WHATSAPP,
  OFFICIAL_SOURCES,
  type Route,
} from '../routes'

export function Footer({ go }: { go: (r: Route) => void }) {
  const { t } = useI18n()
  return (
    <footer className="no-print mt-16 border-t border-[var(--border)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="text-base font-bold tracking-tight text-heading">GridSense AI</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">{t('footer_tagline')}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('footer_product')}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><button onClick={() => go('home')} className="text-soft hover:text-main">{t('nav_home')}</button></li>
            <li><button onClick={() => go('device')} className="text-soft hover:text-main">{t('nav_device')}</button></li>
            <li><button onClick={() => go('dashboard')} className="text-soft hover:text-main">{t('nav_dashboard')}</button></li>
            <li><button onClick={() => go('verify')} className="text-soft hover:text-main">{t('verify_title')}</button></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('footer_company')}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><button onClick={() => go('about')} className="text-soft hover:text-main">{t('nav_about')}</button></li>
            <li><button onClick={() => go('support')} className="text-soft hover:text-main">{t('nav_support')}</button></li>
            <li><button onClick={() => go('terms')} className="text-soft hover:text-main">Terms</button></li>
            <li><button onClick={() => go('privacy')} className="text-soft hover:text-main">Privacy</button></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('footer_sources')}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {OFFICIAL_SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-soft hover:text-main">
                  {t(s.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('footer_support')}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`tel:${SUPPORT_PHONE_TEL}`} className="text-soft hover:text-main">
                📞 {SUPPORT_PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={SUPPORT_WHATSAPP} target="_blank" rel="noreferrer" className="text-soft hover:text-main">
                💬 WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>{t('footer_copyright')}</span>
          <span>🛡 Data protected · Law 058/2021 aligned</span>
        </div>
      </div>
    </footer>
  )
}
