# GridSense AI — Founder's Master Brief
### Everything I built, why, how it works, and how I win
*Tesi Songa Kelia · BSc Software Engineering · African Leadership University, Kigali · June 2026*
*Live product: https://gridsense-ai-zeta.vercel.app*

> This is my single source of truth. It explains GridSense in my own voice — what it is, the root of how it's constructed, every part of the system, the verified data behind it, how I built it, and exactly how I present and defend it. If I can explain this document, I can explain GridSense to anyone: a panel, a regulator, an investor, a customer.

---

## 1. What GridSense AI is (the definition I say out loud)
**GridSense AI is an AI-powered electricity intelligence platform for Rwanda.** It turns invisible, prepaid electricity spending into clear, real-time, money-saving insight — for a single household, for a landlord billing many tenants, and for enterprises managing many properties.

One sentence: *"GridSense shows Rwandans exactly where their electricity money goes, warns them before the bill jumps a tier, and lets landlords bill tenants fairly and get paid on time."*

Who I am as a company: *a Rwanda-built, Kigali-first energy-tech product that makes power consumption transparent, fair, and affordable.*

**Keywords / tags (for positioning & SEO):** home energy monitor Rwanda, electricity cost calculator Rwanda, RURA tariff, EUCL cash power, prepaid electricity, landlord tenant billing Rwanda, sub-metering, kWh tracker, energy saving Kigali, smart meter alternative, ESP32 energy monitor, tier-cliff alert, Kinyarwanda energy app, property management utilities, GridSense.

---

## 2. The problem (why this is genuinely needed — it saves people money)
- On **1 October 2025**, Rwanda's residential electricity became steeply **tiered**: **89 RWF/kWh** for the first 20 kWh, **310** for 20–50, **369** above 50 (average tariff up ~15%). Source: REG.
- Electricity is sold **prepaid** ("cash power") — **~99.7%** of meters. People see only a **falling balance**: no idea which appliance drains it, or when they cross into an expensive tier.
- The painful truth: crossing from 20→21 kWh makes the next unit cost **3.5× more**, invisibly.
- For **landlords**, it's worse: tenants share/are sub-billed for power and constantly **dispute how they're charged** because nobody can show them the math.
- **You can't manage what you can't see.** GridSense makes it visible — and fair.

---

## 3. The insight that shapes everything (this is my "rigor" point)
~Half of connected homes use ≤20 kWh/month (the 89 RWF lifeline) where the absolute savings are tiny. So I **do not** target "every household." I target where the money and the pain actually are:
1. **Tier-crossing urban homes** (cross into 310/369).
2. **Landlords / property managers** — one buyer, many meters, a real billing-dispute pain, ability to pay.
3. **Small businesses & enterprises** (hotels, big apartment blocks) on the **non-residential** tariff (**355–376 RWF/kWh** on every unit — the most to save).
Mass-market lifeline homes are a later, grant-funded social-impact tier. I confronted the brutal economics instead of hiding them — that *reshaped* the product into a platform with tiers.

---

## 4. What I actually built (the live product)
A real, deployed, tested web platform (not slides): **https://gridsense-ai-zeta.vercel.app**

**For individuals (Home):**
- Personalized setup (home type, people, appliances + hours) → the dashboard reflects *their* home.
- **Live Now** (live kW, month-to-date RWF, the signature **tier-cliff alert**), **This Month** (usage vs tier thresholds + month-end forecast), **Appliances** (sourced breakdown), **Save** (honest RWF-quantified tips).
- Dark/light theme, English/Kinyarwanda, share, save/print.

**For landlords (Property workspace):**
- Add properties → units → tenants (name, phone, email) → meter readings.
- **Exact per-tenant amount due** from the real tariff, with billing period and due date.
- **Invoice / Receipt / Consumption Report** as branded, printable PDFs.
- **Send** to the tenant via WhatsApp / SMS / email (pre-filled), and **payment reminders** as a downloadable **calendar (.ics)** firing at 5/3/2/1 days before, the morning of, and the 12:00 due moment.
- Portfolio overview (total due, paid/unpaid, consumption).

