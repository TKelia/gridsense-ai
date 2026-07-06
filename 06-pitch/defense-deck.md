# 06 — GridSense AI · Capstone Defense Deck (Script + Speaker Notes)

> The source-of-truth deck script for the ALU capstone defense. Tool-agnostic — build the visuals from this in Gamma / Canva / PowerPoint.
> **Every number here is traced to a verified repo source.** Unverified items are flagged `⚠️` and handled honestly on the Risks slide.
> Design rationale (the Channel) is logged in `02-strategy/` and `PROJECT-REPORT.md`. Structure pre-empts the attack list in `02-strategy §E`.
> Target: ~16 slides (12–15 min) + Q&A defense appendix. Presenter: Tesi Songa Kelia, BSc Software Engineering, ALU Kigali.

---

## SLIDE 1 — Title
**On slide:**
- **GridSense AI**
- *X-ray vision into Rwanda's newly expensive electricity bill.*
- Tesi Songa Kelia · BSc Software Engineering · African Leadership University, Kigali
- Capstone Defense · June 2026

**Speaker note (15s):** "Rwandans just got a more expensive, tiered electricity bill — and almost no way to see it coming. GridSense AI fixes that." Open with confidence; the tagline is the whole thesis.

---

## SLIDE 2 — The problem (make them feel it)
**On slide:**
- Oct 2025: residential power became **steeply tiered** — **89 → 310 → 369 RWF/kWh**; average tariff up **~15%** (186 → ~214 RWF/kWh).
- Households pay via prepaid **"cash power"** — they see a falling balance, **not** which room/appliance drains it, or when they cross into an expensive tier.
- **"You can't manage what you can't see."**

**Speaker note:** A home creeping from 20 → 21 kWh suddenly pays **3.5× more** on the marginal unit and has no idea why. This invisibility is the pain we sell against.
**Sources:** `01-research §1` (REG tariffs, RURA press release).

---

## SLIDE 3 — The insight that reshapes the strategy (shows rigor)
**On slide:**
- **~50%** of connected homes use **≤ 20 kWh/month** — the 89 RWF lifeline tier. A 20% saving there ≈ **356 RWF (~$0.25)/month**. *No one buys a device for that.*
- The money — and willingness to pay — is with homes/landlords/SMEs that **cross into the 310 & 369 RWF tiers**.
- **So we don't target "every household." We target the tier-crossers.**

**Speaker note:** This is the slide that wins the rigor points. We confronted the brutal truth (`02-strategy §A`) instead of hiding it, and it reshaped our targeting. Pre-empts the panel's #1 question: *"Who actually pays, and does the math work?"*
**Sources:** `01-research §3`; `02-strategy §A, §D1`.

---

## SLIDE 4 — The solution
**On slide:**
- A low-cost kit: **whole-home CT clamp + ESP32 (Wi-Fi)** for real-time total use + live RWF cost, **+ energy-metering smart plugs** for the biggest appliances.
- Feeds a simple **web app + tariff-aware AI** that shows live cost, forecasts the bill, **warns before a tier cliff**, and recommends specific savings.
- Localized: **RWF, Rwanda's real tiers, Kinyarwanda-ready.**

**Speaker note:** Cheap, safe, self-installable. The CT gives the whole-home picture; the plugs answer "which appliance?". The intelligence is the localization + tariff-aware AI.
**Sources:** `DIRECTION.md`; `02-strategy §D2`.

---

## SLIDE 5 — LIVE DEMO (the centerpiece)
**On slide:** *(live URL + screenshots of the 4 screens)*
- **Live Now** — live kW, month-to-date RWF, **tier-cliff alert** ("You're 2.4 kWh from the 369 RWF tier").
- **This Month** — cumulative use vs tier thresholds + month-end forecast.
- **Appliances** — which devices eat the bill.
- **Save** — personalized, RWF-quantified advice. **EN / Kinyarwanda toggle.**

**Speaker note:** DO THE LIVE DEMO HERE. Switch to Kinyarwanda live — it lands. Say clearly: *"Sensor data here is simulated and labelled; the tariff math and appliance model are real and sourced."* Honesty is a strength. Demo is built, tested (9 unit + 5 e2e), Lighthouse 100/100/100/100.
**Sources:** `05-build/` (working app); screenshots `gridsense-*.png`.

---

## SLIDE 6 — Is the "AI" real? (told honestly)
**On slide:**
- **Now:** tariff-aware analytics (kWh → live RWF across real tiers) + **rule-based** personalized recommendations + run-rate **forecasting**.
- **Next:** ML bill forecasting + anomaly detection ("your fridge is drawing 30% more than usual").
- **Later:** appliance disaggregation (**NILM**) as data grows.
- **We never claim NILM we haven't built.**

