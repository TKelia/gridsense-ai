# 01 — Research Findings (Grounded, Sourced)

> Rule 1: every fact here has a source. Items without a verified source are tagged `⚠️ UNVERIFIED`.
> Last updated: 2026-06-22 (Sprint 1 — BOM, FX, regulation, funding verified in Claude Code).
> Currency note: **1 USD ≈ 1,464 RWF** — market mid-rate, 21–22 June 2026 (Investing.com USD/RWF ≈ 1,464; Coinbase 1,464; currency.me.uk 1,463.79). `⚠️ Use BNR official daily reference rate (bnr.rw) for final accounting` — not machine-accessible this session; market vs official spread is typically small. (Prior ~1,400 working figure is now superseded.)

---

## 1. Electricity tariffs in Rwanda (THE core of our value proposition)

**Residential end-user tariffs, effective 1 October 2025 (set by RURA, billed by REG/EUCL):**

| Monthly consumption block | Price | Note |
|---|---|---|
| 0–20 kWh | **89 RWF/kWh** | "Lifeline" rate, protects low-income homes. Bracket expanded from 0–15 to 0–20 kWh in 2025. |
| 20–50 kWh | **310 RWF/kWh** | ~3.5× jump from lifeline. |
| Above 50 kWh | **369 RWF/kWh** | Highest residential block. |

- New **average** tariff ≈ **214 RWF/kWh**, a **15.1% increase** from the previous 186 RWF/kWh.
- **Strategic insight:** the tier structure creates painful "cliffs." A household that creeps from 20 → 21 kWh starts paying 3.5× more on the marginal unit. Most users have **no idea** which appliance pushed them over. This invisibility is exactly what GridSense sells against.

