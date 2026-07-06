// Welcome-flow helpers: template filling for the branded email + SMS, plus the
// deep links the WelcomeModal uses (mailto / WhatsApp / sms). Pure + dependency-free.

import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_WHATSAPP,
  SUPPORT_EMAIL,
} from '../routes'

export const APP_URL = 'https://gridsense-ai-zeta.vercel.app'
export const DASHBOARD_URL = `${APP_URL}/`

export interface WelcomeVars {
  name: string
  email?: string
  appUrl?: string
}

/** Replace {name}, {appUrl}, {support}, {whatsapp}, {email} tokens in a template. */
export function fillTemplate(template: string, vars: WelcomeVars): string {
  const map: Record<string, string> = {
    name: vars.name || 'there',
    appUrl: vars.appUrl || APP_URL,
    dashboardUrl: DASHBOARD_URL,
    support: SUPPORT_PHONE_DISPLAY,
    whatsapp: SUPPORT_WHATSAPP,
    email: SUPPORT_EMAIL,
  }
  return template.replace(/\{(\w+)\}/g, (full, key: string) =>
    key in map ? map[key] : full,
  )
}

/** Friendly SMS / WhatsApp copy (kept under ~320 chars). */
export function welcomeSms(vars: WelcomeVars): string {
  const name = vars.name || 'there'
  return (
    `Welcome to GridSense AI, ${name}! Your account is ready. ` +
    `See your electricity cost across Rwanda's real RURA tariff (89/310/369 RWF/kWh), ` +
    `get tier-cliff alerts, and save. Open your dashboard: ${APP_URL} ` +
    `Help: ${SUPPORT_PHONE_DISPLAY}`
  )
}

/** Plain-text welcome email body (used as the mailto: body fallback). */
export function welcomeEmailText(vars: WelcomeVars): string {
  const name = vars.name || 'there'
  return [
    `Welcome to GridSense AI, ${name}!`,
    '',
    'Your account is ready. GridSense turns your prepaid electricity into clear,',
    "real-time, money-saving insight — on Rwanda's real RURA tariff.",
    '',
    'What you can do now:',
    '  • See your live cost across the 89 / 310 / 369 RWF/kWh tiers',
    '  • Get a tier-cliff alert before the next unit gets more expensive',
    '  • Forecast your month-end bill and find honest ways to save',
    '  • Landlords: bill each tenant the exact amount and get paid on time',
    '',
    `Open your dashboard: ${APP_URL}`,
    '',
    `Need help? Call/WhatsApp ${SUPPORT_PHONE_DISPLAY} or email ${SUPPORT_EMAIL}.`,
    '',
    'GridSense AI · Kigali, Rwanda',
    'You are receiving this because you created a GridSense AI account.',
  ].join('\n')
}

/** mailto: link that pre-fills the user's own mail app with the welcome email. */
export function mailtoLink(vars: WelcomeVars): string {
  const to = vars.email ? encodeURIComponent(vars.email) : ''
  const subject = encodeURIComponent(`Welcome to GridSense AI, ${vars.name || 'there'}!`)
  const body = encodeURIComponent(welcomeEmailText(vars))
  return `mailto:${to}?subject=${subject}&body=${body}`
}

/** WhatsApp deep link pre-filled with the SMS copy. `phone` digits only (no +). */
export function whatsappLink(vars: WelcomeVars & { phone?: string }): string {
  const digits = (vars.phone || '').replace(/[^\d]/g, '')
  const text = encodeURIComponent(welcomeSms(vars))
  return digits ? `https://wa.me/${digits}?text=${text}` : `${SUPPORT_WHATSAPP}?text=${text}`
}

/** sms: deep link pre-filled with the SMS copy. */
export function smsLink(vars: WelcomeVars & { phone?: string }): string {
  const phone = (vars.phone || '').replace(/[^\d+]/g, '')
  const text = encodeURIComponent(welcomeSms(vars))
  // `?&body=` is the most broadly compatible separator across iOS/Android.
  return `sms:${phone}?&body=${text}`
}
