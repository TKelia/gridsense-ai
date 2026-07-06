# Blockchain Research — Verifiable Monthly Reports

> Phase A of the verifiable-reports mission. Every fact below is either **verified live**
> (dated, with a source link) or explicitly tagged `⚠️ UNVERIFIED`. Per RULE 1, a labelled
> gap beats a confident guess. Research date: **2026-07-03**.
> Scope: anchor a monthly report's **SHA-256 fingerprint + IPFS CID** on a free public
> testnet so anyone can later prove the report was never altered. No token, no payment,
> no personal data on-chain.

---

## 0. TL;DR (what the research confirms)

1. **Base Sepolia is live and free.** Chain ID **84532**, ~2s blocks, working public RPC, faucets, and a BaseScan explorer. We verified the RPC responds from our own environment (see §1). This is the primary target testnet; **Polygon Amoy** is the fallback.
2. **IPFS pinning via Pinata** works with a simple authenticated `POST` that returns the content's **CID** (`IpfsHash`). A free tier exists. The report is pinned **encrypted**.
3. **Gasless is achievable today** on a testnet with the simplest possible pattern: a **backend relayer key** that signs and submits the anchor transaction and pays the (free) test-gas. The user has no wallet and no keys. Production upgrade path = ERC-4337 paymaster (Pimlico / Alchemy / Biconomy) or Coinbase Paymaster on Base.
4. **Solidity ^0.8.x is current** (dev branch at 0.8.36 as of 1 Jul 2026); we pin a Hardhat-supported stable (0.8.28). Tooling = **Hardhat + viem** (Foundry is an equally valid alternative).
5. **Rwanda Law N° 023/2026** regulates *virtual-asset businesses* (issuance, exchange, custody, transfer, brokerage, on/off-ramp). **Anchoring a hash is none of those** — it issues no asset, custodies nothing, moves no value. Our reasoned reading: hash-anchoring for integrity is **distributed-ledger notarization, not a regulated VASP activity**. (This is our interpretation for a capstone, *not* legal advice — see §5 and open questions.)
6. **Rwanda Law N° 058/2021** gives data subjects a **right to erasure**. On-chain records are permanent → we put **no personal or consumption data on-chain**, only the non-personal fingerprint (hash) + CID, and pin the report **encrypted**.

---

## 1. Base Sepolia — active, RPC, faucet, explorer

**Network (verified live, 2026-07-03):** we sent an `eth_chainId` JSON-RPC call to `https://sepolia.base.org` from this build environment and received `0x14a34` = **84532**, confirming the network is up and reachable from where we build.

