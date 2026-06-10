// Answer natural-language questions about imported RawData snapshots —
// rankings ("수익 Top5 호텔") AND specific entity+period lookups
// ("아고다 4월 매출 어때?") — returning text + optional chart data.
// Pure + deterministic so it powers the demo assistant, grounds the live model,
// and is unit-testable.

import type { DatasetSnapshot, GroupRow } from './dataImport'
import type { Lang } from '../i18n'

export interface ChartPoint { label: string; value: number }
export interface ChartData {
  kind: 'bar' | 'line'
  title: string
  unit: 'yen' | 'count' | ''
  points: ChartPoint[]
}
export interface DataAnswer { text: string; chart?: ChartData }

const fmtNum = (n: number, yen: boolean) => (yen ? '¥' : '') + Math.round(n).toLocaleString()
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]/g, '')

// Korean ↔ English aliases for common OTAs / channels so "아고다" matches "Agoda".
const ALIASES: Record<string, string> = {
  아고다: 'agoda', 부킹닷컴: 'booking', 부킹: 'booking', 익스피디아: 'expedia',
  트립닷컴: 'trip', 트립: 'trip', 씨트립: 'ctrip', 호텔스닷컴: 'hotels',
  야놀자: 'yanolja', 여기어때: 'yeogi', 호텔베드: 'hotelbeds', 호텔베즈: 'hotelbeds', 웹베드: 'webbeds',
}
const applyAlias = (s: string) => {
  let r = s
  for (const [k, v] of Object.entries(ALIASES)) r = r.split(k).join(v)
  return r
}

export function looksLikeDataQuery(text: string): boolean {
  return (
    /(top\s*\d|상위|순위|랭킹|랭크|best|가장|많은|높은|적은|낮은)/i.test(text) ||
    /(판매액|매출|매입|수익|마진|룸나잇|room\s?night|예약\s?건|건수|booking\s?count)/i.test(text) ||
    Object.keys(ALIASES).some((k) => text.includes(k))
  )
}

function pickN(text: string): number {
  const m = text.match(/(?:top|상위)\s*(\d{1,3})|(\d{1,3})\s*(?:개|곳|건)/i)
  const n = m ? parseInt(m[1] || m[2], 10) : 5
  return Math.max(1, Math.min(20, isFinite(n) ? n : 5))
}

interface MetricPick { label: string; isCount: boolean }
function pickMetric(text: string, labels: string[]): MetricPick {
  const rules: { re: RegExp; key: string }[] = [
    { re: /수익|마진|revenue|profit|margin/i, key: '수익' },
    { re: /판매|매출|sales|billing|sell/i, key: '판매액' },
    { re: /매입|원가|cost|vendor/i, key: '매입' },
    { re: /룸나잇|room\s?night|박|nights?/i, key: '룸나잇' },
  ]
  if (/건수|예약\s?건|booking\s?count|건\b/i.test(text)) return { label: '건수', isCount: true }
  for (const r of rules) {
    if (r.re.test(text)) {
      const hit = labels.find((l) => l.includes(r.key))
      if (hit) return { label: hit, isCount: false }
    }
  }
  return { label: labels[0] ?? '건수', isCount: !labels.length }
}

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
function monthFromText(text: string): number | undefined {
  const ko = text.match(/(\d{1,2})\s*월/)
  if (ko) return Math.min(12, Math.max(1, +ko[1]))
  const en = text.toLowerCase().match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/)
  if (en) return MONTHS[en[1]]
  return undefined
}
const monthOfPeriod = (label: string): number | undefined => {
  const m = label.match(/^(\d{4})-(\d{2})\b/)
  return m ? +m[2] : undefined
}

function snapsAsc(snapshots: DatasetSnapshot[]): DatasetSnapshot[] {
  return [...snapshots].sort((a, b) => a.periodLabel.localeCompare(b.periodLabel))
}
const groupsForDim = (s: DatasetSnapshot, dim: string): GroupRow[] => s.byDimension?.[dim] ?? (dim === s.mapping.dimension ? s.groups : [])

// Find a specific entity (e.g. a hotel or channel like Agoda) across all dimensions.
function findEntity(text: string, snapshots: DatasetSnapshot[]): { name: string; dim: string } | undefined {
  const q = applyAlias(text.toLowerCase())
  const qn = norm(applyAlias(text))
  const seen = new Map<string, { name: string; dim: string; len: number }>()
  for (const s of snapshots) {
    const dims = s.byDimension ? Object.keys(s.byDimension) : [s.mapping.dimension]
    for (const dim of dims) {
      for (const g of groupsForDim(s, dim)) {
        const kn = norm(g.key)
        if (kn.length < 4) continue // avoid 3-char false positives (e.g. "ana" in "analysis")
        // query mentions this entity (alias-normalized), either script
        if (qn.includes(kn) || q.includes(g.key.toLowerCase())) {
          const prev = seen.get(kn)
          if (!prev || kn.length > prev.len) seen.set(kn, { name: g.key, dim, len: kn.length })
        }
      }
    }
  }
  // most specific (longest) match wins
  const best = [...seen.values()].sort((a, b) => b.len - a.len)[0]
  return best ? { name: best.name, dim: best.dim } : undefined
}

