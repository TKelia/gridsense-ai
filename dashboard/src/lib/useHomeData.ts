import { useEffect, useRef, useState } from 'react'
import { initState, tick, type ApplianceModel, type SimState, APPLIANCES } from './simulation'
import type { HomeSnapshot } from './types'

export interface ChartPoint {
  t: string
  kw: number
}

/**
 * Shared live-data hook: runs the simulation once and feeds all screens.
 * @param appliances active appliance list (from the household profile).
 * @param seedKwh starting month-to-date kWh (demo: ~47.5 near the cliff; real: month-to-date estimate).
 */
export function useHomeData(appliances: ApplianceModel[] = APPLIANCES, seedKwh = 47.5) {
  const [snap, setSnap] = useState<HomeSnapshot | null>(null)
  const [history, setHistory] = useState<ChartPoint[]>([])
  const stateRef = useRef<SimState>(initState(seedKwh))
  const listRef = useRef<ApplianceModel[]>(appliances)
  listRef.current = appliances

  useEffect(() => {
    const id = setInterval(() => {
      const { snapshot, state } = tick(stateRef.current, Date.now(), listRef.current)
      stateRef.current = state
      setSnap(snapshot)
      setHistory((h) =>
        [
          ...h,
          { t: new Date(snapshot.ts).toLocaleTimeString(), kw: +(snapshot.totalWatts / 1000).toFixed(2) },
        ].slice(-40),
      )
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return { snap, history }
}
