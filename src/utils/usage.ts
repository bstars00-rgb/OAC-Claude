// Token-usage & cost tracking for the user's own API key. Every live AI call
// records the input/output tokens it used; this aggregates them into today's
// spend, this month's spend, and a month-end projection. Stored locally only.
//
// Pricing is USD per 1,000,000 tokens (Anthropic + OpenAI list prices). The
// monthly subscription (e.g. Claude Pro / ChatGPT Plus) is separate — this is
// the metered API cost that runs on top of it.

export interface ModelPrice {
  label: string
  inputPerM: number // USD per 1M input tokens
  outputPerM: number // USD per 1M output tokens
}

export const PRICING: Record<string, ModelPrice> = {
  'claude-opus-4-8': { label: 'Claude Opus 4.8', inputPerM: 5, outputPerM: 25 },
  'claude-sonnet-4-6': { label: 'Claude Sonnet 4.6', inputPerM: 3, outputPerM: 15 },
  'claude-haiku-4-5': { label: 'Claude Haiku 4.5', inputPerM: 1, outputPerM: 5 },
  'gpt-4o': { label: 'ChatGPT · GPT-4o', inputPerM: 2.5, outputPerM: 10 },
  'gpt-4o-mini': { label: 'ChatGPT · GPT-4o mini', inputPerM: 0.15, outputPerM: 0.6 },
}

// Approximate USD→KRW for an at-a-glance number. Billing is in USD; this is only
// a rough conversion for intuition.
export const USD_TO_KRW = 1400

export interface ModelDay { in: number; out: number; calls: number }
export type UsageStore = Record<string, Record<string, ModelDay>> // date → model → totals

const KEY = 'oac-usage-v1'

const todayStr = (): string => new Date().toISOString().slice(0, 10)

export function loadUsage(): UsageStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as UsageStore
  } catch {
    /* ignore */
  }
  return {}
}

function save(store: UsageStore) {
  try {
    // keep ~120 days
    const dates = Object.keys(store).sort()
    while (dates.length > 120) delete store[dates.shift() as string]
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* quota — ignore */
  }
}

/** Record one call's token usage. No-op if both counts are zero/unknown. */
export function recordUsage(model: string, inputTokens: number, outputTokens: number): void {
  if (!model || (!inputTokens && !outputTokens)) return
  const store = loadUsage()
  const day = (store[todayStr()] ??= {})
  const m = (day[model] ??= { in: 0, out: 0, calls: 0 })
  m.in += inputTokens || 0
  m.out += outputTokens || 0
  m.calls += 1
  save(store)
  try { window.dispatchEvent(new CustomEvent('oac-usage-updated')) } catch { /* ignore */ }
}

export const costOf = (model: string, inTok: number, outTok: number): number => {
  const p = PRICING[model]
  if (!p) return 0
  return (inTok / 1_000_000) * p.inputPerM + (outTok / 1_000_000) * p.outputPerM
}

export interface Totals { in: number; out: number; calls: number; cost: number; byModel: { model: string; label: string; in: number; out: number; cost: number }[] }

function sumDays(store: UsageStore, dates: string[]): Totals {
  const acc: Record<string, ModelDay> = {}
  for (const d of dates) {
    const day = store[d]
    if (!day) continue
    for (const [model, v] of Object.entries(day)) {
      const a = (acc[model] ??= { in: 0, out: 0, calls: 0 })
      a.in += v.in; a.out += v.out; a.calls += v.calls
    }
  }
  let inSum = 0, outSum = 0, calls = 0, cost = 0
  const byModel = Object.entries(acc).map(([model, v]) => {
    const c = costOf(model, v.in, v.out)
    inSum += v.in; outSum += v.out; calls += v.calls; cost += c
    return { model, label: PRICING[model]?.label ?? model, in: v.in, out: v.out, cost: c }
  }).sort((a, b) => b.cost - a.cost)
  return { in: inSum, out: outSum, calls, cost, byModel }
}

export function todayTotals(store = loadUsage()): Totals {
  return sumDays(store, [todayStr()])
}

export function monthTotals(store = loadUsage()): Totals {
  const prefix = todayStr().slice(0, 7) // YYYY-MM
  return sumDays(store, Object.keys(store).filter((d) => d.startsWith(prefix)))
}

/** Project this month's total cost from the daily average so far. */
export function projectMonthly(store = loadUsage()): { projected: number; elapsedDays: number; daysInMonth: number; avgPerDay: number } {
  const now = new Date()
  const elapsedDays = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const month = monthTotals(store)
  const avgPerDay = elapsedDays > 0 ? month.cost / elapsedDays : 0
  return { projected: avgPerDay * daysInMonth, elapsedDays, daysInMonth, avgPerDay }
}

/** Daily cost for the last n days (oldest→newest), for a small chart. */
export function dailyCostSeries(n = 14, store = loadUsage()): { label: string; cost: number }[] {
  const out: { label: string; cost: number }[] = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ label: key.slice(5), cost: sumDays(store, [key]).cost })
  }
  return out
}

export function clearUsage(): void {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  try { window.dispatchEvent(new CustomEvent('oac-usage-updated')) } catch { /* ignore */ }
}
