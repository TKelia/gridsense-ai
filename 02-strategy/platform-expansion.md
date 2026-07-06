# 02 — Platform Expansion: The Channel (brainstorm → stress-test → argue → decide)

> Scope: expand GridSense from a single-home dashboard into a multi-tier platform — Individual, Landlord/Property Manager, and Enterprise — with per-tenant billing, reports, payment reminders, subscriptions/checkout, and a connected-device tier.
> Date: 2026-06-22. Rule 1: verified facts cited; pricing/strategy items are labelled assumptions.

---

## A. Verified facts that anchor this expansion (no guessing)
- **Electricity is VAT-exempt in Rwanda.** Energy supplies are VAT-exempt, and REG tariffs are quoted "VAT & regulatory-fee exclusive." → A residential consumer effectively pays the **block rates 89 / 310 / 369 RWF/kWh** (a small regulatory fee may apply). **Our calculator is exact for the consumer bill** — this closes the earlier open VAT question in our favour. Sources: [REG Tariffs](https://www.reg.rw/customer-service/tariffs/) · [PwC Rwanda — Other taxes (VAT exemptions)](https://taxsummaries.pwc.com/rwanda/corporate/other-taxes).
- **Billing is block-marginal**, not flat: bill = 20·89 + min(used−20,30)·310 + max(used−50,0)·369. Our engine does exactly this (unit-tested: 100 kWh → 29,530; 150 → 47,980; 200 → 66,430 RWF).
- **Landlord–tenant law:** governed by Rwanda's tenancy law (2006) + the 2018 Law on civil, commercial, labour & administrative procedure (default/eviction). Tenants have a **right to privacy**; rent increases need **≥1 month notice**. Sub-metering/cost-allocation to tenants is common but must be transparent. Source: [Global Property Guide — Rwanda landlord/tenant](https://www.globalpropertyguide.com/africa/rwanda/landlord-tenant-law) · [Generis — Lease & tenancy laws in Rwanda](https://generisonline.com/understanding-lease-and-tenancy-laws-in-rwanda-a-comprehensive-guide/). ⚠️ Confirm exact tenancy-law citation with counsel before legal copy ships.
- **Data protection:** Law **N° 058/2021** (NCSA supervisory authority). Sharing a tenant's name/phone/email + consumption = processing personal data → consent + minimization + security required. We cite this as a trust asset. Source: [RwandaLII — Law 058/2021](https://rwandalii.org/akn/rw/act/law/2021/58/eng@2021-10-15).

## B. Brainstorm — who are we for, and what do they need?
1. **Individual / homeowner** — see live use, forecast, tier-cliff alerts, save. (Built.)
2. **Landlord / property manager** — many units, many tenants; needs each unit's consumption + **exact amount each tenant owes**, a clean report to send, and **payment reminders** so rent/utility is collected on time. The pain: *"tenants complain they don't understand how they're charged."* GridSense makes the charge transparent and defensible.
3. **Enterprise** (hotels, large apartment blocks, estates) — many meters, staff roles, exports, support. Higher-touch, custom.
4. **Connected-device customers** — install the GridSense device for **live, automatic** data instead of manual readings. Premium add-on, mostly for landlords/enterprise with big stakes.

## C. Stress-test — kill the weak ideas (honesty before building)
| Idea | Verdict | Why / what we do instead |
|---|---|---|
| Charge real cards / run live payments now | ❌ KILL (for the demo) | Needs a licensed payment processor (MTN MoMo / Flutterwave / Stripe) + merchant account + backend. Not stand-up-able in a static app, and money-movement is out of scope. **Build a premium, trustworthy checkout + cart + invoice/receipt flow that is integration-ready** (clearly "activate billing" stub), not fake charges. |
| Auto-send SMS/email reminders from a server | ❌ KILL (for the demo) | Needs a backend + Twilio/SMS gateway + scheduler. Instead: **generate the reminder schedule + one-tap send via WhatsApp/SMS/email deep links**, and **export .ics calendar events** (5/3/2/1 days before, morning-of, 12:00 due) the landlord adds once — these fire real device notifications with no backend. Honest, works today, upgrades cleanly to automated server sends later. |
| Claim live device data now | ❌ KILL | Phase-2 hardware. Present as a **clearly-scoped tier** with the real ingestion contract (`{deviceId, ts, watts, source}`); manual/estimated readings power the platform today, device makes it exact + automatic. |
| "It's for everyone" pricing | ❌ KILL | Individuals = free (adoption + data + capstone story). **Money comes from landlords/enterprise** who have real admin pain and ability to pay. |
| Fake tenant data out of nowhere | ❌ KILL (user's own point) | Onboarding **collects the landlord's real units + tenants + readings**; the platform calculates from THAT. Demo seeds are clearly labelled. |

## D. The defended architecture (what we build)
**Account types (after sign-in, user picks a workspace):**
1. **Home** (free) — the existing personalized dashboard.
2. **Property** (landlord) — a manager workspace: Properties → Units → Tenants; per-unit reading entry (manual now, device-live later); per-tenant **exact bill** from the verified tariff; **Report / Invoice / Receipt** PDFs; **Send** (WhatsApp/SMS/email deep links); **payment reminders + .ics**; a portfolio overview (total due, paid/unpaid, consumption).
3. **Enterprise** — Property features + multi-property roll-ups, team seats, exports, priority support, optional white-label. "Talk to us" + indicative pricing.

**Connected-device tiers (add-on, orthogonal to plan):**
- **Self-report** (no device): enter meter readings → exact bill + reports. Free/included.
- **Live (1 device/property main)**: GridSense whole-home device streams real data. Hardware one-time + small monthly data/cloud.
- **Live+ (per-unit / by-area)**: multiple sensors/smart plugs for unit-level automatic splits. Enterprise/large landlords.

## E. Pricing (PROPOSAL — `⚠️ ASSUMPTION`, grounded in cost & value; founder to finalize)
- **Home** — **Free.** (Adoption engine; optional Home+ later for long history/advanced AI.)
- **Property / Landlord** (monthly): **Starter** up to 5 units ~**RWF 9,900/mo (~$7)**; **Growth** up to 20 units ~**RWF 29,000/mo (~$20)**; **+RWF 1,200/unit/mo** beyond. Justified by admin-time saved + dispute avoidance; tiny vs rent collected.
- **Enterprise** — from ~**RWF 150,000/mo (~$100)**, custom by meters/seats. "Contact sales."
- **Device add-on** — one-time hardware (verified BOM: core ~**RWF 40,100**, full kit ~**RWF 69,100**) + **Live** data plan ~**RWF 2,500/device/mo**. (Hardware cost is sourced; the monthly is a proposal.)
- Annual = 2 months free (common SaaS hook). All RWF-first, USD shown.

## F. Trust & conversion (premium, "beyond the 1%")
- Trust cues: "Data protected — Law 058/2021 aligned", local-first storage in the demo, no card charged in demo, clear honesty badge, Rwanda-built.
- Hooks/CTAs: hero ("Stop guessing. Bill fairly. Get paid on time."), social-proof placeholders, "Start free", "See a sample tenant invoice", pricing "Most popular", sticky CTA, exit-intent later.
- Consistent layout system across ALL pages (same header/footer, spacing scale, card system, max-widths) — looks like one premium product.

## G. What this turn delivers vs. roadmap
- **This build:** account-type selection; landlord Property workspace (properties/units/tenants, readings, exact per-tenant billing); Report/Invoice/Receipt PDFs; Send via deep links; reminders + .ics; pricing + cart + checkout (demo, integration-ready); device tiers page; logo + favicon; premium consistent layout + visuals; legal pages updated with the verified laws above.
- **Roadmap (named, not faked):** real payment processor, server-side auto SMS/email, live device fleet, tenant self-service portal, multi-currency.
