# GridSense AI — Phase-1 Demo Dashboard

Live home-energy dashboard for Rwandan households. Shows whole-home power, live RWF cost across the **verified RURA tiers** (89 / 310 / 369 RWF/kWh, 1 Oct 2025), the signature **tier-cliff alert**, a month-end forecast, and a sourced appliance breakdown.

> **Honesty:** sensor data is **simulated** (clearly badged in-app). The **tariff math and appliance load model are real and sourced** — see `../appliance-load-data.md` and `../../01-research/research-findings.md`. The same app shows `source: live` the moment real ESP32 hardware POSTs to `/api/ingest` (contract in `src/lib/types.ts`).

## Stack
React 19 + Vite + TypeScript · Tailwind v4 · Recharts · Vitest. Deploys free on Vercel.

## Run locally
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build -> dist/
npm test          # 9 tariff unit tests (proves bills match capex-opex §4)
npm run test:e2e  # 5 Playwright journeys (builds + previews + drives the 4 screens + EN/RW)
```

## Quality (verified 2026-06-22)
- **Unit:** 9/9 passing — tariff engine output equals the sourced bills (100→29,530, 150→47,980, 200→66,430 RWF).
- **E2E (Playwright):** 5/5 passing — Live Now, This Month, Appliances, Save, and the EN↔Kinyarwanda toggle.
- **Lighthouse (mobile):** Accessibility 100 · Best Practices 100 · SEO 100 · Agentic Browsing 100.
- **Perf note:** main JS bundle ~563 kB (gzip ~169 kB) — Recharts is the bulk. Fine for a demo; code-split or swap to a lighter chart lib if perf budgets tighten.

## Project map
- `src/lib/tariff.ts` — pure, tested tariff engine (verified RURA tiers, cliff logic, forecast).
- `src/lib/tariff.test.ts` — cross-checks against the sourced bills (100→29,530 RWF, etc.).
- `src/lib/simulation.ts` — whole-home load sim from the sourced Kigali appliance model.
- `src/lib/types.ts` — the ESP32/smart-plug **ingestion contract** (simulated→live swap point).
- `src/App.tsx` — the "Live Now" screen.

## Auth & welcome messaging (Auth v2)
Sign up collects name, email, Rwanda phone, an editable username (auto-suggested + uniqueness-checked), and a password (with a "Suggest strong password" generator + live strength meter). Passwords are hashed with Web Crypto (`SHA-256` over a random salt + password) and stored in `localStorage('gridsense_accounts')` — **never in plaintext**. Sign in resolves a single field against username / email / phone. The guest **"Explore the demo"** button still works with no password. *Demo accounts live in the browser; production uses a managed auth backend.*

On sign-up a **WelcomeModal** offers one-tap "send to me" via the user's own email (`mailto:`), WhatsApp (`wa.me`), and SMS (`sms:`), and the client fires `POST /api/welcome` (fire-and-forget).

### Environment variables (server-side welcome email/SMS)
`api/welcome.ts` is a Vercel serverless function. With **no env vars set it returns `{ sent:false, reason:'no provider configured' }` and never errors** — the static build is unaffected. Set these on Vercel (Project → Settings → Environment Variables) and welcome messages send automatically:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend HTTP API key — enables the real welcome **email**. |
| `RESEND_FROM` | Verified from-address, e.g. `GridSense AI <welcome@gridsense.rw>` (optional; defaults to `onboarding@resend.dev`). |
| `SMS_API_URL` | Generic SMS gateway endpoint (receives `POST {to, message}`). |
| `SMS_API_KEY` | Bearer token for the SMS gateway. |

Branded templates live in `../templates/welcome-email.html` and `../templates/welcome-sms.txt`; the in-app templating helper is `src/lib/welcome.ts`.

## Deploy to Vercel (one-time, Tesi-triggered — needs your login)
Vercel deploy requires authentication, so run it yourself:
```bash
npm i -g vercel
vercel login          # opens browser / emails a code
vercel --prod         # from this dashboard/ folder; accept the Vite defaults
```
Or, easier: push the repo to GitHub and **import it on vercel.com** → set the **Root Directory** to `05-build/dashboard` → it auto-detects Vite and deploys on every push. Build command `npm run build`, output `dist`.

## Next build steps (per ../dashboard-build-plan.md)
This-Month + Appliances + Save screens · EN/RW i18n + honesty toggle · Playwright journeys · Lighthouse pass · ground appliance ownership % from the Columbia QSEL studies to weight scenarios.