**Monetization:** Pricing page (Home free; Landlord Starter/Growth; Enterprise) + cart + checkout (demo, no card charged, payment-provider-ready) + a **connected-device** add-on tier.

**Accounts & onboarding:** real sign-up collects name / email / phone (+250-normalized) + a **username** (auto-suggested, uniqueness-checked) and a **password** with a strong-password generator, live strength meter, and a requirement checklist. Login works by **username, phone, or email** + password. Passwords are hashed with **Web Crypto (salted SHA-256) — never stored in plaintext**; the demo keeps accounts in the browser and says plainly that production uses a managed auth backend. The guest **"Explore the demo"** path stays password-free.

**Welcome on sign-up:** a branded HTML welcome email + a warm SMS, with an in-app confirmation offering one-tap send via **mailto / WhatsApp / SMS** deep links. An optional Vercel serverless function (`/api/welcome`, Edge runtime) sends a **real** email/SMS when provider keys (Resend + an SMS gateway) are set, and **honestly no-ops** (`{sent:false}`) without them — integration-ready, never faked.

**Brand & discoverability:** custom logo + favicon + social card; consistent premium layout across every page; trust/security/data-protection cues. **SEO:** Organization + SoftwareApplication JSON-LD, keyword + description meta, canonical, OG/Twitter cards, `sitemap.xml`, `robots.txt`. An **"Official sources & references"** section (Support + About + footer) links the live REG / RURA / RwandaLII Law 058/2021 / NCSA / Data-Protection-Office pages — every public claim is one click from its source.

---

## 5. How it's constructed — the ROOT (this is the architecture I must be able to draw)

### 5.1 The data path (the spine of the system)
```
[ Sensors ]                 [ Edge ]            [ Cloud ]                [ App ]
CT clamp on the main   →   ESP32 reads    →   /api/ingest         →   Web dashboard
 + smart plugs             current, Wi-Fi      (JSON contract)         + tariff-aware AI
```
- **Hardware (Phase 1):** a non-invasive **CT clamp (SCT-013-000, 100A)** around the home's main wire (after the meter — we never touch the utility meter), read by an **ESP32** micro-controller, sent over **Wi-Fi**. Optional **smart plugs** for big appliances.
- **Ingestion contract:** every reading is `{ deviceId, ts, watts, source }`. **The demo emits the exact same shape**, so when real hardware is installed, it swaps in with a one-line change of the data source. *This is why my "simulated" demo is a true product slice, not a mockup.*
- **The intelligence** runs on that stream: convert kWh → live RWF across the real tiers, forecast the month, detect the tier-cliff, and recommend savings.

### 5.2 The calculation (why it's exact and true)
- Rwanda bills in **marginal blocks**: `bill = 20·89 + min(used−20,30)·310 + max(used−50,0)·369`.
- My tariff engine implements exactly this and is **unit-tested**: 100 kWh → **29,530 RWF**, 150 → **47,980**, 200 → **66,430**. (9/9 tests pass — this is my defense against "are your numbers real?")
- **Electricity is VAT-exempt in Rwanda**, and REG quotes rates "VAT & regulatory-fee exclusive" — so the consumer effectively pays the block rates. **My calculation is the real consumer cost** (a small regulatory fee aside). Non-residential uses 355/376.

