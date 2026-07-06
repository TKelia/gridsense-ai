# The Channel — Integrating Verifiable Reports into the LIVE App

PoC: `07-blockchain/` (14/14 contract tests, real local e2e)
> This documents the four passes (brainstorm → stress-test → deep-dive → argue & defend)
> for HOW the finished PoC gets wired into `05-build/dashboard` without breaking anything.

---

## 0. Facts re-verified live before designing

| Fact | How verified | Result |
|---|---|---|
| Base Sepolia RPC live, chainId 84532 | Direct `eth_chainId` POST to `https://sepolia.base.org` (2026-07-03) | `0x14a34` = 84532 ✓ |
| Browser can read the chain (CORS) | `OPTIONS` preflight with app origin against `sepolia.base.org` | `access-control-allow-origin: *`, `POST` allowed ✓ → wallet-less client-side verify works |
| BaseScan explorer live | `curl -I https://sepolia.basescan.org` | HTTP 200 ✓ |
| Pinata `pinFileToIPFS` endpoint + JWT auth | POST with invalid bearer → structured `INVALID_CREDENTIALS` JSON (endpoint live, JWT scheme confirmed) | ✓ |
| Pinata free tier | Firecrawl extract of `pinata.cloud/pricing` (2026-07-03) | Free: 1 GB storage, 500 files, 10 GB bandwidth, $0/mo; first paid "Picnic" $20/mo ✓ (closes an old ⚠️) |
| Law 023/2026 unchanged | Firecrawl search (last-month filter): PwC/allAfrica/LinkedIn commentary, June 2026 | Gazetted 28/05/2026, in force; **no amendment found**; VASP licensing under CMA — hash-anchoring still not a listed VA activity ✓ |
| Law 058/2021 unchanged | Firecrawl search | No amendment found (Jan 2026 items are awareness campaigns, not changes) ✓ |
| Relayer-gasless still simplest for testnet | Re-confirmed same-day in `01-research/blockchain-research.md` + our own working PoC run | ✓ (prod path stays ERC-4337/Coinbase Paymaster) |

⚠️ Note: the **Perplexity API key is out of quota (401 insufficient_quota)** this session. Fact-finding used the other approved stack tool (Firecrawl search/extract) + direct protocol-level checks (`curl` against the actual RPC/explorer/API endpoints — stronger than search for liveness). Flagged for Tesi to top up.

---

## 1. Brainstorm (options generated)

**A. Where the crypto logic lives**
1. Duplicate `lib.mjs` logic separately in the API and in the client.
2. One **isomorphic TypeScript module** (`src/lib/verifiable.ts`) using only Web Crypto — imported by the serverless function, the client verify page, AND the unit tests.
3. Import the PoC's `lib.mjs` directly across folders.

**B. Serverless runtime for `api/anchor.ts`**
1. Vercel **Edge runtime**, web `(Request) => Response` signature — the exact pattern already proven live by `api/welcome.ts` in this same project (it initially hung on the Node runtime; the 2026-06-22 report documents the fix).
2. Node runtime `(req, res)` with `node:crypto` + `ipfs-only-hash`.

**C. How the client reads the chain (wallet-less verify)**
1. Ship **viem in the client bundle** (~tens of kB on top of an already-heavy 563 kB Recharts bundle).
2. **Hand-rolled `eth_call`** via `fetch` — hardcoded 4-byte selectors + minimal ABI encode/decode, **unit-tested against viem** (viem stays a server/test-only dependency).
3. A second serverless function that proxies reads (adds a server hop to something that must be trustless).

**D. When a report gets anchored**
1. Auto-anchor every time the report document is opened.
2. An explicit **"Finalize & anchor"** action on the Consumption Report document, once per (home, period).
3. Anchor on a monthly cron.

**E. Where the verify receipt lives**
1. Embed the anchor receipt inside the report JSON.
2. **Sidecar receipt**: `localStorage` map keyed by `reportId`, holding `{receipt, exact anchored report JSON}`; report JSON downloadable for independent verification.

## 2. Stress-test (killed, with reasons)

