# 01 — Evidence & Validation (Defense Backbone)

During development we identified several assumptions that needed stronger evidence before they could support our project proposal. This document brings together the research we used to validate those assumptions, including expected energy savings, user behaviour, internet connectivity, electricity tariffs, and recent developments in Rwanda's energy sector. Where studies disagree, we include both perspectives and explain why we reached our conclusions.
---

## 1. Does energy feedback actually cut consumption? (closes the #1 gap)

The payback math previously rested on an **unproven 5–20% savings assumption**. Here is the real literature.

| Study | Finding | Type |
|---|---|---|
| **Darby (2006, Univ. Oxford / DEFRA)** — the seminal review | **Direct (real-time) feedback typically saves 5–15%.** Reviewed 38 studies; of 21 on direct feedback, savings ranged 0–20%, with **15 studies in the 5–14%** band. Direct feedback = "the single most promising form." | Literature review |
| **Faruqui et al. (2009/2010)** | In-home displays save **3–13%**. | Meta-analysis |
| **Ehrhardt-Martinez et al. (ACEEE, 2010)** | Real-time premise-level feedback saves **4–12%**, **average ~9.2%** (pilots 1995–2010). | Meta-analysis |
| **Recent large-scale critique** | Large, representative deployments are more modest — a realistic mass-scale effect of **~3–5%** (small pilots overstate). | Methodological review |
| **Jack & Smith (2015/2020, South Africa)** | **Prepaid metering cut consumption ~14%** — salience of a falling balance made households understand and control usage. | Field study |

**Why this is decisive for Rwanda (and a stronger argument than we had):**
- **Rwanda is ~99.7% prepaid** electricity meters. So Rwandan households *already* respond to crude salience (a falling "cash power" balance). Jack & Smith show that crude prepaid salience alone drives ~14% reductions.
- GridSense provides **far richer** feedback than a falling balance — real-time, per-appliance, tier-aware, with specific advice. It is reasonable to expect results **at least in the established 5–15% direct-feedback band**, plausibly toward the higher end given the prepaid-primed context.

**How we use it (defensible, conservative):**
- **Headline payback anchored at ~10%** (within every meta-analysis range, below the ~14% prepaid result).
- **Sensitivity shown 5–15%**, and we openly acknowledge the **~3–5% large-scale floor** and that our own pilot will measure the real number. This honesty *is* the defense.

