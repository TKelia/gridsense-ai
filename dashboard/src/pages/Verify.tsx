// Wallet-less report verification — public page, no sign-in required.
//
// Re-computes the SHA-256 fingerprint of the report the user holds (canonical
// bytes, same shared module the server used) and compares it with the hash
// anchored on Base Sepolia via a plain public-RPC read (eth_call — no wallet,
// no key, no crypto UI). Includes the tamper demo (negative control).
//
// HONEST LIMIT (shown in the UI): this proves the report was not changed after
// issuance — NOT that the meter reading was correct.
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import {
  canonicalize,
  sha256Hex,
  ethCall,
  encodeVerifyCall,
  encodeGetReportCall,
  decodeBool,
  decodeGetReportResult,
  loadAnchors,
  BASE_SEPOLIA,
  IPFS_GATEWAY,
  type OnchainRecord,
  type StoredAnchor,
} from '../lib/verifiable'

interface RunResult {
  pass: boolean
  notAnchored: boolean
  myHash: string
  record: OnchainRecord | null
  contractOk: boolean
  tampered: boolean
  error?: string
}

async function runVerification(
  report: unknown,
  reportId: string,
  registry: string,
  tampered: boolean,
  rpc: string,
): Promise<RunResult> {
  const myHash = await sha256Hex(canonicalize(report))
  let record: OnchainRecord | null = null
  let notAnchored = false
  try {
    record = decodeGetReportResult(await ethCall(rpc, registry, encodeGetReportCall(reportId)))
  } catch {
    notAnchored = true // getReport reverts when nothing is anchored under this id
  }
  let contractOk = false
  if (!notAnchored) {
    contractOk = decodeBool(await ethCall(rpc, registry, encodeVerifyCall(reportId, myHash)))
  }
  const pass = !notAnchored && record !== null && record.sha256Hash === myHash && contractOk
  return { pass, notAnchored, myHash, record, contractOk, tampered }
}

