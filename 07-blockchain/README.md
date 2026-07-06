# 07 — Verifiable Reports (Blockchain PoC)

> **Tamper-evidence for GridSense monthly reports.** When a report is finalized, its
> **SHA-256 fingerprint + IPFS CID + minimal opaque metadata** are anchored on a public
> blockchain. Anyone can later prove the report was never altered by **re-hashing it**
> and comparing to the chain.
>
> **HONESTY BANNER (read first):** This is a **testnet / demo** proof-of-concept.
> **No token, no coin, no payment, no franc-pegged asset** (Rwanda Law N° 023/2026).
> **No personal or consumption data on-chain** — only non-personal hashes (Rwanda Law
> N° 058/2021). No fabricated transactions or hashes anywhere in this folder. The
> values recorded below come from a **real local deployment** that this build ran and
> verified; the **Base Sepolia public-testnet run is one command away** and needs only
> a faucet-funded key + a Pinata JWT (see §4). Grounding: `../01-research/blockchain-research.md`,
> reasoning + threat model: `../02-strategy/verifiable-reports.md`.

---

## 1. What it proves (and what it does NOT)
- **PROVES:** the report file you hold is **byte-for-byte identical** to the one anchored at time *T*. Any later edit changes the hash → mismatch → tampering detected. Also proves the report existed by *T*.
- **DOES NOT PROVE:** that the sensor reading or the bill was **correct**. This is **integrity, not accuracy**. Garbage-in anchors as verifiably-unchanged garbage.

## 2. What goes on-chain (nothing else)
```
struct Record {
  bytes32 sha256Hash;   // SHA-256 of the canonicalized report JSON (off-chain)
  string  ipfsCid;      // IPFS CID of the ENCRYPTED report file
  bytes32 homeRef;      // OPAQUE home reference — NEVER a name/meter/address
  uint32  periodYYYYMM; // e.g. 202607
  uint64  timestamp;    // set by the chain
  address anchorer;     // the GridSense relayer
}
```
No name, no address, no kWh, no RWF. The report itself is pinned to IPFS **encrypted** (AES-256-GCM) and can be deleted/un-pinned to honor the right to erasure — the on-chain fingerprint stays a meaningless 32 bytes.

## 3. Contents
```
07-blockchain/
├── src/ReportRegistry.sol        # the contract (anchor / getReport / verify; no token, no payable)
├── test/ReportRegistry.t.sol     # 14 Foundry tests (anchor, dup, empty, access, verify, determinism, no-ETH)
├── script/Deploy.s.sol           # deploy script (signer = env PRIVATE_KEY)
├── foundry.toml                  # solc 0.8.28, RPC endpoints, etherscan
├── scripts/                      # off-chain Node + viem
│   ├── lib.mjs                   # canonicalize, SHA-256, AES-256-GCM, real IPFS CID
│   ├── anchor.mjs                # report -> hash -> encrypt -> CID (+pin) -> anchorReport()
│   ├── verify.mjs                # re-hash + on-chain compare + CID + decrypt + tamper control
│   ├── sample-report.json        # a representative finalized monthly report
│   ├── package.json              # deps: viem, ipfs-only-hash
│   └── out/                      # run receipts (last-anchor.local-demo.json + encrypted artifact)
├── .env.example                  # copy to .env (git-ignored) and fill in
└── .gitignore                    # never commit .env / private keys
```

## 4. Reproduce

### Prerequisites
- **Foundry** (`forge`, `anvil`, `cast`): `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- **Node 22+**
- **forge-std** in `lib/forge-std` (vendored): `git clone --depth 1 https://github.com/foundry-rs/forge-std lib/forge-std` and add `remappings.txt` line `forge-std/=lib/forge-std/src/`.

### Build + test the contract
```bash
cd 07-blockchain
forge build
forge test -vv          # expect: 14 passed; 0 failed
```

### A. LOCAL end-to-end (zero accounts, fully reproducible)
```bash
# 1) start a local chain
anvil --silent &

# 2) deploy (anvil's first test key — PUBLIC, local-only, never for a real net)
export AK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
PRIVATE_KEY=$AK forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# 3) install script deps + anchor + verify
cd scripts && npm install
export RPC_URL=http://127.0.0.1:8545 PRIVATE_KEY=$AK
export REPORT_REGISTRY_ADDRESS=0x5fbdb2315678afecb367f032d93f642f64180aa3   # deterministic anvil addr
export REPORT_ENC_KEY=$(openssl rand -hex 32)
node anchor.mjs        # hashes, encrypts, computes CID, anchors -> prints tx
node verify.mjs        # re-hashes and proves it matches the chain (6 checks)
```

