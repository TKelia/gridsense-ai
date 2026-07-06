# 02 — The Channel: Stress-Test & Deep Argument

> This is GridSense AI put through fire. Per Rule 2, we brainstorm, kill weak ideas, deep-dive, then argue and defend.
> Goal: reach the strongest, most defensible direction — and arm Tesi with answers to the hardest questions a capstone panel, a regulator, or an investor can throw.
> Date: 2026-06-22. Everything references verified facts in `01-research/`.

---

## A. THE BRUTAL TRUTH (the one weakness that could sink the pitch)

**Half of Rwanda's connected households use ≤ ~20 kWh/month** — they sit in the 89 RWF/kWh lifeline tier. A household at 20 kWh pays ~1,780 RWF (~US$1.30) a month. Even a heroic 20% saving = ~356 RWF (~US$0.25)/month. **No one buys a $30 device to save $0.25 a month.**

If GridSense pitches itself as "for every Rwandan household," a sharp panelist kills it in one question: *"Who actually pays for this, and does the math work for them?"*

**We confront this head-on instead of hiding it.** The answer reshapes the whole strategy → see Section D (targeting).

---

## B. BRAINSTORM — the option space (don't marry the first idea)

**B1. What exactly do we monitor first?**
- (a) **Multi-circuit "by area"** CTs inside the distribution board (the draft's Phase 1).
- (b) **Single whole-home CT** on the main incomer (cheapest, safest, one sensor).
- (c) **Appliance-first** via smart plugs only.
- (d) **Meter-reading** (optically read the prepaid meter's pulse LED / display).

**B2. Who is the first customer (beachhead)?**
- (a) Mass-market low-income homes.
- (b) Middle/upper-income urban homes (Kigali).
- (c) Landlords / multi-tenant compounds (sub-metering tenants).
- (d) Small businesses / shops / salons / small hospitality.
- (e) Institutions (schools, clinics, ALU itself).

**B3. What is "the product" for the capstone in <3 weeks with ~0 budget?**
- (a) Full working hardware in a real home.
- (b) Bench/breadboard hardware proof-of-concept.
- (c) **Software demo** (dashboard) fed by realistic data + a clear hardware design + feasibility evidence.
- (d) Hybrid: software demo + small bench PoC if any parts are obtainable.

**B4. How "AI" is the AI?**
- (a) Deep ML / NILM appliance disaggregation (what Sense does).
- (b) Tariff-aware analytics + rule-based recommendations.
- (c) Hybrid: rules + light ML (forecasting, anomaly detection) that grows with data.

---

## C. STRESS-TEST — kill the weak ideas

**B1 monitoring:**
- ❌ (a) Multi-circuit CTs first: requires opening the live distribution board, multiple sensors, a certified electrician, higher cost, and safety/liability risk. Too heavy for a first prototype and a self-install consumer product. *Survives only as Phase 2+.*
- ✅ (b) Single whole-home CT: one cheap non-invasive clamp on the main, real-time total use, tier-cliff alerts. Cheapest, safest, fastest. **Strong Phase-1 core.**
- ✅ (c) Appliance smart plugs: dead-simple, plug-and-play, no electrician, gives the "which appliance?" answer people actually want. **Strong, and pairs perfectly with (b).**
- ⚠️ (d) Optical meter reading: clever and ultra-cheap but fragile (meter models vary, mounting, lighting). Keep as a research curiosity, not the core.

**B2 customer:**
- ❌ (a) Mass low-income: economics don't work (Section A). Keep as a *future social-impact tier*, not the paying beachhead.
- ✅ (b) Middle/upper urban Kigali homes: they cross into 310/369 RWF tiers, own appliances, have Wi-Fi and smartphones, and feel the new tariff hike. **Real willingness to pay.**
- ✅✅ (c) Landlords / compounds: one buyer, many meters, a billing-dispute pain point (who used what), recurring value. **Possibly the best wedge.**
- ✅ (d) Small businesses: electricity is a real cost line; clear ROI story.
- ✅ (e) Institutions (incl. ALU): great for a credible capstone pilot and a reference logo.

**B3 capstone deliverable:**
- ❌ (a) Full home hardware in 3 weeks with $0: not realistic; over-promising risks failure on demo day.
- ✅ (c)/(d): a **polished software demo + rigorous hardware design + feasibility proof** is achievable, free, and — argued well — *more* impressive than a shaky breadboard. Add a tiny bench PoC only if parts are free/borrowable.

**B4 AI:**
- ❌ (a) Deep NILM now: data-hungry, months of labelled data, easy to over-claim and get caught. A panel will probe this.
- ✅ (c) Hybrid (rules + tariff math + light forecasting/anomaly detection): honest, achievable, and still genuinely useful. **Defensible.**

---

## D. THE DEFENDED DIRECTION (what we commit to, and why it beats the rest)

### D1. Reframe the mission (keeps the heart, fixes the economics)
GridSense is **not** "save every poor family $0.25." It is: *"Give Rwandan households and small property owners X-ray vision into a newly expensive, tiered power bill — and let AI tell them exactly how to spend less."* Social impact (energy literacy, efficiency, lower national peak demand, climate) is **real and fundable**, but the **paying beachhead is the segment that actually crosses the expensive tiers**: middle/upper urban homes, landlords/compounds, and small businesses. This is the honest, defensible position.

### D2. Product architecture (revised, stronger than the draft)
- **Phase 1 (beachhead):** **one whole-home CT clamp + ESP32 over Wi-Fi** for real-time total consumption, live RWF cost (tier-aware), and **tier-cliff alerts** ("You're 2 kWh from the 310 RWF tier"). **+ smart plugs** for the 2–3 biggest appliances so users get the "which device?" answer immediately. Cheap, safe, self-installable, no electrician for the plugs; CT clamp is non-invasive.
- **Phase 2:** multi-circuit "by-area" CTs in the DB (the draft's original Phase 1) for homes/landlords who want room-level detail — installed by a partner electrician.
- **Phase 3:** light **ML** — forecasting the month-end bill, anomaly detection ("your fridge is drawing 30% more than usual"), and eventually NILM disaggregation as data accumulates.
- **Connectivity:** **Wi-Fi-only for the beachhead is correct** — the target segment has it. GSM is a Phase-2 lever for scaling beyond Wi-Fi homes. (⚠️ confirm Wi-Fi penetration in target segment — open research Q.)

### D3. The AI, told honestly
"AI" = (1) tariff-aware analytics that convert kWh → live RWF across the real tiers; (2) rule-based, personalized recommendations grounded in each home's pattern; (3) forecasting + anomaly detection that improve as data grows; (4) a roadmap to appliance disaggregation. We **never** claim mature NILM we haven't built. Honesty here is a defense, not a weakness.

### D4. The no-prototype-by-deadline plan (our safety net)
If hardware isn't in a home by defense day, we still **win** with:
1. A **working web dashboard** (real UX) driven by realistic data — built from open household-load datasets + Rwanda tariff math, clearly labelled as simulated. Free to build, demo-ready, and shows the actual product experience.
2. A **bench proof-of-concept** (ESP32 + one CT reading a real load) *if* a sensor can be borrowed/bought cheaply — even a 10-second live reading is powerful.
3. A **rigorous feasibility pack**: validated BOM with real prices, wiring/architecture diagrams, references to proven open-source builds, and a deployment plan. This proves it's buildable, not hand-wavy.
4. An **elite pitch + defense** (Tesi's superpower) that frames demo-as-simulation confidently: *"The hardware is off-the-shelf and proven; our innovation is the localization, the tariff-aware AI, and the go-to-market — here it is working."*

### D5. Why this beats alternatives (the argument, in one breath)
A whole-home-CT + smart-plug beachhead aimed at tier-crossing urban homes/landlords is **cheaper, safer, faster to demo, and economically real** than the draft's multi-circuit-first, everyone-is-a-customer plan. It keeps the social mission as a fundable impact narrative without resting the business on households that can't pay. And it lets a broke student ship a credible capstone in 3 weeks.

---

## E. THE PANEL / INVESTOR / REGULATOR ATTACK LIST (pre-empt the hard questions)

| Hard question | Our defended answer |
|---|---|
| "Most homes use too little to bother. Who pays?" | We target tier-crossing urban homes, landlords, and SMEs (Section D1), with mass-market as a later impact tier. Economics shown in `04-business/`. |
| "Sense/Emporia already exist." | None are localized, RWF-tier-aware, Kinyarwanda-capable, or Rwanda-priced/serviced. Localization + AI + GTM is the moat (`01-research §4`). |
| "Is the 'AI' real?" | Yes, and honestly scoped: tariff-aware analytics + rules now, ML forecasting/anomaly next, NILM later (Section D3). |
| "Did you really build hardware?" | Hardware is proven off-the-shelf (open-source references); our build + feasibility pack + live demo prove it (Section D4). |
| "What about user data/privacy?" | Compliant with Law 058/2021; register with NCSA; consent + encryption + data minimization (`01-research §6`). |
| "Will it mess with the utility meter?" | No — Phase 1 is behind-the-meter, non-invasive CT after the meter; we don't touch REG/EUCL metering (⚠️ confirm install/safety rule). |
| "Can a normal person install it?" | Smart plugs: yes, plug-and-play. Whole-home CT: simple clamp; partner electrician for DB work in Phase 2. |
| "How do you make money?" | Device sale + optional subscription for advanced AI/reports; landlord/SME tiers; see `04-business/`. |

---

## F. DECISIONS LOCKED IN THIS PASS
1. Beachhead = tier-crossing **urban homes + landlords/compounds + SMEs**; mass-market = later impact tier.
2. Phase 1 = **whole-home CT + ESP32 (Wi-Fi) + smart plugs**; multi-circuit "by area" moves to Phase 2.
3. AI scoped **honestly**: tariff-aware analytics + rules → ML forecasting/anomaly → NILM later.
4. Capstone deliverable = **software demo + feasibility pack + elite pitch**, with bench PoC if parts are free; full-home hardware is a bonus, not a dependency.
5. Privacy/compliance (Law 058/2021 + NCSA) is built in from day one as a credibility asset.

## G. Still open (needs verification before final claims)
- Local landed BOM cost; live FX; install/safety regulation; Hanga 2026 eligibility/dates; target-segment Wi-Fi penetration; Kigali appliance mix for savings modeling.
