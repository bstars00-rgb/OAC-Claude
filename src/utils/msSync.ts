// Shared Microsoft 365 sync used by BOTH the manual Settings button and the
// periodic auto-sync (MsAutoSync). It fetches the last N days of Outlook inbox +
// sent + Teams, DE-DUPLICATES against everything already imported (so repeated /
// periodic syncs never create duplicate captures), turns fresh items into capture
// entries, and — only when asked (manual, live) — adds a per-company AI summary.

import {
  fetchOutlook,
  fetchSent,
  fetchTeams,
  itemToCapture,
  matchRelationship,
  type MsConnection,
  type NormalizedItem,
} from './graph'
import { summarizeCompanyEmails } from './aiClient'
import type { StructuredCapture } from './captureAI'
import type { Lang } from './../i18n'
import { TODAY } from './format'

const SEEN_KEY = 'oac-ms-synced-v1'
const SEEN_CAP = 4000 // keep the newest N ids; older ones fall off (7-day window anyway)
export const LAST_SYNC_KEY = 'oac-ms-last-sync' // epoch ms of the last successful sync

/** ms since the last successful sync (Infinity if never). */
export function msSinceLastSync(): number {
  const v = Number(localStorage.getItem(LAST_SYNC_KEY) || 0)
  return v ? Date.now() - v : Infinity
}

// A stable identity for an item: the Graph id when present, else a content key.
export const itemKey = (it: NormalizedItem): string =>
  it.id || `${it.source}|${it.direction ?? ''}|${it.date}|${it.title}|${it.personEmail ?? ''}`

/** Items not already in `seen` — the heart of de-duplication across syncs. */
export function freshItems(items: NormalizedItem[], seen: Set<string>): NormalizedItem[] {
  return items.filter((it) => !seen.has(itemKey(it)))
}

const loadSeen = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch {
    /* ignore */
  }
  return new Set()
}
const saveSeen = (seen: Set<string>) => {
  try {
    const arr = [...seen]
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr.slice(-SEEN_CAP)))
  } catch {
    /* quota — ignore */
  }
}

export interface MsSyncResult {
  inbox: number
  sent: number
  teams: number
  added: number // fresh capture entries actually created this run
  companies: number
  summarized: number
  error?: string
  fatal: boolean // true when nothing could be fetched (auth/permission)
}

export interface MsSyncDeps {
  conn: MsConnection
  lang: Lang
  relList: { id: string; name: string }[]
  addEntry: (cap: StructuredCapture, raw: string) => void
  sinceDays?: number
  // Present → per-company AI summaries are allowed. Auto-sync passes this only
  // when the caller opts in, to avoid silently spending API budget.
  live?: { provider: 'anthropic' | 'openai'; apiKey: string; model: string }
  summarize?: boolean
}

export async function syncMicrosoft(deps: MsSyncDeps): Promise<MsSyncResult> {
  const { conn, lang, relList, addEntry } = deps
  const sinceDays = deps.sinceDays ?? 7

  const [mr, sr, tr] = await Promise.allSettled([
    fetchOutlook(conn, { sinceDays }),
    fetchSent(conn, { sinceDays }),
    fetchTeams(conn, { sinceDays }),
  ])
  const inbox = mr.status === 'fulfilled' ? mr.value : []
  const sent = sr.status === 'fulfilled' ? sr.value : []
  const teams = tr.status === 'fulfilled' ? tr.value : []
  const firstErr =
    mr.status === 'rejected' ? String(mr.reason?.message ?? mr.reason)
      : sr.status === 'rejected' ? String(sr.reason?.message ?? sr.reason)
        : tr.status === 'rejected' ? String(tr.reason?.message ?? tr.reason)
          : ''

  const all = [...inbox, ...sent, ...teams]
  // every fetch failed → surface it (likely permission/auth)
  if (firstErr && all.length === 0) {
    return { inbox: 0, sent: 0, teams: 0, added: 0, companies: 0, summarized: 0, error: firstErr, fatal: true }
  }

  const seen = loadSeen()
  const fresh = freshItems(all, seen)

  // group fresh items by company so we can optionally AI-summarize each
  const byCompany = new Map<string, { name: string; match?: { accountId: string; accountName: string }; mails: NormalizedItem[] }>()
  for (const it of fresh) {
    const match = matchRelationship(it, relList)
    const cap = itemToCapture(it, lang, match)
    addEntry(cap, `${it.title}\n${it.preview}`)
    seen.add(itemKey(it))
    const g = byCompany.get(cap.accountId) ?? { name: cap.accountName, match, mails: [] }
    g.mails.push(it)
    byCompany.set(cap.accountId, g)
  }
  saveSeen(seen)

  let summarized = 0
  if (deps.summarize && deps.live && byCompany.size) {
    for (const [accountId, g] of [...byCompany.entries()].slice(0, 12)) {
      try {
        const summary = await summarizeCompanyEmails(
          { ...deps.live, lang },
          g.name,
          g.mails.map((m) => ({ subject: m.title, body: m.body || m.preview, date: m.date })),
        )
        if (summary) {
          addEntry(
            {
              accountName: g.name, accountId, isExisting: !!g.match, category: 'General',
              detectedContext: lang === 'ko' ? 'AI 요약 · Outlook' : 'AI summary · Outlook', contextConfidence: 0.9,
              summary, timeline: { date: TODAY, title: lang === 'ko' ? 'AI 메일 요약' : 'AI mail summary', detail: summary },
              todos: [], risks: [], report: { title: '', sections: [] }, email: { subject: '', body: '' },
              kind: 'update', detail: summary, nextBestAction: summary,
            },
            summary,
          )
          summarized++
        }
      } catch {
        /* skip this company's summary */
      }
    }
  }

  // mark freshness so the UI can show "last synced" and focus-catchup can debounce
  try {
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()))
    window.dispatchEvent(new CustomEvent('oac-ms-synced'))
  } catch {
    /* ignore */
  }

  return { inbox: inbox.length, sent: sent.length, teams: teams.length, added: fresh.length, companies: byCompany.size, summarized, error: firstErr || undefined, fatal: false }
}
