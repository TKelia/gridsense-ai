# GridSense AI —

GridSense AI is our software engineering capstone project exploring how affordable technology can help households in Rwanda better understand and reduce their electricity consumption. The current prototype combines appliance-level monitoring, AI-generated energy recommendations, tariff-aware cost estimation, and blockchain-backed report verification. Rather than building a commercial product, this project focuses on demonstrating that these components can work together in a practical solution.

- **Live app:** https://gridsense-ai-zeta.vercel.app
- **Operator:** Tesi Songa Kelia — BSc Software Engineering, African Leadership University, Kigali
- **Core focus (scoped to the proposal):** appliance-level consumption monitoring + AI recommendations + tier alerts, plus a blockchain verifiable-report layer.

> **Demo :** sensor data in the hosted demo is **simulated and labelled**; the
> tariff math is **real and unit-tested** against the RURA tiers. The blockchain layer is on
> a **free public testnet (Base Sepolia)** — no token, no payment, no personal data on-chain.

---

## 1. What it does (core functionality — what the demo shows)
1. **Live Now** — live power (kW), month-to-date kWh + RWF, a tier gauge, and a **tier-cliff alert** ("you're 2.5 kWh from the 369 RWF tier").
2. **This Month** — cumulative kWh vs the 20/50 kWh tier lines, run-rate forecast to month-end.
3. **Appliances** — **how much each appliance consumes**: per-appliance kWh, RWF, % share, and live watts (fridge, water heater, TV, iron/kettle, fan, laptop…).
4. **Save** — an honest, rule-based **recommendation engine** (cliff-crossing, biggest controllable load, standby) with savings shown as **estimated ranges**, never fabricated figures.
5. **Verify a report** — a wallet-less page that **re-hashes a monthly report (SHA-256)** and checks it against the fingerprint **anchored on Base Sepolia**, with a **tamper demo** and BaseScan / IPFS links.
6. **Bilingual** — full **English + Kinyarwanda** (RW marked as draft pending native review).

## 2. Deployed version
- **URL:** https://gridsense-ai-zeta.vercel.app  (Vercel, production)
- To explore core functionality without signing up, click **"Try the live demo"** on the home page (loads a demo home). The graded demo focuses on the four consumption screens + Verify — not sign-up/sign-in.

## 3. Run it locally (step by step)
Prerequisites: **Node.js 20+** and npm.
```bash
# 1. get the code, then:
cd 05-build/dashboard

# 2. install dependencies
npm install

# 3. run the dev server
npm run dev
# open the printed URL (http://localhost:5173)

# 4. (optional) production build + preview
npm run build      # tsc -b && vite build  — type-checks + bundles
npm run preview

# 5. run the tests (tariff engine + crypto/verify oracles)
npm test           # vitest
```
Deploy your own copy to Vercel: `npm i -g vercel` → `vercel --prod` from `05-build/dashboard` (the folder is already Vercel-linked).

### Optional: enable real on-chain anchoring
The Verify page works in "demo/not-configured" mode out of the box. To anchor real reports on Base Sepolia, set these **server-side env vars in Vercel** (never commit them):
`RELAYER_PRIVATE_KEY`, `REPORT_REGISTRY_ADDRESS`, `REPORT_ENC_KEY`, `PINATA_JWT`, `BASE_SEPOLIA_RPC_URL`. See `07-blockchain/README.md` §4B.

## 4. Repository map (related files)
```
GridSense-AI/
├── 01-research/         grounded research + citations (tariffs, appliances, blockchain)
├── 02-strategy/         decision logs ("the Channel": stress-tests + arguments)
├── 04-business/         BOM, CAPEX/OPEX, unit economics, funding
├── 05-build/dashboard/  THE APP — React + Vite + TS + Tailwind + Recharts
│   ├── src/lib/tariff.ts        verified RURA tariff engine (unit-tested)
│   ├── src/screens/             Live Now · This Month · Appliances · Save
│   ├── src/lib/verifiable.ts    canonicalize → SHA-256 → AES-GCM → IPFS CID (isomorphic)
│   ├── src/pages/Verify.tsx     wallet-less "Verify a report" page
│   └── api/anchor.ts            serverless gasless anchor endpoint (Base Sepolia)
├── 06-pitch/            capstone brief, defense deck, demo assets
├── 07-blockchain/       ReportRegistry smart contract + tests + scripts (PoC)
└── 08-submission/       THIS folder — submission README + testing results
```

## 5. Testing
See **`08-submission/TESTING-RESULTS.md`** for the full evidence: unit tests, the app under
different testing strategies, behaviour across different data values (100 / 150 / 200 kWh homes),
and performance on different hardware/software. Headlines:
- **Tariff engine: 9/9 unit tests pass** — engine output equals the sourced bills (100 kWh → 29,530 RWF, 150 → 47,980, 200 → 66,430).
- **Crypto / CID / anchor: additional oracle tests** pin the hashing + CID against independent references.
- **Smart contract: 14/14 tests pass**; a real local anchor→verify round-trip verifies 6/6 checks incl. tamper detection.
- **Production build green** and deployed; verified live via browser (screens render, 0 console errors).

## 6. 5-minute demo video — script/shot list (core functionality)
> Record the **live app**; keep sign-in to ~10 seconds. Focus on consumption + verify.
1. **0:00–0:30 — Problem.** One line: "Rwandan homes pay a tiered tariff but only see a falling prepaid balance — no idea which appliance drains it." Show the Home page headline.
2. **0:30–2:00 — Appliance consumption (core).** Open **Try the live demo → Live Now**: live kW, month-to-date RWF, the **tier-cliff alert**, the tier gauge. Switch to **Appliances**: walk through per-appliance kWh/RWF/% (fridge = always-on driver, water heater = big lever).
3. **2:00–3:00 — This Month + Save.** Show the forecast crossing the 50 kWh tier line; open **Save** and read two recommendations (cliff-crossing + biggest load) with the honest estimated ranges.
4. **3:00–3:30 — Kinyarwanda.** Toggle EN → RW to show localization.
5. **3:30–4:45 — Blockchain verify.** Open a monthly report, point out the **"Verified on-chain ✓"** badge, open **/verify**, click **Verify now** (PASS), then **Tamper demo** (FAIL). Say the honest line: "this proves the report wasn't changed after issuance — not that the reading was correct." Show the BaseScan link.
6. **4:45–5:00 — Close.** "Built local, on the real RURA tariff, privacy-by-design under Law 058/2021. GridSense AI — see your power, spend less."

## 7. Scope notes
- Sensor data in the hosted demo is simulated + labelled; the ingestion contract matches a real ESP32 + CT clamp so live devices plug in unchanged.
- Blockchain = **testnet, integrity only** (no token/payment/personal data). Full reasoning: `02-strategy/verifiable-reports.md`; contract + proof: `07-blockchain/`.
