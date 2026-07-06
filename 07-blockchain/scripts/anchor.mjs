// anchor.mjs — finalize a GridSense monthly report onto the chain (testnet PoC).
// Flow: read report -> canonicalize -> SHA-256 -> encrypt -> IPFS CID (+optional pin)
//       -> anchorReport() on ReportRegistry -> print tx hash + explorer/gateway links.
//
// Run (local anvil):  RPC_URL=http://127.0.0.1:8545 node --env-file-if-exists=.env anchor.mjs
// Run (Base Sepolia): set .env (PRIVATE_KEY funded, REPORT_REGISTRY_ADDRESS, RPC) then:
//                     RPC_URL=$BASE_SEPOLIA_RPC_URL node --env-file-if-exists=.env anchor.mjs
import fs from 'node:fs'
import path from 'node:path'
import {
  createPublicClient, createWalletClient, http, defineChain,
  keccak256, encodeAbiParameters,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  HERE, canonicalize, sha256Hex, encrypt, computeCid, pinToPinata,
  opaqueHomeRef, periodYYYYMM, loadEnv, loadAbi, ensureOut,
} from './lib.mjs'

const env = loadEnv()
const RPC = env.RPC_URL || env.BASE_SEPOLIA_RPC_URL || 'http://127.0.0.1:8545'
const PK = env.PRIVATE_KEY
const ADDR = env.REPORT_REGISTRY_ADDRESS
const ENC_KEY = env.REPORT_ENC_KEY || '0x' + '11'.repeat(32) // demo default; override in .env
const SALT = env.HOME_REF_SALT || 'gridsense-demo-salt'
if (!PK) throw new Error('PRIVATE_KEY missing (set in .env)')
if (!ADDR) throw new Error('REPORT_REGISTRY_ADDRESS missing (deploy first, then set it)')

const reportPath = process.argv[2] || path.join(HERE, 'sample-report.json')
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

// 1) canonicalize + hash (the primary tamper-evidence fingerprint)
const canonical = canonicalize(report)
const sha = sha256Hex(canonical)

// 2) opaque, non-personal on-chain metadata
const homeRef = opaqueHomeRef(report.home.internalId, SALT) // bytes32, reveals nothing
const period = periodYYYYMM(report.period.year, report.period.month)
const reportId = keccak256(
  encodeAbiParameters([{ type: 'bytes32' }, { type: 'uint32' }], [homeRef, period]),
)

// 3) encrypt the report + compute its real IPFS CID (offline) + optional pin
const enc = encrypt(Buffer.from(canonical, 'utf8'), ENC_KEY)
ensureOut()
const encPath = path.join(HERE, 'out', `${reportId}.enc`)
fs.writeFileSync(encPath, enc)
const cid = await computeCid(enc)
let pinNote = 'NOT pinned (no PINATA_JWT) — CID computed offline; real + recomputable'
if (env.PINATA_JWT) {
  const pinnedCid = await pinToPinata(enc, `${reportId}.enc`, env.PINATA_JWT)
  pinNote = pinnedCid === cid
    ? `pinned to Pinata OK (CID matches offline: ${pinnedCid})`
    : `WARNING pinned CID ${pinnedCid} != offline CID ${cid} (check options)`
}

// 4) chain clients
const pub = createPublicClient({ transport: http(RPC) })
const chainId = await pub.getChainId()
const chain = defineChain({
  id: chainId, name: `chain-${chainId}`,
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
})
const account = privateKeyToAccount(PK.startsWith('0x') ? PK : `0x${PK}`)
const wallet = createWalletClient({ account, chain, transport: http(RPC) })
const abi = loadAbi()

// Guard: refuse to "anchor" into a code-less address (a write there is a silent
// no-op that looks successful). Catches wrong address / wrong network early.
const code = await pub.getCode({ address: ADDR })
if (!code || code === '0x') {
  throw new Error(`No contract code at ${ADDR} on chainId ${chainId} — deploy first / check REPORT_REGISTRY_ADDRESS & RPC_URL`)
}

// 5) anchor
console.log('- GridSense report anchor (testnet PoC) -')
console.log('report file     :', path.basename(reportPath))
console.log('sha256 (hash)   :', sha)
console.log('ipfs cid        :', cid, `\n                  (${pinNote})`)
console.log('homeRef (opaque):', homeRef)
console.log('period (YYYYMM) :', period)
console.log('reportId        :', reportId)
console.log('chainId         :', chainId)
console.log('registry        :', ADDR)

const txHash = await wallet.writeContract({
  address: ADDR, abi, functionName: 'anchorReport',
  args: [reportId, sha, cid, homeRef, period],
})
console.log('\nanchor tx sent  :', txHash)
const receipt = await pub.waitForTransactionReceipt({ hash: txHash })
console.log('mined in block  :', receipt.blockNumber, '| status:', receipt.status)

if (chainId === 84532) {
  console.log('\nBaseScan tx     : https://sepolia.basescan.org/tx/' + txHash)
  console.log('BaseScan addr   : https://sepolia.basescan.org/address/' + ADDR)
  console.log('IPFS gateway    : https://gateway.pinata.cloud/ipfs/' + cid + '  (resolves once pinned)')
}

// 6) persist a receipt for verify.mjs / the README
const out = {
  reportFile: path.basename(reportPath),
  reportId, sha256: sha, ipfsCid: cid, homeRef, period,
  chainId, registry: ADDR, txHash, block: Number(receipt.blockNumber),
  encFile: path.basename(encPath), pinNote, anchoredAt: new Date().toISOString(),
}
fs.writeFileSync(path.join(HERE, 'out', 'last-anchor.json'), JSON.stringify(out, null, 2))
console.log('\nreceipt written : out/last-anchor.json')
