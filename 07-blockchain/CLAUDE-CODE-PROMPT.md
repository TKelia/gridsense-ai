# Claude Code Prompt — Integrate Verifiable Reports into the LIVE GridSense App

> Paste this whole file as your task in **Claude Code**, run from the repo root
> (`GridSense-AI/`) so it loads `CLAUDE.md`, `RULES.md`, `PROJECT-REPORT.md`, and the
> full MCP stack. Model: your strongest. This builds on the finished, verified PoC in
> `07-blockchain/` — read that folder's `README.md` first.

---

## 0. The two unbreakable rules (obey every step)

**RULE 1 — NEVER guess, invent, imagine, pretend, or assume.** Every fact, price, gas
cost, API detail, address, or regulation must be **verified live and cited**, or tagged
`⚠️ UNVERIFIED` and added to the open-questions list in `PROJECT-REPORT.md`. No fabricated
tx hashes, CIDs, or numbers. A labelled gap beats a confident guess.

**RULE 2 — ALWAYS pass "the Channel"** before any final result and right after any new
direction: **brainstorm → stress-test (kill weak/generic ideas) → deep-dive → argue &
defend.** Save the reasoning to `02-strategy/`.

**Tool stack (use deliberately, cite everything):** Perplexity (find facts) → Firecrawl
(extract exact docs/API/prices) → Playwright (drive & test the browser flow) → Chrome
DevTools (console/network/perf). In Cowork, use the web-search + fetch equivalents.

**Report discipline:** read `PROJECT-REPORT.md` before working; append a dated entry after.

**Honesty guardrails (non-negotiable):** testnet only (Base Sepolia, chainId 84532; Amoy
fallback). **No token, no coin, no payment, no franc-pegged asset** (Rwanda Law N° 023/2026).
**No personal or consumption data on-chain** — only the SHA-256 hash + IPFS CID + `{period,
opaque homeRef, timestamp}` (Rwanda Law N° 058/2021). Report file pinned to IPFS **encrypted**.
Secrets in env only, never committed. Label everything **demo/testnet** clearly. **Do NOT
break `src/lib/tariff.ts` or its 9/9 tests, or the existing app build.**

---

## 1. Context — what already exists (don't rebuild it)
- **Live app:** `05-build/dashboard` (React/Vite/TS + Tailwind + Recharts), deployed at
  https://gridsense-ai-zeta.vercel.app. Serverless dir: `05-build/dashboard/api/` (Vercel
  functions; `welcome.ts` is the existing example). Monthly report/invoice UI:
  `src/components/Documents.tsx`. i18n: `src/i18n/strings.ts` + `index.tsx` (EN + RW, `t()` ).
  Tariff engine (tested, DO NOT TOUCH logic): `src/lib/tariff.ts`, tests `src/lib/tariff.test.ts`.
- **Finished PoC (reuse it):** `07-blockchain/` — `ReportRegistry.sol` (deployed + 14/14
  tests), `scripts/lib.mjs` (canonicalize / SHA-256 / AES-256-GCM / real IPFS CID),
  `scripts/anchor.mjs`, `scripts/verify.mjs`, ABI at `07-blockchain/out/ReportRegistry.sol/ReportRegistry.json`.
  The canonicalize+hash+CID logic is already proven — **port it, don't reinvent it.**

## 2. First, verify live (RULE 1) before coding
Re-confirm and cite in `PROJECT-REPORT.md`: (a) Base Sepolia RPC + chainId 84532 + BaseScan
live; (b) Pinata `pinFileToIPFS` endpoint + current free-tier limits + JWT auth; (c) that a
**backend-relayer** gasless pattern is still the simplest testnet approach; (d) any change to
Law 023/2026 or 058/2021. Then run the Channel on the integration design and save it to
`02-strategy/verifiable-reports-integration.md`.

## 3. Build — integrate verifiable reports into the LIVE app

### 3a. Serverless "anchor" endpoint — `05-build/dashboard/api/anchor.ts`
- On monthly-report **finalize**, accept the finalized report JSON (POST).
- **Canonicalize → SHA-256 → encrypt (AES-256-GCM) → pin to IPFS (Pinata) → `anchorReport()`**
  on Base Sepolia via the **relayer key from env** (`RELAYER_PRIVATE_KEY`, `PINATA_JWT`,
  `REPORT_ENC_KEY`, `REPORT_REGISTRY_ADDRESS`, `BASE_SEPOLIA_RPC_URL`). Use **viem**.
