// Verifiable-reports parity tests.
//
// Every hand-rolled piece is asserted against an independent oracle:
// - canonicalize + SHA-256 + homeRef + reportId  -> the PoC's REAL recorded run
//   (07-blockchain/scripts/out/last-anchor.local-demo.json, executed 2026-07-03)
// - ABI selectors/encoding/decoding              -> viem (dev/test dependency)
// - AES-256-GCM layout (iv|tag|ct)               -> a reference vector produced
//   by node:crypto with the PoC's exact encrypt() code (lib.mjs)
// - CIDv0                                        -> ipfs-only-hash reference
//   vectors (the PoC's CID library; artifact parity re-run 2026-07-03)
// - the /api/anchor endpoint's no-key no-op path -> called directly
import { describe, expect, it } from 'vitest'
import {
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  toFunctionSelector,
} from 'viem'
import {
  canonicalize,
  sha256Hex,
  opaqueHomeRef,
  periodYYYYMM,
  encryptAesGcm,
  decryptAesGcm,
  hexToBytes,
  bytesToHex,
  utf8Bytes,
  SEL_VERIFY,
  SEL_GET_REPORT,
  SEL_IS_ANCHORED,
  encodeVerifyCall,
  encodeGetReportCall,
  decodeBool,
  decodeGetReportResult,
} from './verifiable'
import { computeCidV0 } from './cid'
import { handler as anchorHandler } from '../../api/anchor'

// The PoC fixture (07-blockchain/scripts/sample-report.json), embedded verbatim.
// canonicalize() sorts keys, so only VALUES matter — any content drift from the
// real fixture makes the hash assertion below fail.
const POC_REPORT = {
  schema: 'gridsense.monthly-report.v1',
  reportType: 'residential-monthly',
  generatedAt: '2026-07-31T18:05:00.000Z',
  period: { year: 2026, month: 7, label: 'July 2026' },
  home: {
    internalId: 'home-000123',
    label: 'Demo Home — Kigali',
    note: 'This sample stands in for a real finalized report. Personal fields live only in this (encrypted, off-chain) file — NEVER on-chain.',
  },
  tariff: {
    authority: 'RURA (Rwanda), residential tiers effective 2025-10-01',
    currency: 'RWF',
    tiers: [
      { label: '0–20 kWh', rate: 89 },
      { label: '21–50 kWh', rate: 310 },
      { label: '>50 kWh', rate: 369 },
    ],
  },
  consumptionKwh: 100,
  blocks: [
    { label: '0–20 kWh', kwh: 20, rate: 89, amountRWF: 1780 },
    { label: '21–50 kWh', kwh: 30, rate: 310, amountRWF: 9300 },
    { label: '>50 kWh', kwh: 50, rate: 369, amountRWF: 18450 },
  ],
  totalRWF: 29530,
  appliancesKwh: {
    waterHeater: 59,
    fridge: 36,
    tv: 11,
    ironKettle: 8,
    fan: 7,
    laptop: 6,
  },
  disclaimer:
    "Sensor data in the GridSense demo is simulated and labelled; the tariff math is real and sourced. This report's integrity (not its accuracy) is what the on-chain anchor proves.",
}

// Values from the PoC's REAL executed run (out/last-anchor.local-demo.json)
const POC_SHA = '0x62afb2a06bdb75a92ab02e9d17c19aac4508eca8924536e52c7f8c99a24907b7'
const POC_HOME_REF = '0x6f361ac342e3cc29ffa5d9a069789f272f68344d15141033f743b33d5e7fcd94'
const POC_REPORT_ID = '0x40aef65b043d639bb6014046f2672636ef86aed114c2dd324ea717317faf1e5c'
const POC_SALT = 'gridsense-demo-salt'

const REGISTRY_ABI = [
  {
    type: 'function',
    name: 'verify',
    stateMutability: 'view',
    inputs: [
      { name: 'reportId', type: 'bytes32' },
      { name: 'sha256Hash', type: 'bytes32' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getReport',
    stateMutability: 'view',
    inputs: [{ name: 'reportId', type: 'bytes32' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'sha256Hash', type: 'bytes32' },
          { name: 'ipfsCid', type: 'string' },
          { name: 'homeRef', type: 'bytes32' },
          { name: 'periodYYYYMM', type: 'uint32' },
          { name: 'timestamp', type: 'uint64' },
          { name: 'anchorer', type: 'address' },
        ],
      },
    ],
  },
] as const

