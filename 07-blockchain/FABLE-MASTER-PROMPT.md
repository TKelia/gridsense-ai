# ▶ HOW TO USE THIS
1. In the Claude desktop app, open a **new Cowork task** in this same project (so it can read the `GridSense-AI` folder).
2. Set the model to **Fable 5**.
3. Copy **everything below the line** and paste it as your first message. Let it run end to end.
4. When it finishes, it will have (a) reworked the docs, (b) built + deployed a proof-of-concept smart contract on a free public testnet, and (c) written a ready-to-run **Claude Code prompt** at `07-blockchain/CLAUDE-CODE-PROMPT.md`.

---

# GridSense AI — Blockchain Verifiable-Reports · Master Build & Handoff Task

## 0. Who & what
You are continuing **GridSense AI** — Tesi Songa Kelia's AI-powered residential energy platform for Rwanda (BSc Software Engineering, African Leadership University, Kigali). It is **already live and deployed**: https://gridsense-ai-zeta.vercel.app. The full project lives in this workspace folder `GridSense-AI/` (research, strategy, business, the React app in `05-build/dashboard`, pitch materials, and `PROJECT-REPORT.md` as the living log).

**New mission:** add a **verifiable, tamper-proof monthly-report layer** — when GridSense finalizes a household's monthly report, its fingerprint is anchored on a public blockchain (with the report file on IPFS) so **anyone can later prove the report was never altered** — then hand off a precise build prompt to Claude Code. This must be **real, tested, and honest** (Tesi has no tangible product yet and wants this to be actionable and demoable).

## 1. TWO UNBREAKABLE RULES — obey in every step
- **RULE 1 — NEVER assume, guess, invent, or pretend.** Every fact, price, API detail, gas cost, address, or regulation must be **verified live and cited**, or explicitly tagged `⚠️ UNVERIFIED` and added to an open-questions list. A labelled gap beats a confident guess.
- **RULE 2 — ALWAYS pass "the Channel"** before any final result and right after any new task/direction: **brainstorm → stress-test (kill weak/generic ideas) → deep-dive → argue & defend.** Save the reasoning in `02-strategy/`.
- **Honesty is mandatory:** no fake transactions, no fabricated tx hashes, no personal or consumption data on-chain, testnet only — and label everything demo/testnet clearly.
- Read `PROJECT-REPORT.md` **before** working; append a dated entry **after**. Standard of work: elite, premium, defensible. Good pace, in order, bold.

## 2. Tool stack — use deliberately, cite everything
Perplexity (find facts) → Firecrawl (extract exact docs / API / prices) → Playwright (drive & test browser flows) → Chrome DevTools (debug, network, performance). In Cowork use the web-search + fetch tools equivalently. Cite every external fact with a link.

## 3. READ FIRST — ground yourself (never assume the state)
Read in full before changing anything: `CLAUDE.md`, `RULES.md`, `DIRECTION.md`, `PROJECT-REPORT.md`, `02-strategy/*`, `01-research/research-findings.md` + `evidence-and-validation.md`, `04-business/capex-opex.md`, `06-pitch/GridSense-Master-Brief.md`. In the app (`05-build/dashboard`): `src/components/Documents.tsx` (the monthly report/invoice), `src/landlord.tsx`, `src/lib/tariff.ts` (the tested engine — never break it), `src/lib/billing.ts`. Confirm you understand the current product, then proceed.

## 4. DECISIONS ALREADY LOCKED (by Tesi — do not re-litigate)
- **On-chain payload:** the report's **SHA-256 fingerprint (hash) + its IPFS CID** + minimal metadata (period, an opaque home/report reference, timestamp). **The report data itself never goes on-chain.** The (encrypted) report **file is stored on IPFS**.
- **Network:** a **free public testnet** — primary **Base Sepolia** (OP-stack Ethereum L2, ~2s blocks, faucets, BaseScan explorer); **Polygon Amoy** as fallback. Real, publicly verifiable, $0.
- **UX:** **gasless — users have NO wallet and NO keys.** GridSense anchors on the user's behalf; the user just sees a "Verified on-chain ✓" badge + a Verify button.
- **This task's scope:** deep research → restructure the docs → **build a working proof-of-concept smart contract** (recorded step by step) → emit the final Claude Code prompt.

