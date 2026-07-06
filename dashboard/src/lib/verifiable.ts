// Verifiable reports — shared, isomorphic crypto + chain-read helpers.
//
// This is the SINGLE canonicalize/hash/encrypt brain used by the serverless
// anchor endpoint (Vercel Edge), the wallet-less /verify page (browser), and
// the unit tests (Node). It is a byte-exact TypeScript port of the proven PoC
// in 07-blockchain/scripts/lib.mjs — parity is asserted in verifiable.test.ts
// against the PoC's recorded values (sha 0x62afb2a0…, homeRef 0x6f361ac3…).
//
// Web Crypto only (no Node imports) so the same bytes hash the same everywhere.
//
// HONESTY: everything here is testnet/demo tooling. It proves a report was not
// altered after anchoring — it does NOT prove the reading was correct.

// ---------------------------------------------------------------------------
// Canonical JSON (deterministic bytes -> deterministic hash)
// ---------------------------------------------------------------------------

/** Deterministic JSON: recursively sort object keys so the SAME report always
 *  serializes to the SAME bytes (and therefore the same hash). Arrays keep order. */
export function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']'
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj).sort()
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}'
  }
  return JSON.stringify(value) // strings, numbers, booleans, null
}

// ---------------------------------------------------------------------------
// Hex / bytes helpers
// ---------------------------------------------------------------------------

export function bytesToHex(bytes: Uint8Array): string {
  let out = ''
  for (const b of bytes) out += b.toString(16).padStart(2, '0')
  return out
}

export function hexToBytes(hex: string): Uint8Array {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex
  if (h.length % 2 !== 0) throw new Error('odd-length hex')
  const out = new Uint8Array(h.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16)
  return out
}

export function utf8Bytes(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}

// ---------------------------------------------------------------------------
// SHA-256 (Web Crypto; async — the PoC's sync node:crypto equivalent)
// ---------------------------------------------------------------------------

/** 0x-prefixed SHA-256 of a UTF-8 string or bytes. */
export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const buf = typeof input === 'string' ? utf8Bytes(input) : input
  const digest = await crypto.subtle.digest('SHA-256', buf as BufferSource)
  return '0x' + bytesToHex(new Uint8Array(digest))
}

/** Opaque, non-personal home reference (bytes32): SHA-256 of `${salt}::${internalId}`.
 *  Never a name / meter number / address. Same formula as the PoC. */
