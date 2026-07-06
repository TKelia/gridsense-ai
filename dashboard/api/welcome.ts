// Vercel serverless function — sends the welcome email + SMS when a provider is
// configured via env vars; otherwise returns {sent:false} WITHOUT erroring.
//
// Env (all optional — set on Vercel to "just work"):
//   RESEND_API_KEY    Resend HTTP API key (email)
//   RESEND_FROM       Verified from-address, e.g. "GridSense AI <welcome@gridsense.rw>"
//   SMS_API_URL       Generic SMS gateway endpoint (POST JSON {to, message})
//   SMS_API_KEY       Bearer token for the SMS gateway
//
// This file is intentionally framework-light (web Request/Response) and lives
// outside src/, so it never affects the static Vite build.

// Run on Vercel's Edge runtime: this handler uses the web-standard
// (Request) => Response signature, which the Node runtime does not serve
// (it expects (req, res)). Edge supports fetch + process.env for the keys below.
export const config = { runtime: 'nodejs' }

interface WelcomeBody {
  name?: string
  email?: string
  phone?: string
}

const APP_URL = 'https://gridsense-ai-zeta.vercel.app'
const SUPPORT = '+250 783 619 522'

function emailHtml(name: string): string {
  const safeName = escapeHtml(name || 'there')
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" style="padding:24px 0;background:#f1f5f9;"><tr><td align="center">
  <table role="presentation" width="600" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;">
  <tr><td style="height:6px;background:linear-gradient(90deg,#34d399,#06b6d4);font-size:0;">&nbsp;</td></tr>
  <tr><td style="padding:32px 40px;">
  <div style="font-size:18px;font-weight:700;">GridSense AI</div>
  <h1 style="margin:16px 0 0;font-size:24px;font-weight:800;">Welcome to GridSense AI, ${safeName}! 🎉</h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#475569;">Your account is ready. GridSense turns your prepaid electricity into clear, real-time, money-saving insight — on Rwanda's real RURA tariff (89 / 310 / 369 RWF/kWh).</p>
  <ul style="margin:16px 0 0;padding-left:20px;font-size:14px;line-height:1.7;color:#334155;">
  <li>See your live cost across the tiers</li>
  <li>Get a tier-cliff alert before the next unit costs more</li>
  <li>Forecast your month-end bill and find ways to save</li>
  <li>Landlords: bill each tenant the exact amount</li></ul>
  <p style="margin:24px 0 0;"><a href="${APP_URL}" style="display:inline-block;background:linear-gradient(90deg,#34d399,#06b6d4);color:#06281f;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:12px;">Open my dashboard →</a></p>
  <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">Need help? Call/WhatsApp ${SUPPORT}. GridSense AI · Kigali, Rwanda. You're receiving this because you created an account.</p>
  </td></tr></table></td></tr></table></body></html>`
}

function smsText(name: string): string {
  return `Welcome to GridSense AI, ${name || 'there'}! Your account is ready. See your electricity cost across Rwanda's real RURA tariff (89/310/369 RWF/kWh), get tier-cliff alerts, and save. Open: ${APP_URL} Help: ${SUPPORT}`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
}

async function sendEmail(to: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return { ok: false, error: 'no_email_provider' }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'GridSense AI <onboarding@resend.dev>',
        to: [to],
        subject: `Welcome to GridSense AI, ${name || 'there'}!`,
        html: emailHtml(name),
      }),
    })
    return res.ok ? { ok: true } : { ok: false, error: `resend_${res.status}` }
  } catch {
    return { ok: false, error: 'resend_request_failed' }
  }
}

async function sendSms(to: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.SMS_API_URL
  const key = process.env.SMS_API_KEY
  if (!url || !key || !to) return { ok: false, error: 'no_sms_provider' }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message: smsText(name) }),
    })
    return res.ok ? { ok: true } : { ok: false, error: `sms_${res.status}` }
  } catch {
    return { ok: false, error: 'sms_request_failed' }
  }
}

async function handler(req: Request): Promise<Response> {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })

  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405)

  let body: WelcomeBody = {}
  try {
    body = (await req.json()) as WelcomeBody
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400)
  }

  const name = (body.name || '').toString().slice(0, 80)
  const email = (body.email || '').toString().trim()
  const phone = (body.phone || '').toString().trim()

  const hasEmailProvider = Boolean(process.env.RESEND_API_KEY)
  const hasSmsProvider = Boolean(process.env.SMS_API_URL && process.env.SMS_API_KEY)

  // No provider configured: succeed honestly without sending.
  if (!hasEmailProvider && !hasSmsProvider) {
    return json({ sent: false, reason: 'no provider configured' })
  }

  const [emailResult, smsResult] = await Promise.all([
    hasEmailProvider ? sendEmail(email, name) : Promise.resolve({ ok: false, error: 'no_email_provider' }),
    hasSmsProvider ? sendSms(phone, name) : Promise.resolve({ ok: false, error: 'no_sms_provider' }),
  ])

  return json({
    sent: emailResult.ok || smsResult.ok,
    email: emailResult,
    sms: smsResult,
  })
}


export default { fetch: handler }
