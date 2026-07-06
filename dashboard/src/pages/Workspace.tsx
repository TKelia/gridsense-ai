import { PageTitle } from './Prose'
import { useWorkspace, type WorkspaceKind } from '../workspace'
import { useI18n } from '../i18n'
import type { Route } from '../routes'
import { IcHome, IcBuilding, IcEnterprise, IcArrow, IcCheck } from '../components/icons'

const OPTIONS: { kind: WorkspaceKind; icon: React.ReactNode; titleKey: 'ws_home' | 'ws_property' | 'ws_enterprise'; descKey: 'ws_home_desc' | 'ws_property_desc' | 'ws_enterprise_desc'; points: string[] }[] = [
  { kind: 'home', icon: <IcHome size={26} />, titleKey: 'ws_home', descKey: 'ws_home_desc', points: ['Live usage & cost', 'Tier-cliff alerts', 'Savings advice'] },
  { kind: 'property', icon: <IcBuilding size={26} />, titleKey: 'ws_property', descKey: 'ws_property_desc', points: ['Per-tenant billing', 'Invoices & reminders', 'Portfolio overview'] },
  { kind: 'enterprise', icon: <IcEnterprise size={26} />, titleKey: 'ws_enterprise', descKey: 'ws_enterprise_desc', points: ['Many properties', 'Team seats & exports', 'Live+ devices'] },
]

export function WorkspaceChooser({ go }: { go: (r: Route) => void }) {
  const { setKind } = useWorkspace()
  const { t } = useI18n()

  const pick = (k: WorkspaceKind) => {
    setKind(k)
    if (k === 'home') go('setup')
    else go('properties')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title={t('ws_title')} sub={t('ws_sub')} />
      <div className="grid gap-4 md:grid-cols-3">
        {OPTIONS.map((o) => (
          <button key={o.kind} onClick={() => pick(o.kind)} className="group flex flex-col gs-card p-6 text-left transition-colors hover:border-emerald-500/50">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-500">{o.icon}</span>
            <h3 className="mt-4 text-lg font-bold text-heading">{t(o.titleKey)}</h3>
            <p className="mt-1 text-sm text-soft">{t(o.descKey)}</p>
            <ul className="mt-4 flex-1 space-y-1.5">
              {o.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs text-muted"><span className="text-emerald-500"><IcCheck size={13} /></span>{p}</li>
              ))}
            </ul>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500 group-hover:gap-2.5 transition-all">{t('ws_continue')} <IcArrow size={15} /></span>
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted">You can switch workspace any time from the top bar.</p>
    </div>
  )
}
