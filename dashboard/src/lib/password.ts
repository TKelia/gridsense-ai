// Password strength + generator and Rwanda phone helpers. Pure, dependency-free.

export interface PasswordChecks {
  length: boolean
  upper: boolean
  lower: boolean
  number: boolean
}

export function checkPassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  }
}

/** Minimum bar to allow sign-up: 8+ chars, upper, lower, number. */
export function passwordMeetsMinimum(pw: string): boolean {
  const c = checkPassword(pw)
  return c.length && c.upper && c.lower && c.number
}

export type StrengthLevel = 0 | 1 | 2 | 3 | 4
export interface Strength {
  score: StrengthLevel
  label: string
  /** 0–100 for the meter width. */
  percent: number
}

/** A lightweight strength score (0–4) based on length, classes, and symbols. */
export function passwordStrength(pw: string): Strength {
  if (!pw) return { score: 0, label: 'Empty', percent: 0 }
  let score = 0
  const c = checkPassword(pw)
  if (c.length) score++
  if (pw.length >= 12) score++
  if (c.upper && c.lower) score++
  if (c.number) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  // Cap at 4 and clamp to a label.
  const clamped = Math.min(score, 4) as StrengthLevel
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score: clamped, label: labels[clamped], percent: (clamped / 4) * 100 }
}

/** Cryptographically-random strong password (default 16 chars, all classes). */
export function generatePassword(length = 16): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%^&*?-_'
  const all = upper + lower + digits + symbols
  const pick = (set: string) => set[randomIndex(set.length)]
  // Guarantee at least one of each class, then fill the rest.
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  for (let i = chars.length; i < length; i++) chars.push(all[randomIndex(all.length)])
  // Fisher–Yates shuffle so the guaranteed chars aren't always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

function randomIndex(max: number): number {
  try {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    return arr[0] % max
  } catch {
    return Math.floor(Math.random() * max)
  }
}

/* ---------------------- Rwanda phone helpers ---------------------- */

/** Normalize a Rwanda mobile number to +250XXXXXXXXX where possible. */
export function formatRwandaPhone(input: string): string {
  let digits = input.replace(/[^\d+]/g, '')
  if (digits.startsWith('+250')) return '+250' + digits.slice(4).replace(/\D/g, '')
  digits = digits.replace(/\D/g, '')
  if (digits.startsWith('250')) return '+' + digits
  if (digits.startsWith('07') && digits.length >= 10) return '+250' + digits.slice(1)
  if (digits.startsWith('7') && digits.length >= 9) return '+250' + digits
  return input.trim()
}

/** Loose validity check for a Rwandan mobile (+250 7XXXXXXXX). */
export function isValidRwandaPhone(input: string): boolean {
  const f = formatRwandaPhone(input)
  return /^\+2507\d{8}$/.test(f)
}

/* ---------------------- username suggestion ---------------------- */

/** Suggest a clean username from a name or email (lowercase, alnum + dot). */
export function suggestUsername(name: string, email: string): string {
  const fromName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  if (fromName) return fromName.slice(0, 20)
  const local = (email.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9.]+/g, '')
  return local.slice(0, 20)
}