**Speaker note:** Pre-empts *"Is the AI real?"*. Honest scoping is a defense, not a weakness. A panel respects a clear roadmap over an over-claim it can puncture.
**Sources:** `02-strategy §D3`; visible in the Save screen + roadmap line.

---

## SLIDE 7 — How it works (architecture — proves it's buildable)
**On slide:**
- Non-invasive **CT clamp on the main feed** → **ESP32** reads current → POSTs JSON to the cloud → dashboard.
- **Documented ingestion contract** (`{deviceId, ts, watts, source}`) — the demo's simulated data uses the *same* shape, so hardware swaps in with a one-line change.
- Built on **proven open-source** designs (ESP32 + SCT-013 + EmonLib; CircuitSetup).

**Speaker note:** Pre-empts *"Did you really build hardware?"*. The hardware is off-the-shelf and proven; our innovation is localization + tariff-aware AI + GTM. The real ingestion contract makes the demo a genuine product slice, not a mockup.
**Sources:** `01-research §5`; `05-build/dashboard-build-plan.md`, `src/lib/types.ts`.

---

## SLIDE 8 — Feasibility & cost (sourced, in RWF)
**On slide:**
- BOM priced from **live Kigali retailers in RWF** (SoftTech Supply, Hills Electronics) — landed cost, taxes embedded.
- ESP32 **15,500** · SCT-013-100 **12,000** · metering plug **14,500** · PSU **5,000** · wiring **2,600**.
- **Whole-home monitor (entry SKU): ~RWF 40,100 (~$27)** · full kit w/ 2 plugs: **~RWF 69,100 (~$47)**. FX 1 USD ≈ 1,464 RWF.

**Speaker note:** We priced locally, not off a foreign catalogue — the most defensible, conservative basis (bulk import would be cheaper). 93% of the kit is live-sourced; the small remainder is flagged.
**Sources:** `04-business/capex-opex.md §1`; `01-research §5`.

---

## SLIDE 9 — Unit economics & payback (the math is real)
**On slide:**
- Verified tiers → a **100 kWh home** pays **29,530 RWF/month**.
- **Payback (core monitor, RWF 40,100):** ~13.6 mo @ 10% savings → **~9.1 mo @ 15%**. Heavy users (200 kWh): **~6 mo @ 10%**.
- Savings shown as a **sensitivity range** — we don't fake a single number.

**Speaker note:** The bills are computed straight from the verified RURA tiers (tested in code). Payback < 12 months for tier-crossers proves the beachhead economically — it doesn't just assert it. The savings % is a labelled assumption (see Risks).
**Sources:** `04-business/capex-opex.md §4`; tariff engine unit-tested in `05-build`.

---

## SLIDE 10 — Market & beachhead
**On slide:**
- **1.946M** households on the grid; **84.6%** national electricity access.
- Beachhead = **tier-crossing urban homes + landlords/compounds + SMEs** (cross 310/369, own appliances, have Wi-Fi + smartphones, feel the hike).
- Mass-market & lifeline homes = a later **social-impact tier** (grant-funded), not the paying entry.

**Speaker note:** Landlords are arguably the best wedge — one buyer, many meters, a billing-dispute pain point. SMEs have a clear ROI line.
**Sources:** `01-research §2–3`; `02-strategy §D1`.

---

## SLIDE 11 — Competition & our moat
**On slide:**
- Sense (~$300, US, ML), Emporia Vue, IoTaWatt (DIY), Bidgely (utility B2B).
- **None** is localized: no RWF-tier logic, no Kinyarwanda, not Rwanda-priced or -serviced.
- **Moat = localization + tariff-aware AI + go-to-market**, at a Rwandan price.

**Speaker note:** Strong tech exists — we don't pretend to out-engineer Sense. We win on the wedge they ignore: a tariff-aware, Kinyarwanda, affordably-serviced product for Rwanda.
**Sources:** `01-research §4`.

---

## SLIDE 12 — Regulation & compliance (turn it into credibility)
**On slide:**
- **Behind-the-meter, non-invasive** — no utility permit to clip a CT on your own wiring; **we never touch the REG/EUCL meter.**
- Board-side install done by a **licensed electrician** (REG/RURA requirement); the smart plugs are plug-and-play.
- **Data:** compliant with **Law 058/2021**; register with **NCSA**; consent + encryption + data minimization.

**Speaker note:** Pre-empts *"Will it mess with the meter?"* and *"What about privacy?"*. We verified the rule rather than assuming — and built compliance in from day one.
**Sources:** `01-research §6` (RURA, REG, RwandaLII).

---

## SLIDE 13 — Go-to-market & funding (the lean ladder)
**On slide:**
- **$0 to win the capstone** (free cloud, open-source, ALU resources). Funding is for scaling.
- Ladder: demo → **Hanga PitchFest** (50M RWF top prize; RDB + MINICT + UNDP) → 3–5 real kits + 1 pilot → larger grants (FEC 2026, Youth4Climate $30k, ClimaFii $70k, EEP Africa €200–500k) → production run.
- Channel: direct + **landlord/SME** partnerships + possible REG partnership.

