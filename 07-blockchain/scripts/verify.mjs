// verify.mjs — independently prove a GridSense report was NOT altered since it was
// anchored. Re-hashes the report you hold, checks it against the on-chain hash, and
// checks the pinned encrypted file's CID + that it decrypts back to the same report.
//
// Run: RPC_URL=<rpc> node --env-file-if-exists=.env verify.mjs [reportPath]
// (uses out/last-anchor.json for reportId/registry/CID unless overridden by env)
import fs from 'node:fs'
import path from 'node:path'
import { createPublicClient, http } from 'viem'
import {
  HERE, canonicalize, sha256Hex, decrypt, computeCid,
  loadEnv, loadAbi,
} from './lib.mjs'

const env = loadEnv()
const RPC = env.RPC_URL || env.BASE_SEPOLIA_RPC_URL || 'http://127.0.0.1:8545'
const ENC_KEY = env.REPORT_ENC_KEY || '0x' + '11'.repeat(32)

const anchorFile = path.join(HERE, 'out', 'last-anchor.json')
if (!fs.existsSync(anchorFile)) throw new Error('no out/last-anchor.json — run anchor.mjs first')
const rec = JSON.parse(fs.readFileSync(anchorFile, 'utf8'))
const ADDR = env.REPORT_REGISTRY_ADDRESS || rec.registry
const reportPath = process.argv[2] || path.join(HERE, 'sample-report.json')

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
const abi = loadAbi()
const pub = createPublicClient({ transport: http(RPC) })

let pass = true
const line = (ok, msg) => { if (!ok) pass = false; console.log(`${ok ? '✓' : '✗'} ${msg}`) }

console.log('— GridSense report verification —')
console.log('report file :', path.basename(reportPath))
console.log('registry    :', ADDR, '| reportId:', rec.reportId, '\n')

// (1) On-chain existence + read-back
const onchain = await pub.readContract({ address: ADDR, abi, functionName: 'getReport', args: [rec.reportId] })
line(onchain.timestamp > 0n, `report is anchored on-chain (block time ${onchain.timestamp})`)

// (2) PRIMARY tamper-evidence: re-hash the report I hold, compare to on-chain hash
const rehash = sha256Hex(canonicalize(report))
line(rehash === onchain.sha256Hash, `SHA-256 re-hash matches on-chain hash`)
console.log('   mine :', rehash)
console.log('   chain:', onchain.sha256Hash)

// (2b) contract's own verify() view agrees
const contractSaysOk = await pub.readContract({ address: ADDR, abi, functionName: 'verify', args: [rec.reportId, rehash] })
line(contractSaysOk === true, `contract verify(reportId, myHash) == true`)

// (3) CID integrity: recompute the encrypted file's CID, compare to on-chain CID
const encPath = path.join(HERE, 'out', rec.encFile)
if (fs.existsSync(encPath)) {
  const enc = fs.readFileSync(encPath)
  const cid = await computeCid(enc)
  line(cid === onchain.ipfsCid, `encrypted file CID matches on-chain CID (${cid})`)
  // (3b) decrypt the pinned file and confirm it IS the anchored report (closes the loop)
  try {
    const plain = decrypt(enc, ENC_KEY).toString('utf8')
    line(sha256Hex(plain) === onchain.sha256Hash, `decrypted pinned file re-hashes to the anchored hash`)
  } catch (e) {
    line(false, `decrypt failed (file tampered or wrong key): ${e.message}`)
  }
} else {
  console.log(`• (encrypted artifact ${rec.encFile} not present locally — fetch from IPFS gateway to check CID)`)
}

// (4) Negative control: a tampered report must FAIL
const tampered = structuredClone(report); tampered.totalRWF = (report.totalRWF ?? 0) + 1
const tamperedHash = sha256Hex(canonicalize(tampered))
line(tamperedHash !== onchain.sha256Hash, `a tampered report (totalRWF+1) does NOT match — tamper detected`)

console.log('\nRESULT:', pass ? '✅ VERIFIED — report is untampered since anchoring' : '❌ FAILED — see ✗ lines above')
if (rec.chainId === 84532) console.log('BaseScan:', `https://sepolia.basescan.org/tx/${rec.txHash}`)
process.exit(pass ? 0 : 1)