describe('canonicalize + SHA-256 (parity with the PoC run)', () => {
  it('hashes the PoC fixture to the exact anchored hash', async () => {
    expect(await sha256Hex(canonicalize(POC_REPORT))).toBe(POC_SHA)
  })

  it('is key-order independent (canonical)', async () => {
    const shuffled = { totalRWF: 29530, schema: 'gridsense.monthly-report.v1' }
    const ordered = { schema: 'gridsense.monthly-report.v1', totalRWF: 29530 }
    expect(canonicalize(shuffled)).toBe(canonicalize(ordered))
  })

  it('a tampered report (totalRWF+1) does NOT hash to the anchored hash', async () => {
    const tampered = { ...POC_REPORT, totalRWF: POC_REPORT.totalRWF + 1 }
    expect(await sha256Hex(canonicalize(tampered))).not.toBe(POC_SHA)
  })
})

describe('opaque homeRef + reportId (parity with the PoC run)', () => {
  it('homeRef formula matches', async () => {
    expect(await opaqueHomeRef('home-000123', POC_SALT)).toBe(POC_HOME_REF)
  })

  it('reportId = keccak256(abi.encode(homeRef, period)) matches', async () => {
    const period = periodYYYYMM(2026, 7)
    expect(period).toBe(202607)
    const id = keccak256(
      encodeAbiParameters(
        [{ type: 'bytes32' }, { type: 'uint32' }],
        [POC_HOME_REF as `0x${string}`, period],
      ),
    )
    expect(id).toBe(POC_REPORT_ID)
  })
})

describe('hand-rolled ABI codec (oracle: viem)', () => {
  it('selectors match viem', () => {
    expect(SEL_VERIFY).toBe(toFunctionSelector('verify(bytes32,bytes32)'))
    expect(SEL_GET_REPORT).toBe(toFunctionSelector('getReport(bytes32)'))
    expect(SEL_IS_ANCHORED).toBe(toFunctionSelector('isAnchored(bytes32)'))
  })

  it('encodeVerifyCall is byte-equal to viem encodeFunctionData', () => {
    expect(encodeVerifyCall(POC_REPORT_ID, POC_SHA)).toBe(
      encodeFunctionData({
        abi: REGISTRY_ABI,
        functionName: 'verify',
        args: [POC_REPORT_ID as `0x${string}`, POC_SHA as `0x${string}`],
      }),
    )
  })

  it('encodeGetReportCall is byte-equal to viem encodeFunctionData', () => {
    expect(encodeGetReportCall(POC_REPORT_ID)).toBe(
      encodeFunctionData({
        abi: REGISTRY_ABI,
        functionName: 'getReport',
        args: [POC_REPORT_ID as `0x${string}`],
      }),
    )
  })

  it('decodeBool decodes true/false words', () => {
    expect(decodeBool('0x' + '0'.repeat(63) + '1')).toBe(true)
    expect(decodeBool('0x' + '0'.repeat(64))).toBe(false)
  })

  it('decodeGetReportResult decodes a viem-encoded Record struct', () => {
    const anchorer = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    const encoded = encodeAbiParameters(
      [
        {
          type: 'tuple',
          components: [
            { name: 'sha256Hash', type: 'bytes32' },
            { name: 'ipfsCid', type: 'string' },
            { name: 'homeRef', type: 'bytes32' },
            { name: 'periodYYYYMM', type: 'uint32' },
            { name: 'timestamp', type: 'uint64' },
            { name: 'anchorer', type: 'address' },
          ],
        },
      ],
      [
        {
          sha256Hash: POC_SHA as `0x${string}`,
          ipfsCid: 'QmVm438uaz4msepwnygXBJJ4zibCA16PwVR9UtmAUnrM6h',
          homeRef: POC_HOME_REF as `0x${string}`,
          periodYYYYMM: 202607,
          timestamp: 1751564985n,
          anchorer,
        },
      ],
    )
    const rec = decodeGetReportResult(encoded)
    expect(rec.sha256Hash).toBe(POC_SHA)
    expect(rec.ipfsCid).toBe('QmVm438uaz4msepwnygXBJJ4zibCA16PwVR9UtmAUnrM6h')
    expect(rec.homeRef).toBe(POC_HOME_REF)
    expect(rec.periodYYYYMM).toBe(202607)
    expect(rec.timestamp).toBe(1751564985)
    expect(rec.anchorer).toBe(anchorer)
  })
})

