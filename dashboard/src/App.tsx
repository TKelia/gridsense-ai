import { useEffect, useState } from 'react'
import { Shell } from './components/Shell'
import { Login } from './screens/Login'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { HowToUse } from './pages/HowToUse'
import { Support } from './pages/Support'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'
import { Setup } from './pages/Setup'
import { Dashboard } from './pages/Dashboard'
import { WorkspaceChooser } from './pages/Workspace'
import { Properties } from './pages/Properties'
import { Pricing } from './pages/Pricing'
import { Checkout } from './pages/Checkout'
import { Device } from './pages/Device'
import { Verify } from './pages/Verify'
import type { ScreenId } from './components/Nav'
import { useAuth } from './auth'
import type { Route } from './routes'

// A returning, signed-in user with a completed setup lands straight on the dashboard.
function initialRoute(): Route {
  // Public deep link: /verify (SPA rewrite serves index.html for every path).
  try {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/verify')) {
      return 'verify'
    }
  } catch {
    /* ignore */
  }
  try {
    const user = localStorage.getItem('gridsense_user')
    const hh = localStorage.getItem('gridsense_household')
    if (user && hh) {
      const profile = JSON.parse(hh) as { setupComplete?: boolean }
      if (profile.setupComplete) return 'dashboard'
    }
  } catch {
    /* ignore */
  }
  return 'home'
}

export default function App() {
  const { user } = useAuth()
  const [route, setRoute] = useState<Route>(initialRoute)
  const [screen, setScreen] = useState<ScreenId>('live')

  const go = (r: Route) => {
    setRoute(r)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }

  // Auth guard: dashboard, setup, workspace chooser, and properties require sign-in.
  useEffect(() => {
    const guarded: Route[] = ['dashboard', 'setup', 'workspace', 'properties']
    if (!user && guarded.includes(route)) setRoute('login')
  }, [user, route])

  // The login screen is a full-bleed split layout (no shell).
  if (route === 'login') return <Login go={go} />

  // Dashboard requires auth; render full-width inside the shell.
  if (route === 'dashboard') {
    if (!user) return <Login go={go} />
    return (
      <Shell route={route} go={go} contained={false}>
        <Dashboard screen={screen} setScreen={setScreen} go={go} />
      </Shell>
    )
  }

  if (route === 'setup') {
    if (!user) return <Login go={go} />
    return (
      <Shell route={route} go={go}>
        <Setup go={go} />
      </Shell>
    )
  }

  if (route === 'workspace') {
    if (!user) return <Login go={go} />
    return (
      <Shell route={route} go={go}>
        <WorkspaceChooser go={go} />
      </Shell>
    )
  }

  if (route === 'properties') {
    if (!user) return <Login go={go} />
    return (
      <Shell route={route} go={go}>
        <Properties />
      </Shell>
    )
  }

  // Public content pages. `home` provides its own container, others use the shell's.
  const isHome = route === 'home'
  return (
    <Shell route={route} go={go} contained={!isHome}>
      {isHome && (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <Home go={go} />
        </div>
      )}
      {route === 'about' && <About />}
      {route === 'how' && <HowToUse go={go} />}
      {route === 'support' && <Support />}
      {route === 'terms' && <Terms />}
      {route === 'privacy' && <Privacy />}
      {route === 'pricing' && <Pricing go={go} />}
      {route === 'checkout' && <Checkout go={go} />}
      {route === 'device' && <Device go={go} />}
      {route === 'verify' && <Verify />}
    </Shell>
  )
}
