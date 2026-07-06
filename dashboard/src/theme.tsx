import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useI18n } from './i18n'

export type Theme = 'dark' | 'light'

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
  /** Recharts-friendly color tokens for the active theme. */
  charts: {
    grid: string
    axis: string
    tipBg: string
    tipBd: string
  }
}

const Ctx = createContext<ThemeCtx | null>(null)
const KEY = 'gridsense_theme'

function readInitial(): Theme {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* storage unavailable */
  }
  return 'dark'
}

function apply(theme: Theme) {
  const el = document.documentElement
  if (theme === 'light') el.classList.add('light')
  else el.classList.remove('light')
  el.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial)

  useEffect(() => {
    apply(theme)
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)
  const toggle = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))

  const charts =
    theme === 'light'
      ? { grid: '#e5e7eb', axis: '#64748b', tipBg: '#ffffff', tipBd: '#cbd5e1' }
      : { grid: '#1e293b', axis: '#94a3b8', tipBg: '#0f172a', tipBd: '#334155' }

  return <Ctx.Provider value={{ theme, setTheme, toggle, charts }}>{children}</Ctx.Provider>
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useTheme must be used within ThemeProvider')
  return c
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t('theme_light') : t('theme_dark')}
      title={isDark ? t('theme_light') : t('theme_dark')}
      className={`grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-base text-soft transition-colors hover:text-main ${className}`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