function Hash({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'bad' }) {
  return (
    <div className="mt-2">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p
        className={`break-all font-mono text-xs ${
          tone === 'ok' ? 'text-emerald-500' : tone === 'bad' ? 'text-rose-500' : 'text-soft'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export function Verify() {
  const { t } = useI18n()
  const anchors = useMemo(() => Object.values(loadAnchors()), [])
  const [selected, setSelected] = useState<StoredAnchor | null>(null)
  const [pasted, setPasted] = useState('')
  const [pastedId, setPastedId] = useState('')
  const [registry, setRegistry] = useState<string | null>(null)
  const [rpcUrl, setRpcUrl] = useState<string>(BASE_SEPOLIA.rpcUrl)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [uiError, setUiError] = useState<string | null>(null)

  // Deep link: /verify?report=<reportId> preselects the stored anchor.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('report')
    if (id) {
      const hit = loadAnchors()[id]
      if (hit) setSelected(hit)
    }
  }, [])

  // Public config (registry address) for verifying pasted reports — no secrets.
  useEffect(() => {
    fetch('/api/anchor')
      .then((r) => r.json())
      .then((cfg: { registry?: string | null; rpcUrl?: string }) => {
        setRegistry(cfg.registry ?? null)
        if (cfg.rpcUrl) setRpcUrl(cfg.rpcUrl)
      })
      .catch(() => setRegistry(null))
  }, [])

  const activeReport: unknown = selected
    ? selected.report
    : pasted
      ? (() => {
          try {
            return JSON.parse(pasted) as unknown
          } catch {
            return undefined
          }
        })()
      : undefined
  const activeId = selected ? selected.receipt.reportId : pastedId.trim()
  const activeRegistry = selected ? selected.receipt.registry : registry
  const localChain = selected !== null && selected.receipt.chainId !== BASE_SEPOLIA.chainId

  const run = async (tamper: boolean) => {
    setUiError(null)
    setResult(null)
    if (pasted && !selected && activeReport === undefined) return setUiError(t('verify_bad_json'))
    if (!activeReport || !activeId || !activeRegistry) return
    setBusy(true)
    try {
      let report = activeReport
      if (tamper) {
        const clone = JSON.parse(JSON.stringify(report)) as Record<string, unknown>
        clone.totalRWF = (typeof clone.totalRWF === 'number' ? clone.totalRWF : 0) + 1
        report = clone
      }
      setResult(await runVerification(report, activeId, activeRegistry, tamper, rpcUrl))
    } catch {
      setUiError(t('verify_rpc_error'))
    }
    setBusy(false)
  }

  const download = () => {
    if (!selected) return
    const blob = new Blob([JSON.stringify(selected.report, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gridsense-report-${selected.receipt.period}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight text-heading">{t('verify_title')}</h1>
      <p className="mt-2 text-sm text-soft">{t('verify_sub')}</p>
      <p className="mt-2 inline-block rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs text-amber-500">
        {t('verify_testnet')} · {t('verify_limit')}
      </p>

      {/* Pick a report anchored from this device */}
      <div className="mt-6 gs-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {t('verify_pick_stored')}
        </p>
        {anchors.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{t('verify_none_stored')}</p>
        ) : (
          <div className="mt-2 space-y-2">
            {anchors.map((a) => (
              <button
                key={a.receipt.reportId}
                onClick={() => {
                  setSelected(a)
                  setResult(null)
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  selected?.receipt.reportId === a.receipt.reportId
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-500'
                    : 'border-[var(--border)] bg-[var(--surface)] text-soft hover:text-main'
                }`}
              >
                <span className="truncate font-mono text-xs">{a.receipt.reportId}</span>
                <span className="shrink-0 text-xs text-muted">{a.receipt.period}</span>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <button onClick={download} className="mt-3 text-xs text-emerald-500 underline hover:text-emerald-400">
            {t('verify_download')}
          </button>
        )}

        {/* Or paste a report + its id */}
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
          {t('verify_paste_label')}
        </p>
        <textarea
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value)
            setSelected(null)
            setResult(null)
          }}
          rows={4}
          spellCheck={false}
          placeholder='{"schema":"gridsense.monthly-report.v1", …}'
          className="mt-2 w-full rounded-xl gs-input px-3.5 py-2.5 font-mono text-xs focus:border-emerald-400 focus:outline-none"
        />
        <input
          value={pastedId}
          onChange={(e) => setPastedId(e.target.value)}
          placeholder={t('verify_report_id') + ' — 0x…'}
          className="mt-2 w-full rounded-xl gs-input px-3.5 py-2.5 font-mono text-xs focus:border-emerald-400 focus:outline-none"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => run(false)}
            disabled={busy || !activeReport || !activeId || !activeRegistry || localChain}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40"
          >
            {busy ? t('verify_running') : t('verify_run')}
          </button>
          <button
            onClick={() => run(true)}
            disabled={busy || !activeReport || !activeId || !activeRegistry || localChain}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-500 hover:bg-amber-500/20 disabled:opacity-40"
          >
            {t('verify_tamper_demo')}
          </button>
        </div>
        {localChain && (
          <p className="mt-2 text-xs text-amber-500">
            This receipt is from a local demo chain (chainId {selected?.receipt.chainId}) — it is
            not publicly verifiable on Base Sepolia.
          </p>
        )}
        {uiError && <p className="mt-2 text-sm text-rose-500">{uiError}</p>}
      </div>

      {/* Result */}
      {result && (
        <div
          className={`mt-4 gs-card p-5 ${
            result.pass ? 'border border-emerald-500/40' : 'border border-rose-500/40'
          }`}
        >
          <p className={`text-lg font-black ${result.pass ? 'text-emerald-500' : 'text-rose-500'}`}>
            {result.pass ? t('verify_pass') : result.notAnchored ? t('verify_not_anchored') : t('verify_fail')}
          </p>
          {result.tampered && <p className="mt-1 text-xs text-amber-500">{t('verify_tamper_note')}</p>}
          <Hash label={t('verify_hash_mine')} value={result.myHash} tone={result.pass ? 'ok' : 'bad'} />
          {result.record && (
            <>
              <Hash
                label={t('verify_hash_chain')}
                value={result.record.sha256Hash}
                tone={result.pass ? 'ok' : undefined}
              />
              <p className="mt-2 text-xs text-muted">
                {t('verify_anchored_time')}:{' '}
                {new Date(result.record.timestamp * 1000).toLocaleString('en-GB')} · period{' '}
                {result.record.periodYYYYMM}
              </p>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {selected?.receipt.txHash && (
              <a
                href={`${BASE_SEPOLIA.explorer}/tx/${selected.receipt.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-500 underline hover:text-emerald-400"
              >
                {t('verify_view_basescan')}
              </a>
            )}
            {activeRegistry && (
              <a
                href={`${BASE_SEPOLIA.explorer}/address/${activeRegistry}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-500 underline hover:text-emerald-400"
              >
                ReportRegistry ↗
              </a>
            )}
            {result.record?.ipfsCid &&
              (selected?.receipt.pinned ? (
                <a
                  href={`${IPFS_GATEWAY}${result.record.ipfsCid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-500 underline hover:text-emerald-400"
                >
                  {t('verify_view_ipfs')}
                </a>
              ) : (
                <span className="text-xs text-muted">
                  {t('verify_cid_unpinned')}: <span className="font-mono">{result.record.ipfsCid}</span>
                </span>
              ))}
          </div>
          <p className="mt-3 text-xs text-muted">{t('verify_limit')}</p>
        </div>
      )}
    </div>
  )
}
