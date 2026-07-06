# GridSense AI ⚡

**An AI-powered residential energy monitoring system for Rwandan households.**
Track electricity use by area and appliance, get personalized money-saving advice, and cut your bill with data.

> **Tesi Songa Kelia** — BSc Software Engineering, African Leadership University, Kigali, Rwanda.



Rwandan families pay rising, *tiered* electricity prices but have almost no visibility into where their power goes. GridSense AI makes consumption visible — by room and by appliance — and uses AI to tell each household exactly how to spend less.

## Why now 
- New tiered tariffs (effective 1 Oct 2025): **89 RWF/kWh** for the first 20 kWh, then a steep jump to **310 RWF/kWh**, then **369 RWF/kWh** above 50 kWh. Crossing a tier is expensive — and invisible to most users today.
- **84.6%** of Rwandan households now have electricity access (59.6% grid, 25% off-grid), so the addressable base is large and growing.
- Global energy monitors (Sense, Emporia, etc.) are **not localized** for Rwanda — no RWF tiered-tariff logic, no Kinyarwanda, no Rwanda-priced hardware. That's our gap.

## How it works (two phases)
- **Phase 1 — Area monitoring:** non-invasive CT clamp sensors at the home's electrical distribution board + an ESP32 microcontroller send readings over Wi-Fi to the cloud. Low cost, easy to adopt.
- **Phase 2 — Appliance monitoring:** smart plugs add device-level detail for high-consumption appliances.
- **App + AI:** a simple web dashboard shows real-time use, reports, alerts, and AI recommendations that learn each household's pattern.

## How to navigate this repo
| File / folder | What's inside |
|---|---|
| `RULES.md` | How we work, in plain language. |
| `DIRECTION.md` | Vision, scope, target user, phase plan, locked decisions. |
| `PROJECT-REPORT.md` | Living log of every decision and change. |
| `01-research/` | All verified facts with sources. |
| `02-strategy/` | Stress-tests, the hard arguments, the defense. |
| `03-product/` | Architecture, hardware, UX. |
| `04-business/` | Costs (CAPEX/OPEX), business model, fundraising plan. |
| `05-build/` | Firmware + web app + AI code. |
| `06-pitch/` | Capstone defense and pitch materials. |