### 5.3 The software (the stack & repo root)
- **Stack:** React 19 + TypeScript + Vite (build) + Tailwind v4 (style) + Recharts (charts); deployed free on **Vercel**; data persists in the browser (localStorage) for the demo. Tested with **Vitest** (unit) + **Playwright** (journeys); audited with **Lighthouse** (100s).
- **Where the code lives:** `05-build/dashboard/`. Key parts:
  - `src/lib/tariff.ts` — the pure, tested tariff engine (the heart; never changed without a test).
  - `src/lib/simulation.ts` + `useHomeData.ts` — the live load model + the hook feeding all screens.
  - `src/household.tsx` — personalization (your home → your numbers).
  - `src/landlord.tsx` + `src/pages/Properties.tsx` — properties/units/tenants + per-tenant billing.
  - `src/lib/billing.ts` — WhatsApp/SMS/email links + .ics reminders + due-date math.
  - `src/components/Documents.tsx` — printable Invoice/Receipt/Report.
  - `src/pages/` — Home, About, How to use, Support, Terms, Privacy, Pricing, Checkout, Device, Setup, Dashboard.
  - `src/theme.tsx`, `src/i18n/` — dark/light + EN/Kinyarwanda.
  - `src/auth.tsx` + `src/lib/password.ts` — accounts, Web-Crypto password hashing, username/strength/generator helpers; `src/screens/Login.tsx` — sign-in/sign-up.
  - `src/lib/welcome.ts` + `src/components/WelcomeModal.tsx` + `api/welcome.ts` — welcome templates, deep links, and the integration-ready serverless sender.
  - `src/components/Sources.tsx` + `OFFICIAL_SOURCES` in `src/routes.ts` — the verified references; SEO/JSON-LD live in `index.html`, with `public/sitemap.xml` + `public/robots.txt`.
- **The whole project** (research, strategy, business, build, pitch) is organized in the `GridSense-AI/` repo folders `01-research` … `06-pitch`, with `PROJECT-REPORT.md` as the living log.

---