export async function opaqueHomeRef(internalId: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}::${internalId}`)
}

/** Billing period as YYYYMM, e.g. 202607. */
export function periodYYYYMM(year: number, month: number): number {
  return year * 100 + month
}

// ---------------------------------------------------------------------------
// AES-256-GCM — PoC byte layout: iv(12) | authTag(16) | ciphertext
// (Web Crypto returns ciphertext||tag, so we re-order to match lib.mjs.)
// ---------------------------------------------------------------------------

const GCM_IV_LEN = 12
const GCM_TAG_LEN = 16

async function importAesKey(keyHex: string): Promise<CryptoKey> {
  const key = hexToBytes(keyHex)
  if (key.length !== 32) throw new Error('REPORT_ENC_KEY must be 32 bytes (64 hex chars)')
  return crypto.subtle.importKey('raw', key as BufferSource, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

/** AES-256-GCM encrypt. Output layout: iv(12) | authTag(16) | ciphertext. */
export async function encryptAesGcm(plaintext: Uint8Array, keyHex: string): Promise<Uint8Array> {
  const key = await importAesKey(keyHex)
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LEN))
  const ctAndTag = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, plaintext as BufferSource),
  )
  const ct = ctAndTag.subarray(0, ctAndTag.length - GCM_TAG_LEN)
  const tag = ctAndTag.subarray(ctAndTag.length - GCM_TAG_LEN)
  const out = new Uint8Array(GCM_IV_LEN + GCM_TAG_LEN + ct.length)
  out.set(iv, 0)
  out.set(tag, GCM_IV_LEN)
  out.set(ct, GCM_IV_LEN + GCM_TAG_LEN)
  return out
}

/** Reverse of encryptAesGcm(). Throws if the auth tag fails (file tampered / wrong key). */
export async function decryptAesGcm(enc: Uint8Array, keyHex: string): Promise<Uint8Array> {
  const key = await importAesKey(keyHex)
  const iv = enc.subarray(0, GCM_IV_LEN)
  const tag = enc.subarray(GCM_IV_LEN, GCM_IV_LEN + GCM_TAG_LEN)
  const ct = enc.subarray(GCM_IV_LEN + GCM_TAG_LEN)
  const ctAndTag = new Uint8Array(ct.length + tag.length)
  ctAndTag.set(ct, 0)
  ctAndTag.set(tag, ct.length)
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ctAndTag as BufferSource,
  )
  return new Uint8Array(plain)
}

// ---------------------------------------------------------------------------
// Chain constants + minimal wallet-less reads (raw eth_call, zero client deps).
// Selectors are hardcoded and asserted byte-equal to viem's encoder in tests.
// ---------------------------------------------------------------------------

export const BASE_SEPOLIA = {
  chainId: 84532, // verified live 2026-07-03: eth_chainId -> 0x14a34
  rpcUrl: 'https://sepolia.base.org',
  explorer: 'https://sepolia.basescan.org',
  name: 'Base Sepolia (testnet)',
} as const

export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

// function selectors (keccak256(signature)[0..4]) — computed with viem's
// toFunctionSelector on 2026-07-03 and re-asserted against viem in tests
export const SEL_VERIFY = '0x4e8fee00' // verify(bytes32,bytes32)
export const SEL_GET_REPORT = '0x171c4f11' // getReport(bytes32)
export const SEL_IS_ANCHORED = '0x4f0b5801' // isAnchored(bytes32)

function word(hex32: string): string {
  const h = hex32.startsWith('0x') ? hex32.slice(2) : hex32
  if (h.length !== 64) throw new Error('expected a bytes32 hex value')
  return h.toLowerCase()
}

/** calldata for verify(reportId, sha256Hash) */
export function encodeVerifyCall(reportId: string, sha256Hash: string): string {
  return SEL_VERIFY + word(reportId) + word(sha256Hash)
}

/** calldata for getReport(reportId) */
export function encodeGetReportCall(reportId: string): string {
  return SEL_GET_REPORT + word(reportId)
}

/** Decode the bool returned by verify(). */
export function decodeBool(result: string): boolean {
  const h = result.startsWith('0x') ? result.slice(2) : result
  if (h.length < 64) throw new Error('short eth_call result')
  return BigInt('0x' + h.slice(0, 64)) === 1n
}

export interface OnchainRecord {
  sha256Hash: string
  ipfsCid: string
  homeRef: string
  periodYYYYMM: number
  timestamp: number // unix seconds
  anchorer: string
}

/** Decode getReport()'s Record struct: (bytes32, string, bytes32, uint32, uint64, address).
 *  Solidity ABI: one head word (offset to the tuple), then the tuple with its own
 *  head (6 words; the string slot is an offset relative to the tuple start). */
export function decodeGetReportResult(result: string): OnchainRecord {
  const h = result.startsWith('0x') ? result.slice(2) : result
  const wordAt = (i: number) => h.slice(i * 64, (i + 1) * 64)
  const tupleOffsetWords = Number(BigInt('0x' + wordAt(0))) / 32
  const t = (i: number) => wordAt(tupleOffsetWords + i)
  const strOffsetWords = Number(BigInt('0x' + t(1))) / 32
  const strLen = Number(BigInt('0x' + wordAt(tupleOffsetWords + strOffsetWords)))
  const strDataStart = (tupleOffsetWords + strOffsetWords + 1) * 64
  const strBytes = hexToBytes(h.slice(strDataStart, strDataStart + strLen * 2))
  return {
    sha256Hash: '0x' + t(0),
    ipfsCid: new TextDecoder().decode(strBytes),
    homeRef: '0x' + t(2),
    periodYYYYMM: Number(BigInt('0x' + t(3))),
    timestamp: Number(BigInt('0x' + t(4))),
    anchorer: '0x' + t(5).slice(24),
  }
}

/** Raw eth_call against a public RPC (no wallet, no key, read-only). */
export async function ethCall(rpcUrl: string, to: string, data: string): Promise<string> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to, data }, 'latest'],
    }),
  })
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
  const json = (await res.json()) as { result?: string; error?: { message?: string } }
  if (json.error) throw new Error(`RPC error: ${json.error.message ?? 'unknown'}`)
  if (typeof json.result !== 'string') throw new Error('RPC: no result')
  return json.result
}

// ---------------------------------------------------------------------------
// Anchor receipts (sidecar storage — NEVER embedded in the report JSON,
// because that would change the bytes the hash certifies)
// ---------------------------------------------------------------------------

export interface AnchorReceipt {
  reportId: string
  sha256: string
  ipfsCid: string
  homeRef: string
  period: number
  chainId: number
  registry: string
  txHash: string | null
  block: number | null
  pinned: boolean
  anchoredAt: string
  /** local lookup metadata (client-side only, never on-chain) */
  unitId?: string
}

export interface StoredAnchor {
  receipt: AnchorReceipt
  /** the EXACT report JSON that was anchored (what re-hashing must reproduce) */
  report: unknown
}

const ANCHORS_KEY = 'gridsense_anchors'

export function loadAnchors(): Record<string, StoredAnchor> {
  try {
    const raw = localStorage.getItem(ANCHORS_KEY)
    if (raw) return JSON.parse(raw) as Record<string, StoredAnchor>
  } catch {
    /* unavailable / malformed */
  }
  return {}
}

export function saveAnchor(entry: StoredAnchor): void {
  const all = loadAnchors()
  all[entry.receipt.reportId] = entry
  try {
    localStorage.setItem(ANCHORS_KEY, JSON.stringify(all))
  } catch {
    /* storage full/unavailable — receipt still shown this session */
  }
}

export function findAnchorForUnitPeriod(unitId: string, period: number): StoredAnchor | null {
  for (const entry of Object.values(loadAnchors())) {
    if (entry.receipt.unitId === unitId && entry.receipt.period === period) return entry
  }
  return null
}