Sources: [REG Tariffs](https://www.reg.rw/customer-service/tariffs/) · [RURA press release (PDF)](https://www.rura.rw/fileadmin/user_upload/RURA/Documents/Press_Release/Press_Release_for_New_Electricity-End_User_Tariffs.pdf) · [REG new tariff PDF](https://www.reg.rw/fileadmin/user_upload/New_Tariff_effective_from_1st_October_2025.pdf) · [KT Press](https://www.ktpress.rw/2025/09/new-power-tariffs-small-consumers-manufacturers-are-biggest-winners/) · [Rwanda Inspirer](https://rwandainspirer.com/rwanda-announces-updated-electricity-tariffs/)

---

## 2. Electricity access & the market

- **84.6%** of Rwandan households have electricity access as of July 2025 — **59.6% on national grid**, **25.0% off-grid** (mainly solar).
- **1.946 million** households connected to the grid; **+137,502** new grid connections in 2023/24 alone.
- EUCL (Energy Utility Corporation Limited), a subsidiary of Rwanda Energy Group (REG), retails electricity to end-users and is **upgrading its prepaid "cash power" vending system** to newer international standards.

Sources: [REG — Electricity Access](https://www.reg.rw/what-we-do/access/) · [Rwanda Dispatch](https://rwandadispatch.com/from-tariffs-to-clean-energy-how-rwandas-energy-sector-is-faring/) · [REG — power vending upgrade](https://www.reg.rw/media-center/news-details/news/reg-kicks-off-the-upgrade-of-power-vending-system/)

---

## 3. Household consumption baselines (decides WHO we target)

- **National average:** ~**20.8 kWh/month** per household.
- **Rural connected household:** ~**8.1 kWh/month**.
- **~50%** of connected households use **< 240 kWh/year** (~20 kWh/month → at/below the lifeline tier).
- **Only ~7%** use **> 1,800 kWh/year** (~150 kWh/month).
- A 2015 Kigali study measured ~3.66 kWh/household/day for the sampled urban homes (higher-consumption segment).

**Strategic insight (this is decisive — see stress-test doc):** half of all connected homes sit at/below the 20 kWh lifeline, where the *absolute* money to be saved is tiny. The real savings opportunity — and willingness to pay — lives in **middle- and higher-consumption urban households, landlords, and small businesses** that cross into the 310 and 369 RWF tiers. Targeting must reflect this.

Sources: [Frontiers — Kigali household consumption study](https://www.frontiersin.org/journals/sustainable-cities/articles/10.3389/frsc.2023.1130758/full) · [IGC — long-term grid adoption rural Rwanda](https://www.theigc.org/blogs/climate-priorities-developing-countries/long-term-adoption-grid-electricity-evidence-rural) · [World Bank — kWh per capita](https://data.worldbank.org/indicator/EG.USE.ELEC.KH.PC?locations=RW)

---

## 4. Competitor / prior-art scan

| Product | What it is | Price (intl, ⚠️ verify) | Gap for Rwanda |
|---|---|---|---|
| **Sense** | Whole-home monitor, ML appliance detection, premium | ~$300 | Expensive; US-centric; no RWF tiers; cloud-dependent. |
| **Emporia Vue 3** | Whole-home + branch circuits (16×50A), ±2%, value pick | budget vs Sense | No local tariff logic, no Kinyarwanda, import cost. |
| **IoTaWatt** | Open-source/DIY, local data (no cloud) | DIY | Hobbyist; no consumer UX, no AI advice, no localization. |
| **Bidgely** | Utility-side AI / NILM analytics (B2B) | enterprise | Sold to utilities, not households. |

**Conclusion:** strong tech exists, but **none is localized, affordable, and consumer-friendly for Rwanda**. No competitor encodes Rwanda's tiered RWF tariff, speaks Kinyarwanda, or is priced/serviced for the local market. That is GridSense's defensible wedge.

Sources: [Earthly Ours — Best Home Energy Monitors 2026](https://earthlyours.com/best-home-energy-monitors-2026/) · [Emporia comparison](https://www.emporiaenergy.com/blog/home-energy-monitor-comparison/) · [Wholehousefan — 2025 picks](https://www.wholehousefan.com/blogs/wholehousefans/home-energy-monitor-devices)

---

## 5. Hardware — LOCAL RWANDA BOM (VERIFIED, Sprint 1)

**Key finding: the full Phase-1 BOM is available in Kigali, priced in RWF, in stock.** Two local shops — **SoftTech Supply** (softechsupply.com) and **Hills Electronics** (hillselectronics.rw) — sell ESP32, SCT-013 CT clamps, metering smart switches, PSUs, and jumpers. A Rwandan retailer's RWF price already includes import duty + 18% VAT + levies → these are **landed Rwanda prices**, the strongest cost basis.

| Component | Local price (RWF) | Source |
|---|---|---|
| ESP32 dev board (ESP-WROOM-32) | **15,500** | SoftTech ✓ (Hills Electronics also 15,500 — corroborated) |
| SCT-013-000 **100A** CT clamp | **12,000** | SoftTech ✓ |
| 16A Tuya WiFi switch **w/ power metering** (smart plug) | **14,500** | SoftTech ✓ |
| 5V 3A DC power supply (220V AC→5V) | **5,000** | SoftTech ✓ |
| Jumper wires (DuPont set) | **2,000–2,600** | SoftTech ✓ |
| Burden resistor + bias passives (bundle) | ~1,000 `⚠️ estimate` | SoftTech passives |
| Enclosure / junction box | ~4,000 `⚠️ estimate` | local hardware (STS lists no project box) |

→ **Whole-home monitor sub-kit ≈ RWF 40,100 (~$27.4); full kit w/ 2 metering plugs ≈ RWF 69,100 (~$47.2).** Full BOM, unit economics, and payback in `04-business/capex-opex.md`. Regional cross-check: SCT-013-100 in Kenya ≈ KES 1,100–1,500 (ASK Electronics, Nerokas) — confirms the RWF 12,000 local price is reasonable.

- Reference open-source designs (ESP32 + SCT-013 + EmonLib; CircuitSetup 6-channel ESP32 meter) prove buildability and seed our firmware.
- **Architecture choice:** build on ESP32+CT (not a closed Tuya CT meter, also sold locally) so we own the firmware and can run the **tariff-aware AI + Kinyarwanda layer** — the moat (§4).

Sources: [SoftTech Supply — Kigali](https://www.softechsupply.com/shop) · [Hills Electronics — Kigali](https://hillselectronics.rw/product-category/development-boards/) · [ASK Electronics Kenya — SCT-013](https://askelectronics.co.ke/product/high-quality-30a-50a-100a-sct-013-030-sct-013-050-sct-013-000-non-invasive-ac-current-sensor-split-core-current-transformer/) · [SimplyExplained — ESP32 + SCT-013 build](https://simplyexplained.com/blog/Home-Energy-Monitor-ESP32-CT-Sensor-Emonlib/) · [CircuitSetup 6-ch ESP32 energy meter](https://github.com/CircuitSetup/Expandable-6-Channel-ESP32-Energy-Meter/blob/master/README.md)

---

## 6. Regulation & government validation

- **Data protection:** Law **No. 058/2021** on the Protection of Personal Data and Privacy (gazetted 15 Oct 2021). Supervisory authority = **National Cyber Security Authority (NCSA)**; controllers/processors must register and apply technical + organizational safeguards. GridSense collects household consumption data → **we are a data controller** and must comply. This is a credibility asset in the capstone & with government.
- **Energy sector:** **RURA** regulates utilities/tariffs; **REG/EUCL** is the utility. GridSense Phase 1 is **behind-the-meter** (CT clamp on the household's own circuits, after the utility meter) — it does **not** alter or tap the utility meter.

**Install / electrical-safety rule — VERIFIED (Sprint 1):**
- **No permit required for the device itself.** No RURA, REG/EUCL, or RSB instrument found that requires approval to clip a **non-invasive CT** around your own conductors **downstream of the meter**, provided the **utility meter and its seals are never touched, bypassed, or tampered with** (tampering falls under anti-theft provisions of Electricity Act Law 21/2011). RURA's Electricity Quality of Service Regulations (02/R/EL-EWS/RURA/2016) contain no clause on monitoring devices or CT clamps.
- **BUT installation work should be done by a qualified/licensed technician.** REG states publicly: *"Any electrical installation activity in premises, whether residential or commercial, must be done by qualified technicians,"* and RURA licenses electrical installers (Energy FAQs). Any work **inside the consumer unit / distribution board** is "installation activity" → use a licensed electrician. The plug-in smart plugs need no electrician; clamping the CT on the main feed near the board is the part to have a professional do.
- **No CT-specific rule exists** — the device is governed by general electrical-safety/installation standards (RSB/RURA, likely IEC-60364-aligned `⚠️ exact RS/IEC number not publicly confirmed`). Device should be IEC-conformant (e.g. IEC 61010 for current clamps).

**Defensible claim for the pitch:** *"Phase 1 is behind-the-meter and non-invasive — no utility permit is needed and we never touch the REG/EUCL meter. For safety and code compliance, the CT is fitted at the board by a licensed electrician (the smart plugs are plug-and-play)."* This is honest and survives the regulator question.

Sources: [RISA — Data Protection Law](https://www.risa.gov.rw/data-protection-and-privacy-law) · [RwandaLII — Law 058/2021](https://rwandalii.org/akn/rw/act/law/2021/58/eng@2021-10-15) · [RURA Electricity Quality of Service Regs (PDF)](https://www.rura.rw/fileadmin/user_upload/RURA/Documents/Sectors/Energy/Regulatory_Instruments/Energy_Regulations_and_Guidelines/Electricity_Quality_of_Service_Regulations-_March_16.pdf) · [REG — safety precautions on electrical installation](https://www.reg.rw/media-center/news-details/news/important-safety-precautions-on-electrical-installation/) · [RURA Energy FAQs](https://www.rura.rw/sectors/energy/faqs)

---

## 7. Funding landscape (for the fundraising plan)

- **Hanga PitchFest** — national startup competition by **RDB + MINICT + UNDP Rwanda**; top startups compete for a share of **$100,000** in grant money + non-cash prizes. Now in its ~5th edition. Strong target. ⚠️ Confirm 2026 dates, eligibility (student-stage), and whether a clean-energy/climate track exists.
- **FEC 2026 Innovation Challenge** — clean-energy innovation funding for Africa. ⚠️ Verify eligibility & deadline.
- General Rwanda startup grants/accelerators aggregated by StartupMap Africa and New Times "top funding initiatives."

Sources: [Hanga PitchFest official](https://www.hangapitchfest.rw/) · [Innovate Rwanda — Hanga](https://innovaterwanda.rw/en/opportunities/1) · [FEC 2026 Innovation Challenge](https://opportunitiesforyouth.org/2026/05/26/fec-2026-innovation-challenge-funding-and-scaling-africas-next-generation-of-clean-energy-innovators/) · [StartupMap Africa — Rwanda funding](https://startupmapafrica.com/funding/country/rwanda)

---

## Open research questions
**Resolved in Sprint 1 (2026-06-22):**
- ✅ Landed Rwanda BOM prices — local Kigali shops, RWF, §5 + `capex-opex.md`.
- ✅ Live USD↔RWF — 1,464 market (BNR official still `⚠️` for final accounting).
- ✅ Behind-the-meter CT install rule — §6 (no permit for device; licensed electrician for board work; no CT-specific rule).
- ✅ Hanga PitchFest — pattern verified; **2026 edition not yet announced** (apps ~June / finale ~Nov projected); no confirmed clean-energy track. `fundraising-plan.md`.

**Resolved in Validation pass (2026-06-22, Cowork) — see `01-research/evidence-and-validation.md`:**
- ✅ **Savings %** anchored in literature (Darby 5–15%; ACEEE avg ~9.2%; Faruqui 3–13%; Jack & Smith prepaid ~14%; ~3–5% large-scale floor). Payback now uses a conservative ~10% with 5–15% sensitivity.
- ✅ **Wi-Fi/smartphone penetration** — urban beachhead is connected (urban internet ~57%, 4G ~100%); mass-market needs GSM/SMS (Phase 2). Wi-Fi-only validated for Phase 1.
- ✅ **Kigali appliance mix** — done in `05-build/appliance-load-data.md` (water heater 59, fridge 36, TV 11, etc.).
- ✅ **Tariff confirmed against PRIMARY REG source** (89/310/369 residential); added non-residential 355/376 (strengthens SME beachhead).

**Still open:**
1. Confirm **enclosure (~RWF 4,000) + passives bundle (~RWF 1,000)** exact local prices; **BNR official FX**.
2. ⚠️ **VAT/regulatory-fee treatment of residential electricity** — REG rates are stated "VAT & regulatory-fee exclusive." Confirm whether these are added to consumer bills (would make real bills + savings *higher*; our payback stays conservative). Verify with RRA/REG.
3. When the **Hanga 2026 call** drops: confirm dates, student/registration eligibility, tracks.