## 6. The data & sources (everything is verified — I can cite it live)
- **Tariff (89/310/369; non-res 355/376):** REG official tariffs page; RURA board decision.
- **VAT-exempt electricity:** Rwanda tax summaries (PwC).
- **Access 84.6%, 1.946M grid households; ~99.7% prepaid:** REG; field studies.
- **Savings evidence (5–15% from direct feedback; ~14% from prepaid salience):** Darby 2006 (Oxford/DEFRA), ACEEE 2010, Jack & Smith (prepaid metering).
- **Connectivity (urban internet ~57%, 4G ~100%, smartphone ~34% of homes):** DataReportal / TechCabal 2025.
- **Hardware prices (RWF):** live Kigali retailers (SoftTech Supply, Hills Electronics).
- **Law:** Data Protection **Law N° 058/2021** (NCSA); tenancy law (2006) + 2018 civil-procedure law; tenant privacy.
- Full citations live in `01-research/research-findings.md`, `01-research/evidence-and-validation.md`, `04-business/`, and `02-strategy/`. **All five public reference links were re-verified live (HTTP 200) on 2026-06-22** and are linked in-app: REG tariffs, RURA, RwandaLII Law 058/2021, NCSA (cyber.gov.rw), Data Protection Office (dpo.gov.rw). (NCSA's site is cyber.gov.rw, not ncsa.gov.rw; the tariff figures trace to REG/RURA primary sources, not the secondary article that still shows the old 212/249.)

---

## 7. The numbers (economics & business model)
- **Hardware:** core whole-home monitor ≈ **RWF 40,100 (~$27)**; full kit (+2 metering plugs) ≈ **RWF 69,100 (~$47)** — priced from live Kigali shops (93% live-sourced).
- **Payback:** for a 100 kWh tier-crossing home (29,530 RWF/mo bill), the core monitor pays back in **~9 months at 15% savings**, ~6 months for heavy users — **under a year**. Savings shown as a 5–15% range, never a single fabricated figure.
- **Capstone-phase OPEX ≈ $0** (free cloud, own Wi-Fi).
- **Pricing (indicative):** Home **free**; Landlord **~RWF 9,900/mo** (≤5 units) / **~RWF 29,000/mo** (≤20); Enterprise from **~RWF 150,000/mo**; device add-on (hardware one-time + ~RWF 2,500/device/mo live data).
- **Funding ladder:** $0 capstone demo → Hanga PitchFest (50M RWF) / FEC / Youth4Climate → pilot → larger grants → production. (`04-business/fundraising-plan.md`.)

---

## 8. Regulation, ethics, trust (turn compliance into credibility)
- **Behind-the-meter, non-invasive** — no utility permit to clip a CT on your own wire; the REG/EUCL meter is never touched (board work by a licensed electrician).
- **Data protection by design** — compliant intent with **Law 058/2021** (NCSA): consent, minimization, encryption. In the demo, data stays on the user's device.
- **Honesty as a feature** — every screen labels simulated data; the tariff math is real; "estimates, not an official bill — REG/EUCL is the billing authority."
- **Tenant fairness** — transparent, itemized charges respect tenant privacy and end "I don't know how I'm charged" disputes.

---

## 9. How I built it (the process — so I can explain my method)
1. **Understood** the brief (the GridSense draft) and my own strengths.
2. **Researched live** and verified every fact (tariffs, VAT, laws, prices, evidence) — never assumed.
3. **Ran "the Channel"** on every decision: brainstorm → stress-test (kill weak ideas) → deep-dive → argue & defend. (e.g., I killed "real card payments now" and "auto-SMS from a server" as not honestly buildable yet, and chose deep-link + .ics + integration-ready checkout instead.)
4. **Built** the product in React/Vite/Tailwind, **tested** it (unit + e2e + Lighthouse), and **deployed** to Vercel.
5. **Documented** everything in the repo and this brief; kept `PROJECT-REPORT.md` as the running record.
Tooling: live web research, a build pipeline (Vite), automated tests (Vitest/Playwright), Lighthouse audits, and Vercel for hosting.

---

## 10. How I present it (12–15 min) — the winning arc
1. **Hook (feel the pain):** "Rwandans just got a tiered power bill — and no way to see it coming." Show the falling-balance problem.
2. **The insight:** half of homes can't pay for savings; the money is with tier-crossers, landlords, SMEs. (Shows rigor.)
3. **Live demo (centerpiece):** open the site → set up a home → Live Now tier-cliff alert → switch to **Kinyarwanda** → then the **Landlord workspace**: add a tenant, show the **exact amount due**, generate the **invoice**, hit **Send (WhatsApp)**, add **reminders to calendar**. Say out loud: *"sensor data is simulated and labelled; the tariff math is real and sourced."*
4. **It's real & feasible:** architecture (CT→ESP32→cloud→app, same JSON contract), sourced BOM, **under-12-month payback**, unit-tested tariff.
5. **Business:** tiers + pricing + device add-on; the funding ladder (Hanga).
6. **Trust:** VAT-exempt exact math, Law 058/2021, behind-the-meter.
7. **Close:** impact (fairer bills, less waste, energy literacy) + the ask (validation, a pilot, Hanga). *"GridSense AI — see your power, spend less."*

---

## 10b. Verifiable, tamper-proof reports (my differentiator — added 2026-07-03)
*One line I say:* **"Every GridSense monthly report is fingerprinted and anchored on a public blockchain — so a tenant, a landlord, or an auditor can prove it was never altered, without having to trust me."**

- **The problem it kills:** landlord–tenant billing disputes come down to *"can I trust this bill?"* A signed PDF from my own server isn't enough — I hold the key and could re-sign an edited version. So I anchor each report's **SHA-256 fingerprint + its IPFS address (CID)** on a **public blockchain (Base Sepolia testnet today)**. Anyone can later **re-hash the report and compare** — match = untouched, mismatch = tampered.
- **What's on-chain:** only the **hash + CID + {month, an opaque home reference, timestamp}**. **No name, no address, no kWh, no RWF, nothing personal** — because a blockchain record is permanent and **Law 058/2021** gives a right to erasure. The report file itself lives on **IPFS, encrypted**, and can be deleted; the on-chain fingerprint stays a meaningless 32 bytes.
- **Invisible to the user:** **no wallet, no seed phrase, no crypto.** GridSense anchors on the user's behalf (gasless) and they just see **"Verified on-chain ✓"** and a **Verify** button.
- **Why I'm NOT breaking the new crypto law (Law N° 023/2026):** that law licenses *virtual-asset businesses* — issuing, exchanging, custodying, or transferring crypto assets. **I do none of that.** I issue **no token, no coin, no payment, no franc-pegged asset**; I only write a fingerprint for integrity. That's **distributed-ledger notarization, not a crypto business** — so it needs no CMA licence. *(My reading of the law for the capstone; I'd get a Rwandan lawyer to confirm before commercial launch.)*
- **The honest limit (I say it before they ask):** this proves a report **wasn't changed after I issued it** — it does **not** prove the sensor reading or the bill was *correct*. Integrity, not accuracy. Over-claiming would be dishonest and a panel would catch it.
- **Cost:** **$0** at capstone scale (free testnet + free IPFS tier); a fraction of a cent per report on a real L2 in production. Big trust story, near-zero cost.
- *Full reasoning + threat model: `02-strategy/verifiable-reports.md`; research + sources: `01-research/blockchain-research.md`; working proof-of-concept: `07-blockchain/`.*

---

## 11. The hard questions & my answers (rehearse cold)
- **"Who actually pays?"** → Tier-crossers, landlords, SMEs; mass-market is a later impact tier. Economics shown.
- **"Sense/Emporia exist."** → None localized: no RWF tiers, no Kinyarwanda, not Rwanda-priced/serviced, no landlord billing. That's my moat.
- **"Is the AI real?"** → Tariff-aware analytics + rules + forecasting now; ML/anomaly next; NILM later. I never claim what I haven't built.
- **"Did you build hardware?"** → It's proven off-the-shelf (ESP32+SCT-013); the real ingestion contract + live app prove it; pilot installs it.
- **"Are your numbers real?"** → Live Kigali prices + verified RURA tiers; the engine is unit-tested; electricity is VAT-exempt so the bill is exact.
- **"Privacy / will it touch the meter?"** → Law 058/2021 by design; behind-the-meter, non-invasive; never touches the utility meter.
- **"How do you make money?"** → Landlord/enterprise subscriptions + device add-on; individuals free for adoption.
- **"Isn't the blockchain part just hype?"** → No — it does one thing a database can't: let *anyone* verify a report *forever* without trusting me. I killed every crypto-for-its-own-sake option (no token, no user wallets, no data on-chain). If verifiability weren't needed I'd ship a signed PDF; billing disputes and auditable grant data make it needed.
- **"Are you doing crypto without a licence?"** → Law 023/2026 licenses issuing/exchanging/custodying/transferring virtual assets. I do none — I anchor a hash for integrity. It's notarization, not a virtual-asset business. (Lawyer to confirm pre-commercial.)

---

## 12. Roadmap (honest, staged)
- **Phase 1 (now):** whole-home CT + ESP32 + plugs; tariff-aware app; landlord billing; demo live.
- **Phase 2:** by-area (multi-circuit) monitoring; **GSM/SMS** for non-Wi-Fi homes; real payment provider (MTN MoMo/Flutterwave/Stripe); server-side auto email/SMS; live device fleet. **Verifiable reports → production chain** (Base mainnet + gasless paymaster) once the testnet PoC is validated.
- **Phase 3:** ML forecasting → anomaly detection → appliance disaggregation (NILM); tenant self-service portal; multi-property analytics.

---

## 13. My one-paragraph "how I did this" (for any conversation)
*"I started from a real, dated change in Rwanda — the new tiered electricity tariff — and verified every number against REG and RURA. I realized most homes can't justify a savings device, so I aimed GridSense at the people who feel the cost: tier-crossing homes, landlords, and businesses. I built a working web platform in React that calculates the exact bill from the real tariff (it's unit-tested), personalizes to each home, and gives landlords per-tenant invoices, reminders, and reports. The hardware is a simple, proven ESP32 + clamp sensor, and my demo speaks the same data format so real devices plug straight in. It's deployed, bilingual, privacy-by-design under Law 058/2021, and priced to pay for itself in under a year. I didn't fake anything — where something needs a payment processor or a server, I built it integration-ready and said so."*
