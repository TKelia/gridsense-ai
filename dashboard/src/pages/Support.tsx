import { PageTitle, Section } from './Prose'
import { Sources } from '../components/Sources'
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  SUPPORT_WHATSAPP,
  SUPPORT_EMAIL,
} from '../routes'

const FAQ = [
  {
    q: 'The dashboard shows "Starting GridSense…" and nothing loads.',
    a: 'Give it a second to boot, then refresh. The demo runs entirely in your browser; a hard refresh (Ctrl/Cmd + Shift + R) clears any stale state.',
  },
  {
    q: 'My estimate looks too high or too low.',
    a: 'Re-open Set up my home and adjust which appliances you own and the hours-per-day sliders. The preview updates instantly so you can dial it in.',
  },
  {
    q: 'How do I switch language or theme?',
    a: 'Use the EN/RW toggle and the sun/moon button in the top bar. Your choice is remembered on this device.',
  },
]

export function Support() {
  return (
    <div className="max-w-3xl">
      <PageTitle
        title="Need help?"
        sub="Reach the GridSense project directly. We're happy to help with setup, the demo, or questions about the approach."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href={`tel:${SUPPORT_PHONE_TEL}`}
          className="gs-card p-6 text-center transition-colors hover:border-emerald-500/50"
        >
          <div className="text-3xl">📞</div>
          <p className="mt-3 font-semibold text-heading">Call</p>
          <p className="mt-1 text-sm text-emerald-500">{SUPPORT_PHONE_DISPLAY}</p>
        </a>
        <a
          href={`sms:${SUPPORT_PHONE_TEL}`}
          className="gs-card p-6 text-center transition-colors hover:border-emerald-500/50"
        >
          <div className="text-3xl">✉️</div>
          <p className="mt-3 font-semibold text-heading">SMS</p>
          <p className="mt-1 text-sm text-emerald-500">{SUPPORT_PHONE_DISPLAY}</p>
        </a>
        <a
          href={SUPPORT_WHATSAPP}
          target="_blank"
          rel="noreferrer"
          className="gs-card p-6 text-center transition-colors hover:border-emerald-500/50"
        >
          <div className="text-3xl">💬</div>
          <p className="mt-3 font-semibold text-heading">WhatsApp</p>
          <p className="mt-1 text-sm text-emerald-500">{SUPPORT_PHONE_DISPLAY}</p>
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="gs-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Email</p>
          <p className="mt-2 text-sm text-soft">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-500 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-1 text-xs text-muted">Project contact address (demo).</p>
        </div>
        <div className="gs-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Hours</p>
          <p className="mt-2 text-sm text-soft">Mon–Sat, 08:00–18:00 (CAT, Kigali). We respond as soon as we can.</p>
        </div>
      </div>

      <div className="mt-12">
        <Section title="Troubleshooting">
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="gs-card p-5">
                <p className="font-semibold text-heading">{f.q}</p>
                <p className="mt-1.5 text-sm text-soft">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Sources />
    </div>
  )
}
