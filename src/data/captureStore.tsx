import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Category, Priority, StructuredCapture } from '../utils/captureAI'

export interface SavedTodo {
  id: string
  text: string
  due: string
  priority: Priority
  done: boolean
}

export type EntryKind = 'note' | 'review' | 'meeting' | 'email' | 'report' | 'update'

export interface CaptureEntry {
  id: string
  accountId: string
  accountName: string
  category: Category
  detectedContext: string
  isExisting: boolean
  date: string
  rawText: string
  summary: string
  timeline: { date: string; title: string; detail: string }
  todos: SavedTodo[]
  risks: string[]
  kind?: EntryKind
  detail?: string // longer result (e.g. review findings, email/report body)
  nextBestAction?: string // assistant's updated recommendation for the relationship
}

export interface CaptureAccount {
  accountId: string
  accountName: string
  category: Category
  detectedContext: string
  isExisting: boolean
  entryCount: number
  openTodos: number
  riskCount: number
  lastDate: string
}

interface StoreValue {
  entries: CaptureEntry[]
  addEntry: (s: StructuredCapture, rawText: string) => CaptureEntry
  toggleTodo: (entryId: string, todoId: string) => void
  clearAll: () => void
  accounts: CaptureAccount[]
  entriesByEntity: (accountId: string) => CaptureEntry[]
  stats: { accounts: number; openTodos: number; risks: number; entries: number }
}

const Ctx = createContext<StoreValue | null>(null)
const KEY = 'oac-captures-v1'

let seq = 0
const newId = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

const load = (): CaptureEntry[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as CaptureEntry[]
  } catch {
    /* ignore */
  }
  return [] // start with an empty workspace — real use, your data only
}

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CaptureEntry[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(entries))
    } catch {
      /* ignore */
    }
  }, [entries])

  const addEntry = useCallback((s: StructuredCapture, rawText: string): CaptureEntry => {
    const entry: CaptureEntry = {
      id: newId('e'),
      accountId: s.accountId,
      accountName: s.accountName,
      category: s.category,
      detectedContext: s.detectedContext,
      isExisting: s.isExisting,
      date: s.timeline.date,
      rawText,
      summary: s.summary,
      timeline: s.timeline,
      todos: s.todos.map((t) => ({ id: newId('t'), text: t.text, due: t.due, priority: t.priority, done: false })),
      risks: s.risks,
      kind: s.kind,
      detail: s.detail,
      nextBestAction: s.nextBestAction,
    }
    setEntries((prev) => [entry, ...prev])
    return entry
  }, [])

  const toggleTodo = useCallback((entryId: string, todoId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, todos: e.todos.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)) }
          : e,
      ),
    )
  }, [])

  const clearAll = useCallback(() => setEntries([]), [])

  const accounts = useMemo<CaptureAccount[]>(() => {
    const map = new Map<string, CaptureAccount>()
    for (const e of entries) {
      const a =
        map.get(e.accountId) ??
        ({
          accountId: e.accountId,
          accountName: e.accountName,
          category: e.category,
          detectedContext: e.detectedContext,
          isExisting: e.isExisting,
          entryCount: 0,
          openTodos: 0,
          riskCount: 0,
          lastDate: e.date,
        } as CaptureAccount)
      a.entryCount += 1
      a.openTodos += e.todos.filter((t) => !t.done).length
      a.riskCount += e.risks.length
      if (e.date > a.lastDate) a.lastDate = e.date
      map.set(e.accountId, a)
    }
    return [...map.values()].sort((x, y) => y.lastDate.localeCompare(x.lastDate))
  }, [entries])

  const stats = useMemo(
    () => ({
      accounts: accounts.length,
      openTodos: entries.reduce((n, e) => n + e.todos.filter((t) => !t.done).length, 0),
      risks: entries.reduce((n, e) => n + e.risks.length, 0),
      entries: entries.length,
    }),
    [entries, accounts],
  )

  const entriesByEntity = useCallback(
    (accountId: string) => entries.filter((e) => e.accountId === accountId),
    [entries],
  )

  return (
    <Ctx.Provider value={{ entries, addEntry, toggleTodo, clearAll, accounts, entriesByEntity, stats }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCaptureStore(): StoreValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCaptureStore must be used within CaptureProvider')
  return ctx
}