## 5. VERIFIED CONTEXT (2026 — confirm live before building, then rely on)
- **Rwanda Law N° 023/2026 on virtual assets** (adopted May 2026, gazetted **28 May 2026**): virtual assets are **not legal tender / not a means of payment**; **virtual-asset businesses** (exchange, custody, token issuance, brokerage, etc.) need a **Capital Market Authority (CMA)** licence; **franc-pegged tokens, crypto mining, and mixers are prohibited.** → **GridSense must issue NO token, NO coin, NO payment, NO franc-pegged asset.** It only anchors **report hashes** for integrity (distributed-ledger *notarization*), which is **not** a regulated virtual-asset business. **Confirm this interpretation live and cite it** — it is a core defensibility point.
- **Data protection Law N° 058/2021 (NCSA):** on-chain records are **permanent and public** → **never put personal or consumption data on-chain** (it conflicts with the right to erasure). Only the hash + CID (both non-personal fingerprints). Pin the report to IPFS **encrypted**.
- **Gasless approach:** simplest that works on a testnet today = a **backend relayer signer** (a server-held key) that submits the anchor transaction and pays the **free test-gas**; the user needs nothing. Production roadmap (name it, don't build it now): **ERC-4337 paymaster** (Pimlico / Alchemy / Biconomy) or **Coinbase Paymaster** (~$15/mo free tier on Base).
- **IPFS pinning:** **Pinata** (free ~1 GB, mature JS/TS SDK, simple upload API) primary; **Filebase** (5 GB, S3-compatible) alternative.
- **Tooling:** Hardhat **or** Foundry; Solidity `^0.8.24` (confirm current stable); `viem` (or ethers) for the off-chain script; Pinata SDK for IPFS.
- **Sources to re-verify:** Rwanda virtual-assets law — allafrica.com/stories/202606290110.html, mondaq.com/.../1801206, bitcoinke.io/2026/05/rwandan-parliament-passes-crypto-law/ ; Base Sepolia — thirdweb.com/base-sepolia-testnet, alchemy.com faucets; Pinata — pinata.cloud ; gasless — eco.com/support/.../gas-sponsorship-2026, docs-gasless.biconomy.io. Confirm each is current.

## 6. PHASE A — Deep live research (verify + fill gaps; cite all) → `01-research/blockchain-research.md`
Confirm/complete, each with a live source: (1) Base Sepolia is active + a working **faucet, RPC, and BaseScan explorer** URL; (2) **Pinata** free-tier limits + the exact upload/pin API and how a CID is returned; (3) a **minimal gasless/relayer** pattern that works on a testnet now (backend key signs & sends); (4) current **Solidity + Hardhat/Foundry** versions; (5) re-confirm the **Law 023/2026** reading (hash-anchoring is not a VASP activity) and the **Law 058/2021** constraint. End with a `⚠️ open questions` list.

## 7. PHASE B — The Channel: stress-test & restructure the story
Run brainstorm → stress-test → deep-dive → argue, and **write it down** (`02-strategy/verifiable-reports.md`). Explicitly **kill**: on-chain personal/energy data; any token/coin/payment/franc-pegged idea; user-held wallets/seed phrases; "blockchain for its own sake." **Defend**: hash + CID anchoring on a free testnet, gasless, "verify by re-hashing." Include an honest **threat model** — what tamper-evidence *does* prove (the stored report matches what was anchored at time T) and what it *doesn't* (it can't prove the sensor reading was correct — only that the report wasn't altered afterwards). Then **update**: `DIRECTION.md` (add the verifiable-reports phase), `04-business/capex-opex.md` (testnet $0, IPFS free tier, honest production gas/paymaster estimate), `06-pitch/GridSense-Master-Brief.md` (add the verifiability narrative + honest framing + the Law-023/2026 "not a VASP" point), and the roadmap. Everything cited and labelled.

## 8. PHASE C — Build the proof-of-concept (record EVERY step in `07-blockchain/`)
Create the PoC under `07-blockchain/`. Deliver:
1. **Contract** `ReportRegistry.sol` (Solidity ^0.8.x): stores/【emits】 per report `{ bytes32 sha256Hash, string ipfsCid, bytes32 homeRef, uint32 periodYYYYMM, uint64 timestamp, address anchorer }`; functions `anchorReport(...)` (idempotent — reject duplicate id / empty hash) and a `getReport(id)` / `verify(id, hash)` view; emit `ReportAnchored`. **No token, no `payable`, no fund custody.** Small, clear, audited-style comments.
2. **Tests** (Hardhat or Foundry): anchor → read back; reject duplicate + empty; hash determinism. All passing.
3. **Off-chain script** (`anchor.mjs`, Node + viem + Pinata): take a sample monthly-report JSON → **canonicalize** → **SHA-256** → **encrypt + pin to Pinata → get CID** → **anchor on Base Sepolia** via the relayer key → print the **tx hash + BaseScan link**. Plus a `verify.mjs` that re-hashes the report and asserts it equals the on-chain hash and that the CID resolves.
4. **Deploy** `ReportRegistry` to **Base Sepolia** and **record, step by step**, in `07-blockchain/README.md` **and** `PROJECT-REPORT.md`: the **contract address, deploy tx, a sample anchor tx, the IPFS CID, and all explorer/gateway links**, plus exact commands to reproduce.
5. **Secrets:** relayer private key + Pinata key live in a **git-ignored `.env`** — **never commit or print** a private key. Fund the relayer from a public faucet (record which).
- **Acceptance:** contract live on a public testnet; a real sample report **anchored and independently verifiable on BaseScan**; `verify.mjs` passes; no secrets committed; the existing app’s build and **9/9 tariff tests remain untouched and green**.

## 9. PHASE D — Emit the final Claude Code prompt → `07-blockchain/CLAUDE-CODE-PROMPT.md`
Write a complete, advanced prompt for **Claude Code** that (a) restates the two rules + the Perplexity/Firecrawl/Playwright/Chrome DevTools stack + "verify live, never assume, always pass the Channel"; and (b) tells it to **integrate verifiable reports into the LIVE app**:
- a **serverless "anchor" endpoint** (Vercel function; **gasless** via the relayer key from env; no-ops safely without keys) that on monthly-report finalize **hashes → pins to IPFS → anchors on Base Sepolia**;
- a **wallet-less "Verify this report ✓"** page + badge that **re-hashes** a given report and checks it against the chain, showing the **BaseScan + IPFS** links and a clear pass/fail;
- **EN/Kinyarwanda** strings; **tests**; keep `tariff.ts` + the 9/9 tests intact; **deploy to Vercel**; update `PROJECT-REPORT.md`;
- honest guardrails: testnet only, no tokens/payments, no personal data on-chain, secrets in env, label demo clearly.

## 10. Deliverables, guardrails & finish
- **Save:** `01-research/blockchain-research.md`; `02-strategy/verifiable-reports.md`; updated `DIRECTION.md`, `04-business/capex-opex.md`, `06-pitch/GridSense-Master-Brief.md`; `07-blockchain/` (contract, tests, scripts, `README.md` with addresses/tx/links); `07-blockchain/CLAUDE-CODE-PROMPT.md`. Append a dated `PROJECT-REPORT.md` entry.
- **Guardrails:** **testnet only** (no mainnet, no real money); **no token / no payment / no franc-pegged asset** (Law 023/2026); **no personal/consumption data on-chain** (Law 058/2021); secrets in `.env` only; **don't break the existing app or its 9/9 tests**; label everything demo/testnet honestly.
- **Finish with:** a short scorecard (/10), what was built + the **live testnet links**, the open-questions list, and **one clear next action** (run the Claude Code prompt). Do not skip the Channel; do not present unverified facts.
