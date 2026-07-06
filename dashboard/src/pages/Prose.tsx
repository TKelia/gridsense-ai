import type { ReactNode } from 'react'

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-black text-heading sm:text-4xl">{title}</h1>
      {sub && <p className="mt-3 max-w-2xl text-base text-soft">{sub}</p>}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-heading">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-soft">{children}</div>
    </section>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`gs-card p-6 ${className}`}>{children}</div>
}
