import { PageTitle, Section } from './Prose'
import { SUPPORT_PHONE_DISPLAY, SUPPORT_EMAIL } from '../routes'

export function Terms() {
  return (
    <div className="max-w-3xl">
      <PageTitle title="Terms & Conditions" sub="Last updated: 22 June 2026" />

      <Section title="1. Acceptance">
        <p>
          By using GridSense AI ("the Service"), you agree to these terms. GridSense AI is a student capstone project
          and is provided as a demonstration. If you do not agree, please do not use the Service.
        </p>
      </Section>

      <Section title="2. What the Service does">
        <p>
          The Service estimates and forecasts electricity usage and cost using meter readings (or a sourced load model)
          and the published RURA/REG residential tariff — blocks of <b className="text-main">89 / 310 / 369 RWF/kWh</b>{' '}
          (0–20 / 20–50 / above 50 kWh per month). Electricity is <b className="text-main">VAT-exempt in Rwanda</b>, so
          the consumer charge equals these block rates; a small regulatory fee may apply on the official bill.
          Non-residential consumption is charged at a representative flat rate (355–376 RWF/kWh).
        </p>
      </Section>

      <Section title="3. Estimates, not an official bill">
        <p>
          All figures shown — usage, forecasts, costs, invoices, and savings ranges — are{' '}
          <b className="text-main">estimates</b> for guidance only. They are not guarantees of actual consumption, cost,
          or savings. GridSense AI is <b className="text-main">not a billing authority</b>. REG/EUCL is the official
          electricity utility and billing authority; your meter and official invoice are the authoritative record of
          what you owe. Invoices a landlord generates with GridSense are a transparent estimate to share with tenants,
          not a substitute for the utility's bill.
        </p>
      </Section>

      <Section title="4. For landlords and property managers">
        <p>
          If you use the Property workspace to bill tenants, you are responsible for using accurate meter readings and
          for complying with Rwandan landlord–tenant law. Rwanda's <b className="text-main">tenancy law (2006)</b> and
          the <b className="text-main">2018 Law on civil, commercial, labour and administrative procedure</b> govern
          matters such as rent default and eviction. Tenants have a <b className="text-main">right to privacy</b>, and a
          rent increase requires <b className="text-main">at least one month's notice</b>. Sub-metering and cost
          allocation to tenants must be transparent. GridSense provides tools to make charges clear; it does not provide
          legal advice — confirm specifics with counsel before relying on generated documents.
        </p>
      </Section>

      <Section title="5. Payments (demo)">
        <p>
          The pricing, cart, and checkout flows are a demonstration. <b className="text-main">No card is charged and no
          card details are collected.</b> Billing activates only when a licensed payment provider (such as MTN MoMo,
          Flutterwave, or Stripe) is connected in a future version.
        </p>
      </Section>

      <Section title="6. Acceptable use">
        <p>
          Use the Service lawfully and for legitimate purposes. Do not attempt to disrupt, reverse engineer for
          malicious purposes, or misuse the Service or its content. Only process tenant data you are entitled to
          process.
        </p>
      </Section>

      <Section title="7. No warranty">
        <p>
          The Service is provided "as is" and "as available", without warranties of any kind, express or implied,
          including fitness for a particular purpose or accuracy of estimates. Your use is at your own risk.
        </p>
      </Section>

      <Section title="8. Limitation of liability">
        <p>
          To the maximum extent permitted by law, the project and its author are not liable for any indirect or
          consequential loss arising from use of the Service, including decisions made based on its estimates.
        </p>
      </Section>

      <Section title="9. Governing law">
        <p>These terms are governed by the laws of the Republic of Rwanda.</p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions about these terms: {SUPPORT_EMAIL} · {SUPPORT_PHONE_DISPLAY}.
        </p>
      </Section>
    </div>
  )
}
