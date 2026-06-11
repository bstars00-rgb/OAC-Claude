import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { DatasetInsights } from '../components/DatasetInsights'
import { PieChart, BarChart } from '../components/DemoChart'
import { useT } from '../i18n'
import { useDatasets } from '../data/datasetStore'
import { useAiSettings } from '../utils/aiSettings'
import { generateInsight, type Insight } from '../utils/insights'
import type { ChartData } from '../utils/datasetQuery'
import { TODAY } from '../utils/format'
import type { DatasetSnapshot } from '../utils/dataImport'

const INSIGHTS_KEY = 'oac-insights-v1'
let insightSeq = 0

const isYen = (label: string) => label.includes('¥')
const fmt = (n: number, yen: boolean) => (yen ? '¥' : '') + Math.round(n).toLocaleString()

// Real-data-only RawData view. Demo sample data has been removed; this reads the
// imported Ohmyhotel RawData snapshots (later to be synced from the MCP database).
export function DataInsight() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const ds = useDatasets()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)

  if (!ds.snapshots.length) {
    return (
      <div className="oac-fade-in">
        <PageHeader title={t('page.data.title')} subtitle={t('page.data.subtitle')} />
        <Card className="flex flex-col items-center py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white"><DbIcon /></span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">{L('아직 RawData가 없습니다', 'No RawData yet')}</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">{L('설정 → 데이터 가져오기에서 주간 RawData(.xlsx)를 가져오면 추세·지표가 여기에 표시됩니다.', 'Import your weekly RawData (.xlsx) in Settings → Import data to see trends & metrics here.')}</p>
          <Button className="mt-4" onClick={() => navigate('/settings')}>{L('설정에서 가져오기', 'Import in Settings')} →</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="oac-fade-in">
      <PageHeader title={t('page.data.title')} subtitle={t('page.data.subtitle')} />

      {/* AI insight board — ask, and the interpreted insight shows here */}
      <AiInsightBoard L={L} />

      {/* trends + Top N (real, from imported snapshots) */}
      <DatasetInsights />

      {/* dimension explorer — break down by hotel / seller / channel / country */}
      <DimensionExplorer L={L} />

      {/* all snapshots */}
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-700">{L('가져온 RawData', 'Imported RawData')}</span>
        <Badge tone="slate">{ds.snapshots.length}</Badge>
      </div>
      <div className="space-y-3">
        {ds.snapshots.map((s) => <SnapshotCard key={s.id} s={s} L={L} />)}
      </div>

      {/* assistant CTA */}
      <Card className="mt-5 bg-gradient-to-br from-brand-600 to-violet-600 text-white">
        <div className="text-xs font-bold uppercase tracking-wide opacity-90">OAC {L('어시스턴트', 'Assistant')}</div>
        <p className="mt-1.5 text-sm leading-relaxed opacity-95">{L('이 데이터로 바로 물어보세요 — "이번 주 수익 Top5 호텔", "전주比 룸나잇 늘어난 곳".', 'Ask this data directly — "Top 5 hotels by revenue this week", "rooms-nights up vs last week".')}</p>
        <Button variant="secondary" size="sm" className="mt-3 !bg-white !text-brand-700" onClick={() => navigate('/assistant')}>{L('어시스턴트 열기', 'Open assistant')} →</Button>
      </Card>
    </div>
  )
}

function loadInsights(): Insight[] {
  try {
    const raw = localStorage.getItem(INSIGHTS_KEY)
    if (raw) return JSON.parse(raw) as Insight[]
  } catch {
    /* ignore */
  }
  return []
}

