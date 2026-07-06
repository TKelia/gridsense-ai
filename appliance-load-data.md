# 05 — Kigali Appliance Load Data (Sourced) — for the demo simulation

> Grounds the dashboard's simulated data in real figures so the demo is defensible. Sprint 1 follow-up, 2026-06-22.
> Rule 1: wattage ranges are standard nameplate ratings corroborated by the sources below; consumption figures are from Rwanda/Kigali studies. Anything not sourced is tagged `⚠️`.

## Consumption baseline (mid/upper urban Kigali home)
- **Frontiers 2023 Kigali study:** mean ≈ **3.66 kWh/household/day (~110 kWh/month)** for sampled urban homes; weighted mean ≈ 1.88 kWh/day (~56 kWh/month). (Already in `01-research §3`.)
- Implication vs the verified RURA tiers (0–20 @89 / 20–50 @310 / >50 @369): a typical mid/upper home lands **well above 50 kWh/month**, squarely in the most expensive band — exactly our target.
- **Biggest driver of crossing 50 kWh = the refrigerator** (always-on): ~1.1–1.5 kWh/day → **~33–45 kWh/month alone**. Add anything else and the home is over the cliff. Electric **water heating** is the next big lever (~60 kWh/month at ~1 hr/day).

## Appliance power ratings + typical use (for the simulation)

| Appliance | Nameplate (W) | Typical use | ≈ kWh/month | Role |
|---|---|---|---|---|
| **Refrigerator** | 100–300 | always-on (cycles) | **~33–45** | 🔴 #1 always-on driver |
| **Electric water heater / geyser** | 1,500–3,000 | ~1 hr/day | **~60** | 🔴 biggest discretionary driver |
| **Electric kettle** | 1,500–2,200 | minutes/day | ~5–10 | 🟠 short but high-power spikes |
| **Microwave** | 600–1,500 | ~0.25 kWh/day | ~7.5 | 🟠 |
| **Electric iron** | ~1,000–2,000 `⚠️ range` | minutes/day | ~5–10 | 🟠 high-power spike |
| **Washing machine** | ~500–2,000 | ~0.7 kWh/cycle, ~3/wk | ~8–9 | 🟠 |
| **Television (+ decoder)** | 30–150 | ~0.36 kWh/day | **~11** | 🟡 steady evening load |
| **Ceiling fan** | 40–120 | ~0.24 kWh/day | ~7 | 🟡 |
| **Laptop** | 60–100 | ~0.2 kWh/day | ~6 | 🟢 small |
| **Phone charger** | <10 typical (adapter rated to ~75) | trickle | ~1–2 | 🟢 negligible |
| **LED bulb** | 5–15 | evenings | small | 🟢 (vs ~100 W incandescent — efficiency talking point) |

## Demo scenarios (composite, grounded)
- **Scenario A — "tier-crosser" (~100 kWh/mo):** fridge ~35 + TV/decoder ~11 + lighting + laptop ~6 + fan ~7 + occasional kettle/microwave/iron → ~90–110 kWh → deep in the **369 RWF** band. Bill ≈ 29,530 RWF (matches `capex-opex §4`). **Default demo home.**
- **Scenario B — "heavy user" (~180–200 kWh/mo):** Scenario A **+ electric water heater (~60 kWh)** + washing machine → 150–200 kWh. Bill ≈ 47,980–66,430 RWF. Used to show big savings + fast payback.
- **The tier-cliff moment to dramatize:** a home sitting at ~48 kWh mid-month; one hot-water session or a few kettle/iron cycles tips it past 50 kWh → every further unit jumps to 369 RWF. This is the demo's emotional beat.

## How the simulation should use this
- Each appliance = a load profile (base wattage × a realistic on/off duty pattern by time of day: fridge cycling, evening TV/lighting peak, morning/evening water-heater spikes).
- Sum → whole-home watts (feeds the "Live Now" kW + the CT-clamp analogue).
- Smart-plug appliances (2–3 biggest movers: fridge, water heater/iron) get their own series for the "Appliances" screen.
- Tariff engine converts cumulative monthly kWh → live RWF across the verified tiers.

## Sources
- [Frontiers 2023 — Kigali household consumption](https://www.frontiersin.org/journals/sustainable-cities/articles/10.3389/frsc.2023.1130758/full)
- [Columbia QSEL 2024 — Residential Appliance Ownership (Rwanda)](https://qsel.columbia.edu/assets/uploads/blog/2024/publications/Residential_Appliance_Ownership_Feb_08_24.pdf)
- [Columbia QSEL 2025 — Electricity consumption, grid reliability & appliance use in Rwanda](https://qsel.columbia.edu/assets/uploads/blog/2025/publications/Electricity-consumption-The-role-of-grid-reliability-in-appliance-ownership-and-usage-in-Rwanda.pdf)
- [Electrical Safety First — home appliance power ratings](https://www.electricalsafetyfirst.org.uk/guidance/safety-around-the-home/home-appliances-ratings/)
- [REG — tariffs](https://www.reg.rw/customer-service/tariffs/) · [World Bank — kWh per capita, Rwanda](https://data.worldbank.org/indicator/EG.USE.ELEC.KH.PC?locations=RW)

`⚠️ Open:` exact electric-iron nameplate range to firm up; appliance *ownership %* in the target segment (Columbia QSEL has this — extract in a later pass to weight scenarios).
