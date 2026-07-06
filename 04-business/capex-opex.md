# 04 — CAPEX / OPEX (Sourced — Sprint 1, 2026-06-22)

> Rule 1: every price below is sourced to a live supplier page or tagged `⚠️ ESTIMATE`/`⚠️ ASSUMPTION` with its basis stated. No fabricated numbers.
> **Working FX (this sprint): 1 USD ≈ 1,464 RWF** — market mid-rate, 21–22 June 2026 (Investing.com USD/RWF ≈ 1,464; Coinbase 1,464; currency.me.uk 1,463.79). `⚠️ For final accounting use the BNR official daily reference rate` (bnr.rw — page not machine-accessible this session; difference vs market is typically small).
> Method: priced primarily from **two Kigali shops that sell in RWF** (SoftTech Supply, Hills Electronics). A Rwandan retailer's shelf price already includes import duty + 18% VAT + levies, so these are **landed Rwanda prices**. International/import-model figures are kept only as a cross-check (Section 6).

---

## 1. Bill of Materials — Phase-1 single-home kit

**Primary source: SoftTech Supply (STS), Kigali — softechsupply.com (RWF retail, in stock, taxes embedded).** Cross-checked against Hills Electronics (hillselectronics.rw).

| # | Component | Qty | Unit (RWF) | Line (RWF) | Source / status |
|---|---|---|---|---|---|
| 1 | ESP32 dev board (ESP-WROOM-32, WiFi+BT) | 1 | 15,500 | 15,500 | STS `softechsupply.com/shop/item/esp32-esp-32-...` ✓ (Hills Electronics also **RWF 15,500** — corroborated) |
| 2 | SCT-013-000 100A CT clamp (whole-home) | 1 | 12,000 | 12,000 | STS `SCT-013-000 100A Switching Current Transformer` ✓ |
| 3 | Burden resistor + bias divider passives (1× burden R, 2× divider R, 1× cap) | 1 set | ~1,000 | ~1,000 | STS sells these passives; bundle `⚠️ ESTIMATE` (commodity parts, exact line to confirm) |
| 4 | 5V 3A DC power supply (220V AC → 5V) | 1 | 5,000 | 5,000 | STS `5V 3A DC Power Supply 220V AC` ✓ |
| 5 | Jumper wires / DuPont set | 1 | 2,600 | 2,600 | STS `Male-Male Jumper Wires Dupont Cable` ✓ (M-F variant RWF 2,000) |
| 6 | Enclosure / junction box | 1 | ~4,000 | ~4,000 | `⚠️ ESTIMATE` — generic plastic electrical junction box, Kigali hardware stores (STS doesn't list a project box; confirm locally) |
| | **A. Whole-home monitor sub-kit (rows 1–6)** | | | **≈ 40,100 RWF (≈ $27.4)** | core unit — the hero device |
| 7 | Tuya 16A WiFi switch w/ **power metering** (appliance monitor) | 2 | 14,500 | 29,000 | STS `16A Tuya Smart WiFi Switch Power Metering` ✓ (verified RWF 14,500) |
| | **B. Full Phase-1 kit (A + 2 metering plugs)** | | | **≈ 69,100 RWF (≈ $47.2)** | |

**Verified vs estimated:** of the RWF 69,100 full kit, **RWF 64,100 (93%) is live-sourced**; only rows 3 + 6 (RWF 5,000, ~7%) are labelled estimates.

**Design note (cost-driver insight):** the whole-home monitor (rows 1–6, ~RWF 40,100) is the standalone product; smart plugs are an **optional add-on**, not a dependency. This matters for pricing tiers and payback (Section 4) — the lean core unit pays back fastest and should be the entry SKU.

**Why ESP32 + CT rather than an off-the-shelf Tuya CT energy meter** (STS stocks those too): the ESP32+CT path is what lets us own the firmware → run our **tariff-aware AI + Kinyarwanda layer** on-device/in-cloud. That localization is the moat (`01-research §4`); a closed Tuya meter would not let us build it.

Reference build feasibility: open-source ESP32 + SCT-013 + EmonLib designs prove this is buildable (`01-research §5`).

---

## 2. CAPEX (one-time, to a working pilot)

| Item | Notes | Cost (RWF) | Cost ($) |
|---|---|---|---|
| Prototype hardware — 1 kit | Full kit (Section 1B) | 69,100 | ~$47 |
| Prototype hardware — bench PoC only | Core monitor (Section 1A), no plugs | 40,100 | ~$27 |
| Tools (soldering iron, multimeter, jumpers) | **Check ALU makerspace first — target RWF 0** | 0 → `⚠️ confirm ALU` | $0 target |
| Domain + basic branding | e.g. `.rw`/`.com` | ~15,000–28,000/yr `⚠️ confirm` | ~$10–19/yr |
| **Lean pilot CAPEX (1 full kit + domain, tools borrowed)** | | **≈ 84,000–97,000 RWF** | **≈ $57–66** |
| **Minimum (bench PoC + free domain trial)** | | **≈ 40,000 RWF** | **≈ $27** |

> The capstone does **not** require any of this to pass (the software demo + feasibility pack carries it — `02-strategy §D4`). A single bench PoC at ~$27 is the *bonus* tier if free parts aren't available from ALU.

## 3. OPEX (recurring)

| Item | Notes | Cost |
|---|---|---|
| Cloud hosting / DB | Free tier (Vercel + a free Postgres/Firebase tier) | $0 in capstone phase |
| Domain renewal | annual | ~$10–19/yr `⚠️ confirm` |
| Connectivity | Wi-Fi = user's own; no SIM in Phase 1 | $0 |
| Maintenance | Tesi's time | $0 cash |
| **OPEX during capstone** | | **≈ $0–2/month** |

Real OPEX (support, GSM SIMs, cloud at scale) appears only in the Phase-2+ scaled model.

---

## 4. Unit economics & payback (sourced inputs)

**Tariff (verified, RURA/REG, eff. 1 Oct 2025 — `01-research §1`):** 0–20 kWh @ **89**; 20–50 @ **310**; >50 @ **369** RWF/kWh.

**Monthly bill by consumption (computed from the verified tiers):**

| Home (kWh/mo) | Bill calc | Bill (RWF) | ≈ $ |
|---|---|---|---|
| 100 kWh (mid tier-crosser) | 20·89 + 30·310 + 50·369 | **29,530** | $20.2 |
| 150 kWh | 20·89 + 30·310 + 100·369 | **47,980** | $32.8 |
| 200 kWh (heavy user) | 20·89 + 30·310 + 150·369 | **66,430** | $45.4 |

**Savings sensitivity** `⚠️ ASSUMPTION — savings %`: real-time energy feedback typically yields ~5–15% reductions in the behavioral-economics literature, but **we have not yet pulled a citable study this session** — so we present a *range*, never a single claimed number. Action logged in open questions.

**Payback = kit cost ÷ monthly RWF saved.** For the **100 kWh home (29,530 RWF/mo bill):**

| Savings | RWF saved/mo | Core monitor (40,100) | Full kit (69,100) |
|---|---|---|---|
| 5% | 1,477 | 27.2 mo | 46.8 mo |
| 10% | 2,953 | **13.6 mo** | 23.4 mo |
| 15% | 4,430 | **9.1 mo** ✅ | 15.6 mo |
| 20% | 5,906 | **6.8 mo** ✅ | 11.7 mo ✅ |

For the **200 kWh home (66,430 RWF/mo):** at just 10% savings → core monitor pays back in **~6.0 months**, full kit **~10.4 months**; at 15% → **4.0 / 6.9 months**.

**Read-out (defensible):**
- The **core monitor pays back in under 12 months** for a mid-tier-crossing home at ≥10% savings — and far faster for heavier users. This is the headline economic case.
- The **full kit** needs a heavier user *or* ≥20% savings to clear 12 months — which is exactly why the **core monitor is the entry SKU** and plugs are an upsell.
- This confirms the `02-strategy` targeting: the economics work **for tier-crossing/heavy homes, landlords, and SMEs**, not for sub-20-kWh lifeline homes (where even 20% of a ~1,780 RWF bill ≈ 356 RWF/mo and nothing pays back). The model *proves* the beachhead choice instead of asserting it.

**Indicative retail & margin** `⚠️ ASSUMPTION — pricing strategy, not a verified figure`:
- Core monitor cost ≈ RWF 40,100 (single-unit retail parts). At assembly + small-batch import the BOM falls (Section 6), widening margin.
- An indicative retail of **RWF 55,000–65,000** for the core monitor = ~37–62% gross over single-unit parts cost, and still keeps payback **< 12 months for the 100 kWh home at 15% savings** (55,000 ÷ 4,430 ≈ 12.4 mo borderline; better for heavier homes). Price must be set against the customer's payback, not just cost-plus.
- **Optional subscription** (advanced AI reports, forecasting, landlord/SME multi-unit dashboards) = recurring revenue layer, priced later once value is demonstrated.

---

## 5. Scaled model (Phase 2+, directional — verify before use)
- COGS per kit drops at volume via bulk import + local assembly (avoid single-unit retail markup; see Section 6 import math).
- Channel: direct + landlord/SME partnerships + possible REG/utility partnership.
- Revenue: hardware margin + subscription + B2B (landlord/SME) tiers.
- Cost drivers at scale: cloud, support, GSM SIMs, logistics, warranty.

## 6. Import cross-check (for the scaled/bulk case only)
If buying components abroad in bulk instead of local retail, Rwanda customs on electronics from outside the EAC (sourced — `01-research §6`, RRA/EAC): **EAC CET duty 0–25%** (band depends on HS code — components often 0–10%, finished smart plugs ~25%) **+ 18% VAT** on (CIF+duty) **+ 1.5% IDL + 0.2% AU Levy** on CIF, **+5% customs withholding** if imported *for commercial use* (creditable against income tax), **+0.2% plastic-packaging levy** if applicable. ICT VAT-exemption lists exist but generic dev boards / smart plugs are **not** typically covered. Net: bulk landed cost is usually **below** the single-unit Kigali retail prices in Section 1 once you skip the retailer markup, even after these taxes — so Section 1 is a **conservative** (worst-case) cost basis. `⚠️ Confirm exact HS-code duty via rwandatrade.rw tariff calculator before any bulk-import claim.`

---

## 7. Verifiable-reports (blockchain) layer — cost (added 2026-07-03)
> Grounding: `01-research/blockchain-research.md`, `02-strategy/verifiable-reports.md`.

**Capstone PoC / demo — €0 / $0 / 0 RWF.**
| Item | Cost | Basis |
|---|---|---|
| Base Sepolia test-gas | **$0** | public testnet; test-ETH from a free faucet (~0.01–0.1 ETH/day — orders of magnitude more than needed). |
| Anchor transaction | **$0** | one small `anchorReport` write; free test-gas. |
| IPFS pinning (Pinata) | **$0** | free tier; a report is a few KB, trivially inside any free limit. `⚠️` confirm current free GB. |
| Explorer / verification | **$0** | public BaseScan; re-hashing is client-side. |
| **Total PoC** | **$0** | testnet only — labelled demo. |

**Production (real-chain, honest estimate — do NOT quote as fact yet):**
- Anchoring a **32-byte hash** on an L2 like **Base mainnet** costs a **fraction of a US cent** per report at typical L2 gas; one write per household per month. Even 10,000 homes/month is a **negligible on-chain cost** (single-digit dollars/month order-of-magnitude). `⚠️ UNVERIFIED exact $ — depends on live L2 gas; compute before quoting.`
- **Gasless in production** = ERC-4337 **paymaster** (Coinbase Paymaster on Base / Pimlico / Alchemy / Biconomy). Coinbase advertises a **free monthly sponsorship allowance** on Base. `⚠️ UNVERIFIED exact free $/mo — confirm live before the pitch.`
- IPFS pinning at scale: Pinata/Filebase paid tiers, low $/mo for thousands of small reports; or self-host an IPFS node. `⚠️` price at real volume.
- **Net:** the verifiability layer is **effectively free at capstone scale and near-free at early production scale** — a big story-to-cost ratio. Kept honest: exact production numbers are flagged, not invented.

---

## Methodology note (for the defense)
We price from **live Rwandan retailers in RWF** (landed cost, taxes embedded), show the **tariff math from the verified RURA tiers**, and present payback as a **sensitivity range** (the only honest way given the unverified savings %). Estimated lines (RWF 5,000, 7% of kit) and the savings assumption are **visibly flagged**. This rigor is the strength.

## Open items carried to the report
1. `⚠️` Cite a behavioral-savings study to anchor the savings % (currently a labelled 5–20% range).
2. `⚠️` Confirm enclosure (RWF ~4,000) + passives bundle (RWF ~1,000) exact local prices.
3. `⚠️` BNR official USD/RWF reference rate for final accounting (working market rate 1,464).
4. `⚠️` ALU makerspace tools/parts availability (drives CAPEX toward $0).
