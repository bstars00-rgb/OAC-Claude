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
  stats: { accounts: number; openTodos: number; risks: number; entries: number }
}

const Ctx = createContext<StoreValue | null>(null)
const KEY = 'oac-captures-v1'

let seq = 0
const newId = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

// Seed data so the workspace isn't empty on first run.
const seed = (): CaptureEntry[] => [
  {
    id: 'seed-1',
    accountId: 'cap-northstar-logistics',
    accountName: 'Northstar Logistics',
    category: 'Supplier',
    detectedContext: 'Supplier / Sourcing & Operations',
    isExisting: false,
    date: '2026-06-08',
    rawText:
      'Northstar Logistics review — Q3 unit price needs renegotiation, last two deliveries were late. Need to confirm new SLA and send the revised PO by next week. Risk: repeated late deliveries could hit peak-season fulfillment.',
    summary:
      'OAC detected a "Supplier / Sourcing & Operations" context. Q3 unit-price renegotiation and recent late deliveries; revised PO due next week.',
    timeline: {
      date: '2026-06-08',
      title: 'Northstar Logistics — Work note',
      detail: 'Q3 unit price renegotiation, two late deliveries, revised PO and new SLA needed.',
    },
    todos: [
      { id: 's1a', text: 'Confirm new SLA terms with Northstar', due: '2026-06-12', priority: 'High', done: false },
      { id: 's1b', text: 'Send the revised PO', due: '2026-06-15', priority: 'Medium', done: false },
    ],
    risks: ['Repeated late deliveries could hit peak-season fulfillment'],
  },
  {
    id: 'seed-2',
    accountId: 'cap-platform-hire',
    accountName: 'Platform Team Hiring',
    category: 'Recruiting',
    detectedContext: 'Recruiting / Hiring Pipeline',
    isExisting: false,
    date: '2026-06-07',
    rawText:
      'Backend candidate for Platform team interviewed — strong on APIs and distributed systems. Need to send offer by Friday and schedule a final culture-fit round. Risk: candidate has a competing offer.',
    summary:
      'OAC detected a "Recruiting / Hiring Pipeline" context. Strong backend candidate; offer due Friday, final round to schedule.',
    timeline: {
      date: '2026-06-07',
      title: 'Platform Team Hiring — Work note',
      detail: 'Strong backend candidate (APIs, distributed systems). Offer + final round pending.',
    },
    todos: [
      { id: 's2a', text: 'Send the offer to the candidate', due: '2026-06-12', priority: 'High', done: false },
      { id: 's2b', text: 'Schedule the final culture-fit round', due: '2026-06-11', priority: 'Medium', done: false },
    ],
    risks: ['Candidate has a competing offer — move quickly'],
  },
]

const load = (): CaptureEntry[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as CaptureEntry[]
  } catch {
    /* ignore */
  }
  return seed()
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

  return (
    <Ctx.Provider value={{ entries, addEntry, toggleTodo, clearAll, accounts, stats }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCaptureStore(): StoreValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCaptureStore must be used within CaptureProvider')
  return ctx
}