- **Gasless + wallet-less:** the user sends nothing; the relayer signs and pays test-gas.
- **No-op safely without keys:** if env keys are missing, return a clear
  `{ anchored:false, reason:"anchoring not configured" }` (HTTP 200) so the app still works
  in dev/preview and never crashes or fabricates. **Never** expose the private key to the client.
- Reuse the exact canonicalization from `07-blockchain/scripts/lib.mjs` (port to TS) so the
  hash matches the PoC and the verifier. Store the returned `{ reportId, txHash, cid, sha256 }`
  with the report record.
- Return the anchor result to the client for the badge.

### 3b. Wallet-less "Verify this report ✓" page + badge
- **Badge** on a finalized report (in `Documents.tsx` report view): "Verified on-chain ✓"
  when anchored, with the BaseScan tx link + IPFS gateway link; a neutral "Not yet anchored"
  otherwise. No wallet, no crypto UI.
- **Verify page/route** (e.g. `/verify`): given a report (uploaded or by `reportId`),
  **re-canonicalize → re-hash (SHA-256) client-side → read `verify(reportId, hash)` from the
  chain** (public RPC read; no key needed) → show a clear **PASS/FAIL**, the BaseScan tx, the
  IPFS CID/gateway link, and (optionally) fetch+recompute the encrypted file's CID. Mirror
  `07-blockchain/scripts/verify.mjs`. Include a **tamper demo** (edit a field → FAIL) for the pitch.
- State the honest limit in the UI copy: *"Proves the report wasn't changed after issuance —
  not that the reading was correct."*

### 3c. EN / Kinyarwanda strings
Add all new UI copy as i18n keys in `src/i18n/strings.ts` (EN canonical + RW draft, keep the
existing amber "draft translation" honesty badge). Suggested keys: `verify.badge.verified`,
`verify.badge.pending`, `verify.title`, `verify.pass`, `verify.fail`, `verify.limit`,
`verify.viewOnBaseScan`, `verify.viewOnIpfs`, `verify.tamperDemo`.

### 3d. Tests
- Unit-test the ported canonicalize+hash against a fixture and assert it equals the PoC output
  (`0x62afb2a0…` for `07-blockchain/scripts/sample-report.json`).
- Test the endpoint's **no-key no-op path** and (if keys present in CI secrets) an anchor→verify
  round-trip against Base Sepolia or a local anvil.
- A **tamper test**: mutate a field → `verify` returns false.
- **Keep `tariff.ts` untouched and its 9 tests green.** Run `npm run build` + `npm test`; both must pass.

### 3e. Deploy + record
- Add the new env vars to Vercel (server-side only). Deploy. Verify the live badge + `/verify`
  route with **Playwright** (screenshot the verified badge and a PASS + a tamper FAIL) and
  **Chrome DevTools** (0 console errors, check the network calls).
- Append a dated `PROJECT-REPORT.md` entry: what was built, the **real** Base Sepolia contract
  address + a sample anchor tx (BaseScan link) + CID, and any `⚠️` open items. Cite sources.

## 4. Acceptance checklist (all must be true, honestly)
- [ ] `api/anchor.ts` anchors a real report on Base Sepolia via the relayer (gasless), and **no-ops safely** without keys.
- [ ] Wallet-less `/verify` re-hashes a report and shows a real PASS/FAIL with BaseScan + IPFS links; tamper demo FAILs.
- [ ] Only hash + CID + opaque metadata on-chain; report pinned **encrypted**; **no PII/energy data on-chain**.
- [ ] **No token / no payment / no franc-pegged asset.** Secrets in env only; nothing committed; private key never client-side.
- [ ] EN/RW strings added; RW kept as flagged draft.
- [ ] `tariff.ts` + its **9/9 tests** untouched and green; app builds; new tests pass.
- [ ] Deployed to Vercel; Playwright + DevTools verified; `PROJECT-REPORT.md` updated with real links.
- [ ] Ran the **Channel**; every new fact **verified live + cited**; open questions logged. No fabricated values.

## 5. Finish with
A short **scorecard (/10)**, the **live links** (contract, sample anchor tx, verify page), the
**open-questions** list, and **one clear next action**. Do not skip the Channel. Do not present
unverified facts.
