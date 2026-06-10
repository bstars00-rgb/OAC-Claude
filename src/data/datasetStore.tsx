import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DatasetSnapshot, ImportProfile } from '../utils/dataImport'

interface DatasetStore {
  snapshots: DatasetSnapshot[]
  addSnapshot: (s: DatasetSnapshot) => void
  removeSnapshot: (id: string) => void
  clearAll: () => void
  byProfile: (p: ImportProfile) => DatasetSnapshot[]
  latest: (p: ImportProfile) => DatasetSnapshot | undefined
}

const Ctx = createContext<DatasetStore | null>(null)
const KEY = 'oac-datasets-v1'

const load = (): DatasetSnapshot[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DatasetSnapshot[]
  } catch {
    /* ignore */
  }
  return []
}

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<DatasetSnapshot[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshots))
    } catch {
      // Quota exceeded — prune the OLDEST snapshots (kept newest-first) until it
      // fits, and update state to match so the UI never diverges from storage.
      for (let keep = snapshots.length - 1; keep >= 1; keep--) {
        try {
          localStorage.setItem(KEY, JSON.stringify(snapshots.slice(0, keep)))
          setSnapshots(snapshots.slice(0, keep))
          return
        } catch {
          /* keep pruning */
        }
      }
    }
  }, [snapshots])

  // Upsert by id — re-importing the same profile+period replaces that snapshot.
  const addSnapshot = useCallback((s: DatasetSnapshot) => {
    setSnapshots((prev) => [s, ...prev.filter((x) => x.id !== s.id)])
  }, [])
  const removeSnapshot = useCallback((id: string) => setSnapshots((prev) => prev.filter((x) => x.id !== id)), [])
  const clearAll = useCallback(() => setSnapshots([]), [])

  const byProfile = useCallback(
    (p: ImportProfile) => snapshots.filter((s) => s.profile === p).sort((a, b) => b.periodLabel.localeCompare(a.periodLabel)),
    [snapshots],
  )
  const latest = useCallback((p: ImportProfile) => byProfile(p)[0], [byProfile])

  const value = useMemo(
    () => ({ snapshots, addSnapshot, removeSnapshot, clearAll, byProfile, latest }),
    [snapshots, addSnapshot, removeSnapshot, clearAll, byProfile, latest],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDatasets(): DatasetStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDatasets must be used within DatasetProvider')
  return ctx
}
