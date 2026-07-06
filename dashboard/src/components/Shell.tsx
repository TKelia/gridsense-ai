import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { Footer } from './Footer'
import type { Route } from '../routes'

export function Shell({
  route,
  go,
  children,
  contained = true,
}: {
  route: Route
  go: (r: Route) => void
  children: ReactNode
  contained?: boolean
}) {
  return (
    <div className="flex min-h-screen flex-col bg-app text-main">
      <TopBar route={route} go={go} />
      <main className="flex-1">
        {contained ? <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div> : children}
      </main>
      <Footer go={go} />
    </div>
  )
}
