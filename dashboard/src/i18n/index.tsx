import { createContext, useContext, useState, type ReactNode } from 'react'
import { strings, type Lang, type StringKey } from './strings'

type Params = Record<string, string | number>
interface Ctx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: StringKey, params?: Params) => string
}

const I18nContext = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const t = (key: StringKey, params?: Params): string => {
    let s = strings[lang][key] ?? strings.en[key] ?? key
    if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
    return s
  }
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n(): Ctx {
  const c = useContext(I18nContext)
  if (!c) throw new Error('useI18n must be used within LangProvider')
  return c
}

export { APPLIANCE_I18N } from './strings'
export type { StringKey } from './strings'

export function LanguageToggle() {
  const { lang, setLang } = useI18n()
  return (
    <div className="flex gap-0.5 p-0.5 rounded-lg gs-surface text-xs">
      {(['en', 'rw'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
            lang === l ? 'bg-emerald-500/25 text-emerald-500' : 'text-muted hover:text-main'
          }`}
        >
          {l === 'en' ? 'EN' : 'RW'}
        </button>
      ))}
    </div>
  )
}
