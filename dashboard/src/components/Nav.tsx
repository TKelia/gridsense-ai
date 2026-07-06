import { useI18n, type StringKey } from '../i18n'

export type ScreenId = 'live' | 'month' | 'appliances' | 'save'

const TABS: { id: ScreenId; key: StringKey; icon: string }[] = [
  { id: 'live', key: 'nav_live', icon: '⚡' },
  { id: 'month', key: 'nav_month', icon: '📅' },
  { id: 'appliances', key: 'nav_appliances', icon: '🔌' },
  { id: 'save', key: 'nav_save', icon: '💡' },
]

export function Nav({ active, onChange }: { active: ScreenId; onChange: (id: ScreenId) => void }) {
  const { t } = useI18n()
  return (
    <nav className="flex gap-1 p-1 rounded-2xl gs-card mb-5">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-2 py-2 rounded-xl text-sm font-medium transition-colors ${
            active === tab.id ? 'bg-emerald-500/20 text-emerald-500' : 'text-muted hover:text-main'
          }`}
        >
          <span className="mr-1">{tab.icon}</span>
          <span className="hidden sm:inline">{t(tab.key)}</span>
        </button>
      ))}
    </nav>
  )
}
