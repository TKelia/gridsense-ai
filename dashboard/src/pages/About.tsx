import { PageTitle, Section } from './Prose'
import { Sources } from '../components/Sources'
import { useI18n } from '../i18n'

export function About() {
  const { t } = useI18n()
  return (
    <div className="max-w-3xl">
      <PageTitle
        title="About GridSense AI"
        sub="Making Rwanda's tiered electricity tariff visible, understandable, and actionable for everyday homes."
      />

      <div className="mb-8 rounded-2xl gs-card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-heading">{t('what_is_title')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-soft">{t('what_is_body')}</p>
        <p className="mt-3 text-sm leading-relaxed text-soft">{t('what_is_value')}</p>
      </div>

      <Section title="Our mission">
        <p>
          Electricity in Rwanda is billed in tiers — and most households can't see which tier they're in or which
          appliance is driving their bill until the prepaid units run out. GridSense AI closes that gap: live,
          appliance-level insight tied to the real RURA tariff, in English and Kinyarwanda, so families can spend less
          without guessing.
        </p>
      </Section>

      <Section title="Who's building it">
        <p>
          GridSense AI is the capstone project of <b className="text-main">Tesi Songa Kelia</b>, BSc Software
          Engineering, <b className="text-main">African Leadership University, Kigali</b>. It pairs a low-cost
          sensing approach with honest, transparent software — every number on screen is either measured, sourced, or
          clearly labelled as an estimate.
        </p>
      </Section>

      <Section title="What GridSense is (and isn't)">
        <p>
          GridSense is a home energy monitor and advisor. It estimates and forecasts your usage and cost against the
          published RURA tariff. It is <b className="text-main">not</b> a billing authority — REG/EUCL remains the
          official utility, and your meter is the source of truth. This demo runs on a sourced simulation; the real
          product reads live current from a sensor on your main line.
        </p>
      </Section>

      <Section title="The roadmap">
        <p>We're honest about what's built today versus what comes next.</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <b className="text-main">Phase 1 — Whole-home + plugs.</b> A CT clamp on the main line plus a few smart
            plugs make the 2–3 biggest appliances exact. Live dashboard, tariff math, tier-cliff alerts, rule-based
            savings advice. (This demo reflects Phase 1.)
          </li>
          <li>
            <b className="text-main">Phase 2 — By-area + GSM.</b> Multiple sensing points for room/circuit-level
            breakdown, and GSM connectivity for homes without reliable Wi-Fi.
          </li>
          <li>
            <b className="text-main">Phase 3 — ML / NILM.</b> Bill forecasting, anomaly detection, and non-intrusive
            load monitoring (appliance disaggregation) as real usage data accumulates.
          </li>
        </ul>
      </Section>

      <Section title="Honest AI scoping">
        <p>
          We don't claim machine learning we haven't built. Today's recommendations are rule-based and tied to the
          verified tariff; savings figures are shown as ranges (10–20%) rather than a single fabricated number. ML and
          NILM are on the roadmap — clearly marked as future work until they ship.
        </p>
      </Section>

      <Sources />
    </div>
  )
}