function MiniChart({ chart }: { chart: ChartData }) {
  const fmt = (n: number) => (chart.unit === 'yen' ? '¥' : '') + Math.round(n).toLocaleString()
  const max = Math.max(...chart.points.map((p) => p.value), 1)
  return (
    // Cap the width so the bars stay compact instead of stretching across the
    // full (now wide) card. Bar track is fixed-width, not flex-1.
    <div className="mt-2 max-w-lg space-y-1">
      {chart.points.map((p) => (
        <div key={p.label} className="flex items-center gap-2">
          <span className="w-40 shrink-0 truncate text-[11px] font-medium text-slate-600 dark:text-slate-300" title={p.label}>{p.label}</span>
          <div className="h-2 w-32 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 sm:w-40">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-violet-600" style={{ width: `${Math.max(2, (p.value / max) * 100)}%` }} />
          </div>
          <span className="shrink-0 text-right text-[11px] font-semibold text-slate-700 dark:text-slate-200">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function AiInsightBoard({ L }: { L: (ko: string, en: string) => string }) {
  const { lang } = useT()
  const ds = useDatasets()
  const ai = useAiSettings()
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [insights, setInsights] = useState<Insight[]>(loadInsights)

  useEffect(() => {
    try { localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights.slice(0, 30))) } catch { /* ignore */ }
  }, [insights])

  const suggestions = [
    L('이번 주 핵심 요약', 'This week — key summary'),
    L('수익 Top5 호텔', 'Top 5 hotels by revenue'),
    L('판매처 판매액 Top10', 'Top 10 sellers by sales'),
    L('아고다 추세', 'Agoda trend'),
  ]

  const run = async (question: string) => {
    const ques = question.trim()
    if (!ques) return
    setBusy(true); setError('')
    try {
      const r = await generateInsight({
        question: ques,
        snapshots: ds.snapshots,
        lang,
        live: ai.isLive ? { provider: ai.provider, apiKey: ai.activeKey, model: ai.model } : undefined,
      })
      setInsights((prev) => [{ id: `in-${TODAY}-${insightSeq++}`, ts: TODAY, question: ques, text: r.text, chart: r.chart }, ...prev])
      setQ('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="mb-5">
      <CardHeader title={L('AI 인사이트', 'AI Insight')} subtitle={ai.isLive ? L('질문하면 AI가 데이터를 해석해 인사이트를 보여줍니다', 'Ask, and AI interprets your data into an insight') : L('데모: 데이터에서 핵심 수치를 계산해 보여줍니다 (실제 AI는 설정에서 키 입력)', 'Demo: computes key figures (add a key in Settings for real AI)')} icon={<SparkIcon />} />
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') run(q) }}
          placeholder={L('무엇이 궁금하세요? 예: 이번 주 수익, 아고다 4월 매출, 취소율 높은 호텔', 'What do you want to know? e.g. revenue this week, Agoda April sales')}
          className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <Button size="sm" onClick={() => run(q)} disabled={busy || !ds.snapshots.length}>{busy ? L('분석 중…', 'Analyzing…') : L('인사이트 생성', 'Generate')}</Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button key={s} onClick={() => run(s)} disabled={busy || !ds.snapshots.length} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 transition hover:border-brand-300 hover:text-brand-700">{s}</button>
        ))}
      </div>
      {!ds.snapshots.length && <p className="mt-2 text-[11px] text-amber-600">{L('먼저 설정 → 로우데이터에서 데이터를 가져오세요.', 'Import RawData in Settings first.')}</p>}
      {error && <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">{error}</div>}

      {insights.length > 0 && (
        <div className="mt-3 space-y-3">
          {insights.map((it) => (
            <div key={it.id} className="rounded-xl border border-brand-100 bg-brand-50/40 p-3 dark:bg-brand-500/10">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-brand-700">{it.question}</span>
                <button onClick={() => setInsights((prev) => prev.filter((x) => x.id !== it.id))} className="shrink-0 text-[11px] text-slate-400 hover:text-rose-500">{L('삭제', 'Delete')}</button>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">{it.text}</p>
              {it.chart && <MiniChart chart={it.chart} />}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function SparkIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg> }

type ChartView = 'bar' | 'donut' | 'column'

function DimensionExplorer({ L }: { L: (ko: string, en: string) => string }) {
  const ds = useDatasets()
  const snap = ds.snapshots[0]
  const dims = snap?.byDimension ? Object.keys(snap.byDimension) : snap ? [snap.mapping.dimension] : []
  const metrics = snap?.mapping.metrics ?? []
  const [dim, setDim] = useState(dims[0] ?? '')
  const [metricLabel, setMetricLabel] = useState(metrics[0]?.label ?? '')
  const [view, setView] = useState<ChartView>('bar')
  if (!snap || !dims.length) return null

  const activeDim = dims.includes(dim) ? dim : dims[0]
  const activeMetric = metrics.find((m) => m.label === metricLabel)?.label ?? metrics[0]?.label ?? ''
  const yen = activeMetric.includes('¥')
  const groups = (snap.byDimension?.[activeDim] ?? snap.groups)
  const sorted = [...groups].sort((a, b) => (b.metrics[activeMetric] ?? 0) - (a.metrics[activeMetric] ?? 0))
  const top = sorted.slice(0, 10)
  const max = Math.max(...top.map((g) => g.metrics[activeMetric] ?? 0), 1)
  const total = groups.reduce((s, g) => s + (g.metrics[activeMetric] ?? 0), 0)
  const fmt = (n: number) => (yen ? '¥' : '') + Math.round(n).toLocaleString()

  // composition: top 6 + an "others" bucket so the donut stays readable
  const topN = sorted.slice(0, 6)
  const othersVal = sorted.slice(6).reduce((s, g) => s + (g.metrics[activeMetric] ?? 0), 0)
  const pieData = [
    ...topN.map((g) => ({ label: g.key, value: g.metrics[activeMetric] ?? 0 })),
    ...(othersVal > 0 ? [{ label: L('기타', 'Others'), value: othersVal }] : []),
  ]
  const columnData = top.slice(0, 8).map((g) => ({ label: g.key, value: g.metrics[activeMetric] ?? 0 }))

  const views: { id: ChartView; ko: string; en: string }[] = [
    { id: 'bar', ko: '막대', en: 'Bars' },
    { id: 'column', ko: '세로막대', en: 'Columns' },
    { id: 'donut', ko: '도넛', en: 'Donut' },
  ]

  return (
    <Card className="mb-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <CardHeader title={L('차원별 분석', 'Breakdown')} subtitle={`${snap.periodLabel} · ${snap.profile === 'booking' ? 'Booking' : 'Check Out'}`} />
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 text-[11px] font-semibold dark:border-white/10">
            {views.map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} className={`px-2.5 py-1.5 transition ${view === v.id ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-transparent dark:text-slate-400'}`}>{L(v.ko, v.en)}</button>
            ))}
          </div>
          <select value={activeDim} onChange={(e) => setDim(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-brand-400 focus:outline-none dark:border-white/10 dark:bg-transparent">
            {dims.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={activeMetric} onChange={(e) => setMetricLabel(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-brand-400 focus:outline-none dark:border-white/10 dark:bg-transparent">
            {metrics.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
          </select>
        </div>
      </div>
      <div className="mb-3 text-xs text-slate-500">{L('합계', 'Total')}: <span className="font-bold text-slate-800 dark:text-slate-200">{fmt(total)}</span> · {groups.length} {activeDim}</div>

      {view === 'donut' && <PieChart data={pieData} unit={yen ? 'yen' : ''} />}

      {view === 'column' && <BarChart data={columnData} height={180} tone={snap.profile === 'booking' ? '#7c3aed' : '#0ea5e9'} unit={yen ? 'yen' : ''} />}

      {view === 'bar' && (
        <div className="space-y-1.5">
          {top.map((g) => {
            const v = g.metrics[activeMetric] ?? 0
            const pct = total ? (v / total) * 100 : 0
            return (
              <div key={g.key} className="flex items-center gap-2">
                <span className="w-32 shrink-0 truncate text-[11px] font-medium text-slate-600 dark:text-slate-300" title={g.key}>{g.key}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-violet-600" style={{ width: `${Math.max(2, (v / max) * 100)}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right text-[10px] text-slate-400">{pct.toFixed(0)}%</span>
                <span className="w-24 shrink-0 text-right text-[11px] font-semibold text-slate-700 dark:text-slate-200">{fmt(v)}</span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function SnapshotCard({ s, L }: { s: DatasetSnapshot; L: (ko: string, en: string) => string }) {
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={s.profile === 'checkout' ? 'sky' : 'violet'} dot>{s.profile === 'checkout' ? 'Check Out' : 'Booking'}</Badge>
        <span className="text-sm font-semibold text-slate-800">{s.periodLabel}</span>
        <span className="text-[11px] text-slate-400">{s.groups.length} {s.mapping.dimension} · {s.rowCount.toLocaleString()} {L('행', 'rows')}</span>
        <button onClick={() => setOpen((v) => !v)} className="ml-auto text-[11px] font-medium text-brand-600 hover:text-brand-700">{open ? L('접기', 'Hide') : L('상세', 'Details')}</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {s.mapping.metrics.map((m) => (
          <span key={m.label} className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] dark:bg-white/5">
            <span className="text-slate-400">{m.label}</span> <span className="font-semibold text-slate-700">{fmt(s.totals[m.label] ?? 0, isYen(m.label))}</span>
          </span>
        ))}
      </div>
      {open && (
        <div className="mt-2.5 overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-slate-400">
                <th className="py-1 pr-3 font-medium">{s.mapping.dimension}</th>
                {s.mapping.metrics.map((m) => <th key={m.label} className="py-1 pr-3 text-right font-medium">{m.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {s.groups.slice(0, 12).map((g) => (
                <tr key={g.key} className="border-t border-slate-100 dark:border-white/5">
                  <td className="py-1 pr-3 font-medium text-slate-700">{g.key}</td>
                  {s.mapping.metrics.map((m) => <td key={m.label} className="py-1 pr-3 text-right text-slate-600">{fmt(g.metrics[m.label] ?? 0, isYen(m.label))}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {s.groups.length > 12 && <div className="mt-1 text-[10px] text-slate-400">+{s.groups.length - 12} {L('개 더', 'more')}</div>}
        </div>
      )}
    </Card>
  )
}

function DbIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg> }
