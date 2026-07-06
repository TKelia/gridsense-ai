# 02 — The Channel: Sprint 1 (Sourcing, Funding, Regulation, Build)

> Rule 2 record. Date: 2026-06-22. The reasoning behind Sprint-1 decisions, saved so it's permanent and defensible.
> Facts cited here live in `01-research/research-findings.md`, `04-business/capex-opex.md`, `04-business/fundraising-plan.md`, `05-build/dashboard-build-plan.md`.

---

## 1. BOM pricing — Brainstorm → Stress-test → Deep-dive → Argue

**Brainstorm (where real prices could come from):** (A) Kigali local shops; (B) regional Kenya hubs; (C) international + a modelled Rwanda import-tax landed cost; (D) direct local quote.

**Stress-test:** (A) best if it exists, but Rwanda hobby-electronics retail is thin/often unlisted — risk of no data. (B) Kenya publishes prices, ships regionally — strong fallback. (C) always available, defensible only if duty/VAT/levies are *sourced* not guessed — good triangulation. (D) most accurate but I can't do it → Tesi action.

**Deep-dive (what happened):** (A) **won outright** — two Kigali shops (SoftTech Supply, Hills Electronics) sell the **entire BOM in RWF, in stock**. A local RWF shelf price already embeds import duty + 18% VAT + levies → it *is* the landed Rwanda cost. (B) used as a sanity check (SCT-013 Kenya ≈ KES 1,100–1,500). (C) verified the full Rwanda import stack (EAC CET 0–25%, VAT 18%, 5% WHT commercial, 1.5% IDL, 0.2% AUL, 0.2% plastic levy) and kept it only for the bulk/scaled case.

**Argue & defend:** local RWF retail is the **most defensible and conservative** basis — no import-model assumptions to attack, and bulk import would only be *cheaper*. 93% of the kit is live-sourced; the 7% estimated (passives + enclosure) is flagged. **Winner: price from Kigali retail; show import math only as the scaled-case cross-check.**

## 2. Funding — Brainstorm → Stress-test → Deep-dive → Argue

**Brainstorm:** Hanga (flagship) + climate/energy funds + youth/student grants + aggregators.
**Stress-test:** aggregators drift; deadlines mislead; student-eligibility is the make-or-break filter; over-claiming a "2026 Hanga date" would violate Rule 1.
**Deep-dive:** Hanga pattern fully verified (annual; MINICT+RDB+UNDP; 50M RWF top prize 2024 & 2025; apps closed 13 Jun 2025; finale 14 Nov 2025 BK Arena; top-25 → bootcamp → Nov finale; Agritech track confirmed). **No official 2026 call exists yet** → all 2026 specifics labelled UNCONFIRMED. Built a 5-grant shortlist (FEC 2026, Youth4Climate $30k, ClimaFii $70k, EEP Africa €200–500k, ACEP $5k) with sourced eligibility/deadlines.
**Argue & defend:** Hanga is the #1 target (continuity near-certain, prize dwarfs our need) but we **must not present projected dates as fact** — we monitor official channels and stay prototype-ready. Several grants have spring-2026 deadlines that may pass; honesty says note the next cycle. **The capstone depends on none of them** — funding is for scaling, per the locked strategy.

## 3. Regulation — Brainstorm → Stress-test → Deep-dive → Argue

**Brainstorm sources:** RURA, REG/EUCL, RSB, Electricity Act, electrician licensing.
**Stress-test:** the claim we *want* ("non-invasive, no approval needed") must not be asserted from absence of evidence; one contrary rule changes the pitch.
**Deep-dive:** no permit found for a behind-the-meter non-invasive CT (provided the meter/seals are untouched); **but** REG + RURA require electrical **installation work** to be done by **qualified/licensed technicians**; no CT-specific rule — general (likely IEC-aligned) safety standards apply.
**Argue & defend:** the honest, *stronger* claim → "behind-the-meter, non-invasive, no utility permit, we never touch the REG/EUCL meter; the CT is fitted at the board by a licensed electrician, the smart plugs are plug-and-play." Survives the regulator question and turns a compliance point into a credibility asset.

## 4. Dashboard build — Brainstorm → Stress-test → Deep-dive → Argue

**Brainstorm stacks:** (A) static + Chart.js; (B) React/Vite SPA on Vercel w/ simulation layer + stubbed ingestion; (C) full-stack + DB + live ingest; (D) Streamlit.
**Stress-test (vs <3 wks, $0, elite look, must not starve the pitch deck):** (C) most "real" but time-risky; (D) fast but generic-looking; (A) fast/free but reads as a toy; (B) elite look + free deploy + a *real* architecture slice (documented ingestion contract, simulated→live one-line swap) — best risk/reward.
**Argue & defend:** **(B) chosen** (Tesi approved). The documented ESP32→`/api/ingest` JSON contract + a pure, tested tariff engine make the demo a genuine product slice, not a mockup — defensible on demo day. Honesty badge + `source` flag keep us Rule-1 clean.

---

## Decisions locked this sprint
1. BOM priced from **Kigali RWF retail** (landed); import-tax model kept only for the scaled/bulk case.
2. Working **FX = 1,464 RWF/USD** (market, 21–22 Jun 2026); BNR official still to confirm for final accounting.
3. **Core monitor (~RWF 40,100) is the entry SKU**; smart plugs are an upsell — the payback math proves it.
4. Funding: **Hanga = #1 target**, dates UNCONFIRMED until the official 2026 call; 5-grant shortlist built; capstone depends on none.
5. Regulation claim reframed to the **honest, stronger** version (licensed electrician for the CT at the board).
6. Dashboard = **React/Vite → Vercel**, simulated-but-labelled data, real ingestion contract.

## Still flagged (Rule 1)
Behavioral savings % (range, needs a cited study) · enclosure + passives exact prices · BNR official FX · Kigali appliance mix · Hanga 2026 official call.
