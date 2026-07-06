// Shared helpers for the GridSense verifiable-reports PoC (Node 22, ESM).
// Pure + honest: deterministic canonicalization, SHA-256, AES-256-GCM, real IPFS CID.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Hash from 'ipfs-only-hash'

export const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '..')
export const OUT = path.join(HERE, 'out')

/** Deterministic JSON: recursively sort object keys so the SAME report always
 *  serializes to the SAME bytes (and therefore the same hash). Arrays keep order. */
export function canonicalize(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']'
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort()
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(value[k])).join(',') + '}'
  }
  return JSON.stringify(value) // strings, numbers, booleans, null
}

/** 0x-prefixed SHA-256 of a UTF-8 string or Buffer. */
export function sha256Hex(input) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return '0x' + crypto.createHash('sha256').update(buf).digest('hex')
}

/** AES-256-GCM encrypt. Output layout: iv(12) | authTag(16) | ciphertext. */
export function encrypt(plaintextBuf, keyHex) {
  const key = Buffer.from(keyHex.replace(/^0x/, ''), 'hex')
  if (key.length !== 32) throw new Error('REPORT_ENC_KEY must be 32 bytes (64 hex chars)')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(plaintextBuf), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ct])
}

/** Reverse of encrypt(). Throws if the auth tag fails (i.e. the file was tampered). */
export function decrypt(encBuf, keyHex) {
  const key = Buffer.from(keyHex.replace(/^0x/, ''), 'hex')
  const iv = encBuf.subarray(0, 12)
  const tag = encBuf.subarray(12, 28)
  const ct = encBuf.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()])
}

/** Real IPFS CID for the exact bytes — the SAME CID Pinata's pinFileToIPFS returns
 *  for a small file (default: CIDv0, dag-pb). Computed OFFLINE with the default
 *  UnixFS options, so it is independently recomputable and honest (no account
 *  needed), and it matches what a real Pinata pin produces => gateways resolve it. */
export async function computeCid(buf) {
  return await Hash.of(buf) // default options == Pinata default for small files
}

/** Build the opaque homeRef as a 32-byte hash of (salt + internal id). Never a
 *  name/meter/address. Uses SHA-256 -> 0x + 64 hex = bytes32. */
export function opaqueHomeRef(internalId, salt) {
  return sha256Hex(`${salt}::${internalId}`)
}

/** period as uint32 YYYYMM, e.g. 202607 */
export function periodYYYYMM(year, month) {
  return year * 100 + month
}

/** Minimal .env loader (no dependency). Reads KEY=VALUE lines. */
export function loadEnv(file = path.join(HERE, '.env')) {
  const env = { ...process.env }
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return env
}

/** Load the Foundry-compiled ABI for ReportRegistry.
 *  Override with ABI_PATH env if running outside the repo layout. */
export function loadAbi() {
  const p = process.env.ABI_PATH || path.join(ROOT, 'out', 'ReportRegistry.sol', 'ReportRegistry.json')
  return JSON.parse(fs.readFileSync(p, 'utf8')).abi
}

export function ensureOut() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })
  return OUT
}

/** Pin bytes to Pinata if a JWT is present; else return null (no fake data). */
export async function pinToPinata(buf, name, jwt) {
  if (!jwt) return null
  const form = new FormData()
  form.append('file', new Blob([buf]), name)
  form.append('pinataMetadata', JSON.stringify({ name }))
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  })
  if (!res.ok) throw new Error(`Pinata ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.IpfsHash // the CID
}
