# PROJECT-REPORT.md — GridSense AI Living Log

> The project's memory. **Read this first every session. Update it after every work block.**
> Newest entries at the top. Each entry: date · what was done · decisions · changes · new open questions.

---

## 2026-06-22 — Blockchain pivot: stress-test + Fable master prompt (Cowork)

**Context:** Tesi wants to add **verifiable, tamper-proof monthly reports** via blockchain smart contracts, and a master prompt to run in a new Cowork/Fable-5 task (which then emits a Claude Code prompt).

**Channel (killed vs kept):** killed on-chain personal/energy data, tokens/coins/payments, franc-pegged assets, user wallets, "web3 for its own sake." Kept: anchor only the report **SHA-256 hash + IPFS CID** (data stays private off-chain), **gasless** (relayer signs — no user wallets), on a **free public testnet** (Base Sepolia). Value = distributed-ledger **notarization** (integrity/timestamp), not currency.

**Locked decisions (Tesi):** hash + IPFS · public testnet (free) · gasless/no-wallet · Fable task will research + restructure + **build a PoC contract** + emit the Claude Code prompt.

**Verified live (2026, cited):**
- **Rwanda Law N° 023/2026** on virtual assets (gazetted 28 May 2026): VA not legal tender; VASP businesses need a **CMA** licence; **tokens/franc-pegged/mining/mixers restricted** → GridSense design uses **no token/payment** = not a regulated VASP (strong defensibility point). Sources: allAfrica, Mondaq, BitcoinKE.
- **Base Sepolia** (OP-stack L2, ~2s blocks, faucets, BaseScan) = primary testnet; Polygon Amoy fallback.
- **Pinata** free ~1 GB + mature SDK for IPFS; Filebase alt.
- **Gasless** = backend relayer signer (free test-gas) for PoC; ERC-4337/Coinbase Paymaster for production.
- On-chain must exclude personal data (Law 058/2021, right to erasure).

**Deliverable:** `07-blockchain/FABLE-MASTER-PROMPT.md` — the detailed, classified master prompt (rules, read-repo, locked decisions, verified context + sources, Phase A research → Phase B restructure → Phase C build+deploy PoC recorded step-by-step → Phase D emit Claude Code prompt; guardrails). Presented to Tesi to run in a new Fable-5 task.

**Next action** → Tesi opens a new Cowork task on **Fable 5**, pastes `07-blockchain/FABLE-MASTER-PROMPT.md`, runs it; it produces `07-blockchain/CLAUDE-CODE-PROMPT.md` for the live-app integration.

---

## 2026-06-22 — Premium 90s explainer video (Cowork)

**Done**
- Built **`06-pitch/GridSense-AI-Explainer.mp4`** — a premium ~**1:29** explainer (1280×720, 30fps): 12 designed motion-graphics scenes rendered crisp from SVG via resvg (brand logo, icons, shapes, the 89/310/369 tier chart, a payback bar chart, and real framed dashboard screenshots), assembled with ffmpeg (clean fade transitions) + on-screen captions. Scenes: intro → tiered-tariff problem → prepaid blind spot → the insight → solution/architecture → Live Now → Save → Landlords → the math (payback) → bilingual+trust → platform/pricing → close (logo + live URL). Verified (duration + frames eyeballed).
- Saved the **voiceover script** to `06-pitch/explainer-narration.txt` (per-scene, timed) for self-recording or future TTS.

