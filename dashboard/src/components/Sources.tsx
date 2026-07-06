import { useI18n } from '../i18n'
import { OFFICIAL_SOURCES } from '../routes'
import { IcArrow } from './icons'

/** "Official sources & references" block — real, live links to REG/RURA/RwandaLII/DPO.
 *  Used on the About and Support pages. */
export function Sources() {
  const { t } = useI18n()
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-heading">{t('sources_title')}</h2>
      <p className="mt-2 text-sm text-soft">{t('sources_sub')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {OFFICIAL_SOURCES.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 gs-card p-4 transition-colors hover:border-emerald-500/50"
          >
            <span className="text-sm font-medium text-main">{t(s.labelKey)}</span>
            <span className="shrink-0 text-emerald-500 transition-transform group-hover:translate-x-0.5">
              <IcArrow size={16} />
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
