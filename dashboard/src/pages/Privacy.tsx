import { PageTitle, Section } from './Prose'
import { SUPPORT_PHONE_DISPLAY, SUPPORT_EMAIL } from '../routes'

export function Privacy() {
  return (
    <div className="max-w-3xl">
      <PageTitle title="Privacy & Legal" sub="Last updated: 22 June 2026" />

      <Section title="What we collect (and where it lives)">
        <p>
          In this demo, GridSense AI does <b className="text-main">not</b> run a server account. The data you enter —
          your sign-in name/email, your home-setup choices, and (in the Property workspace) your properties, units,
          tenants, meter readings, and payment status — is stored <b className="text-main">locally on your device</b> in
          your browser's <code>localStorage</code>. It is not transmitted to or stored on any GridSense server.
        </p>
      </Section>

      <Section title="Tenant data and your responsibility">
        <p>
          Storing a tenant's name, phone, email, and consumption is <b className="text-main">processing personal
          data</b>. If you use the Property workspace, you are the controller of that data and must have a lawful basis
          and the tenant's awareness to process it. Tenants have a <b className="text-main">right to privacy</b> under
          Rwandan tenancy law; collect only what you need (data minimization) and keep it secure.
        </p>
      </Section>

      <Section title="Compliance with Law N° 058/2021">
        <p>
          The production product is designed to comply with Rwanda's data-protection framework, principally{' '}
          <b className="text-main">Law N° 058/2021</b> relating to the protection of personal data and privacy, under
          the supervision of the <b className="text-main">National Cyber Security Authority (NCSA)</b>. That law requires
          consent or another lawful basis, data minimization, and appropriate security. This demo's local-only storage
          is an intentionally conservative starting point: your data never leaves your device.
        </p>
      </Section>

      <Section title="Estimates, not an official bill">
        <p>
          Bills and invoices generated here are <b className="text-main">estimates</b> from your readings and the
          official RURA/REG tariff. GridSense is <b className="text-main">not the billing authority</b> — REG/EUCL is.
          Share generated documents with tenants as a transparent breakdown, alongside the official utility record.
        </p>
      </Section>

      <Section title="localStorage keys used">
        <ul className="ml-5 list-disc space-y-1">
          <li><code>gridsense_user</code> — your sign-in name/email</li>
          <li><code>gridsense_household</code> — your home setup profile</li>
          <li><code>gridsense_workspace</code> — which workspace you chose</li>
          <li><code>gridsense_portfolio</code> — your properties, units, tenants & readings</li>
          <li><code>gridsense_theme</code> — dark/light preference</li>
        </ul>
      </Section>

      <Section title="Your rights">
        <p>
          You can view, change, or delete your data at any time by editing your setup, removing a property or unit,
          signing out, or clearing your browser storage. In the production version, you will be able to request access
          to and deletion of any server-held data in accordance with Law N° 058/2021.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Privacy questions: {SUPPORT_EMAIL} · {SUPPORT_PHONE_DISPLAY}.
        </p>
      </Section>
    </div>
  )
}
