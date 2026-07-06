// GridSense AI — Founder's Master Brief → Word (.docx)
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, TableOfContents, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak, ExternalHyperlink
} = require("docx");

const CW = 9360;
const ACCENT = "0B7A4B", DARK = "0B0F17", HEAD = "1F2937", MUT = "606060";
const T = (t, o = {}) => new TextRun({ text: t, ...o });
const P = (c, o = {}) => new Paragraph({ children: Array.isArray(c) ? c : [T(c)], spacing: { after: 120, line: 278 }, ...o });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [T(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [T(t)] });
const bullet = (c) => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 70, line: 276 }, children: Array.isArray(c) ? c : [T(c)] });
const numItem = (c) => new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 70, line: 276 }, children: Array.isArray(c) ? c : [T(c)] });
const spacer = () => new Paragraph({ children: [T("")], spacing: { after: 60 } });
const link = (t, u) => new ExternalHyperlink({ children: [new TextRun({ text: t, style: "Hyperlink", size: 20 })], link: u });
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
function cell(text, w, head = false) {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 110, right: 110 },
    shading: head ? { fill: HEAD, type: ShadingType.CLEAR, color: "auto" } : undefined,
    children: [new Paragraph({ spacing: { after: 0, line: 264 }, children: [T(text, { bold: head, color: head ? "FFFFFF" : undefined, size: 20 })] })] });
}
function table(widths, rows) {
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths,
    rows: rows.map((r, i) => new TableRow({ tableHeader: i === 0, children: r.map((c, j) => cell(c, widths[j], i === 0)) })) });
}
function codeBox(lines) {
  return new Paragraph({ shading: { fill: "0B0F17", type: ShadingType.CLEAR, color: "auto" },
    spacing: { before: 80, after: 120 }, border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 6 } },
    children: lines.flatMap((l, i) => [ new TextRun({ text: l, font: "Consolas", size: 18, color: "D1FAE5", break: i ? 1 : 0 }) ]) });
}