**Speaker note:** Each rung needs only the proof from the one below — never a big upfront ask. Hanga is the #1 target (2026 call not yet published — we're prototype-ready and watching).
**Sources:** `04-business/fundraising-plan.md`.

---

## SLIDE 14 — Roadmap
**On slide:**
- **Phase 1 (now):** whole-home CT + ESP32 (Wi-Fi) + plugs; tariff-aware analytics, alerts, rules; web app. *(demoed today)*
- **Phase 2:** multi-circuit "by-area" CT in the board (partner electrician); GSM option; landlord sub-metering.
- **Phase 3:** ML forecasting → anomaly detection → NILM disaggregation.

**Speaker note:** Clear, staged, honest. Each phase unlocks the next as data and funding grow.
**Sources:** `DIRECTION.md`; `02-strategy §D2`.

---

## SLIDE 15 — Risks & honest mitigations (rigor slide)
**On slide:**
| Risk | Mitigation |
|---|---|
| `⚠️` Savings % is an assumption (we show 5–20% range) | Pilot will measure it; cite behavioral-feedback literature |
| Hardware funding (~$27–47/kit) | $0 capstone path; bench PoC if free parts; Hanga/grants for scale |
| Wi-Fi penetration in target homes | Beachhead chosen for Wi-Fi/smartphone ownership; GSM in Phase 2 |
| Hanga 2026 dates unconfirmed | Monitoring official channels; prototype-ready now |

**Speaker note:** Showing the gaps *with* mitigations beats pretending there are none. This is the slide that earns trust.
**Sources:** open-questions in `PROJECT-REPORT.md`, `01-research`, `04-business`.

---

## SLIDE 16 — Impact & the ask (close strong)
**On slide:**
- **Impact:** energy literacy, lower bills, less waste, reduced peak demand, climate — real and fundable.
- **The ask:** capstone validation · a first pilot home/landlord · a path into Hanga PitchFest.
- **GridSense AI — see your power, spend less.**

**Speaker note:** Close on the mission and a concrete ask. This is Tesi's strength — land it with conviction. Thank the panel; invite questions (you're ready — see appendix).

---

## APPENDIX — Q&A DEFENSE (rehearse these cold)
*Direct from the `02-strategy §E` attack list. Each answer has a slide to jump to.*

| If they ask… | Answer (→ slide) |
|---|---|
| "Most homes use too little to bother — who pays?" | Tier-crossers: urban homes, landlords, SMEs; mass-market is a later impact tier. Economics shown. (→3, 9, 10) |
| "Sense/Emporia already exist." | None localized / RWF-tier-aware / Kinyarwanda / Rwanda-priced. Localization + AI + GTM is the moat. (→11) |
| "Is the AI real?" | Tariff-aware analytics + rules now; ML forecasting/anomaly next; NILM later. No over-claim. (→6) |
| "Did you really build hardware?" | Proven off-the-shelf; real ingestion contract; live demo + feasibility pack. (→5, 7) |
| "Privacy?" | Law 058/2021 compliant; NCSA registration; consent + encryption + minimization. (→12) |
| "Will it mess with the meter?" | No — behind-the-meter, non-invasive; licensed electrician for board work; never touch the utility meter. (→12) |
| "Can a normal person install it?" | Plugs: plug-and-play. CT: licensed electrician at the board (Phase 2 for multi-circuit). (→12) |
| "How do you make money?" | Device sale + optional subscription (advanced AI, landlord/SME dashboards). (→13) |
| "Where did your numbers come from?" | Live Kigali retailers (RWF) + verified RURA tiers; savings shown as a labelled range. (→8, 9, 15) |

## SOURCES (for the panel handout)
REG tariffs & RURA press release; Frontiers 2023 Kigali consumption study; Columbia QSEL 2024/25 appliance studies; SoftTech Supply & Hills Electronics (Kigali BOM, RWF); RRA/EAC import rules; Law 058/2021 (RwandaLII) + RURA/REG install guidance; Hanga PitchFest official + New Times; FEC 2026 / UNDP Youth4Climate / ClimaFii / EEP Africa / ACEP. Full citations in `01-research/`, `04-business/`, `05-build/appliance-load-data.md`.

---

## PRESENTER CHECKLIST
- [ ] Live demo loaded (Vercel URL) + offline screenshot fallback (`gridsense-*.png`).
- [ ] Switch to Kinyarwanda live during the demo.
- [ ] Say "simulated, labelled; tariff math is real" out loud on Slide 5.
- [ ] Rehearse the 9 Q&A answers cold.
- [ ] 12–15 min; leave ≥5 min for questions.
- [ ] One clear ask on the closing slide.
