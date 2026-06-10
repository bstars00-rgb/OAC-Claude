// Weekly/monthly stats import — turns the admin's RawData .xlsx files into
// OAC datasets without a backend. The user maps columns once per profile
// (By Check Out / By Booking Date); later this same mapping layer can be fed by
// an MCP / live source instead of a file.

export type ImportProfile = 'checkout' | 'booking'

export interface ParsedSheet {
  sheetNames: string[]
  sheet: string
  headers: string[]
  rows: Record<string, unknown>[]
}

export interface MetricMap {
  header: string
  label: string
}

export interface ColumnMapping {
  dimension: string // primary grouping column (e.g. 호텔명 / 채널)
  extraDimensions: string[] // kept per group for filtering (hotel/channel/customer/region)
  metrics: MetricMap[] // numeric columns summed per group
}

export interface GroupRow {
  key: string
  dims: Record<string, string>
  metrics: Record<string, number>
  rows: number
}

export interface DatasetSnapshot {
  id: string
  profile: ImportProfile
  periodLabel: string // e.g. '2026-05' (checkout) or '2026-W23' / 'Sat–Fri' (booking)
  importedAt: string // ISO date (caller-stamped)
  fileName: string
  rowCount: number
  mapping: ColumnMapping
  groups: GroupRow[] // aggregated by the primary dimension
  byDimension: Record<string, GroupRow[]> // aggregated by EACH dimension (hotel/seller/vendor/country…)
  totals: Record<string, number>
}

// ── parsing ──────────────────────────────────────────────────────────────────
type ReadInput = { type: 'array'; data: ArrayBuffer } | { type: 'string'; data: string }

async function readWorkbook(input: ReadInput): Promise<ParsedSheet> {
  const XLSX = await import('xlsx')
  const wb = XLSX.read(input.data, { type: input.type, codepage: 65001 })
  const sheet = wb.SheetNames[0]
  const ws = wb.Sheets[sheet]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
  const headers = rows.length ? Object.keys(rows[0]) : []
  return { sheetNames: wb.SheetNames, sheet, headers, rows }
}

export const parseArrayBuffer = (buf: ArrayBuffer): Promise<ParsedSheet> => readWorkbook({ type: 'array', data: buf })

export async function parseFile(file: File): Promise<ParsedSheet> {
  // CSV: read as UTF-8 text so Korean headers/values aren't mis-decoded.
  const isCsv = /\.csv$/i.test(file.name) || file.type.includes('csv')
  if (isCsv) return readWorkbook({ type: 'string', data: await file.text() })
  return readWorkbook({ type: 'array', data: await file.arrayBuffer() })
}

// ── numbers ──────────────────────────────────────────────────────────────────
export function toNum(v: unknown): number {
  if (typeof v === 'number') return isFinite(v) ? v : 0
  if (typeof v !== 'string') return 0
  // strip currency, %, thousands separators, spaces
  const cleaned = v.replace(/[,\s₩$€£%]/g, '').replace(/[()]/g, '')
  const n = parseFloat(cleaned)
  return isFinite(n) ? n : 0
}

// ── schema presets ───────────────────────────────────────────────────────────
// Recognize the Ohmyhotel RawData export and pre-fill a sensible mapping so the
// user doesn't remap 70 columns every week. Amounts default to JPY (¥).
const normH = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()

function findHeader(headers: string[], candidates: string[]): string | undefined {
  const set = headers.map((h) => ({ h, n: normH(h) }))
  for (const c of candidates) {
    const cn = normH(c)
    const exact = set.find((x) => x.n === cn)
    if (exact) return exact.h
  }
  for (const c of candidates) {
    const cn = normH(c)
    const partial = set.find((x) => x.n.includes(cn))
    if (partial) return partial.h
  }
  return undefined
}

export interface SuggestedMapping {
  preset: 'ohmyhotel' | 'generic'
  dimension: string
  extraDimensions: string[]
  metrics: MetricMap[]
  periodColumn?: string
}

// Derive a period label from a date-ish cell value. Check Out is monthly
// (YYYY-MM); Booking keeps the given week/label as-is.
export function derivePeriodLabel(value: unknown, profile: ImportProfile): string {
  const s = String(value ?? '').trim()
  if (!s) return ''
  if (profile === 'checkout') {
    const m = s.match(/(\d{4})[-/.](\d{1,2})/)
    if (m) return `${m[1]}-${m[2].padStart(2, '0')}`
    if (value instanceof Date) return value.toISOString().slice(0, 7)
    return s
  }
  return s // booking — use the week label / value directly
}