const doc = new Document({
  creator: "Tesi Songa Kelia", title: "GridSense AI — Founder's Master Brief",
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: HEAD }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ]
  },
  numbering: { config: [
    { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] },
    { reference: "n", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [ new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9", space: 2 } },
      children: [T("GridSense AI · Founder's Master Brief", { size: 16, color: "808080" })] }) ] }) },
    footers: { default: new Footer({ children: [ new Paragraph({ alignment: AlignmentType.CENTER,
      children: [ T("Tesi Songa Kelia · ALU Kigali · ", { size: 16, color: "808080" }), T("Page ", { size: 16, color: "808080" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "808080" }) ] }) ] }) },
    children: [
      // TITLE
      new Paragraph({ spacing: { before: 1700, after: 0 }, children: [T("")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [T("GRIDSENSE AI", { bold: true, size: 64, color: ACCENT })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 280 }, children: [T("Founder's Master Brief", { size: 30, color: HEAD })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [T("Everything I built, why, how it works, and how I win", { italics: true, size: 24, color: MUT })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [link("https://gridsense-ai-zeta.vercel.app", "https://gridsense-ai-zeta.vercel.app")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [T("Tesi Songa Kelia", { size: 24, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [T("BSc Software Engineering · African Leadership University, Kigali", { size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [T("June 2026", { size: 20, color: MUT })] }),
      new Paragraph({ children: [new PageBreak()] }),
      // TOC
      H1("Contents"),
      new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-1" }),
      new Paragraph({ children: [new PageBreak()] }),

      P([T("This is my single source of truth. It explains GridSense in my own voice — what it is, the root of how it is constructed, every part of the system, the verified data behind it, how I built it, and exactly how I present and defend it. If I can explain this document, I can explain GridSense to anyone: a panel, a regulator, an investor, a customer.", { italics: true })]),

      H1("1. What GridSense AI is"),
      P([T("GridSense AI is an AI-powered electricity intelligence platform for Rwanda.", { bold: true }), T(" It turns invisible, prepaid electricity spending into clear, real-time, money-saving insight — for a single household, for a landlord billing many tenants, and for enterprises managing many properties.")]),
      P([T("In one sentence: ", {}), T("“GridSense shows Rwandans exactly where their electricity money goes, warns them before the bill jumps a tier, and lets landlords bill tenants fairly and get paid on time.”", { italics: true })]),
      P([T("Who we are as a company: a Rwanda-built, Kigali-first energy-tech product that makes power consumption transparent, fair, and affordable.")]),
      P([T("Keywords / tags (positioning & SEO): ", { bold: true }), T("home energy monitor Rwanda, electricity cost calculator Rwanda, RURA tariff, EUCL cash power, prepaid electricity, landlord tenant billing Rwanda, sub-metering, kWh tracker, energy saving Kigali, smart-meter alternative, ESP32 energy monitor, tier-cliff alert, Kinyarwanda energy app, property-management utilities, GridSense.", { size: 20, color: MUT })]),

      H1("2. The problem (why this is genuinely needed)"),
      bullet([T("On 1 October 2025, Rwanda's residential electricity became steeply tiered: ", {}), T("89 RWF/kWh", { bold: true }), T(" for the first 20 kWh, "), T("310", { bold: true }), T(" for 20–50, "), T("369", { bold: true }), T(" above 50 (average tariff up ~15%).")]),
      bullet([T("Electricity is sold prepaid (“cash power”) — "), T("~99.7%", { bold: true }), T(" of meters. People see only a falling balance: no idea which appliance drains it, or when they cross into an expensive tier.")]),
      bullet([T("Crossing from 20→21 kWh makes the next unit cost "), T("3.5× more", { bold: true }), T(", invisibly.")]),
      bullet([T("For landlords it's worse: tenants are sub-billed and constantly dispute how they're charged because nobody can show them the math.")]),
      P([T("You can't manage what you can't see. GridSense makes it visible — and fair.", { bold: true })]),

      H1("3. The insight that shapes everything"),
      P([T("About half of connected homes use ≤20 kWh/month (the 89 RWF lifeline), where the absolute savings are tiny. So we do "), T("not", { italics: true }), T(" target “every household.” We target where the money and the pain actually are:")]),
      numItem([T("Tier-crossing urban homes", { bold: true }), T(" (cross into 310/369).")]),
      numItem([T("Landlords / property managers", { bold: true }), T(" — one buyer, many meters, real billing-dispute pain, ability to pay.")]),
      numItem([T("Small businesses & enterprises", { bold: true }), T(" (hotels, big apartment blocks) on the non-residential tariff (355–376 RWF/kWh on every unit — the most to save).")]),
      P([T("Mass-market lifeline homes are a later, grant-funded social-impact tier. We confronted the brutal economics instead of hiding them — and that reshaped the product into a platform with tiers.")]),

      H1("4. What I actually built (the live product)"),
      P([T("A real, deployed, tested web platform — not slides: "), link("https://gridsense-ai-zeta.vercel.app", "https://gridsense-ai-zeta.vercel.app"), T(".")]),
      H2("For individuals (Home)"),
      bullet("Personalized setup (home type, people, appliances + hours) so the dashboard reflects their home."),
      bullet([T("Live Now", { bold: true }), T(" (live kW, month-to-date RWF, the signature tier-cliff alert), "), T("This Month", { bold: true }), T(" (usage vs tier thresholds + forecast), "), T("Appliances", { bold: true }), T(" (sourced breakdown), "), T("Save", { bold: true }), T(" (honest RWF-quantified tips).")]),
      bullet("Dark/light theme, English/Kinyarwanda, share, save/print."),
      H2("For landlords (Property workspace)"),
      bullet("Add properties → units → tenants (name, phone, email) → meter readings."),
      bullet([T("Exact per-tenant amount due", { bold: true }), T(" from the real tariff, with billing period and due date.")]),
      bullet([T("Invoice / Receipt / Consumption Report", { bold: true }), T(" as branded, printable PDFs.")]),
      bullet([T("Send", { bold: true }), T(" to the tenant via WhatsApp / SMS / email (pre-filled), plus payment reminders as a downloadable calendar (.ics) firing 5/3/2/1 days before, the morning of, and the 12:00 due moment.")]),
      bullet("Portfolio overview (total due, paid/unpaid, consumption)."),
      H2("Accounts, welcome, monetization & brand"),
      bullet([T("Accounts: ", { bold: true }), T("sign-up collects name/email/phone (+250-normalized) + a username (auto-suggested, uniqueness-checked) and a password (generator, live strength meter, requirement checklist). Login by username, phone, or email. Passwords hashed with Web Crypto (salted SHA-256) — never plaintext; demo accounts stay in the browser; production uses a managed auth backend. Guest “Explore the demo” stays password-free.")]),
      bullet([T("Welcome on sign-up: ", { bold: true }), T("branded HTML email + SMS, in-app one-tap send via mailto/WhatsApp/SMS; an Edge serverless function (/api/welcome) sends for real when provider keys are set and honestly no-ops without them.")]),
      bullet([T("Monetization: ", { bold: true }), T("Pricing (Home free; Landlord Starter/Growth; Enterprise) + cart + checkout (demo, no card charged, provider-ready) + a connected-device add-on tier.")]),
      bullet([T("Brand & SEO: ", { bold: true }), T("custom logo + favicon + social card; consistent premium layout; Organization + SoftwareApplication JSON-LD, meta, canonical, OG/Twitter, sitemap.xml, robots.txt; an “Official sources & references” section linking the live REG / RURA / Law 058/2021 / NCSA / DPO pages.")]),

      H1("5. How it's constructed — the root"),
      H2("5.1 The data path (the spine)"),
      codeBox([
        "[ Sensors ]            [ Edge ]          [ Cloud ]            [ App ]",
        "CT clamp + plugs   ->  ESP32 (Wi-Fi)  -> /api/ingest      -> Web dashboard",
        "                       reads current    (JSON contract)      + tariff-aware AI",
      ]),
      bullet([T("Hardware (Phase 1): ", { bold: true }), T("a non-invasive CT clamp (SCT-013-000, 100A) around the home's main wire (after the meter — we never touch the utility meter), read by an ESP32 over Wi-Fi. Optional smart plugs for big appliances.")]),
      bullet([T("Ingestion contract: ", { bold: true }), T("every reading is { deviceId, ts, watts, source }. The demo emits the exact same shape, so real hardware swaps in with a one-line change. That's why the simulated demo is a true product slice, not a mockup.")]),
      bullet([T("The intelligence ", { bold: true }), T("runs on that stream: kWh → live RWF across the real tiers, month forecast, tier-cliff detection, and savings recommendations.")]),
      H2("5.2 The calculation (why it's exact)"),
      bullet([T("Rwanda bills in marginal blocks: bill = 20·89 + min(used−20,30)·310 + max(used−50,0)·369.")]),
      bullet([T("The tariff engine implements exactly this and is unit-tested: 100 kWh → ", {}), T("29,530 RWF", { bold: true }), T("; 150 → 47,980; 200 → 66,430. 9/9 tests pass — the defense against “are your numbers real?”")]),
      bullet([T("Electricity is VAT-exempt in Rwanda, and REG quotes rates VAT- & regulatory-fee-exclusive — so the consumer effectively pays the block rates. The calculation is the real consumer cost. Non-residential uses 355/376.")]),
      H2("5.3 The software (stack & repo)"),
      P([T("Stack: ", { bold: true }), T("React 19 + TypeScript + Vite + Tailwind v4 + Recharts; deployed free on Vercel; demo data persists in the browser. Tested with Vitest (unit) + Playwright (journeys); audited with Lighthouse (100s). Code lives in 05-build/dashboard/. The whole project (research, strategy, business, build, pitch) is organized in folders 01-research … 06-pitch, with PROJECT-REPORT.md as the living log.")]),

      H1("6. The data & sources (verified)"),
      bullet("Tariff (89/310/369; non-res 355/376): REG official tariffs page; RURA board decision."),
      bullet("VAT-exempt electricity: Rwanda tax summaries (PwC)."),
      bullet("Access 84.6%, 1.946M grid households; ~99.7% prepaid: REG; field studies."),
      bullet("Savings evidence (5–15% direct feedback; ~14% prepaid salience): Darby 2006 (Oxford/DEFRA), ACEEE 2010, Jack & Smith."),
      bullet("Connectivity (urban internet ~57%, 4G ~100%, smartphone ~34% of homes): DataReportal / TechCabal 2025."),
      bullet("Hardware prices (RWF): live Kigali retailers (SoftTech Supply, Hills Electronics)."),
      bullet("Law: Data Protection Law N° 058/2021 (NCSA); tenancy law (2006) + 2018 civil-procedure law; tenant privacy."),
      P([T("All five public reference links were re-verified live (HTTP 200) on 2026-06-22: ", { size: 20 }),
        link("REG tariffs", "https://www.reg.rw/customer-service/tariffs/"), T(", "), link("RURA", "https://www.rura.rw"), T(", "),
        link("Law 058/2021 (RwandaLII)", "https://rwandalii.org/akn/rw/act/law/2021/58/eng@2021-10-15"), T(", "),
        link("NCSA (cyber.gov.rw)", "https://cyber.gov.rw"), T(", "), link("Data Protection Office", "https://dpo.gov.rw"), T(".")]),

      H1("7. The numbers (economics & business model)"),
      spacer(),
      table([4680, 4680], [
        ["Item", "Figure"],
        ["Core whole-home monitor (BOM)", "≈ RWF 40,100 (~$27)"],
        ["Full kit (+2 metering plugs)", "≈ RWF 69,100 (~$47)"],
        ["100 kWh home monthly bill", "29,530 RWF"],
        ["Core-monitor payback @15% savings", "~9 months (heavy users ~6)"],
        ["Capstone-phase OPEX", "≈ $0 (free cloud, own Wi-Fi)"],
      ]),
      spacer(),
      P([T("Pricing (indicative): ", { bold: true }), T("Home free; Landlord ~RWF 9,900/mo (≤5 units) / ~RWF 29,000/mo (≤20); Enterprise from ~RWF 150,000/mo; device add-on (hardware one-time + ~RWF 2,500/device/mo live data). Savings shown as a 5–15% range, never a single fabricated figure.")]),
      P([T("Funding ladder: ", { bold: true }), T("$0 capstone demo → Hanga PitchFest (50M RWF) / FEC / Youth4Climate → pilot → larger grants → production.")]),

      H1("8. Regulation, ethics, trust"),
      bullet([T("Behind-the-meter, non-invasive", { bold: true }), T(" — no utility permit to clip a CT on your own wire; the REG/EUCL meter is never touched (board work by a licensed electrician).")]),
      bullet([T("Data protection by design", { bold: true }), T(" — compliant intent with Law 058/2021 (NCSA): consent, minimization, encryption. In the demo, data stays on the user's device.")]),
      bullet([T("Honesty as a feature", { bold: true }), T(" — every screen labels simulated data; the tariff math is real; “estimates, not an official bill — REG/EUCL is the billing authority.”")]),
      bullet([T("Tenant fairness", { bold: true }), T(" — transparent, itemized charges respect tenant privacy and end “I don't know how I'm charged” disputes.")]),

      H1("9. How I built it (my method)"),
      numItem("Understood the brief (the GridSense draft) and my own strengths."),
      numItem("Researched live and verified every fact (tariffs, VAT, laws, prices, evidence) — never assumed."),
      numItem("Ran “the Channel” on every decision: brainstorm → stress-test (kill weak ideas) → deep-dive → argue & defend. (e.g., killed “real card payments now” and “auto-SMS from a server” as not honestly buildable yet; chose deep-link + .ics + integration-ready checkout instead.)"),
      numItem("Built the product in React/Vite/Tailwind, tested it (unit + e2e + Lighthouse), deployed to Vercel."),
      numItem("Documented everything in the repo and this brief; kept PROJECT-REPORT.md as the running record."),

      H1("10. How I present it (12–15 min)"),
      numItem([T("Hook (feel the pain): ", { bold: true }), T("“Rwandans just got a tiered power bill — and no way to see it coming.” Show the falling-balance problem.")]),
      numItem([T("The insight: ", { bold: true }), T("half of homes can't pay for savings; the money is with tier-crossers, landlords, SMEs.")]),
      numItem([T("Live demo (centerpiece): ", { bold: true }), T("set up a home → Live Now tier-cliff alert → switch to Kinyarwanda → Landlord workspace: add a tenant, show exact amount due, generate the invoice, hit Send (WhatsApp), add reminders. Say: “sensor data is simulated and labelled; the tariff math is real and sourced.”")]),
      numItem([T("It's real & feasible: ", { bold: true }), T("architecture (CT→ESP32→cloud→app, same JSON contract), sourced BOM, under-12-month payback, unit-tested tariff.")]),
      numItem([T("Business: ", { bold: true }), T("tiers + pricing + device add-on; the funding ladder (Hanga).")]),
      numItem([T("Trust: ", { bold: true }), T("VAT-exempt exact math, Law 058/2021, behind-the-meter.")]),
      numItem([T("Close: ", { bold: true }), T("impact (fairer bills, less waste, energy literacy) + the ask (validation, a pilot, Hanga). “GridSense AI — see your power, spend less.”")]),

      H1("11. The hard questions & my answers"),
      spacer(),
      table([3200, 6160], [
        ["If they ask…", "My answer"],
        ["Who actually pays?", "Tier-crossers, landlords, SMEs; mass-market is a later impact tier. Economics shown."],
        ["Sense/Emporia exist.", "None localized: no RWF tiers, no Kinyarwanda, not Rwanda-priced/serviced, no landlord billing. That's the moat."],
        ["Is the AI real?", "Tariff-aware analytics + rules + forecasting now; ML/anomaly next; NILM later. Never claim what isn't built."],
        ["Did you build hardware?", "Proven off-the-shelf (ESP32+SCT-013); real ingestion contract + live app; a pilot installs it."],
        ["Are your numbers real?", "Live Kigali prices + verified RURA tiers; unit-tested engine; electricity VAT-exempt so the bill is exact."],
        ["Privacy / touch the meter?", "Law 058/2021 by design; behind-the-meter, non-invasive; never touches the utility meter."],
        ["How do you make money?", "Landlord/enterprise subscriptions + device add-on; individuals free for adoption."],
      ]),

      H1("12. Roadmap (honest, staged)"),
      bullet([T("Phase 1 (now): ", { bold: true }), T("whole-home CT + ESP32 + plugs; tariff-aware app; landlord billing; demo live.")]),
      bullet([T("Phase 2: ", { bold: true }), T("by-area (multi-circuit) monitoring; GSM/SMS for non-Wi-Fi homes; real payment provider (MTN MoMo/Flutterwave/Stripe); server-side auto email/SMS; live device fleet.")]),
      bullet([T("Phase 3: ", { bold: true }), T("ML forecasting → anomaly detection → appliance disaggregation (NILM); tenant self-service portal; multi-property analytics.")]),

      H1("13. My one-paragraph “how I did this”"),
      P([T("“I started from a real, dated change in Rwanda — the new tiered electricity tariff — and verified every number against REG and RURA. I realized most homes can't justify a savings device, so I aimed GridSense at the people who feel the cost: tier-crossing homes, landlords, and businesses. I built a working web platform in React that calculates the exact bill from the real tariff (it's unit-tested), personalizes to each home, and gives landlords per-tenant invoices, reminders, and reports. The hardware is a simple, proven ESP32 + clamp sensor, and my demo speaks the same data format so real devices plug straight in. It's deployed, bilingual, privacy-by-design under Law 058/2021, and priced to pay for itself in under a year. I didn't fake anything — where something needs a payment processor or a server, I built it integration-ready and said so.”", { italics: true })]),
    ]
  }]
});

Packer.toBuffer(doc).then((buf) => { const out = process.argv[2] || "GridSense-Master-Brief.docx"; fs.writeFileSync(out, buf); console.log("WROTE " + out + " (" + buf.length + " bytes)"); });