| Item | Value | Source |
|---|---|---|
| Chain ID | **84532** (`0x14a34`) | live RPC call + [ChainList 84532](https://chainlist.org/chain/84532) |
| Primary RPC | `https://sepolia.base.org` | [thirdweb Base Sepolia](https://thirdweb.com/base-sepolia-testnet) |
| Backup RPC | `https://base-sepolia-rpc.publicnode.com` (verified live, returns 84532) | live RPC call |
| Explorer | `https://sepolia.basescan.org` (also Blockscout `https://base-sepolia.blockscout.com`) | [thirdweb](https://thirdweb.com/base-sepolia-testnet) |
| Block time | ~2 seconds; gas typically ~0.01–0.5 gwei | [thirdweb](https://thirdweb.com/base-sepolia-testnet) |
| Stack | OP-Stack Ethereum L2 testnet | [thirdweb](https://thirdweb.com/base-sepolia-testnet) |

**Faucets (free test ETH — needed to fund the relayer once):**
- **ETHGlobal** faucet for Base Sepolia (chain 84532): [ethglobal.com/faucet/base-sepolia-84532](https://ethglobal.com/faucet/base-sepolia-84532)
- **Alchemy** Base Sepolia faucet: [alchemy.com/rpc/base-sepolia](https://www.alchemy.com/rpc/base-sepolia) — ~0.1 ETH/week tiers.
- Common drip ~**0.01–0.1 ETH/day**, which is *far* more than we need (an anchor tx costs a tiny fraction of a cent-equivalent of test-gas). `⚠️ UNVERIFIED` exact per-faucet amount/eligibility as of today — most faucets require a browser + a small mainnet balance or a login (captcha/social), so **this is a one-time manual step for Tesi**, not something the build can do headless.

**Why Base Sepolia over Polygon Amoy (primary vs fallback):** ~2s blocks, an OP-Stack L2 that mirrors the production Base chain (clean upgrade story), and first-class BaseScan tooling + Coinbase Paymaster for the future gasless path. Amoy stays as the fallback if Base faucets are dry on demo day.

---

## 2. IPFS pinning — Pinata

**Endpoint:** `POST https://api.pinata.cloud/pinning/pinFileToIPFS` (file/multipart) — pins content to Pinata's IPFS nodes and **returns `{ IpfsHash, PinSize, Timestamp }`**, where `IpfsHash` is the **CID** (the content address). JSON can be pinned via `pinJSONToIPFS`. Auth is a Bearer **JWT** (or the legacy API key/secret headers). Source: [Pinata pinFileToIPFS docs / Medium how-to](https://medium.com/pinata/how-to-pin-to-ipfs-effortlessly-ba3437b33885), [Pinata SDK](https://github.com/PinataCloud/Pinata-SDK).

**Free tier:** a free plan exists; exceeding it returns an `over_free_limit` error prompting a card. Rate limits on `api.pinata.cloud/data/` endpoints are ~**30 req/min**. Source: [Pinata limits docs](https://docs.pinata.cloud/account-management/limits). `⚠️ UNVERIFIED` exact free GB/file-count as of today (Pinata has changed tiers before) — confirm on the account page; our usage (a few KB JSON per report) is trivially inside any free tier.

**Key property we exploit (honesty + offline capability):** an IPFS **CID is a deterministic hash of the content**. That means we can compute the *exact* CID of the (encrypted) report **offline**, before/without pinning, using the multiformats/`ipfs-only-hash` libraries. Pinning only makes it *retrievable* on the public network. So the PoC can produce a **real, verifiable CID** with zero account, and the Pinata JWT is only needed to make the file downloadable via a gateway (`https://gateway.pinata.cloud/ipfs/<CID>` or `https://ipfs.io/ipfs/<CID>`).

**Alternative:** **Filebase** (S3-compatible, ~5 GB free) as a drop-in pinning alternative — [filebase.com]. `⚠️ UNVERIFIED` current free size; noted as fallback only.

---

## 3. Gasless — the minimal pattern that works on a testnet *now*

**Chosen for the PoC (simplest thing that works):** a **backend relayer signer**. GridSense holds one server-side private key (in env, never shipped to the browser). When a monthly report is finalized, the backend hashes → pins → and **submits the anchor transaction itself**, paying the free test-gas. The user has **no wallet, no seed phrase, no keys, no MetaMask** — they just see a "Verified on-chain ✓" badge and a Verify button. This is the honest, boring, correct choice for a testnet demo.

**Trust note (write it down for the defense):** the relayer key can anchor reports; it **cannot** move user funds or mint anything, because the contract holds no funds and issues no token (see contract design, Phase C). Worst case if the key leaks on testnet = someone submits junk anchors with free test-gas; no value at risk. In production the relayer would be a locked-down signer / KMS key.

**Production upgrade path (name it, don't build it now):** ERC-4337 **account abstraction with a paymaster** so the *contract*/sponsor pays gas transparently:
- **Coinbase Paymaster** on Base (native, designed for exactly this "sponsor user gas" flow). `⚠️ UNVERIFIED` exact free tier $ as of today — Base has advertised a free monthly sponsorship allowance; confirm current number before quoting it in the pitch.
- **Pimlico / Alchemy / Biconomy** paymasters as vendor-neutral alternatives.
Sources to confirm live before quoting numbers: [Base account-abstraction / paymaster docs], [Biconomy docs], [Pimlico docs]. (Listed as roadmap, not a PoC dependency.)

---

## 4. Tooling & versions

| Tool | Choice | Note / source |
|---|---|---|
| Solidity | pragma `^0.8.24`, compile with **0.8.28** | dev branch at 0.8.36 on [1 Jul 2026 Solidity docs](https://media.readthedocs.org/pdf/solidity/develop/solidity.pdf); 0.8.28 is [Hardhat-supported](https://v2.hardhat.org/hardhat-runner/docs/reference/solidity-support) and stable. |
| Framework | **Hardhat + viem** | Aligns with the app's TS/viem stack; one language for contract, tests, and off-chain scripts. [Hardhat](https://github.com/NomicFoundation/hardhat/releases). |
| Alternative | **Foundry** (`forge`/`anvil`) | Solidity-native tests, single binary, "default for serious work" per [Foundry vs Hardhat 2026](https://dev.to/pavelespitia/foundry-vs-hardhat-in-2026-which-solidity-toolchain-wins-20jd). Valid substitute. |
| Off-chain | **Node + viem + Pinata** | `anchor.mjs` / `verify.mjs`. |
| Hashing | **SHA-256** over a **canonicalized** JSON (stable key order) | so the same report always yields the same hash. |

---

## 5. Regulation — the defensibility core

### 5a. Law N° 023/2026 (virtual assets) — why hash-anchoring is *not* a regulated activity
- **Gazetted 28 May 2026** (Law nº 023/2026 of 25/05/2026), regulating **virtual asset business**. Lead regulator = **Capital Market Authority (CMA)**, with BNR on financial-stability/payments. Sources: [mondaq](https://www.mondaq.com/financial-services/1801206/rwanda-gazettes-first-law-regulating-virtual-asset-business), [allAfrica 01 Jun 2026](https://allafrica.com/stories/202606010387.html), [allAfrica 29 Jun 2026](https://allafrica.com/stories/202606290110.html).
- **Virtual assets are NOT legal tender and cannot be used for payments** in Rwanda. Source: [allAfrica](https://allafrica.com/stories/202606010387.html).
- **Prohibited** (unless CMA-approved): crypto **mining**, virtual-asset **ATMs**, and **mixers/tumblers**. Franc-pegged tokens are out. Source: [allAfrica](https://allafrica.com/stories/202606010387.html).
- **"Virtual asset business" = ** issuance, trading, exchange, custody & management, transfer, brokerage/advisory, escrow, settlement, on/off-ramp of virtual assets. Sources: [mondaq](https://www.mondaq.com/financial-services/1801206/rwanda-gazettes-first-law-regulating-virtual-asset-business), draft-law text on [BitKE](https://bitcoinke.io/wp-content/uploads/2025/03/Draft-Law-Regulating-Virtual-Asset-Business-in-Rwanda-BitKE.pdf).

**Our reasoned interpretation (label clearly as interpretation, not legal advice):** GridSense **issues no token/coin/asset, custodies nothing, transfers no value, operates no exchange/on-ramp, and offers no payment**. It writes a 32-byte fingerprint (hash) + a content address (CID) to a public ledger purely for **integrity/notarization**. None of the regulated "virtual asset business" activities is performed, and none of the three prohibitions (mining, VA ATMs, mixers, franc-pegged tokens) is touched. Therefore, on the face of the law, **hash-anchoring for tamper-evidence is not a regulated virtual-asset activity requiring a CMA licence.** → **This is a defensibility strength** for the capstone: GridSense uses distributed-ledger *technology* for data integrity without becoming a crypto business. Flagged for a Rwandan-lawyer sanity check before any commercial launch (see open questions).

### 5b. Law N° 058/2021 (data protection) — why nothing personal goes on-chain
- Gazetted **15/10/2021**; grants data subjects a **right to erasure** and imposes controller duties (security, DPO, impact assessments, breach notification). Sources: [RwandaLII full text](https://rwandalii.org/akn/rw/act/law/2021/58/eng@2021-10-15), [Securiti overview](https://securiti.ai/rwanda-data-protection-law/).
- **Conflict:** a public blockchain record is **permanent and immutable** — it cannot be erased. Putting personal or consumption data on-chain would directly conflict with the right to erasure.
- **Design consequence (locked):** on-chain payload = **only** the SHA-256 hash + IPFS CID + minimal non-personal metadata (period `YYYYMM`, an **opaque** report reference, timestamp). Both hash and CID are **non-personal fingerprints** — they reveal nothing about the household and can't be reversed. The report itself is pinned to IPFS **encrypted**, and can be un-pinned/rotated. Erasure is honored off-chain (delete the report + un-pin) while the on-chain fingerprint remains a meaningless 32 bytes.

---

## 6. What tamper-evidence proves — and what it does NOT (honest threat model preview)
- **Proves:** the report file that exists today is **byte-for-byte identical** to the one that was fingerprinted and anchored at time *T* (re-hash it → compare to the on-chain hash). Any later edit changes the hash → mismatch → tamper detected.
- **Does NOT prove:** that the underlying **sensor reading or bill was correct**. Anchoring secures the report *after* it's produced; it says nothing about whether GridSense computed it right in the first place. (Full argument in `02-strategy/verifiable-reports.md`.)

---

## ⚠️ Open questions (carry to PROJECT-REPORT.md)
1. **Faucet funding is a manual step** — Tesi funds the relayer address once from a Base Sepolia faucet (browser + captcha/login). The build cannot do this headless. `⚠️`
2. **Pinata JWT** — needs Tesi's free Pinata account; without it the PoC computes the real CID offline but can't pin-for-retrieval. `⚠️`
3. **Exact free-tier numbers** (Pinata GB/files; Coinbase Paymaster free $/mo) change over time — confirm live before quoting in the pitch. `⚠️`
4. **Rwandan lawyer sanity-check** of the "hash-anchoring ≠ VASP" reading before any *commercial* (non-capstone) launch. Strong on the face of the law, but get a local legal opinion. `⚠️`
5. **Encryption key management** for the IPFS-pinned report (who holds it, rotation) — design in Phase C PoC as a symmetric key in env; production needs a real KMS story. `⚠️`