**Voice:** attempted premium TTS (Higgsfield/ElevenLabs preset voice) — the audio workspace is **out of credits**, so no AI voice was added (per Tesi's "don't add a poor voice" guidance). To add a real VO later: top up audio credits (or an ElevenLabs/Resend-style key) and mux, or Tesi records the saved script.

---

## 2026-06-22 — Nav cleanup + DOCX + updated PPTX (Cowork)

**Done**
- **Navigation cleaned** (it was cramped/wrapping — "How / to / use", "Sign / out"): trimmed primary nav to 5 items, consolidated theme/lang/workspace/user/sign-out into one account menu, dropped the global Share (kept on the dashboard), `whitespace-nowrap` everywhere, mobile hamburger. tsc clean → redeployed live.
- **DOCX**: `06-pitch/GridSense-Master-Brief.docx` generated from the Master Brief (validated, 129 paragraphs) — a shareable Word version of the founder brief.
- **PPTX updated**: `06-pitch/GridSense-AI-Defense-Deck.pptx` rebuilt to **20 slides** — real logo on the title, live URL in every footer, and **3 new platform slides** (One platform–three customers; Landlords bill fairly; Plans & pricing). Rendered to PDF + eyeballed (title + landlord slide correct). Re-runnable via `build_deck.py`; Word via `build_brief_docx.js`.

**Honest status — real email/SMS:** Cowork has **no email/SMS send tool** available (only Klaviyo, tied to the user's other brands → not used). Automatic welcome email/SMS still needs a provider (**Resend** email + **Twilio/Africa's Talking** SMS) set on Vercel, or the in-app deep links. Not faked.

**Only Tesi:** revoke the temporary Vercel token; add provider keys for real auto-send; finalize Kinyarwanda strings.

---

## 2026-06-22 — AUTH v2 + Welcome + SEO build landed, validated to 9.4/10, /api fixed + redeployed (Claude Code)

**Context:** Ran the "validate & enhance to 9.9/10" prompt. Discovered a **concurrent build process** was actively writing the same files mid-session (verified by mtime sequence 05:02→05:09); per Tesi's call, I let it finish to avoid corrupting source, then did independent verification + the leftover fixes. I made **no edits** during the build.

**Verified live (Rule 1) — re-confirmed against PRIMARY sources this session**
- Tariff **89/310/369** residential + **355/376** non-residential, effective 1 Oct 2025, **VAT-exclusive** — REG tariffs page + RURA public-notice PDF + REG FAQs.
- **~99.7% prepaid** — REG FAQ financials (1,267,702 prepaid / 1,270,965 total = 99.74%).
- **84.6%** electricity access (REG access page, end-July 2025; a newer **85.4%** Dec-2025 figure is also live). **Law 058/2021** + **NCSA** supervisory authority (cyber.gov.rw + dpo.gov.rw). Tenancy: 2006 law, ≥1-month rent-increase notice, tenant privacy (lawzana/generisonline, Rwanda-specific).
- **All 5 reference links resolve HTTP 200** (Firecrawl/curl): REG tariffs, RURA, RwandaLII Law 058/2021, NCSA (cyber.gov.rw), Data Protection Office (dpo.gov.rw). NOTE corrected: NCSA is at **cyber.gov.rw** (not ncsa.gov.rw); the ktpress secondary article still shows the *old* 212/249 — repo correctly uses the authoritative figures.

**What the build delivered (reviewed + verified by me, all in `05-build/dashboard`)**
- **AUTH v2:** signup with name/email/phone (auto-normalized to +250) + **username** (auto-suggested, live uniqueness check) + **password** (strong-password generator, live strength meter, requirement checklist); login by **username / phone / email** + password. Passwords hashed with **Web Crypto (salted SHA-256), never plaintext**; accounts in `localStorage` for the demo, with an honest "production uses a managed auth backend" note. **Guest "Explore the demo" path preserved** → e2e stays green. (`src/auth.tsx`, `src/lib/password.ts`, `src/screens/Login.tsx`.)
- **Welcome email + SMS:** branded HTML email + SMS copy in `05-build/templates/`; in-app `WelcomeModal` with one-tap **mailto / WhatsApp / SMS deep links**; **`api/welcome.ts`** Vercel function that sends via Resend (email) + a generic SMS gateway when env keys are present and **honestly no-ops** to `{sent:false,"no provider configured"}` without them. (`src/lib/welcome.ts`, `src/components/WelcomeModal.tsx`.)
- **References:** "Official sources & references" on Support + About + footer SOURCES column (`src/components/Sources.tsx`, `OFFICIAL_SOURCES` in `src/routes.ts`).
- **SEO / who-we-are:** Organization + SoftwareApplication **JSON-LD**, keywords meta, **sitemap.xml** (real `application/xml`), robots.txt, canonical, OG/Twitter; "What is GridSense AI? / GridSense AI ni iki?" blocks on Home + About (EN + RW).

**Independent validation results**
- **Build health:** `tsc -b` clean · **vitest 9/9** (tariff.ts untouched) · clean tsc also proves RW has every new i18n key (type-enforced).
- **Live (Playwright + Chrome DevTools) on the redeployed site:** Home, auth (signup→account→welcome→workspace), Support (references + footer), Dashboard (tariff math, tier-cliff, gauge, honesty badge), mobile, light/dark, EN/RW — all render, **0 console errors** (one benign Recharts container-size warning). **Lighthouse mobile: Accessibility 100 · Best Practices 100 · SEO 100 · Agentic 100** (performance not separately re-scored — Recharts bundle is the known weight).

**Bug found + fixed by me:** `/api/welcome` was **hanging (HTTP 000, 30s timeout)** — the web `(Request)→Response` handler needs Vercel's **Edge runtime**. Added `export const config = { runtime: 'edge' }` to `api/welcome.ts` and **redeployed to production** (`vercel --prod`, authed as shailo1 → aliased to gridsense-ai-zeta.vercel.app). Now returns `{"sent":false,"reason":"no provider configured"}` in <1s — correct, honest no-op until keys are added.

**Scorecard: ~9.4/10** (Facts 10 · AUTH 9.5 · Welcome 8 → 10 after fix is keyed · References 10 · SEO 10 · UX/a11y 9.5 · Build 10). Minor open items: single-round SHA-256 (vs PBKDF2); marketing long-form prose is EN-only by the documented Rule-1 decision; performance not re-scored.

**Real email/SMS delivery (honest):** the app is integration-ready but **sends nothing without provider keys** — I will not fake "sent". To actually deliver, Tesi must add **RESEND_API_KEY (+ verified domain for arbitrary recipients)** for email and a **paid SMS gateway** (Twilio trial with verified numbers / Africa's Talking) for SMS; then I wire the Vercel env vars + redeploy + trigger a real send. Working-today alternative: the pre-filled mailto/WhatsApp/SMS deep links (sender-initiated, real delivery, no backend).

**Only Tesi can do:** (1) create + paste a Resend key (+ verify a domain) and an SMS-gateway key to make Welcome auto-send for real; (2) **revoke the temporary Vercel token** (vercel.com/account/tokens; expires 23 Jun); (3) finalize RW long-form strings if desired.

**Next action** → Tesi: tap the deep links to send the two welcomes now, OR paste a Resend key (+ SMS choice) and I wire/redeploy/send a real test to shiloolier8@gmail.com + tsongakelia@gmail.com. Capstone build is submit- and implement-ready at the live URL.

---

## 2026-06-22 — Multi-tier PLATFORM expansion + brand + master brief (Cowork)

**Context:** Expand GridSense from a personal app into a platform: landlord/property billing, subscriptions, device tiers, premium identity, exact REG calc, verified laws/links.

**Verified this session (Rule 1)**
- **Electricity is VAT-exempt in Rwanda** → consumer pays the block rates (89/310/369); our calc is exact. **Non-residential = 355/376 RWF/kWh** (strengthens SME/landlord case). Landlord-tenant law: tenancy law (2006) + 2018 civil-procedure law; tenant right to privacy; ≥1 month notice for rent increase. Sources in `02-strategy/platform-expansion.md`.

**Built & deployed (live: https://gridsense-ai-zeta.vercel.app)**
- **Channel + strategy** → `02-strategy/platform-expansion.md` (tiers, pricing, real-vs-demo, killed ideas: no fake card charges / no fake auto-SMS — used integration-ready checkout + WhatsApp/SMS/email deep links + .ics reminders).
- **Brand:** custom logo + favicon + icon set + social card (`public/favicon.svg`, icon-192/512, apple-touch, og.png) rendered via resvg; wired into the app + meta.
- **Landlord/Property workspace:** properties → units → tenants; per-tenant **exact bill** (tariff engine; residential blocks + non-res 355); printable **Invoice/Receipt/Consumption Report**; **Send** via WhatsApp/SMS/email; **payment reminders** as **.ics** (5/3/2/1 days, morning, 12:00 due); portfolio overview.
- **Monetization:** Pricing (Home free; Landlord Starter/Growth; Enterprise) + cart + **checkout (demo, no card charged, provider-ready)** + **device tiers** page.
- **Workspaces:** Home / Property / Enterprise chooser after real sign-in; guest demo path preserved.
- **Legal pages updated** with verified facts (VAT-exempt; tenancy law; Law 058/2021 + NCSA; "estimates, not an official bill — REG/EUCL is the authority").
- **Quality:** tsc clean, vite build clean, **9/9 unit tests**, source NUL-clean (verified from the mount); redeployed to Vercel.
- **Master brief:** `06-pitch/GridSense-Master-Brief.md` — first-person "what it is / root & architecture / data path / sources / how I built it / how I present & win / Q&A". The backbone + source for the DOCX.
- **Claude Code prompt:** `06-pitch/CLAUDE-CODE-VALIDATE-AND-ENHANCE.md` — validate (verify facts/links + live Playwright/Lighthouse), add **auth v2** (username + password + login by username/phone/email + strong-password gen, Web Crypto hash), **welcome email + SMS** (templates + in-app + optional `/api/welcome` serverless), **reference links**, **who-we-are + SEO/JSON-LD**, refine to 9.9/10, redeploy, update report + brief.

**Next action** → Tesi: run the Claude Code prompt (does auth/welcome/validation → 9.9/10 + redeploy). THEN back in Cowork say "make the docx and the updated pptx" → Claude generates the Word doc (from the Master Brief) + refreshed PPTX from the final state. Also: revoke the temporary Vercel token.

---

## 2026-06-22 — Premium multi-page upgrade → redeployed live (Cowork)

**Done** (built via a focused build agent, then independently verified + deployed by Claude)
- **Dark/light theme**: token-based (`src/theme.tsx` + CSS vars in `index.css`), toggle in the top bar, persisted. Verified both themes look premium live.
- **Household setup → personalization** (`src/pages/Setup.tsx` + `src/household.tsx`): users pick home type, occupants, owned appliances + hours/day; a live kWh/RWF preview uses the real tariff engine; the dashboard then reflects THEIR home. Guest "Explore the demo" keeps the full sourced catalog (so the 59 kWh water-heater + cliff demo and e2e stay intact).
- **Multi-page shell + content pages**: `Home` (marketing landing), `About`, `HowToUse`, `Support` (Call/SMS/WhatsApp **+250 783 619 522**, hours, FAQ), `Terms`, `Privacy/Legal` — with a premium TopBar (nav, theme, EN/RW, Share, user/sign-out) + Footer, state-based routing, auth guard.
- **Share + Save**: Share (Web Share/copy link) in TopBar + Dashboard; household profile persists; "Save / print summary" on the dashboard.
- **Quality**: `tsc -b` clean, `vite build` succeeds, **9/9 unit tests pass** (verified from the workspace, no NUL corruption). e2e updated for the new shell (Home → Get started → Explore the demo → dashboard), tariff/59 kWh assertions preserved.
- **Redeployed** to Vercel → **https://gridsense-ai-zeta.vercel.app** (built on Vercel in 17s). Verified live: Home, theme toggle (light mode clean), Dashboard intact, Support page shows the phone number.

**Notes/flags**
- Content-page bodies are English; short UI labels are bilingual (RW long-form legal text intentionally not fabricated — Rule 1).
- `src/assets/hero.png` (unused) was replaced with a 1×1 placeholder during the agent's NUL-cleanup; Home uses CSS gradients, so no visual impact.
- ⚠️ The temporary `gridsense` Vercel token still worked at deploy time — **Tesi: revoke it now** (vercel.com/account/tokens).

**Next action** → Tesi: revoke the token; (optional) review/finalize RW strings; record a fresh live screen-capture for the demo video if desired.

---

## 2026-06-22 — 🚀 DEPLOYED LIVE (Cowork)

**Done**
- Diagnosed the failed GitHub→Vercel import: the web upload to `github.com/shailo1/gridsense-ai` omitted the `src/`, `public/`, `e2e/` folders → `tsc` had no inputs (`TS18003`).
- Deployed the **complete** project via Vercel CLI from the sandbox using Tesi's token (project `shailo2/gridsense-ai`). Tesi independently deployed the same project from PowerShell (local build clean, 591 modules). Both converged on the same canonical alias.
- **LIVE URL: https://gridsense-ai-zeta.vercel.app** — verified in-browser: premium login renders, "Explore the demo" → full dashboard (live power, tier-cliff alert, tier gauge, chart, movers), EN/RW toggle, sign-out all working.

**Security/cleanup**
- ⚠️ **Revoke the temporary `gridsense` Vercel token** (vercel.com/account/tokens) — deploy is done; token expires 23 Jun anyway.
- `.env.local` was auto-created locally by `vercel` (gitignored, harmless).

**Next action** → Tesi: submit the live URL; revoke the token; finalize Kinyarwanda strings in `src/i18n/strings.ts` (redeploy is automatic on git push, or re-run `vercel --prod`).

---

## 2026-06-22 — Premium login + demo video + deploy prep (Cowork)

**Context:** Tesi wants a premium, easy-to-use **deployed link with login** + a **demo video**, and asked Claude to do the deploy "really well."

**Done**
- **Added a premium login / landing screen** to the dashboard (`05-build/dashboard`): new `src/auth.tsx` (client-side auth, persists to localStorage) + `src/screens/Login.tsx` (split-panel brand story + sign-in card, email/name or "Explore the demo", bilingual EN/RW). Wired via `main.tsx` (AuthProvider) and `App.tsx` (login gate + personalized greeting + sign-out). Added i18n keys (EN + RW). Updated `e2e/journeys.spec.ts` with a sign-in `beforeEach`.
- **Verified:** `tsc -b` clean, `vite build` succeeds (built to /tmp due to a mount-permission quirk on the old Windows `dist`), **9/9 unit tests pass**. ⚠️ Playwright **e2e not executed in-sandbox** (no browser binary available here) — tests are updated and will run on a machine/CI with a browser; Vercel build is unaffected.
- **Produced a real demo video:** `06-pitch/GridSense-AI-Demo.mp4` (33s, 1280×720). Built with ImageMagick title/section cards + the actual dashboard screenshots, stitched with ffmpeg (fade transitions). Sequence: intro → tiered-tariff problem → login → Live Now → This Month → Appliances → Save → Kinyarwanda → outro. Frames eyeballed for correctness.
- **Deployment prepared:** added `05-build/dashboard/vercel.json` (Vite + SPA rewrite) and `06-pitch/DEPLOY-NOW.md` (3 paths: GitHub→Vercel easiest, CLI, or token-based deploy-from-here).

**Honest limits (cannot do for Tesi):** the actual publish needs **Tesi's Vercel account** (login or a token) — can't impersonate. Browser-based e2e + a live screen-capture of the *new* login couldn't run in this sandbox (no browser).

**Next action** → Tesi runs **DEPLOY-NOW.md Path A** (GitHub→Vercel) to get the live URL, OR pastes a Vercel token for Claude to deploy. Then: finalize RW strings; record/swap a live screen-capture into the demo video if desired.

---

## 2026-06-22 — Validation pass + Capstone Submission Report (Cowork)

**Context:** Tesi confirmed dates — **final product/solution submission 25 June 2026**; **panel defense last week of July 2026**. Asked for the package to be "full, ready, validated" with deeper research (studies, reviews, user experiences, news). Ran the Channel.

**Done**
- **Closed the #1 open gap (savings %)** with cited literature: Darby 2006 (direct feedback 5–15%), ACEEE/Ehrhardt-Martinez (avg ~9.2%), Faruqui (3–13%), ~3–5% large-scale floor, and **Jack & Smith ~14% from prepaid salience** — directly relevant since Rwanda is ~99.7% prepaid. Payback now anchored at a conservative 10% (5–15% sensitivity).
- **Confirmed the tariff against the PRIMARY REG source** (89/310/369 residential) — caught and disregarded a secondary article's misreported 212/249. Added **non-residential 355/376 RWF/kWh**, which strengthens the SME/landlord beachhead.
- **Validated Wi-Fi-only** for the urban beachhead (urban internet ~57%, 4G ~100%; national smartphone ~34% confirms GSM/SMS needed for Phase-2 mass market).
- Captured **user-experience evidence** (Sense slow ML detection; Emporia clunky app/wiring) validating our clean-UX + honest-AI choices.
- Wrote **`01-research/evidence-and-validation.md`**; updated `research-findings.md` open questions.
- Built the **complete written Capstone Submission Report**: `06-pitch/GridSense-AI-Capstone-Report.docx` (re-gen via `build_report.js`). 11 sections + exec summary + references; validated (241 paragraphs, all checks passed) and visually rendered/eyeballed.

**New open item:** ⚠️ Confirm VAT/regulatory-fee treatment of residential electricity (REG rates are VAT-exclusive). If added to bills, real savings are higher — our payback stays conservative.

**Only Tesi can do (for 25 June):** (1) confirm the exact submission format the ALU portal expects; (2) deploy dashboard to Vercel; (3) finalize Kinyarwanda strings; (4) eyeball the report + deck.

**Next action** → Tesi confirms submission format + does the 4 items above; Claude adapts the report (PDF/slides/video script) if the rubric needs a different form.

---

## 2026-06-22 — Capstone defense deck → PPTX generated (Claude Code)

**Done**
- Generated a polished **17-slide PowerPoint** at `06-pitch/GridSense-AI-Defense-Deck.pptx` via `python-pptx` (builder script `06-pitch/build_deck.py`, re-runnable).
- Design: dark theme matching the app (#0B0F17 + emerald), accent title bars, a tier-bar visual (89/310/369), styled dark tables (BOM, payback, risks, Q&A), and the **real dashboard screenshots embedded** on the demo slide — English + Kinyarwanda side-by-side.
- **Full speaker notes embedded in each slide's notes pane** (presenter view ready). On-slide text kept concise; every figure sourced.
- Verified structurally: 17 slides, **0 shapes overflow the canvas**, 2 images on the demo slide, tables intact. (Could not pixel-render — no LibreOffice; Tesi to eyeball on open.)
- **Added (2nd pass):** Slide 7 now has a 4-node **architecture flow diagram** (Sensors → ESP32 → Cloud /api/ingest → Dashboard, with arrows + the "same JSON contract" caption); Slide 9 now has a native **PowerPoint payback column chart** (Core vs Full kit at 10/15/20% savings, data labels, on a light card) replacing the table, with key-number callouts beside it. Re-verified: 0 overflow, chart embedded, nodes evenly spaced.

**Next action** → **Tesi: open `06-pitch/GridSense-AI-Defense-Deck.pptx`**, skim for visual taste, tweak in PowerPoint. To regenerate after editing the script/data: `python 06-pitch/build_deck.py`. Still pending overall: finalize RW strings + Vercel deploy.

---

## 2026-06-22 — Capstone defense deck script (Claude Code)

**Done**
- Ran the Channel on deck approach → chose **script-first** (tool-agnostic markdown source of truth) over auto-generating pretty-but-hollow slides.
- Wrote `06-pitch/defense-deck.md`: **16 slides + Q&A defense appendix**, every number traced to a verified repo source, structured to pre-empt the `02-strategy §E` attack list. Includes per-slide speaker notes, the live-demo centerpiece (Slide 5), an honest Risks slide, the 9-question Q&A defense (mapped to slides), a sources handout list, and a presenter checklist.

**Decisions** — deck = script-first; visuals (Gamma/Canva/PowerPoint) built from the script next, Tesi's choice of tool.

**Next action** → **Tesi: choose the visual tool** — I can auto-generate the deck in **Gamma** (MCP available) from this script, or you build it in Canva/PowerPoint using the script. Also still pending: finalize RW strings + Vercel deploy.

---

## 2026-06-22 — Dashboard: E2E tests + Lighthouse pass (Claude Code)

**Done**
- Added **Playwright journey tests** (`@playwright/test`, `e2e/journeys.spec.ts`, run against a production preview build): Live Now (power/cost/cliff/tier gauge + asserts the marginal rate is a *verified* RURA tier), This Month (chart + crossing), Appliances (water heater + fridge ranking, sourced 59 kWh), Save (recs + "(est.)" ranges), and the **EN↔Kinyarwanda** toggle (draft badge + translated nav). **5/5 pass.** Added `vitest.config.ts` to keep unit/e2e separate; `npm run test:e2e` script.
- **Lighthouse pass** (Chrome DevTools MCP, mobile). First run: A11y 91 / BP 100 / SEO 82 / Agentic 67. Fixed all flagged items → **A11y 100 · BP 100 · SEO 100 · Agentic 100, 0 failures**:
  - color contrast (brightened tier-gauge bars; lifted faint `slate-500` → `slate-400`),
  - added a `<main>` landmark,
  - added meta description + real `<title>` + theme-color,
  - added `public/robots.txt` and a spec-compliant `public/llms.txt`.
- **All green:** 9/9 unit, 5/5 e2e, Lighthouse 100×4. Perf note logged: main bundle ~563 kB (Recharts) — fine for demo, code-split later if needed.

**Next action** → **Tesi: (1) finalize RW strings in `src/i18n/strings.ts`; (2) deploy to Vercel** (README, 3 commands). Build is demo-ready and quality-gated.

---

## 2026-06-22 — Dashboard: EN/Kinyarwanda i18n (Claude Code)

**Done**
- Added a dependency-free, typed i18n system (`src/i18n/strings.ts` + `index.tsx`): EN canonical + **RW (Kinyarwanda)**, a `t(key, {params})` with `{var}` interpolation, and an EN/RW toggle in the header. Every visible string — nav, all 4 screens, the cliff/tier sentences, appliance names, and the **rule-based recommendations** (refactored to emit i18n keys) — now switches language.
- **RW translations grounded via Perplexity** (REG/energy context), not invented — but shipped as **draft v1**: a visible amber badge appears in RW mode ("Ikinyarwanda — umwandiko w'agateganyo, ugomba gusuzumwa") and `strings.ts` lists the priority keys for native review. Honest per Rule 1; Tesi/native speaker finalizes in one file.
- **Verified:** build clean; 9/9 tariff tests pass; Playwright switched to RW and the whole Live Now screen rendered in Kinyarwanda (`gridsense-rw-live.png`), numbers intact, 0 console errors.

**Open** — `⚠️` RW is a draft pending native-speaker review (rough verbs flagged in `strings.ts`, e.g. ironing/boiling). Tesi to confirm/correct.

**Next action** → **Tesi: (1) review/finalize the RW strings in `src/i18n/strings.ts`; (2) deploy to Vercel** (README, 3 commands). Then optional polish: Playwright journey tests, Lighthouse pass, brand colors. Preview at **http://localhost:5174**.

---

## 2026-06-22 — Dashboard: all 4 screens complete (Claude Code)

**Done**
- Built the remaining 3 screens + multi-screen shell (tab nav, shared `useHomeData` hook):
  - **This Month** — cumulative-kWh curve with 20/50 kWh tier reference lines, "today" marker, run-rate projection to month-end, tier-crossing callout ("cross 50 kWh around day 24").
  - **Appliances** — per-appliance monthly kWh + RWF + % share + live W; matches the sourced load model.
  - **Save** — honest **rule-based recommendation engine** (`recommendations.ts`): cliff-crossing, biggest controllable load, batch high-power spikes, standby. RWF impacts shown as **10–20% estimated ranges** (never a single fabricated figure), tied to the marginal tariff.
- **Fixed a defensibility bug:** the appliance energy estimate was derived from the live on/off probability, overcounting short-burst appliances (kettle showed 64 kWh). Decoupled it — added sourced `dutyHoursPerDay` so the breakdown now matches `appliance-load-data.md` (water heater 59, fridge 36, TV 11, iron/kettle 8, fan 7, laptop 6 kWh/mo).
- **Verified:** build clean; 9/9 tariff tests pass; all 4 screens rendered + screenshotted via Playwright (`gridsense-{livenow,thismonth,appliances2,save}.png`), **0 console errors**.

**Next action** → **Tesi: deploy to Vercel** (3 commands in the dashboard README) for the public URL. Then remaining polish: EN/Kinyarwanda i18n, Playwright journey tests, Lighthouse pass, brand colors. Preview now at **http://localhost:5174**.

---

## 2026-06-22 — Dashboard build: scaffold + live shell (Claude Code)

**Done**
- Grounded the **Kigali appliance load model** (sourced: Frontiers 2023, Columbia QSEL 2024/2025, Electrical Safety First) → `05-build/appliance-load-data.md`. Fridge = #1 always-on driver (~33–45 kWh/mo); water heater the big discretionary lever (~60 kWh/mo).
- **Scaffolded the React/Vite/TS app** at `05-build/dashboard/` (Tailwind v4 + Recharts). Built the real core: pure **tariff engine** (verified RURA tiers, cliff logic, forecast), **load simulation** emitting the ESP32 ingestion-contract shape, and the **"Live Now" screen** (live kW, month-to-date kWh + RWF, tier gauge, **tier-cliff alert**, forecast, appliance bars, live chart, honesty badge).
- **Verified working:** `npm run build` clean; **9/9 tariff unit tests pass** (engine output = sourced bills: 100→29,530, 150→47,980, 200→66,430 RWF); rendered + screenshotted via Playwright (`gridsense-livenow.png`) — cliff alert correctly shows "2.4 kWh from the 369 RWF tier" at 47.6 kWh; 0 console errors.
- Wrote `05-build/dashboard/README.md` with run + **Vercel deploy** instructions.

**Decisions** — built on simulated-but-labelled data with a real ingestion contract (simulated→live = one-line swap), per the approved spec.

**Changes** — New: `05-build/appliance-load-data.md`, full `05-build/dashboard/` app, root `gridsense-livenow.png` (demo screenshot for the deck).

**Open / next**
- **Vercel deploy needs Tesi's login** (auth) — instructions in the dashboard README; this is the one manual step to get a public URL.
- Next build chunks: This-Month + Appliances + Save screens · EN/RW i18n · Playwright journeys + Lighthouse · weight scenarios by appliance-ownership % (Columbia QSEL).
- Dev server is currently running locally at **http://localhost:5174** for preview.

**Next action** → **Tesi: run the 3 Vercel commands** (`npm i -g vercel` → `vercel login` → `vercel --prod` from `05-build/dashboard/`) to publish the live URL — then I build out the remaining 3 screens + i18n.

---

## 2026-06-22 — Sprint 1: BOM/FX, Funding, Regulation, Build Plan (Claude Code)

**Done** (all via the Channel — reasoning saved to `02-strategy/sprint1-channel.md`; every figure sourced or flagged)
- **BOM priced from live Kigali RWF retail** (SoftTech Supply + Hills Electronics) — landed cost, taxes embedded. Verified: ESP32 RWF 15,500 · SCT-013-000 100A RWF 12,000 · Tuya 16A metering switch RWF 14,500 · 5V 3A PSU RWF 5,000 · jumpers RWF 2,600. Estimated/flagged: passives ~1,000, enclosure ~4,000. **Whole-home monitor sub-kit ≈ RWF 40,100 (~$27.4); full kit ≈ RWF 69,100 (~$47.2).** Replaced every `⚠️VERIFY` in `capex-opex.md`.
- **FX fixed:** 1 USD ≈ **1,464 RWF** (market mid, 21–22 Jun 2026, multi-source). BNR official still `⚠️` for final accounting.
- **Unit economics + payback completed** (`capex-opex.md §4`): bills computed from the verified RURA tiers (100 kWh → 29,530 RWF, etc.); payback as a **sensitivity range** (savings % is a labelled assumption). Core monitor pays back **<12 mo at ≥10% savings** for a 100 kWh home; faster for heavy users. Confirms the tier-crosser beachhead economically.
- **Import-tax stack verified** (EAC CET 0–25%, VAT 18%, 5% WHT, 1.5% IDL, 0.2% AUL, 0.2% plastic) — kept only as the bulk/scaled cross-check.
- **Regulation answered** (`research-findings §6`): no permit for a behind-the-meter non-invasive CT (meter/seals untouched); **but** installation work must be by a licensed technician (REG/RURA) → CT fitted at the board by an electrician, plugs are plug-and-play. No CT-specific rule. Reframed the pitch claim to the honest, stronger version.
- **Funding finalized** (`fundraising-plan.md`): Hanga pattern verified (50M RWF top prize; apps ~Jun, finale ~Nov; MINICT+RDB+UNDP) — **2026 call NOT yet published → all 2026 specifics UNCONFIRMED**. Built a sourced 5-grant shortlist (FEC 2026, Youth4Climate $30k, ClimaFii $70k, EEP Africa €200–500k, ACEP $5k).
- **Dashboard build plan written** (`05-build/dashboard-build-plan.md`): React/Vite + Tailwind + Recharts → Vercel free tier; simulated-but-labelled data; **real ESP32→`/api/ingest` JSON contract**; pure tested tariff engine; 4 screens; Playwright + Lighthouse. Spec only — no code yet (per approval).

**Decisions** — Tesi approved (this session): scope = all 4 tasks research+write; dashboard stack = **React/Vite → Vercel**. Core monitor = entry SKU, plugs = upsell. Price from Kigali retail (conservative); import math for scaled case only.

**Changes** — Updated: `capex-opex.md` (full), `fundraising-plan.md` (full), `research-findings.md` (§FX, §5, §6, open-Qs). New: `02-strategy/sprint1-channel.md`, `05-build/dashboard-build-plan.md`.

**Open questions (carry forward)**
1. Cite a behavioral energy-savings % study (anchor the 5–20% payback range).
2. Confirm enclosure + passives exact local prices; BNR official FX.
3. Grounded Kigali appliance mix + wattages (for realistic dashboard simulation + savings).
4. Watch for the Hanga **2026** official call → confirm dates, student/registration eligibility, tracks.
5. Wi-Fi/smartphone penetration in target segment.

**Next action** → **Approve the dashboard spec, then I execute build-order step 1**: scaffold Vite+React+Tailwind and deploy the empty shell to Vercel — one finishable chunk that yields a live public URL the same day. (Or, if you'd rather, I first ground the Kigali appliance mix so the simulation is realistic from day one.)

---

## 2026-06-22 — Kickoff & Foundation (Cowork session)

**Done**
- Read both source documents word-by-word: `GridSense AI Draft.txt` (the concept) and `Tesi's Resume.pdf` (founder background).
- Confirmed direction with Tesi: capstone goal, <3-week deadline, ~0 current budget (need fundraising + no-prototype fallback), Claude Code + MCP stack already set up.
- Ran live grounding research (Rwanda tariffs, access, consumption, competitors, regulation, funding) → saved to `01-research/research-findings.md` with sources.
- Ran the Channel (brainstorm → stress-test → deep-dive → argue/defend) → saved to `02-strategy/stress-test-and-argument.md`.
- Created foundation files: `CLAUDE.md`, `README.md`, `RULES.md`, `DIRECTION.md`, this report; folder structure `01-research`…`06-pitch`.
- Drafted starter `04-business/capex-opex.md` and `04-business/fundraising-plan.md` (framework + verified figures, gaps flagged).
- Prepared Claude Code handoff (`HANDOFF-claude-code.md`).

**Key decisions (locked)**
1. Beachhead = tier-crossing urban homes + landlords/compounds + SMEs (NOT mass low-income, where the savings math fails). Mass-market = later impact tier.
2. Phase 1 = whole-home CT clamp + ESP32 (Wi-Fi-only) + smart plugs. Multi-circuit "by-area" CT → Phase 2.
3. AI scoped honestly: tariff-aware analytics + rules now → ML forecasting/anomaly → NILM later.
4. Capstone deliverable = software demo + feasibility pack + elite pitch; full home hardware is a bonus, not a dependency.
5. Privacy/compliance with Law 058/2021 + NCSA built in from day one.

**Biggest insight**
The tiered tariff (89 → 310 → 369 RWF/kWh) plus the fact that ~50% of homes sit at/below the lifeline tier reshaped the targeting: the money (and willingness to pay) is with households/landlords/SMEs that cross the expensive tiers. This is now the core of both the product and the pitch.

**Open questions (carry forward)**
1. Exact landed Rwanda BOM cost (ESP32, SCT-013, smart plugs, enclosure, PSU) + shipping/taxes.
2. Live USD↔RWF rate for financials.
3. Any installation/electrical-safety/regulatory requirement for behind-the-meter CT install in Rwanda.
4. Hanga PitchFest 2026 dates + eligibility for an ALU student-stage project; clean-energy track?
5. Wi-Fi/smartphone penetration in the target segment (validates Wi-Fi-only).
6. Kigali home appliance mix for credible savings modeling.

**Next actions (proposed sprint order)**
1. (Claude Code) Pull real local BOM prices via Perplexity/Firecrawl → finalize `04-business/capex-opex.md`.
2. Confirm Hanga 2026 + other funding eligibility → finalize `04-business/fundraising-plan.md`.
3. Build the software demo dashboard (Phase-1 UX with tariff-aware data) in `05-build/`.
4. Assemble the capstone defense deck in `06-pitch/`.

---

## How to add an entry (template)
```
## YYYY-MM-DD — <title>
**Done** …
**Decisions** …
**Changes** …
**Open questions** …
**Next actions** …
```

---

## 2026-07-03 — Verifiable Reports: research + Channel + working PoC + Claude Code handoff (Cowork)

**Done** (all via the Channel; every external fact verified live + cited)
- **Phase A — live research → `01-research/blockchain-research.md`.** Verified: Base Sepolia active (chainId **84532**, confirmed by a live `eth_chainId` call from the build env returning `0x14a34`), RPC `https://sepolia.base.org`, explorer `sepolia.basescan.org`, ~2s blocks, faucets (ETHGlobal/Alchemy); Pinata `pinFileToIPFS` returns the CID (`IpfsHash`), free tier exists; gasless = backend-relayer (prod = ERC-4337 paymaster / Coinbase Paymaster); Solidity 0.8.x current (pinned 0.8.28); **Law 023/2026** (gazetted 28/05/2026) licenses VASP activities (issue/exchange/custody/transfer/broker) — **hash-anchoring is none of them** → not a regulated virtual-asset business (our interpretation, flagged for a lawyer); **Law 058/2021** right to erasure → **no PII/consumption data on-chain**.
- **Phase B — the Channel → `02-strategy/verifiable-reports.md`.** Killed: on-chain personal/energy data, any token/NFT/coin/payment/franc-peg, user wallets/seed phrases, "blockchain for its own sake." Defended: **hash + CID anchoring on a free testnet, gasless, verify-by-re-hash.** Includes the honest threat model (proves integrity, not accuracy). Restructured docs: `DIRECTION.md` (new phase + expanded out-of-scope), `04-business/capex-opex.md` (§7: $0 PoC, honest prod estimate flagged), `06-pitch/GridSense-Master-Brief.md` (§10b verifiability narrative + "not a VASP" + hard-question answers + roadmap).
- **Phase C — working PoC in `07-blockchain/` (recorded step by step in its `README.md`).**
  - `src/ReportRegistry.sol` — anchors `{sha256Hash, ipfsCid, homeRef, periodYYYYMM, timestamp, anchorer}`; `anchorReport` (idempotent: rejects duplicate id + empty hash/cid), `getReport`, `verify`, `computeReportId`; write-only access control (anti-grief); **no token, no payable, rejects ETH.**
  - `test/ReportRegistry.t.sol` — **14/14 Foundry tests pass** (anchor/read, reject duplicate + empty, access control, verify true/false/unknown, determinism, no-ETH).
  - `scripts/` — `lib.mjs` (canonicalize → SHA-256 → AES-256-GCM → **real offline IPFS CID**), `anchor.mjs` (+optional Pinata pin, +code-existence guard), `verify.mjs` (re-hash vs chain + CID + decrypt + tamper negative-control). Node+viem.
  - **Real local end-to-end executed + verified** (anvil, chainId 31337): deploy tx `0x5bbd6db5…`, anchor tx `0xbf63b5e6…` (block 2, success), reportId `0x40aef65b…`, SHA-256 `0x62afb2a0…`, CID `QmVm438uaz4msepwnygXBJJ4zibCA16PwVR9UtmAUnrM6h`; **verify = 6/6 checks incl. tamper detection.** Receipt saved to `scripts/out/last-anchor.local-demo.json`.
  - Secrets: `.env.example` + `.gitignore` (never commit key/JWT). No secrets committed; no fabricated values.
- **Phase D — `07-blockchain/CLAUDE-CODE-PROMPT.md`**: advanced prompt to integrate into the LIVE app — serverless gasless `api/anchor.ts` (safe no-op without keys), wallet-less `/verify` page + "Verified on-chain ✓" badge, EN/RW strings, tests, **keep `tariff.ts` + 9/9 tests intact**, deploy Vercel, update this report.
- **Verified nothing broke:** `tariff.test.ts` still **9/9**; no files under `05-build/` were changed. Contract re-tested from canonical sources: **14/14**.

**Decisions (locked)** — Testnet **Base Sepolia** (Amoy fallback); on-chain = hash+CID+opaque metadata only; **gasless backend relayer**, wallet-less; report pinned **encrypted**; **no token/payment/franc-peg** (Law 023/2026); **no PII on-chain** (Law 058/2021); everything labelled demo/testnet.

**Open questions (⚠️ carry forward)**
1. **Base Sepolia public run is one manual step away** — needs Tesi to (a) `cast wallet new` + **fund it from a faucet** (browser/captcha — can't be headless) and (b) create a **Pinata JWT**. Then `forge script … --rpc-url https://sepolia.base.org --broadcast` + `node anchor.mjs`/`verify.mjs` produce the public BaseScan tx + IPFS links. (README §4B.)
2. Exact **free-tier numbers** (Pinata GB; Coinbase Paymaster $/mo) — confirm live before quoting in the pitch.
3. **Rwandan-lawyer sanity check** of "hash-anchoring ≠ VASP" before any *commercial* launch (strong on the face of the law).
4. `REPORT_ENC_KEY` management — demo uses an env key; production needs real KMS.

**Next action** → **Run `07-blockchain/CLAUDE-CODE-PROMPT.md` in Claude Code** to wire verifiable reports into the live app; in parallel, do the one-time Base Sepolia faucet + Pinata JWT step (README §4B) to publish the first public anchor tx.

---

## 2026-07-03 — Verifiable reports INTEGRATED into the live app + deployed (Claude Code)

**Context:** Executed `07-blockchain/CLAUDE-CODE-PROMPT.md` in full. Channel reasoning: `02-strategy/verifiable-reports-integration.md`.

**Verified live first (Rule 1, all re-confirmed 2026-07-03):**
- **Base Sepolia RPC live**: direct `eth_chainId` POST to `https://sepolia.base.org` → `0x14a34` = **84532** ✓; **CORS open** (`access-control-allow-origin: *` on preflight) → wallet-less browser reads work ✓; **BaseScan** HTTP 200 ✓.
- **Pinata**: `pinFileToIPFS` endpoint live (JWT auth confirmed via structured `INVALID_CREDENTIALS` probe); **free tier = 1 GB storage / 500 files / 10 GB bandwidth / $0** (pinata.cloud/pricing via Firecrawl — closes the old ⚠️ free-tier question; first paid "Picnic" $20/mo).
- **Law 023/2026**: in force since 28/05/2026, **no amendment found** (PwC/allAfrica/LinkedIn commentary, June 2026). **Law 058/2021**: no amendment found. Relayer-gasless still the simplest testnet pattern (same-day research + working PoC).
- ⚠️ **Perplexity API out of quota (401 insufficient_quota)** this session — fact-finding used Firecrawl (approved stack) + direct protocol probes. **Tesi: top up the Perplexity key.**

**Built (all in `05-build/dashboard`, tariff.ts untouched):**
- **`src/lib/verifiable.ts`** — ONE isomorphic Web-Crypto module (canonicalize / SHA-256 / AES-256-GCM iv|tag|ct / opaque homeRef / raw `eth_call` codecs) shared by server + client + tests. Parity with the PoC proven: fixture hashes to the PoC's real `0x62afb2a0…`, homeRef to `0x6f361ac3…`, reportId to `0x40aef65b…`.
- **`src/lib/cid.ts`** — pure CIDv0 (single-chunk UnixFS/dag-pb); **matches `ipfs-only-hash` on the PoC's real artifact (`QmVm438…`) and all sizes up to the 262144-byte chunk limit**; refuses larger files rather than risk a wrong CID.
- **`api/anchor.ts`** (Vercel Edge, viem) — gasless relayer anchor: canonicalize → hash → encrypt → CID (+ Pinata pin if JWT) → code-existence guard → append-only pre-check (idempotent same-content success / honest refusal on different content) → `anchorReport()`. **No keys → HTTP 200 `{anchored:false, reason:"anchoring not configured"}`** (+ the real hash, nothing fabricated). GET returns public config only — **no secrets ever leave the server**.
- **UI**: "Verified on-chain ✓ / Not yet anchored" badge + "Finalize & anchor" on the Consumption Report (`Documents.tsx`), BaseScan/IPFS links; **public wallet-less `/verify` page** (stored-anchor picker + paste-JSON flow, client-side re-hash, `eth_call` reads, PASS/FAIL, **tamper demo button**, honest-limit + testnet copy); footer link. **~30 new EN + RW-draft i18n keys** (type-enforced complete).
- **`src/lib/report.ts`** — finalized-report JSON builder (PoC schema, unit-scoped; personal data only in the encrypted off-chain file).

**Tests: 29/29 pass** (tariff 9/9 intact + 20 new): PoC hash/homeRef/reportId parity, ABI codecs byte-equal to viem, AES-GCM cross-impl vector from node:crypto, CID oracle vectors, endpoint no-op + invalid-body, tamper→mismatch. `tsc -b` + `vite build` clean; **viem verified absent from the client bundle** (0 occurrences in dist).

**Deployed + verified live** (https://gridsense-ai-zeta.vercel.app, Vercel CLI authed as shailo1):
- `GET /api/anchor` → honest `configured:false` config; `POST` → the no-op JSON in <1 s; `/verify` → 200.
- **Playwright on the live site**: guest → Properties → sample → Report doc → badge "Not yet anchored" → anchor click → amber "not configured" note (real POST 200, nothing faked); `/verify` renders EN + **RW** ("Genzura raporo"); **0 console errors** (3 benign Recharts size warnings).
- **Full end-to-end proven through the REAL code path locally**: anvil (chainId 84532) + the real `api/anchor.ts` handler serving the production build → "Finalize & anchor" produced a **real tx `0xdfb6ecdd…` (block 2, status success, `ReportAnchored` event)** → badge "Verified on-chain ✓" → `/verify` **PASS** → tamper demo **FAIL detected on-chain**. Screenshots: `07-blockchain/integration-screenshots/` (local-chain shots labelled as such — **no public BaseScan tx exists yet**, that needs the funded key).
- Note: `vercel dev` was unusable (vite 8 + SPA-rewrite parse bug) — local runs used a minimal Node server mounting the real handler (Node 24 native TS).

**Decisions** — one shared crypto module (server=client=tests, PoC-fixture-anchored); Edge runtime (the pattern already proven by `api/welcome.ts`); hand-rolled `eth_call` reads on the client with viem as the *test oracle* (keeps viem out of the bundle); explicit "Finalize & anchor" (append-only registry ⇒ no auto-anchor); sidecar receipts in localStorage (embedding a receipt would change the hash it certifies).

**Open questions (⚠️ carry forward)**
1. **Public Base Sepolia run still needs Tesi's one manual step** (faucet-funded key via browser/captcha + Pinata JWT → deploy registry → set `RELAYER_PRIVATE_KEY`, `REPORT_REGISTRY_ADDRESS`, `REPORT_ENC_KEY`, `PINATA_JWT`, optional `HOME_REF_SALT` in Vercel env → redeploy). Everything else is wired; the same button then produces a public BaseScan tx.
2. Perplexity API quota exhausted — top up.
3. Rwandan-lawyer sanity check of "hash-anchoring ≠ VASP" before commercial launch (unchanged).
4. `REPORT_ENC_KEY` in env is demo-grade; production needs KMS (unchanged).

**Scorecard: 9.3/10** — Facts 10 · Endpoint 9.5 · Verify UX 9.5 · Tests 10 · Honesty 10 · Deploy 9.5 · docked ~0.7 because the *public-testnet* anchor tx doesn't exist yet (blocked on the faucet/captcha step only Tesi can do).

**Next action** → **Tesi (≈15 min): README §4B one-time step** — `cast wallet new` (or ask Claude to generate a key), fund it at a Base Sepolia faucet, create a Pinata JWT, then hand the values to Claude Code to deploy the registry + set Vercel env + redeploy → first **public** BaseScan-visible anchored report.
