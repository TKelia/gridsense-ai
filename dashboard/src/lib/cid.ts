// Real IPFS CIDv0 for small files — pure TypeScript, Web Crypto only.
//
// Computes the SAME CID that `ipfs-only-hash` (the PoC) and Pinata's
// pinFileToIPFS return for a small file with default options:
//   CIDv0 = base58btc( 0x12 0x20 || SHA-256( dag-pb( UnixFS-file( bytes ) ) ) )
// Parity is asserted in cid.test.ts against the PoC's real recorded artifact
// (out/0x40aef65b….enc -> QmVm438uaz4msepwnygXBJJ4zibCA16PwVR9UtmAUnrM6h).
//
// HONEST LIMIT: single-chunk files only (default IPFS chunk = 262144 bytes).
// A bigger file would be chunked into a tree and get a DIFFERENT CID, so we
// refuse it rather than ever return a wrong CID. Monthly reports are ~2 kB.

const MAX_SINGLE_CHUNK = 262144 // default IPFS chunker size, bytes

function varint(n: number): number[] {
  const out: number[] = []
  let v = n
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80)
    v = Math.floor(v / 128)
  }
  out.push(v)
  return out
}

/** UnixFS `Data` message for a single-chunk file: Type=2(File), Data=bytes, filesize. */
function unixFsFile(content: Uint8Array): Uint8Array {
  const parts: number[] = []
  parts.push(0x08, 0x02) // field 1 (Type), varint: 2 = File
  parts.push(0x12, ...varint(content.length)) // field 2 (Data), length-delimited
  const head = new Uint8Array(parts)
  const tail = new Uint8Array([0x18, ...varint(content.length)]) // field 3 (filesize)
  const out = new Uint8Array(head.length + content.length + tail.length)
  out.set(head, 0)
  out.set(content, head.length)
  out.set(tail, head.length + content.length)
  return out
}

/** dag-pb `PBNode` with no links: just field 1 (Data) = the UnixFS bytes. */
function dagPbNode(unixfs: Uint8Array): Uint8Array {
  const tag = new Uint8Array([0x0a, ...varint(unixfs.length)])
  const out = new Uint8Array(tag.length + unixfs.length)
  out.set(tag, 0)
  out.set(unixfs, tag.length)
  return out
}

const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58btc(bytes: Uint8Array): string {
  // count leading zeros -> leading '1's
  let zeros = 0
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++
  let n = 0n
  for (const b of bytes) n = (n << 8n) | BigInt(b)
  let out = ''
  while (n > 0n) {
    out = B58_ALPHABET[Number(n % 58n)] + out
    n /= 58n
  }
  return '1'.repeat(zeros) + out
}

/** CIDv0 (Qm…) of the exact bytes, matching ipfs-only-hash / Pinata defaults. */
export async function computeCidV0(bytes: Uint8Array): Promise<string> {
  if (bytes.length > MAX_SINGLE_CHUNK) {
    throw new Error(
      `file is ${bytes.length} bytes > single-chunk limit ${MAX_SINGLE_CHUNK} — refusing to compute a possibly-wrong CID`,
    )
  }
  const node = dagPbNode(unixFsFile(bytes))
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', node as BufferSource))
  const multihash = new Uint8Array(2 + digest.length)
  multihash[0] = 0x12 // sha2-256
  multihash[1] = 0x20 // 32 bytes
  multihash.set(digest, 2)
  return base58btc(multihash)
}