describe('AES-256-GCM, PoC layout iv(12)|tag(16)|ct', () => {
  // Reference vector produced 2026-07-03 by node:crypto with the PoC's exact
  // encrypt() code (lib.mjs) and a fixed IV — cross-implementation proof.
  const KEY = '2b7e151628aed2a6abf7158809cf4f3c2b7e151628aed2a6abf7158809cf4f3c'
  const PLAIN = 'gridsense verifiable reports reference vector'
  const NODE_CRYPTO_ENC =
    '000102030405060708090a0b3aadb3e9087fbbc9403950d54d801563385be5ca953624b59572da992fe686d0a9e94bfbc67084323cbb6d2e7b177686690288fcaa07f217fb9e6594c1'

  it('decrypts the node:crypto (PoC) reference vector', async () => {
    const plain = await decryptAesGcm(hexToBytes(NODE_CRYPTO_ENC), KEY)
    expect(new TextDecoder().decode(plain)).toBe(PLAIN)
  })

  it('round-trips with the same layout', async () => {
    const enc = await encryptAesGcm(utf8Bytes(PLAIN), KEY)
    expect(enc.length).toBe(12 + 16 + utf8Bytes(PLAIN).length)
    expect(new TextDecoder().decode(await decryptAesGcm(enc, KEY))).toBe(PLAIN)
  })

  it('rejects a tampered ciphertext (auth tag)', async () => {
    const enc = await encryptAesGcm(utf8Bytes(PLAIN), KEY)
    enc[enc.length - 1] ^= 0xff
    await expect(decryptAesGcm(enc, KEY)).rejects.toThrow()
  })
})

describe('CIDv0 (oracle: ipfs-only-hash reference vectors, 2026-07-03)', () => {
  it('matches on a tiny buffer', async () => {
    expect(await computeCidV0(utf8Bytes('hello gridsense'))).toBe(
      'QmaagSWRzdhxVXSqPfDVpYrwJCD9j6wRqdWuZeWDToEaZN',
    )
  })

  it('matches on a 2048-byte pattern (report-sized)', async () => {
    const buf = new Uint8Array(2048)
    for (let i = 0; i < buf.length; i++) buf[i] = i % 256
    expect(await computeCidV0(buf)).toBe('QmZDdj1nLVnj4V8sxHzbumC4hxWhhzxbqwEQQmYXXjBjwo')
  })

  it('refuses multi-chunk files instead of returning a wrong CID', async () => {
    await expect(computeCidV0(new Uint8Array(262145))).rejects.toThrow(/single-chunk/)
  })

  it('hex helpers round-trip', () => {
    expect(bytesToHex(hexToBytes('0xdeadbeef'))).toBe('deadbeef')
  })
})

describe('/api/anchor endpoint — honest no-op without keys', () => {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } }

  function withoutKeys<T>(fn: () => Promise<T>): Promise<T> {
    const env = g.process?.env
    const saved = {
      RELAYER_PRIVATE_KEY: env?.RELAYER_PRIVATE_KEY,
      REPORT_REGISTRY_ADDRESS: env?.REPORT_REGISTRY_ADDRESS,
      REPORT_ENC_KEY: env?.REPORT_ENC_KEY,
    }
    if (env) {
      delete env.RELAYER_PRIVATE_KEY
      delete env.REPORT_REGISTRY_ADDRESS
      delete env.REPORT_ENC_KEY
    }
    return fn().finally(() => {
      if (env) Object.assign(env, saved)
    })
  }

  it('POST without keys -> 200 {anchored:false, reason:"anchoring not configured"} + honest hash', () =>
    withoutKeys(async () => {
      const res = await anchorHandler(
        new Request('http://localhost/api/anchor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report: POC_REPORT }),
        }),
      )
      expect(res.status).toBe(200)
      const out = (await res.json()) as { anchored: boolean; reason: string; sha256: string }
      expect(out.anchored).toBe(false)
      expect(out.reason).toBe('anchoring not configured')
      expect(out.sha256).toBe(POC_SHA) // fingerprint still real — nothing fabricated
    }))

  it('GET -> public config only, configured:false without keys', () =>
    withoutKeys(async () => {
      const res = await anchorHandler(new Request('http://localhost/api/anchor'))
      expect(res.status).toBe(200)
      const out = (await res.json()) as { configured: boolean; chainId: number; registry: unknown }
      expect(out.configured).toBe(false)
      expect(out.chainId).toBe(84532)
      const body = JSON.stringify(out)
      expect(body).not.toMatch(/PRIVATE|JWT|ENC_KEY/i)
    }))

  it('POST with an invalid report -> 400, never crashes', async () => {
    const res = await anchorHandler(
      new Request('http://localhost/api/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: { no: 'shape' } }),
      }),
    )
    expect(res.status).toBe(400)
    const out = (await res.json()) as { anchored: boolean }
    expect(out.anchored).toBe(false)
  })
})