Sources: [Darby 2006 (PDF)](https://smartgridawareness.org/wp-content/uploads/2016/05/effectiveness-of-feedback-on-energy-consumption-darby-2006.pdf) · [ACEEE — Ehrhardt-Martinez et al. 2010 (PDF)](https://www.aceee.org/sites/default/files/publications/researchreports/b122.pdf) · [Jack & Smith — Charging Ahead, prepaid metering (NBER PDF)](https://www.nber.org/system/files/working_papers/w22895/w22895.pdf) · [Pre-paid meters & behavior — Addis Ababa (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0301421522004700)

---

## 2. What real users say about energy monitors (validates value + UX + our honest AI)

| Product | Users like | Users complain | What it validates for GridSense |
|---|---|---|---|
| **Sense** (~$300, ML detection) | Active community; helpful once learned | **#1 complaint: device auto-detection is slow/incomplete and frustrating** | Our refusal to over-claim NILM is correct — even the market leader's ML disappoints. Honest scoping protects us. |
| **Emporia Vue** (value pick) | Hardware praised as solid, accurate | App "**functional but ugly and weird to navigate**"; **lots of CT wires** to organize in the breaker box | Validates our bet on **clean, simple UX** and a **single whole-home CT + plug** approach (fewer wires) over multi-CT complexity. |

**Take-away:** the market leaders win on hardware but lose on (a) over-promised AI and (b) clunky apps. GridSense's wedge — a clean, localized, honestly-scoped app — targets exactly their weak spots.

Sources: [Residential Tech Today — living with Sense](https://restechtoday.com/living-with-the-sense-energy-monitor-frustrating-but-helpful-overall/) · [Undecided (Matt Ferrell) — Sense review](https://undecidedmf.com/sense-energy-monitor-review/) · [DIY Solar Forum — Emporia vs Sense](https://diysolarforum.com/threads/energy-monitoring-emporia-vue-vs-sense.72781/)

---

## 3. Connectivity — does Wi-Fi-only hold up? (closes open Q on Wi-Fi)

Rwanda digital reality (2025):
- **~38% internet penetration** (forecast ~42.6%); **only ~20%** use mobile internet; **~34% of households own a smartphone**.
- **~1.35M households** have home internet (2025).
- **4G covers ~100%** of the population; ~13.3M mobile connections (~92% of population).
- Sharp urban/rural split: **urban internet use ~57% vs rural ~19%.**

**Verdict — Wi-Fi-only is correct for the beachhead, with eyes open:**
- Our beachhead (middle/upper-income **urban** homes, landlords, SMEs) sits in the **57% urban-connected, smartphone-owning** segment → Wi-Fi + a web app is the right Phase-1 choice.
- The low *national* smartphone/internet figures **confirm** mass-market reach needs **GSM + SMS/USSD** (no smartphone required) — already our **Phase 2** plan. The data validates the phasing instead of contradicting it.

Sources: [TechCabal — Rwanda 38% internet penetration (2025)](https://techcabal.com/2025/06/12/rwanda-internet-penetration-rate/) · [DataReportal — Digital 2025 Rwanda](https://datareportal.com/reports/digital-2025-rwanda) · [Statista — Rwanda digital/connectivity](https://www.statista.com/outlook/co/digital-connectivity-indicators/rwanda)

---

## 4. Tariff — confirmed against the PRIMARY source (and a new SME insight)

Fetched the **official REG tariff page** (effective 1 Oct 2025). It **confirms** the residential rates the dashboard uses, and adds high-value detail:

| Category | Rate (FRW/kWh, **VAT & regulatory-fee exclusive**) |
|---|---|
| **Residential** 0–20 / >20–50 / >50 | **89 / 310 / 369** ✅ confirmed |
| **Non-residential** 0–100 / >100 | **355 / 376** |
| Schools & higher learning | 214 (flat) |
| Health facilities | 214 (flat) |
| Hotels (<660,000 kWh / ≥) | 239 / 175 |
| Telecom towers | 289 |
| Industry (ToU w/ smart meter) | peak/off-peak/shoulder by size |

**Two things this changes:**
1. **The dashboard's 89/310/369 engine is validated against the primary source.** (A secondary news article had misreported 212/249 — disregarded.)
2. **SMEs/shops on the non-residential tariff pay 355–376 RWF/kWh on *every* unit** — far above residential. This **strengthens the SME/landlord beachhead**: the entity with the most to save is a small business, not a lifeline home.

⚠️ **New nuance to verify:** rates are stated **"VAT exclusive & Regulatory fee."** Confirm whether residential electricity is VAT-exempt/zero-rated or whether VAT + regulatory fee are added on the consumer's bill — if added, real bills (and therefore savings) are *higher* than the dashboard currently shows. Either way our payback is conservative. **Action:** verify VAT treatment of residential electricity (RRA/REG) before final bill figures.

Source: [REG — official Tariffs page](https://www.reg.rw/customer-service/tariffs/) · [RURA Board Decision on End-User Tariffs (PDF)](https://rura.rw/fileadmin/Documents/Energy/BoardDecisions/Board_Decision_on_Electricity_End_User_Tariffs_in_Rwanda.pdf)

---

## 5. Current sector context (keeps the pitch current)

- **REG is deploying smart meters** — but to **curb theft** and apply **Time-of-Use to *industrial*** customers, not to give *residential* households appliance-level behavioral feedback. → REG smart meters are **complementary, not competing** with GridSense's consumer/behavioral layer. Useful answer to "won't the utility just do this?"
- **REG loses ~19bn RWF/year** to power theft + grid inefficiency — context for why the utility focuses on theft/industrial metering, leaving the residential efficiency/behavior gap open for us.
- National access **84.6%** (59.6% grid / 25% off-grid), still climbing — a growing addressable base.

Sources: [Africa Energy Portal — REG smart meters to curb theft](https://africa-energy-portal.org/news/rwanda-reg-install-smart-metres-curb-electricity-theft) · [Rwanda Dispatch — energy transition](https://rwandadispatch.com/from-tariffs-to-clean-energy-how-rwandas-energy-sector-is-faring/)

---

## Net effect on the project
- **Savings % is no longer an unsupported assumption** — it's anchored in Darby/ACEEE/Faruqui + the Rwanda-specific prepaid evidence. Payback stands.
- **Targeting is reinforced**: non-residential tariff math makes SMEs/landlords the sharpest wedge.
- **Wi-Fi-only validated** for the beachhead; GSM/SMS confirmed for Phase 2 scale.
- **Tariff engine validated** against the primary REG source.
- **One new ⚠️ to close:** VAT/regulatory-fee treatment of residential electricity.
