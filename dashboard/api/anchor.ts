// Vercel Edge function — anchors a finalized monthly report on Base Sepolia
// (testnet) via the GridSense relayer key. GASLESS + WALLET-LESS for the user:
// the browser sends only the report JSON; the relayer signs and pays test-gas.
//
// Flow: canonicalize -> SHA-256 -> AES-256-GCM encrypt -> IPFS CIDv0 (+ Pinata
// pin when a JWT is set) -> anchorReport() on ReportRegistry. Mirrors the
// proven PoC (07-blockchain/scripts/anchor.mjs); the crypto lives in the
// shared isomorphic module src/lib/verifiable.ts so client/server/tests hash
// identical bytes.
//
// HONESTY GUARANTEES
// - No keys configured  -> HTTP 200 { anchored:false, reason:"anchoring not
//   configured" }. The app keeps working; nothing is faked.
// - The relayer private key lives ONLY in server env; it is never sent to,
//   or readable by, the client. GET returns public config only.
// - On-chain payload: hash + CID + opaque homeRef + period. No PII, no kWh,
//   no RWF (Rwanda Law N° 058/2021). No token / payment (Law N° 023/2026).
//
// Env (server-side only, set in Vercel):
//   RELAYER_PRIVATE_KEY      funded Base Sepolia test key (faucet)
//   REPORT_REGISTRY_ADDRESS  deployed ReportRegistry address
//   REPORT_ENC_KEY           32-byte hex AES key for the pinned file
//   BASE_SEPOLIA_RPC_URL     optional, defaults to https://sepolia.base.org
//   PINATA_JWT               optional — pin the encrypted file to IPFS
//   HOME_REF_SALT            optional salt for the opaque homeRef

export const config = { runtime: 'nodejs' }

import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  encodeAbiParameters,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import {
  canonicalize,
  sha256Hex,
  encryptAesGcm,
  opaqueHomeRef,
  periodYYYYMM,
  utf8Bytes,
  BASE_SEPOLIA,
  IPFS_GATEWAY,
} from '../src/lib/verifiable'
import { computeCidV0 } from '../src/lib/cid'