export function answerDataQueryRich(text: string, snapshots: DatasetSnapshot[], lang: Lang): DataAnswer | null {
  if (!snapshots.length) return null
  const ko = lang === 'ko'
  const labelsUnion = [...new Set(snapshots.flatMap((s) => s.mapping.metrics.map((m) => m.label)))]
  const { label, isCount } = pickMetric(text, labelsUnion)
  const withYen = label.includes('¥')
  const unit: ChartData['unit'] = isCount ? 'count' : withYen ? 'yen' : ''
  const valOf = (g: GroupRow) => (isCount ? g.rows : g.metrics[label] ?? 0)
  const month = monthFromText(text)

  // ── specific entity (e.g. "아고다 4월 매출") ──
  const ent = findEntity(text, snapshots)
  if (ent) {
    const asc = snapsAsc(snapshots)
    let points: ChartPoint[] = []
    for (const s of asc) {
      const g = groupsForDim(s, ent.dim).find((x) => norm(x.key) === norm(ent.name))
      if (g) points.push({ label: s.periodLabel, value: valOf(g) })
    }
    // If a month was asked for, only claim it when a period actually maps to that
    // month (checkout YYYY-MM). Booking weeks have no month → don't fake the label.
    let monthMatched = false
    if (month) {
      const f = points.filter((p) => monthOfPeriod(p.label) === month)
      if (f.length) { points = f; monthMatched = true }
    }
    if (!points.length) return null
    const metricName = isCount ? (ko ? '건수' : 'count') : label
    const last = points[points.length - 1]
    const head =
      month && monthMatched
        ? ko ? `${ent.name} · ${month}월 ${metricName}: ${fmtNum(last.value, withYen)}` : `${ent.name} · ${metricName} in month ${month}: ${fmtNum(last.value, withYen)}`
        : month && !monthMatched
          ? ko ? `${ent.name} · ${month}월 데이터가 없어 최근(${last.label}) ${metricName}: ${fmtNum(last.value, withYen)}` : `${ent.name} · no data for month ${month}; latest (${last.label}) ${metricName}: ${fmtNum(last.value, withYen)}`
          : ko ? `${ent.name} · ${metricName} (최근 ${last.label}): ${fmtNum(last.value, withYen)}` : `${ent.name} · ${metricName} (latest ${last.label}): ${fmtNum(last.value, withYen)}`
    const trend = points.length > 1 ? '\n' + points.map((p) => `${p.label}: ${fmtNum(p.value, withYen)}`).join('\n') : ''
    return {
      text: head + trend,
      chart: { kind: points.length > 1 ? 'line' : 'bar', title: `${ent.name} · ${metricName}`, unit, points },
    }
  }

  // ── ranking (Top N) ──
  const snap = snapshots.find((s) => s.profile === 'booking') ?? snapshots[0]
  if (!snap.groups.length) return null
  // pick the grouping dimension hinted by the question (호텔/판매처/공급사/국가), else primary
  const dimHint = /판매처|seller|채널|channel/i.test(text) ? findDim(snap, ['Seller']) : /공급사|vendor/i.test(text) ? findDim(snap, ['Vendor']) : /국가|country/i.test(text) ? findDim(snap, ['Country']) : undefined
  const dim = dimHint ?? snap.mapping.dimension
  const groups = groupsForDim(snap, dim)
  const n = pickN(text)
  const ranked = [...groups].sort((a, b) => valOf(b) - valOf(a)).slice(0, n)
  const metricName = isCount ? (ko ? '건수' : 'count') : label
  const profileName = snap.profile === 'booking' ? (ko ? '부킹' : 'Booking') : (ko ? '체크아웃' : 'Check Out')
  const header = ko ? `${snap.periodLabel} ${profileName} · ${dim} 기준 ${metricName} Top ${ranked.length}` : `${snap.periodLabel} ${profileName} · ${metricName} by ${dim} — Top ${ranked.length}`
  const lines = ranked.map((g, i) => `${i + 1}. ${g.key} — ${fmtNum(valOf(g), withYen)}`)
  return {
    text: `${header}\n${lines.join('\n')}`,
    chart: { kind: 'bar', title: header, unit, points: ranked.map((g) => ({ label: g.key, value: valOf(g) })) },
  }
}

function findDim(s: DatasetSnapshot, needles: string[]): string | undefined {
  const dims = s.byDimension ? Object.keys(s.byDimension) : []
  return dims.find((d) => needles.some((n) => d.toLowerCase().includes(n.toLowerCase())))
}

// String-only wrapper (back-compat).
export function answerDataQuery(text: string, snapshots: DatasetSnapshot[], lang: Lang): string | null {
  return answerDataQueryRich(text, snapshots, lang)?.text ?? null
}

// Compact dataset summary for grounding the LIVE model.
export function buildDatasetContext(snapshots: DatasetSnapshot[]): string {
  if (!snapshots.length) return ''
  const lines = snapshots.slice(0, 4).map((s) => {
    const totals = s.mapping.metrics.map((m) => `${m.label} ${Math.round(s.totals[m.label] ?? 0).toLocaleString()}`).join(', ')
    const dims = s.byDimension ? Object.keys(s.byDimension).join('/') : s.mapping.dimension
    const top = s.groups.slice(0, 5).map((g) => g.key).join(', ')
    return `- [${s.profile}] ${s.periodLabel} dims(${dims}): ${s.groups.length} groups, ${s.rowCount} rows. Totals: ${totals}. Top: ${top}`
  })
  return 'Imported RawData snapshots (amounts in JPY ¥ unless noted):\n' + lines.join('\n')
}
