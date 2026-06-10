// Answer natural-language questions about imported RawData snapshots
// (e.g. "이번 주 수익 Top5 호텔"). Pure + deterministic so it can power the demo
// assistant AND ground the live (Claude/GPT) answers, and be unit-tested.

import type { DatasetSnapshot } from './dataImport'
import type { Lang } from '../i18n'

const fmtNum = (n: number, withYen: boolean) => {
  const s = Math.round(n).toLocaleString()
  return withYen ? `¥${s}` : s
}

export function looksLikeDataQuery(text: string): boolean {
  return (
    /(top\s*\d|상위|순위|랭킹|랭크|best|가장|많은|높은|적은|낮은)/i.test(text) ||
    /(판매액|매출|매입|수익|마진|룸나잇|room\s?night|예약\s?건|건수|booking\s?count)/i.test(text)
  )
}

function pickN(text: string): number {
  const m = text.match(/(?:top|상위|top\s*)\s*(\d{1,3})|(\d{1,3})\s*(?:개|곳|건)/i)
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

export function answerDataQuery(text: string, snapshots: DatasetSnapshot[], lang: Lang): string | null {
  if (!snapshots.length) return null
  const ko = lang === 'ko'
  // prefer the latest booking snapshot, else the most recent of any
  const snap = snapshots.find((s) => s.profile === 'booking') ?? snapshots[0]
  if (!snap.groups.length) return null

  const labels = snap.mapping.metrics.map((m) => m.label)
  const { label, isCount } = pickMetric(text, labels)
  const withYen = label.includes('¥')
  const valueOf = (g: DatasetSnapshot['groups'][number]) => (isCount ? g.rows : g.metrics[label] ?? 0)
  const n = pickN(text)

  const ranked = [...snap.groups].sort((a, b) => valueOf(b) - valueOf(a)).slice(0, n)
  const metricName = isCount ? (ko ? '건수' : 'count') : label
  const profileName = snap.profile === 'booking' ? (ko ? '부킹' : 'Booking') : (ko ? '체크아웃' : 'Check Out')

  const header = ko
    ? `${snap.periodLabel} ${profileName} 데이터 · ${snap.mapping.dimension} 기준 ${metricName} Top ${ranked.length}`
    : `${snap.periodLabel} ${profileName} · ${metricName} by ${snap.mapping.dimension} — Top ${ranked.length}`
  const lines = ranked.map((g, i) => `${i + 1}. ${g.key} — ${fmtNum(valueOf(g), withYen)}`)

  // a compact total line
  const total = snap.groups.reduce((s, g) => s + valueOf(g), 0)
  const totalLine = ko
    ? `\n전체 ${snap.mapping.dimension} ${snap.groups.length}곳 합계: ${fmtNum(total, withYen)} (${snap.rowCount.toLocaleString()}행)`
    : `\nTotal across ${snap.groups.length} ${snap.mapping.dimension}: ${fmtNum(total, withYen)} (${snap.rowCount.toLocaleString()} rows)`

  return `${header}\n${lines.join('\n')}${totalLine}`
}

// Compact dataset summary for grounding the LIVE model.
export function buildDatasetContext(snapshots: DatasetSnapshot[]): string {
  if (!snapshots.length) return ''
  const lines = snapshots.slice(0, 4).map((s) => {
    const totals = s.mapping.metrics.map((m) => `${m.label} ${Math.round(s.totals[m.label] ?? 0).toLocaleString()}`).join(', ')
    const top = s.groups.slice(0, 5).map((g) => g.key).join(', ')
    return `- [${s.profile}] ${s.periodLabel} by ${s.mapping.dimension}: ${s.groups.length} groups, ${s.rowCount} rows. Totals: ${totals}. Top: ${top}`
  })
  return 'Imported RawData snapshots (amounts in JPY ¥ unless noted):\n' + lines.join('\n')
}