// Minimal ABI — matches 07-blockchain/src/ReportRegistry.sol (14/14 tests)
const REGISTRY_ABI = [
  {
    type: 'function',
    name: 'anchorReport',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'reportId', type: 'bytes32' },
      { name: 'sha256Hash', type: 'bytes32' },
      { name: 'ipfsCid', type: 'string' },
      { name: 'homeRef', type: 'bytes32' },
      { name: 'periodYYYYMM', type: 'uint32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isAnchored',
    stateMutability: 'view',
    inputs: [{ name: 'reportId', type: 'bytes32' }],
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

interface AnchorBody {
  report?: unknown
}

function env(): Record<string, string | undefined> {
  return (
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
  )
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function pinToPinata(bytes: Uint8Array, name: string, jwt: string): Promise<string> {
  const form = new FormData()
  form.append('file', new Blob([bytes as BlobPart]), name)
  form.append('pinataMetadata', JSON.stringify({ name }))
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  })
  if (!res.ok) throw new Error(`Pinata ${res.status}`)
  const out = (await res.json()) as { IpfsHash?: string }
  if (!out.IpfsHash) throw new Error('Pinata: no IpfsHash in response')
  return out.IpfsHash
}

async function handler(req: Request): Promise<Response> {
  const e = env()
  const registry = e.REPORT_REGISTRY_ADDRESS
  const rpcUrl = e.BASE_SEPOLIA_RPC_URL || BASE_SEPOLIA.rpcUrl
  const configured = Boolean(e.RELAYER_PRIVATE_KEY && registry && e.REPORT_ENC_KEY)

  // Public config for the wallet-less verify page — no secrets, ever.
  if (req.method === 'GET') {
    return json({
      configured,
      registry: registry ?? null,
      chainId: BASE_SEPOLIA.chainId,
      rpcUrl,
      explorer: BASE_SEPOLIA.explorer,
      network: BASE_SEPOLIA.name,
    })
  }

  if (req.method !== 'POST') return json({ anchored: false, reason: 'method not allowed' }, 405)

  let body: AnchorBody
  try {
    body = (await req.json()) as AnchorBody
  } catch {
    return json({ anchored: false, reason: 'invalid JSON body' }, 400)
  }

  const report = body.report as
    | { home?: { internalId?: unknown }; period?: { year?: unknown; month?: unknown } }
    | undefined
  const internalId = report?.home?.internalId
  const year = report?.period?.year
  const month = report?.period?.month
  if (
    !report ||
    typeof internalId !== 'string' ||
    typeof year !== 'number' ||
    typeof month !== 'number'
  ) {
    return json(
      { anchored: false, reason: 'report must include home.internalId and period.{year,month}' },
      400,
    )
  }

  // The fingerprint is computable (and returned) even when anchoring is off,
  // so the client can show honest state without fabricating chain data.
  const canonical = canonicalize(report)
  const sha = (await sha256Hex(canonical)) as `0x${string}`

  if (!configured) {
    return json({ anchored: false, reason: 'anchoring not configured', sha256: sha })
  }

  try {
    const homeRef = (await opaqueHomeRef(internalId, e.HOME_REF_SALT || 'gridsense-demo-salt')) as `0x${string}`
    const period = periodYYYYMM(year, month)
    const reportId = keccak256(
      encodeAbiParameters([{ type: 'bytes32' }, { type: 'uint32' }], [homeRef, period]),
    )

    const pub = createPublicClient({ chain: baseSepolia, transport: http(rpcUrl) })
    const registryAddr = registry as `0x${string}`

    // Guard (ported from the PoC): a write to a code-less address is a silent
    // no-op that LOOKS successful — refuse instead.
    const code = await pub.getCode({ address: registryAddr })
    if (!code || code === '0x') {
      return json({ anchored: false, reason: `no contract code at ${registryAddr} on Base Sepolia` })
    }

    // Append-only pre-check: same content -> idempotent success; different
    // content -> honest refusal (the first anchor stands).
    const already = await pub.readContract({
      address: registryAddr,
      abi: REGISTRY_ABI,
      functionName: 'isAnchored',
      args: [reportId],
    })
    if (already) {
      const rec = await pub.readContract({
        address: registryAddr,
        abi: REGISTRY_ABI,
        functionName: 'getReport',
        args: [reportId],
      })
      if (rec.sha256Hash === sha) {
        return json({
          anchored: true,
          alreadyAnchored: true,
          reportId,
          sha256: sha,
          ipfsCid: rec.ipfsCid,
          homeRef,
          period,
          chainId: BASE_SEPOLIA.chainId,
          registry: registryAddr,
          txHash: null,
          block: null,
          pinned: false,
          timestamp: Number(rec.timestamp),
          explorerAddress: `${BASE_SEPOLIA.explorer}/address/${registryAddr}`,
          anchoredAt: new Date(Number(rec.timestamp) * 1000).toISOString(),
        })
      }
      return json({
        anchored: false,
        reason: 'this home/period is already anchored with different content (append-only registry)',
        reportId,
      })
    }

    // Encrypt the exact canonical bytes, compute the real CID, optionally pin.
    const enc = await encryptAesGcm(utf8Bytes(canonical), e.REPORT_ENC_KEY as string)
    const cid = await computeCidV0(enc)
    let pinned = false
    if (e.PINATA_JWT) {
      const pinnedCid = await pinToPinata(enc, `${reportId}.enc`, e.PINATA_JWT)
      if (pinnedCid !== cid) {
        return json({
          anchored: false,
          reason: `Pinata CID ${pinnedCid} != computed CID ${cid} — refusing to anchor a mismatched CID`,
        })
      }
      pinned = true
    }

    const account = privateKeyToAccount(
      (e.RELAYER_PRIVATE_KEY!.startsWith('0x')
        ? e.RELAYER_PRIVATE_KEY
        : `0x${e.RELAYER_PRIVATE_KEY}`) as `0x${string}`,
    )
    const wallet = createWalletClient({ account, chain: baseSepolia, transport: http(rpcUrl) })
    const txHash = await wallet.writeContract({
      address: registryAddr,
      abi: REGISTRY_ABI,
      functionName: 'anchorReport',
      args: [reportId, sha, cid, homeRef, period],
    })
    const receipt = await pub.waitForTransactionReceipt({ hash: txHash })

    return json({
      anchored: receipt.status === 'success',
      reportId,
      sha256: sha,
      ipfsCid: cid,
      homeRef,
      period,
      chainId: BASE_SEPOLIA.chainId,
      registry: registryAddr,
      txHash,
      block: Number(receipt.blockNumber),
      pinned,
      explorerTx: `${BASE_SEPOLIA.explorer}/tx/${txHash}`,
      ipfsUrl: pinned ? `${IPFS_GATEWAY}${cid}` : null,
      anchoredAt: new Date().toISOString(),
    })
  } catch (err) {
    // Never crash the app; never fabricate. Say what failed.
    const msg = err instanceof Error ? err.message : 'unknown error'
    return json({ anchored: false, reason: `anchoring failed: ${msg.slice(0, 300)}` })
  }
}


export { handler }
export default { fetch: handler }