export function suggestMapping(headers: string[], profile: ImportProfile = 'booking'): SuggestedMapping {
  const has = (c: string[]) => findHeader(headers, c)
  const isOhm =
    !!has(['Hotel Name']) &&
    (!!has(['Booking Date']) || !!has(['Check Out Date'])) &&
    !!has(['Billing Sum by Company Currency_JPY', 'Billing Sum by Company Currency JPY'])

  if (isOhm) {
    const metricDefs: { label: string; cands: string[] }[] = [
      { label: '판매액(¥)', cands: ['Billing Sum by Company Currency_JPY'] },
      { label: '수익(¥)', cands: ['Billing Revenue by Company Currency_JPY', 'Billing Revenue  by Company Currency_JPY'] },
      { label: '매입(¥)', cands: ['Vendor Sum by Company Currency_JPY'] },
      { label: '룸나잇', cands: ['Total Room Nights', 'Number Room Night(s)'] },
    ]
    const metrics: MetricMap[] = []
    for (const m of metricDefs) {
      const header = findHeader(headers, m.cands)
      if (header) metrics.push({ header, label: m.label })
    }
    const extras = ['Seller Name', 'Vendor Name', 'Hotel Country', 'Hotel Region', 'Chain Brand']
      .map((c) => findHeader(headers, [c]))
      .filter((x): x is string => !!x)
    const periodColumn =
      profile === 'checkout'
        ? findHeader(headers, ['Check Out Date', 'Week of Check In Date', 'Check In Date'])
        : findHeader(headers, ['Week of Booking Date', 'Booking Date', 'Week of Check In Date'])
    return {
      preset: 'ohmyhotel',
      dimension: findHeader(headers, ['Hotel Name']) ?? headers[0],
      extraDimensions: extras,
      metrics,
      periodColumn,
    }
  }

  // generic fallback: first text column + up to 4 inferred numeric columns
  return { preset: 'generic', dimension: '', extraDimensions: [], metrics: [] }
}

// Columns that look numeric across the sample → suggested metric candidates.
export function inferNumericHeaders(rows: Record<string, unknown>[], headers: string[]): string[] {
  const sample = rows.slice(0, 25)
  return headers.filter((h) => {
    let num = 0
    let nonEmpty = 0
    for (const r of sample) {
      const v = r[h]
      if (v === '' || v == null) continue
      nonEmpty++
      const s = String(v).replace(/[,\s₩$€£%()]/g, '')
      if (s !== '' && isFinite(parseFloat(s)) && /\d/.test(s)) num++
    }
    return nonEmpty > 0 && num / nonEmpty >= 0.8
  })
}

// ── aggregation ──────────────────────────────────────────────────────────────
export function aggregate(rows: Record<string, unknown>[], mapping: ColumnMapping): GroupRow[] {
  const map = new Map<string, GroupRow>()
  for (const r of rows) {
    const key = String(r[mapping.dimension] ?? '').trim() || '(미지정)'
    let g = map.get(key)
    if (!g) {
      const dims: Record<string, string> = { [mapping.dimension]: key }
      for (const d of mapping.extraDimensions) dims[d] = String(r[d] ?? '').trim()
      g = { key, dims, metrics: Object.fromEntries(mapping.metrics.map((m) => [m.label, 0])), rows: 0 }
      map.set(key, g)
    }
    for (const m of mapping.metrics) g.metrics[m.label] += toNum(r[m.header])
    g.rows++
  }
  return [...map.values()].sort((a, b) => {
    const k = mapping.metrics[0]?.label
    return k ? (b.metrics[k] ?? 0) - (a.metrics[k] ?? 0) : a.key.localeCompare(b.key)
  })
}

/** Aggregate rows by a single dimension column (for multi-dimension analysis). */
export function aggregateBy(rows: Record<string, unknown>[], dimColumn: string, metrics: MetricMap[]): GroupRow[] {
  const map = new Map<string, GroupRow>()
  for (const r of rows) {
    const key = String(r[dimColumn] ?? '').trim() || '(미지정)'
    let g = map.get(key)
    if (!g) {
      g = { key, dims: { [dimColumn]: key }, metrics: Object.fromEntries(metrics.map((m) => [m.label, 0])), rows: 0 }
      map.set(key, g)
    }
    for (const m of metrics) g.metrics[m.label] += toNum(r[m.header])
    g.rows++
  }
  return [...map.values()].sort((a, b) => {
    const k = metrics[0]?.label
    return k ? (b.metrics[k] ?? 0) - (a.metrics[k] ?? 0) : a.key.localeCompare(b.key)
  })
}

export function totalsOf(groups: GroupRow[], metrics: MetricMap[]): Record<string, number> {
  const t: Record<string, number> = {}
  for (const m of metrics) t[m.label] = groups.reduce((s, g) => s + (g.metrics[m.label] ?? 0), 0)
  return t
}

export function buildSnapshot(
  input: {
    profile: ImportProfile
    periodLabel: string
    fileName: string
    importedAt: string
    rows: Record<string, unknown>[]
    mapping: ColumnMapping
  },
): DatasetSnapshot {
  const groups = aggregate(input.rows, input.mapping)
  // aggregate by every available dimension (hotel / seller / vendor / country …)
  const dims = [...new Set([input.mapping.dimension, ...input.mapping.extraDimensions])].filter(Boolean)
  const byDimension: Record<string, GroupRow[]> = {}
  for (const d of dims) byDimension[d] = d === input.mapping.dimension ? groups : aggregateBy(input.rows, d, input.mapping.metrics)
  return {
    id: `ds-${input.profile}-${input.periodLabel}-${input.fileName}`.replace(/[^a-zA-Z0-9가-힣-]+/g, '_'),
    profile: input.profile,
    periodLabel: input.periodLabel,
    importedAt: input.importedAt,
    fileName: input.fileName,
    rowCount: input.rows.length,
    mapping: input.mapping,
    groups,
    byDimension,
    totals: totalsOf(groups, input.mapping.metrics),
  }
}
