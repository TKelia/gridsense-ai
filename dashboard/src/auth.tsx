import { createContext, useContext, useState, type ReactNode } from 'react'

/** The signed-in session user. Backwards-compatible with the original {name,email}
 *  shape; `username` and `phone` are optional so existing stored sessions still load. */
export interface User {
  name: string
  email: string
  username?: string
  phone?: string
}

/** A locally-stored account. The password is never stored in plaintext — only a
 *  SHA-256 hash of (salt + password) via Web Crypto. */
export interface Account {
  username: string
  name: string
  email: string
  phone: string
  passHash: string
  salt: string
  createdAt: string
}

interface AuthCtx {
  user: User | null
  signIn: (u: User) => void
  signOut: () => void
}

const Ctx = createContext<AuthCtx | null>(null)
const KEY = 'gridsense_user'
const ACCOUNTS_KEY = 'gridsense_accounts'

/* ------------------------------------------------------------------ *
 * Account store (localStorage) + Web Crypto password hashing.
 * These are pure helpers so screens (Login/Signup) can share them.
 * ------------------------------------------------------------------ */

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Account[]) : []
  } catch {
    return []
  }
}

function saveAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    /* storage unavailable — sign-up still completes in-memory for this session */
  }
}

/** Random salt as a hex string (Web Crypto, falls back to Math.random). */
export function makeSalt(): string {
  try {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

/** SHA-256 hex digest of (salt + password) using Web Crypto. */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

const norm = (s: string) => s.trim().toLowerCase()

export function findAccount(identifier: string): Account | undefined {
  const id = norm(identifier)
  if (!id) return undefined
  return loadAccounts().find(
    (a) => norm(a.username) === id || norm(a.email) === id || norm(a.phone) === id,
  )
}

export function usernameTaken(username: string): boolean {
  const u = norm(username)
  return loadAccounts().some((a) => norm(a.username) === u)
}

export function emailTaken(email: string): boolean {
  const e = norm(email)
  if (!e) return false
  return loadAccounts().some((a) => norm(a.email) === e)
}

export interface NewAccountInput {
  username: string
  name: string
  email: string
  phone: string
  password: string
}

/** Create + persist a new account (hashing the password). Returns the session User. */
export async function createAccount(input: NewAccountInput): Promise<User> {
  const salt = makeSalt()
  const passHash = await hashPassword(input.password, salt)
  const account: Account = {
    username: input.username.trim(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    passHash,
    salt,
    createdAt: new Date().toISOString(),
  }
  const accounts = loadAccounts()
  accounts.push(account)
  saveAccounts(accounts)
  return { name: account.name, email: account.email, username: account.username, phone: account.phone }
}

/** Verify an identifier + password against the local accounts. */
export async function verifyCredentials(
  identifier: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; reason: 'not_found' | 'bad_password' }> {
  const account = findAccount(identifier)
  if (!account) return { ok: false, reason: 'not_found' }
  const hash = await hashPassword(password, account.salt)
  if (hash !== account.passHash) return { ok: false, reason: 'bad_password' }
  return {
    ok: true,
    user: { name: account.name, email: account.email, username: account.username, phone: account.phone },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })

  const signIn = (u: User) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(u))
    } catch {
      /* storage unavailable — keep in-memory only */
    }
    setUser(u)
  }

  const signOut = () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setUser(null)
  }

  return <Ctx.Provider value={{ user, signIn, signOut }}>{children}</Ctx.Provider>
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
