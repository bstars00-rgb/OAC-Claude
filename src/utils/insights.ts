// Generate an interpreted INSIGHT (narrative + chart) from the imported RawData.
// Live mode → an AI-written analysis grounded on the data; Demo mode → a
// deterministic summary computed from the numbers. Used by the Data Insight page.

import { answerDataQueryRich, buildDatasetContext, type ChartData } from './datasetQuery'
import { callText } from './aiClient'
import type { DatasetSnapshot } from './dataImport'
import type { Lang } from '../i18n'

export interface Insight {
  id: string
  ts: string // ISO date (caller-stamped)
  question: string
  text: string
  chart?: ChartData
}

const yen = (n: number) => '¥' + Math.round(n).toLocaleString()

function deterministicSummary(snapshots: DatasetSnapshot[], lang: Lang): string {
  const ko = lang === 'ko'
  const s = snapshots.find((x) => x.profile === 'booking') ?? snapshots[0]
  const labels = s.mapping.metrics.map((m) => m.label)
  const salesLabel = labels.find((l) => l.includes('판매액')) ?? labels[0] ?? ''
  const revLabel = labels.find((l) => l.includes('수익'))
  const top = [...s.groups].sort((a, b) => (b.metrics[salesLabel] ?? 0) - (a.metrics[salesLabel] ?? 0))[0]
  const asc = snapshots.filter((x) => x.profile === s.profile).sort((a, b) => a.periodLabel.localeCompare(b.periodLabel))
  const cur = asc[asc.length - 1]
  const prev = asc.length > 1 ? asc[asc.length - 2] : undefined
  const wow = prev && (prev.totals[salesLabel] ?? 0) !== 0 ? (((cur.totals[salesLabel] ?? 0) - (prev.totals[salesLabel] ?? 0)) / (prev.totals[salesLabel] ?? 1)) * 100 : undefined
  const parts: string[] = []
  if (ko) {
    parts.push(`${s.periodLabel} 기준 ${salesLabel} 합계 ${yen(s.totals[salesLabel] ?? 0)}${revLabel ? `, ${revLabel} ${yen(s.totals[revLabel] ?? 0)}` : ''}.`)
    if (top) parts.push(`최상위 ${s.mapping.dimension}는 ${top.key}(${yen(top.metrics[salesLabel] ?? 0)}).`)
    if (wow !== undefined) parts.push(`전기比 ${wow >= 0 ? '+' : ''}${wow.toFixed(0)}%.`)
    parts.push(`전체 ${s.groups.length}개 · ${s.rowCount.toLocaleString()}행.`)
  } else {
    parts.push(`${s.periodLabel}: total ${salesLabel} ${yen(s.totals[salesLabel] ?? 0)}.`)
    if (top) parts.push(`Top ${s.mapping.dimension}: ${top.key} (${yen(top.metrics[salesLabel] ?? 0)}).`)
    if (wow !== undefined) parts.push(`${wow >= 0 ? '+' : ''}${wow.toFixed(0)}% vs prev.`)
  }
  return parts.join(' ')
}

export async function generateInsight(opts: {
  question: string
  snapshots: DatasetSnapshot[]
  lang: Lang
  live?: { provider: 'anthropic' | 'openai'; apiKey: string; model: string }
}): Promise<{ text: string; chart?: ChartData }> {
  const data = answerDataQueryRich(opts.question, opts.snapshots, opts.lang)
  const ko = opts.lang === 'ko'

  if (opts.live) {
    const system = ko
      ? '당신은 오마이호텔 B2B 데이터 분석가입니다. 주어진 데이터 요약으로 핵심 인사이트를 3~4문장으로 작성하세요: 무엇이 두드러지는지, 추세/변화, 그리고 실행 제안 1개. 반드시 구체적 숫자(¥, 건수, 호텔/채널명)를 인용하고, 데이터에 없는 건 추측하지 마세요. 한국어로.'
      : 'You are an Ohmyhotel B2B data analyst. From the data summary, write a sharp 3-4 sentence insight: what stands out, the trend/change, and one actionable recommendation. Cite concrete numbers (¥, counts, hotel/channel names); never invent data not present.'
    const user = `${buildDatasetContext(opts.snapshots)}\n\nQuestion: ${opts.question}\n${data ? `Computed figures:\n${data.text}` : ''}`
    const text = await callText({ provider: opts.live.provider, apiKey: opts.live.apiKey, model: opts.live.model, system, user })
    return { text: text || (data?.text ?? deterministicSummary(opts.snapshots, opts.lang)), chart: data?.chart }
  }

  // demo: deterministic
  if (data) return { text: data.text, chart: data.chart }
  return { text: deterministicSummary(opts.snapshots, opts.lang) }
}
