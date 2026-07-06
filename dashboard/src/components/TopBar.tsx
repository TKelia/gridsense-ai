import { useEffect, useRef, useState } from 'react'
import { Logo } from './ui'
import { ThemeToggle } from '../theme'
import { LanguageToggle, useI18n, type StringKey } from '../i18n'
import { useAuth } from '../auth'
import type { Route } from '../routes'

// Lean primary nav. Secondary links (How to use, About, Terms…) live in the footer.
const NAV: { route: Route; key: StringKey }[] = [
  { route: 'home', key: 'nav_home' },
  { route: 'device', key: 'nav_device' },
  { route: 'support', key: 'nav_support' },
]

export function TopBar({ route, go }: { route: Route; go: (r: Route) => void }) {
  const { t } = useI18n()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false) // mobile menu
  const [acct, setAcct] = useState(false) // account dropdown
  const acctRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcct(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const linkCls = (r: Route) =>
    `whitespace-nowrap text-sm font-medium transition-colors ${
      route === r ? 'text-emerald-500' : 'text-soft hover:text-main'
    }`

  const doSignOut = () => {
    signOut()
    setAcct(false)
    setOpen(false)
    go('home')
  }

  return (
    <header className="no-print sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <button onClick={() => go('home')} className="flex shrink-0 items-center gap-2.5" aria-label="GridSense AI home">
          <Logo size="sm" />
          <span className="whitespace-nowrap text-base font-bold tracking-tight text-heading">GridSense AI</span>
        </button>

        {/* Desktop nav (centered) */}
        <nav className="mx-auto hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <button key={n.route} onClick={() => go(n.route)} className={linkCls(n.route)}>
              {t(n.key)}
            </button>
          ))}
          {user && (
            <button onClick={() => go('dashboard')} className={linkCls('dashboard')}>
              {t('nav_dashboard')}
            </button>
          )}
        </nav>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <span className="hidden sm:block">
            <LanguageToggle />
          </span>

          {user ? (
            <div className="relative hidden sm:block" ref={acctRef}>
              <button
                onClick={() => setAcct((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={acct}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-soft transition-colors hover:text-main"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-slate-900">
                  {(user.name || 'G').charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[7rem] truncate md:block">{user.name}</span>
                <span className="text-[10px]">▼</span>
              </button>
              {acct && (
                <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-xl">
                  <div className="border-b border-[var(--border)] px-4 py-3">
                    <p className="truncate text-sm font-semibold text-heading">{user.name}</p>
                    {user.email ? <p className="truncate text-xs text-muted">{user.email}</p> : null}
                  </div>
                  <button onClick={() => { setAcct(false); go('dashboard') }} role="menuitem" className="block w-full px-4 py-2.5 text-left text-sm text-soft hover:bg-[var(--surface)] hover:text-main">
                    {t('nav_dashboard')}
                  </button>
                  <button onClick={doSignOut} role="menuitem" className="block w-full border-t border-[var(--border)] px-4 py-2.5 text-left text-sm text-soft hover:bg-[var(--surface)] hover:text-main">
                    {t('sign_out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => go('login')}
              className="hidden whitespace-nowrap rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-1.5 text-sm font-semibold text-slate-900 transition-colors hover:from-emerald-400 hover:to-cyan-400 sm:block"
            >
              {t('sign_in')}
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={t('menu')}
            aria-expanded={open}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] text-soft lg:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <button key={n.route} onClick={() => { go(n.route); setOpen(false) }} className={`rounded-lg px-3 py-2 text-left ${linkCls(n.route)}`}>
                {t(n.key)}
              </button>
            ))}
            {user && (
              <button onClick={() => { go('dashboard'); setOpen(false) }} className={`rounded-lg px-3 py-2 text-left ${linkCls('dashboard')}`}>
                {t('nav_dashboard')}
              </button>
            )}
            <div className="mt-2 flex items-center gap-2">
              <LanguageToggle />
            </div>
            <div className="mt-2">
              {user ? (
                <button onClick={doSignOut} className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm text-soft">
                  {t('sign_out')} · {user.name}
                </button>
              ) : (
                <button onClick={() => { go('login'); setOpen(false) }} className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900">
                  {t('sign_in')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
