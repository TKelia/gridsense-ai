import { createContext, useContext, useState, type ReactNode } from 'react'

export type WorkspaceKind = 'home' | 'property' | 'enterprise'

interface WorkspaceCtx {
  kind: WorkspaceKind
  setKind: (k: WorkspaceKind) => void
  /** True once the user has explicitly chosen a workspace (vs. the default). */
  chosen: boolean
}

const Ctx = createContext<WorkspaceCtx | null>(null)
const KEY = 'gridsense_workspace'

function readInitial(): { kind: WorkspaceKind; chosen: boolean } {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === 'home' || raw === 'property' || raw === 'enterprise') return { kind: raw, chosen: true }
  } catch {
    /* storage unavailable */
  }
  return { kind: 'home', chosen: false }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readInitial)

  const setKind = (k: WorkspaceKind) => {
    try {
      localStorage.setItem(KEY, k)
    } catch {
      /* keep in-memory only */
    }
    setState({ kind: k, chosen: true })
  }

  return <Ctx.Provider value={{ kind: state.kind, setKind, chosen: state.chosen }}>{children}</Ctx.Provider>
}

export function useWorkspace(): WorkspaceCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return c
}
