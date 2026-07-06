import { useMemo, useState, type FormEvent } from 'react'
import {
  useAuth,
  createAccount,
  verifyCredentials,
  usernameTaken,
  emailTaken,
} from '../auth'
import { LanguageToggle, useI18n } from '../i18n'
import { ThemeToggle } from '../theme'
import { useHousehold, DEMO_PROFILE } from '../household'
import type { Route } from '../routes'
import {
  checkPassword,
  passwordMeetsMinimum,
  passwordStrength,
  generatePassword,
  formatRwandaPhone,
  isValidRwandaPhone,
  suggestUsername,
} from '../lib/password'
import { WelcomeModal } from '../components/WelcomeModal'

type Mode = 'signin' | 'signup'

export function Login({ go }: { go: (r: Route) => void }) {
  const { signIn } = useAuth()
  const { t, lang } = useI18n()
  const { profile, save } = useHousehold()

  const [mode, setMode] = useState<Mode>('signin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [welcome, setWelcome] = useState<{ name: string; email: string; phone: string } | null>(null)

  // Sign-in fields
  const [identifier, setIdentifier] = useState('')
  const [signInPass, setSignInPass] = useState('')

  // Sign-up fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [usernameEdited, setUsernameEdited] = useState(false)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const checks = checkPassword(password)
  const strength = useMemo(() => passwordStrength(password), [password])

  // Auto-suggest a username from name/email until the user edits it.
  const effectiveUsername = usernameEdited ? username : suggestUsername(name, email)

  // Route after a successful sign-in / sign-up.
  const routeAfterAuth = () => {
    go(profile.setupComplete ? 'dashboard' : 'setup')
  }

  const submitSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const id = identifier.trim()
    if (!id || !signInPass) {
      setError(t('auth_err_required'))
      return
    }
    setBusy(true)
    try {
      const res = await verifyCredentials(id, signInPass)
      if (!res.ok) {
        setError(res.reason === 'not_found' ? t('auth_err_no_account') : t('auth_err_bad_password'))
        return
      }
      signIn(res.user)
      routeAfterAuth()
    } catch {
      setError(t('auth_err_generic'))
    } finally {
      setBusy(false)
    }
  }

  const submitSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const cleanPhone = formatRwandaPhone(phone)
    const cleanUser = effectiveUsername.trim()

    if (!cleanName || !cleanEmail || !cleanUser) {
      setError(t('auth_err_required'))
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setError(t('auth_err_email'))
      return
    }
    if (phone && !isValidRwandaPhone(cleanPhone)) {
      setError(t('auth_err_phone'))
      return
    }
    if (usernameTaken(cleanUser)) {
      setError(t('auth_err_username_taken'))
      return
    }
    if (emailTaken(cleanEmail)) {
      setError(t('auth_err_email_taken'))
      return
    }
    if (!passwordMeetsMinimum(password)) {
      setError(t('auth_err_weak'))
      return
    }

    setBusy(true)
    try {
      const user = await createAccount({
        username: cleanUser,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
      })
      signIn(user)
      // Fire the server welcome (no-op unless a provider is configured). Honest:
      // it returns {sent:false} without keys. Fire-and-forget; never blocks signup.
      try {
        void fetch('/api/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName, email: cleanEmail, phone: cleanPhone }),
        }).catch(() => {})
      } catch {
        /* ignore — static hosting has no API route */
      }
      setWelcome({ name: cleanName, email: cleanEmail, phone: cleanPhone })
    } catch {
      setError(t('auth_err_generic'))
    } finally {
      setBusy(false)
    }
  }

  // Guest demo: straight to the Home dashboard (keeps e2e working; no password).
  const exploreDemo = () => {
    save(DEMO_PROFILE)
    signIn({ name: 'Guest', email: '' })
    go('dashboard')
  }

  const features = [t('login_feat_tariff'), t('login_feat_alerts'), t('login_feat_ai')]
  const inputCls =
    'w-full rounded-xl gs-input px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30'
  const labelCls = 'block text-xs uppercase tracking-wider text-muted mb-1.5'

  const strengthColor = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500'][strength.score]

  return (
    <div className="min-h-screen text-main grid lg:grid-cols-2 bg-app">
      {/* Brand / story panel */}
      <div className="relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14 flex flex-col justify-between bg-gradient-to-br from-emerald-600/15 via-[var(--bg)] to-[var(--bg)] border-b lg:border-b-0 lg:border-r border-[var(--border)]">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />

        <button onClick={() => go('home')} className="relative flex items-center gap-3 self-start" aria-label="Home">
          <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-xl" />
          <div className="text-left">
            <p className="text-lg font-bold tracking-tight text-heading">GridSense AI</p>
            <p className="text-xs text-muted -mt-0.5">{t('subtitle')}</p>
          </div>
        </button>

        <div className="relative my-10 lg:my-0 max-w-md">
          <h1 className="text-3xl sm:text-4xl font-black leading-tight text-heading">{t('login_hero_title')}</h1>
          <p className="mt-4 text-soft text-sm sm:text-base leading-relaxed">{t('login_hero_sub')}</p>
          <ul className="mt-7 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-main">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-500/20 text-emerald-500 grid place-items-center text-xs">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-muted">{t('footer_note', { source: 'demo' })}</p>
      </div>

      {/* Auth panel */}
      <div className="px-6 py-10 sm:px-12 sm:py-14 flex flex-col">
        <div className="flex justify-end gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>

        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-sm">
            {/* Mode tabs */}
            <div className="mb-6 flex gap-1 rounded-xl gs-surface p-1 text-sm">
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m)
                    setError('')
                  }}
                  className={`flex-1 rounded-lg px-3 py-2 font-semibold transition-colors ${
                    mode === m ? 'bg-emerald-500/25 text-emerald-500' : 'text-muted hover:text-main'
                  }`}
                >
                  {m === 'signin' ? t('auth_tab_signin') : t('auth_tab_signup')}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-500">
                {error}
              </div>
            )}

            {mode === 'signin' ? (
              <>
                <h2 className="text-2xl font-bold text-heading">{t('auth_signin_title')}</h2>
                <p className="mt-1.5 text-sm text-muted">{t('auth_signin_sub')}</p>

                <form onSubmit={submitSignIn} className="mt-7 space-y-4">
                  <div>
                    <label htmlFor="identifier" className={labelCls}>{t('auth_identifier')}</label>
                    <input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={t('auth_identifier_ph')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="signin-pass" className={labelCls}>{t('auth_password')}</label>
                    <input
                      id="signin-pass"
                      type="password"
                      autoComplete="current-password"
                      value={signInPass}
                      onChange={(e) => setSignInPass(e.target.value)}
                      placeholder="••••••••"
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400 transition-colors disabled:opacity-60"
                  >
                    {busy ? '…' : `${t('login_signin')} →`}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-muted">
                  {t('auth_no_account')}{' '}
                  <button onClick={() => { setMode('signup'); setError('') }} className="font-semibold text-emerald-500 hover:underline">
                    {t('auth_tab_signup')}
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-heading">{t('auth_signup_title')}</h2>
                <p className="mt-1.5 text-sm text-muted">{t('auth_signup_sub')}</p>

                <form onSubmit={submitSignUp} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="su-name" className={labelCls}>{t('auth_name')}</label>
                    <input id="su-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('name_ph')} className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="su-email" className={labelCls}>{t('login_email')}</label>
                    <input id="su-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email_ph')} className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="su-phone" className={labelCls}>{t('auth_phone')}</label>
                    <input
                      id="su-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => phone && setPhone(formatRwandaPhone(phone))}
                      placeholder={t('auth_phone_ph')}
                      className={inputCls}
                    />
                    <p className="mt-1 text-[11px] text-muted">{t('auth_phone_hint')}</p>
                  </div>
                  <div>
                    <label htmlFor="su-username" className={labelCls}>{t('auth_username')}</label>
                    <input
                      id="su-username"
                      type="text"
                      value={effectiveUsername}
                      onChange={(e) => { setUsernameEdited(true); setUsername(e.target.value) }}
                      placeholder={t('auth_username_ph')}
                      className={inputCls}
                    />
                    {effectiveUsername && (
                      <p className={`mt-1 text-[11px] ${usernameTaken(effectiveUsername) ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {usernameTaken(effectiveUsername) ? t('auth_username_taken') : t('auth_username_ok')}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="su-pass" className={labelCls}>{t('auth_password')}</label>
                      <button type="button" onClick={() => { setPassword(generatePassword()); setShowPass(true) }} className="mb-1.5 text-[11px] font-semibold text-emerald-500 hover:underline">
                        {t('auth_suggest_pw')}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="su-pass"
                        type={showPass ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${inputCls} pr-16`}
                      />
                      <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted hover:text-main">
                        {showPass ? t('auth_hide') : t('auth_show')}
                      </button>
                    </div>

                    {/* Strength meter */}
                    {password && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                          <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${strength.percent}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-muted">{t('auth_strength')}: <span className="font-semibold text-main">{strength.label}</span></p>
                      </div>
                    )}

                    {/* Requirements */}
                    <ul className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                      {[
                        { ok: checks.length, label: t('auth_req_len') },
                        { ok: checks.upper, label: t('auth_req_upper') },
                        { ok: checks.lower, label: t('auth_req_lower') },
                        { ok: checks.number, label: t('auth_req_number') },
                      ].map((r) => (
                        <li key={r.label} className={r.ok ? 'text-emerald-500' : 'text-muted'}>
                          {r.ok ? '✓' : '○'} {r.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400 transition-colors disabled:opacity-60"
                  >
                    {busy ? '…' : `${t('auth_create')} →`}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-muted">
                  {t('auth_have_account')}{' '}
                  <button onClick={() => { setMode('signin'); setError('') }} className="font-semibold text-emerald-500 hover:underline">
                    {t('auth_tab_signin')}
                  </button>
                </p>
              </>
            )}

            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-[var(--border)]" />
              {t('login_or')}
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <button
              onClick={exploreDemo}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-main hover:border-emerald-500/50 transition-colors"
            >
              {t('login_demo')}
            </button>

            <p className="mt-5 text-[11px] leading-relaxed text-muted">🔒 {t('auth_security_note')}</p>
            {lang === 'rw' && <p className="mt-3 text-[11px] text-amber-500/90">⚠ {t('rw_draft_note')}</p>}
          </div>
        </div>
      </div>

      {welcome && (
        <WelcomeModal
          name={welcome.name}
          email={welcome.email}
          phone={welcome.phone}
          onClose={() => { setWelcome(null); routeAfterAuth() }}
          onGoToDashboard={() => { setWelcome(null); routeAfterAuth() }}
        />
      )}
    </div>
  )
}