### B. BASE SEPOLIA (real public testnet — the one manual step)
This is $0 but needs a **funded key** and a **Pinata JWT** (things a script cannot self-provision):
```bash
# 1) make a fresh relayer key (keep it secret; it controls nothing of value on testnet)
cast wallet new           # note the address + private key -> put PRIVATE_KEY in scripts/.env

# 2) FUND it (browser step): paste the address into a Base Sepolia faucet, e.g.
#    https://ethglobal.com/faucet/base-sepolia-84532  or  https://www.alchemy.com/rpc/base-sepolia
#    You need a tiny amount; an anchor costs a fraction of a cent of test-gas.

# 3) create a free Pinata account -> API Keys -> a JWT -> put PINATA_JWT in scripts/.env

# 4) deploy to Base Sepolia
cd 07-blockchain
forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast
#   -> copy the deployed address into scripts/.env as REPORT_REGISTRY_ADDRESS

# 5) anchor + verify against the public testnet
cd scripts
RPC_URL=https://sepolia.base.org node anchor.mjs   # prints a real BaseScan tx link + IPFS gateway
RPC_URL=https://sepolia.base.org node verify.mjs   # anyone can re-run this to verify
```
The anchor tx is then publicly viewable on **https://sepolia.basescan.org** and the encrypted report resolves via **https://gateway.pinata.cloud/ipfs/<CID>**.

## 5. Verified run record

### Local devnet (anvil, chainId 31337) — REAL, run by this build on 2026-07-03
| Field | Value |
|---|---|
| Contract (ReportRegistry) | `0x5fbdb2315678afecb367f032d93f642f64180aa3` (deterministic anvil CREATE, deployer nonce 0) |
| Deploy tx | `0x5bbd6db51a773e258c2225a49491055458cba2c97f856eda6c7d357976dcfb06` |
| Anchor tx | `0xbf63b5e62fa45b3e1c8feae5b4912377d136291213920d853bd27afc50466fc8` (block 2, status success) |
| reportId | `0x40aef65b043d639bb6014046f2672636ef86aed114c2dd324ea717317faf1e5c` |
| SHA-256 (report) | `0x62afb2a06bdb75a92ab02e9d17c19aac4508eca8924536e52c7f8c99a24907b7` |
| IPFS CID (encrypted) | `QmVm438uaz4msepwnygXBJJ4zibCA16PwVR9UtmAUnrM6h` (real, recomputable offline) |
| homeRef (opaque) | `0x6f361ac342e3cc29ffa5d9a069789f272f68344d15141033f743b33d5e7fcd94` |
| Verify result | ✅ 6/6 checks pass, incl. tamper negative-control (edited report → mismatch detected) |
| Contract tests | ✅ 14/14 `forge test` pass |

> Local addresses/tx hashes are only meaningful on a local anvil (they reset each run). They are recorded here as honest evidence that the full flow executes and verifies. The Base Sepolia run (§4B) produces the public, permanent equivalents.

### Base Sepolia (public testnet, chainId 84532)
- ⚠️ **Not yet run** — needs the faucet-funded key + Pinata JWT (§4B). Network verified reachable (RPC returns chainId `0x14a34`). Fill in below after running:
  - Contract: `__________`  ·  Deploy tx: `https://sepolia.basescan.org/tx/______`
  - Anchor tx: `https://sepolia.basescan.org/tx/______`  ·  CID: `__________`

## 6. Secrets
- All secrets live in `scripts/.env` (git-ignored). **Never** commit or print `PRIVATE_KEY` / `PINATA_JWT` / `REPORT_ENC_KEY`.
- On testnet the relayer key controls nothing of value (the contract holds no funds, issues no token). Production would use a KMS-held signer + real key management for `REPORT_ENC_KEY`.

## 7. Design / regulatory notes
- **No token, no payable, rejects ETH** (test in the suite) → not a "virtual asset business" under Law 023/2026; distributed-ledger notarization only.
- **Append-only**: a (home, period) report cannot be overwritten (duplicate anchors revert) — the immutability is the point.
- **Access control** over writes only (`isAnchorer`) prevents a griefer front-running a slot with a bogus hash; grants no funds/assets.
- Full argument + threat model: `../02-strategy/verifiable-reports.md`. Open legal item: a Rwandan-lawyer sanity check of the "hash-anchoring ≠ VASP" reading before any commercial launch.
