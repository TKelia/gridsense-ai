# The Channel — Verifiable Monthly Reports


## Pass 1 — Brainstorm (options on the table)

The user need: *"when GridSense finalizes a household's monthly report, anyone should later be able to prove the report was never altered."* Options generated:

- **A. Do nothing / trust GridSense.** Reports are just PDFs from our server.
- **B. Server-side digital signature.** GridSense signs each report with its private key; a verifier checks the signature.
- **C. Centralized hash log / timestamp authority.** Store each report's hash in our DB (or a TSA like a trusted timestamp service) with a time.
- **D. Anchor the report's hash + IPFS CID on a public blockchain.** Fingerprint on a public, append-only ledger; report file (encrypted) on IPFS; verify by re-hashing. **[the brief's locked direction]**
- **E. Put the whole report on-chain.** Every report, in full, on the blockchain.
- **F. Issue a token / NFT per report ("proof token").** Mint an on-chain asset representing the report.
- **G. Give each household a wallet** and let *them* hold/sign their reports.

---

## Pass 2 — Stress-test (attack every option, kill the weak ones)

- **A. Trust us — KILLED.** The entire ask is *independent* verifiability. "Trust us" is the thing we're replacing. A landlord–tenant billing dispute cannot be settled by "the company says so."
- **B. Signature alone — WEAK / insufficient.** A signature proves *GridSense* produced the file, but GridSense holds the key and could **re-sign an altered report** and backdate it. There's no independent, immutable *time* anchor. Good as a complement, not the guarantee.
- **C. Centralized hash log — KILLED as the guarantee.** We control the database; we could rewrite the stored hash. A TSA is better but is one trusted third party a tenant must also trust, and is not publicly auditable by anyone, anytime. Fails the "anyone can verify, forever, without trusting us" bar.
- **E. Whole report on-chain — KILLED (illegal + expensive + dumb).** Directly violates **Law 058/2021 right to erasure** (on-chain = permanent, can't be deleted) and exposes **personal + consumption data** publicly forever. Also costly and pointless. Hard no.
- **F. Token/NFT per report — KILLED (regulatory landmine + zero added value).** Minting an on-chain asset is **exactly** the kind of "issuance of a virtual asset" that **Law 023/2026** puts under CMA licensing. It buys us nothing over a plain hash anchor and turns a non-regulated notarization into a potential regulated virtual-asset business. Absolutely not. No token, no coin, no NFT, no franc-pegged anything.
- **G. Household wallets / seed phrases — KILLED (UX + support disaster).** Our users are Rwandan households with low crypto literacy and zero appetite for seed-phrase custody. Forcing wallets kills adoption and creates a support/loss nightmare. The user must need **nothing**.
- **D. Hash + CID anchor on a public testnet, gasless — SURVIVES.** Independent (public ledger, not our DB), immutable (append-only), privacy-safe (only a non-personal fingerprint on-chain), cheap/free (testnet), and wallet-less (relayer pays). This is the survivor. Deep-dive it.

**Also explicitly killed:** *"blockchain for its own sake."* We are **not** using a chain because it's trendy. We use it for one property a centralized log can't give a tenant: **anyone can verify, at any time in the future, without trusting GridSense.** If that property weren't needed, a signed PDF would do. It *is* needed for billing disputes and grant/government auditability — that's the whole justification.

---

## Pass 3 — Deep dive (the survivor, to the bottom)

**What actually goes on-chain (nothing else):**
`{ bytes32 sha256Hash, string ipfsCid, bytes32 homeRef, uint32 periodYYYYMM, uint64 timestamp, address anchorer }`
- `sha256Hash` — SHA-256 of the **canonicalized** report JSON (stable key ordering, so the same report always hashes identically).
- `ipfsCid` — content address of the **encrypted** report file on IPFS (itself a hash → deterministic, verifiable offline).
- `homeRef` — an **opaque** reference (e.g. `keccak256(salt + internalHomeId)`), not a name, meter number, or anything personal. Reveals nothing; can't be reversed.
- `periodYYYYMM` + `timestamp` — the billing month and the anchor time.
- **No name, no address, no kWh, no RWF, no tenant, no meter ID. Ever.** (Law 058/2021.)

**The flow (gasless, wallet-less):**
1. Report finalized → canonicalize JSON → **SHA-256**.
2. Encrypt the report → **pin to IPFS** (Pinata) → get **CID**.
3. Backend **relayer** submits `anchorReport(...)` to `ReportRegistry` on Base Sepolia, paying free test-gas.
4. User sees **"Verified on-chain ✓"** + a **Verify** button. No wallet, no keys, no crypto UX.

**Verification (by anyone, anytime):** take the report file → re-canonicalize → re-hash (SHA-256) → compare to the on-chain `sha256Hash` for that report id; and check the on-chain `ipfsCid` resolves to the same file. Match = untampered since anchor time *T*. Mismatch = altered.

**Why Base Sepolia + gasless-relayer + Pinata specifically:** live, free, ~2s blocks, public BaseScan explorer, and a clean production upgrade (real Base + Coinbase Paymaster). Relayer is the simplest gasless pattern that works *today* on a testnet (no ERC-4337 plumbing needed for the PoC). Pinata gives a real CID with a trivial API and a free tier. All verified in `01-research`.

---

## Pass 4 — Argue & defend

### The strongest case FOR (why D wins)
1. **It's the only option that delivers independent, permanent verifiability** without asking the tenant/panel/regulator to trust GridSense — which is the entire point.
2. **It's privacy-clean and law-aligned:** only a non-personal fingerprint on-chain (Law 058/2021 honored via off-chain erasure), and **no token/payment/franc-peg** so it's not a regulated virtual-asset business under Law 023/2026.
3. **It's free and real:** public testnet, $0, publicly auditable on BaseScan — not a private mock.
4. **It's invisible to users:** gasless + wallet-less. A grandmother in Kigali sees a green check, nothing else.
5. **It's a genuine differentiator + grant magnet:** "cryptographically verifiable, tamper-evident energy bills" is a strong, honest line for landlord trust and for climate/government funders who need auditable data — using blockchain *tech* without becoming a *crypto business*.

### The strongest case AGAINST (steelman, then answer)
- **"This is blockchain hype bolted onto an energy app."** → Answer: we killed exactly that in Pass 2. The chain does one thing a centralized log cannot: let *anyone* verify *forever* without trusting us. Remove that need and we'd ship a signed PDF. The need is real (billing disputes, auditable grant data).
- **"A testnet can be shut down / reset — your proof evaporates."** → Honest and true. **Mitigation:** for the capstone this is a labelled **demo/testnet PoC**; production would anchor to a persistent chain (Base mainnet) where anchoring a 32-byte hash costs a fraction of a cent. We say this plainly rather than pretend testnet = forever.
- **"You're the relayer — you could anchor a fake report."** → We can anchor, yes; but we **cannot alter an already-anchored one** (append-only) and we **cannot move funds/mint** (no token, no payable). And anchoring the *wrong* report doesn't help us: the tenant still re-hashes the report they hold and catches a mismatch. The value is *tamper-evidence after issuance*, which holds regardless of who the relayer is.
- **"Regulator says you're doing crypto without a licence."** → Answer with the law's own text (§5a research): the regulated activities are issuance/exchange/custody/transfer/brokerage/on-ramp of virtual assets — we do **none**. We issue nothing, custody nothing, move no value. Flagged for a Rwandan-lawyer sanity check before commercial launch, but strong on the face of the law.

### Honest threat model — what tamper-evidence PROVES and does NOT
- **PROVES:** the report you're holding is **byte-for-byte identical** to the one anchored at time *T*. Any edit → different hash → mismatch → tampering detected. Also proves the report existed by *T*.
- **DOES NOT PROVE:** that the **sensor reading or the bill computation was correct**. Anchoring secures the report *after* it's produced. Garbage-in still anchors as garbage — verifiably unchanged garbage. Integrity ≠ accuracy.
- **DOES NOT PROVE:** who read the meter, or that the household is who they say. Those are separate (device attestation, KYC) and out of scope.
- **We state this limit out loud** — over-claiming ("blockchain makes our bills trustworthy") would fail Rule 1 and a sharp panel. The correct claim: *"blockchain makes our bills tamper-evident: once we issue a report, no one — including us — can quietly change it."*

---

## Verdict (locked)
Ship **Option D**: anchor the report's **SHA-256 hash + IPFS CID + minimal opaque metadata** on **Base Sepolia** (Amoy fallback), **gasless via a backend relayer**, **wallet-less** for users, report pinned to IPFS **encrypted**, verify **by re-hashing**. **No token, no payment, no franc-pegged asset, no personal/consumption data on-chain.** Labelled clearly as a **testnet demo**. This is the survivor of the Channel and the version we defend.

**One-line pitch claim (honest):** *"Every GridSense monthly report is fingerprinted and anchored on a public blockchain — so a tenant, a landlord, or an auditor can prove it was never altered, without having to trust us."*