- **A1/A3 killed.** Duplication = the classic "hashes differ by one byte" bug; importing `.mjs` across the repo boundary breaks Vite/TS builds and Vercel's function bundler. A single Web-Crypto TS module runs identically in browser, Edge, and Node 24 vitest — one canonicalizer, one hash, provably equal to the PoC via the `0x62afb2a0…` fixture.
- **B2 killed.** The Node `(req,res)` runtime already bit this project once (`/api/welcome` HTTP 000 hang, fixed by moving to Edge — see PROJECT-REPORT 2026-06-22). `ipfs-only-hash` is Node-stream flavored and Edge-hostile; a pure CIDv0 encoder (single-chunk UnixFS/dag-pb, ~60 lines) is testable against both `ipfs-only-hash` output and the PoC's recorded CID. Guard: refuse >256 KiB (would need chunking → wrong CID risk; a monthly report is ~2 kB).
- **C1 killed** (bundle bloat for two tiny calls), **C3 killed** (re-introduces trust in our server — the whole point is anyone can check the public chain). C2's risk (hand-rolled ABI bugs) is neutralized by unit tests that assert byte-equality with viem's `encodeFunctionData`/`decodeFunctionResult`.
- **D1 killed.** The registry is append-only by design — a duplicate `reportId` reverts (`AlreadyAnchored`). Auto-anchor on open would burn the (home, period) slot on a half-finished reading and turn every later view into a revert. **D3 killed** — no cron infra, and a demo needs a visible user action.
- **E1 killed by math**: embedding the receipt inside the JSON changes the bytes → changes the hash → the receipt invalidates the thing it certifies. Sidecar is the only coherent shape.
- Also killed (carried over from the PoC Channel, still binding): client-side relayer key (**never** — key must not exist in the browser), plaintext report on IPFS (Law 058/2021), any token/payment (Law 023/2026), auto-switching to Amoy (Base Sepolia verified live; a silent fallback would hide outages).

## 3. Deep-dive (the surviving design, verified details)

- **Shared module** `src/lib/verifiable.ts`: `canonicalize()` (byte-for-byte port of `lib.mjs`), `sha256Hex()` via `crypto.subtle`, AES-256-GCM via `crypto.subtle` with the PoC's exact layout **iv(12) | tag(16) | ciphertext** (Web Crypto appends the tag to the ciphertext, so the port re-orders — round-trip tested against `node:crypto` in vitest, which IS the PoC implementation).
- **`src/lib/cid.ts`**: CIDv0 = base58btc(0x12 0x20 ‖ SHA-256(dag-pb(UnixFS(file)))) for single-chunk files — the same default `ipfs-only-hash` and Pinata produce for small files. Parity-tested against the PoC's real artifact: `out/0x40aef65b….enc` → must equal `QmVm438uaz4msepwnygXBJJ4zibCA16PwVR9UtmAUnrM6h`.
- **`api/anchor.ts`** (Edge): no keys → `200 {anchored:false, reason:"anchoring not configured"}`; with keys → canonicalize → hash → encrypt → CID (+Pinata pin if JWT) → `isAnchored` pre-check (idempotent: same hash ⇒ report already-anchored success; different hash ⇒ honest "period already anchored" refusal) → `anchorReport()` via viem wallet client → receipt. Contract-code guard before writing (ported from `anchor.mjs`).
- **Client verify**: `eth_call` to `verify(bytes32,bytes32)` and `getReport(bytes32)` on `https://sepolia.base.org` (CORS `*` verified). PASS/FAIL is computed from bytes the USER holds, not from our receipt.
- **Reports**: `buildMonthlyReport(unit)` mirrors `sample-report.json` schema (`gridsense.monthly-report.v1`) with the landlord unit's real numbers; personal fields stay in the encrypted off-chain file only.
- **Routing**: state-router gains a public `verify` route; `initialRoute()` maps `location.pathname === '/verify'` (SPA rewrite already sends every path to `index.html`).

## 4. Argue & defend

**Why this wins:** one hashing brain shared by server, client, and tests — anchored to the PoC's proven fixture values — is the only architecture where "PASS on the verify page" mathematically means "same bytes the chain saw". Edge runtime is the only serverless pattern already proven live in this exact app. Hand-rolled reads keep the trustless path dependency-free and the bundle flat, with viem as the test oracle so we get its correctness without its weight.

**Strongest counter-argument:** hand-rolling ABI codecs and CIDv0 is reinventing wheels viem/ipfs-only-hash already solve; a subtle bug fabricates a FAIL (or worse, a false PASS). **Rebuttal:** every hand-rolled piece has a machine-checked oracle in the test suite — byte-equality with viem's codec, CID equality with the PoC's real recorded artifact, GCM round-trip against `node:crypto`. A false PASS additionally requires SHA-256 collision. The tamper demo (negative control) is part of the shipped UI, so the FAIL path is demonstrated, not assumed.

**Honest limits (stated in the UI):** proves the report wasn't changed after issuance — not that the reading was correct. Anchoring runs on a **testnet** and is labelled demo. Without `RELAYER_PRIVATE_KEY`/`PINATA_JWT` (Tesi's one-time faucet/JWT step — browser+captcha, cannot be done headless), production stays in the honest no-op state and the badge says "Not yet anchored".
