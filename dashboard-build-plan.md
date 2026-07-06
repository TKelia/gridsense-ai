# 05 — Phase-1 Demo Dashboard — Build Plan (Spec)

> Status: **PLAN / SPEC ONLY** (approved 2026-06-22 — stack decision: React/Vite SPA → Vercel free tier). No app code is written until this spec is approved.
> Purpose: the capstone's live, demo-able product experience — the thing on screen during the defense. Must look elite, run free, be Playwright-testable, and use **only verified Rwanda tariff math** with **clearly-labelled simulated sensor data**.

---

## 1. What this demo must prove (success criteria)
1. **X-ray vision into a tiered bill** — live total consumption (kW) + live RWF cost computed across the **real RURA tiers** (89 / 310 / 369 RWF/kWh).
2. **The tier-cliff alert** — the signature feature: *"You're 2 kWh from the 310 RWF tier."* This is the emotional hook of the whole pitch.
3. **Appliance breakdown** — which devices (from smart-plug data) are eating the bill.
4. **Bill forecast** — projected month-end kWh + RWF if the current pattern holds.
5. **Rule-based, personalized savings advice** — honest "AI" per `02-strategy §D3` (no fabricated NILM).
6. **Localization** — RWF, Rwanda tiers, Kinyarwanda-ready (i18n scaffold).
7. **Honesty by design** — a visible "Demo data (simulated)" badge; nothing pretends to be a live home we don't have.

## 2. Stack (decided)
- **Frontend:** React + **Vite** + TypeScript. Charts: **Recharts** (or Chart.js) — lightweight, clean.
- **Styling:** Tailwind CSS (fast, premium look). Mobile-first (target users are on phones).
- **State/data:** local simulation engine now; typed data layer behind an interface so a real API swaps in later.
- **Deploy:** **Vercel free tier** (auto-deploy from Git). $0.
- **i18n:** `react-i18next` with `en` + `rw` (Kinyarwanda) string files (rw can be filled later).
- **Testing:** **Playwright** (per RULES.md) for the core user journeys; **Chrome DevTools** for perf/accessibility (Lighthouse).

## 3. The honesty layer (non-negotiable)
- A persistent badge: **"Simulated demo data — tariff math is real (RURA Oct 2025)."**
- A `dataSource` flag in the data layer: `'simulated' | 'live'`. The UI reads it and renders the badge accordingly — so the same app shows "LIVE" the day real hardware connects.
- Simulated load profiles are generated from realistic Kigali appliance patterns (fridge, lighting, iron, water heater, TV) — `⚠️ appliance mix to be grounded by open research Q (research-findings §open).`

## 4. Architecture (real, so it's defensible)
```
[ ESP32 + SCT-013 ]  --(HTTP POST JSON)-->  [ /api/ingest ]  -->  [ store ]  -->  [ React dashboard ]
   (Phase-1 hardware)        STUBBED NOW          stubbed              simulated → live
        |                                                                     ^
        +----- smart plugs (Tuya) ---------------------------------------------+
```
- **Ingestion contract (define now, even though stubbed):** a documented JSON shape the ESP32 will POST — `{ deviceId, ts, watts, voltage?, source }`. Writing this contract now is what makes the demo a *real product slice*, not a mockup. The simulation engine emits the **same** shape, so swapping simulated→live is a one-line change.
- **Tariff engine (pure function, fully testable):** `cost(kWhThisMonth) → RWF`, applying the verified tiered marginal rates. Unit-tested against hand-computed values from `capex-opex §4` (100 kWh → 29,530 RWF, etc.).
- **No backend required for the capstone demo** — the simulation + tariff engine run client-side; the `/api/ingest` stub is documented for Phase-2.

## 5. Screens (MVP scope for the defense)
1. **Live Now** — big live kW + today's RWF so far; tier gauge ("Tier 2 of 3 — 8 kWh into the 310 band"); the tier-cliff alert banner.
2. **This Month** — cumulative kWh, RWF spent, **forecast** to month-end; tier-crossing timeline chart.
3. **Appliances** — per-plug live W + share of bill; "biggest movers."
4. **Save** — ranked rule-based recommendations with RWF impact (e.g., "Shift the water heater off-peak / cap it → est. save X RWF/mo" — impact range labelled as estimate).
5. **(Settings)** — language (EN/RW), tariff config (pre-loaded RURA), home profile.

## 6. The "AI"/recommendation rules (honest, v1)
Rule-based, each tied to data + the verified tariff:
- **Tier-cliff proximity** → alert when projected month-end is within N kWh of the next band.
- **Forecast** → simple run-rate projection (kWh-to-date ÷ days × month length); label as estimate.
- **Anomaly (light)** → appliance drawing materially above its own rolling baseline.
- **Shift advice** → high-power, time-flexible loads flagged for off-peak / reduced use.
Roadmap (say so, don't claim now): ML forecasting → anomaly detection → NILM (`02-strategy §D3`).

## 7. Build order (small, finishable chunks — ADHD-friendly)
1. Scaffold Vite+React+TS+Tailwind; deploy empty shell to Vercel (prove the pipeline). ← *first win, ~1 sitting*
2. Tariff engine (pure fn) + unit tests vs `capex-opex §4` numbers.
3. Simulation engine emitting the ingestion-contract JSON.
4. "Live Now" screen + tier gauge + cliff alert (the hero screen).
5. "This Month" + forecast chart.
6. "Appliances" + "Save" screens.
7. i18n scaffold (EN now, RW keys stubbed); honesty badge.
8. Playwright journeys + Lighthouse pass (Chrome DevTools).
9. Polish, mobile QA, demo script.

## 8. Definition of done (for the capstone)
- Deployed public Vercel URL, loads on mobile, looks premium.
- Tier math provably correct (tests green, matches verified bills).
- Tier-cliff alert + forecast + appliance view + recommendations all working on simulated data.
- Honesty badge visible; `source` flag wired for future live swap.
- Playwright green on the 4 core journeys; Lighthouse perf/accessibility checked.

## 9. Open inputs needed before/with build
- `⚠️` Grounded Kigali appliance mix + typical wattages (for realistic simulation) — research-findings open Q.
- `⚠️` Behavioral savings % (for the "Save" impact figures) — keep as labelled ranges until cited.
- Brand basics (name lockup, colors) — can start neutral, theme later.

---
**Next physical step when approved:** execute build-order step 1 (scaffold + Vercel deploy) — a single finishable chunk that yields a live URL the same day.
