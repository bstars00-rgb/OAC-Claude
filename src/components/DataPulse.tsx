import { useState } from 'react'
import { Card, CardHeader } from './Card'
import { Badge } from './Badge'
import { useT } from '../i18n'
import { useDatasets } from '../data/datasetStore'
import { useAiSettings } from '../utils/aiSettings'
import { generateInsight } from '../utils/insights'
import type { DatasetSnapshot, ImportProfile } from '../utils/dataImport'

const yen = (n: number) => '¥' + Math.round(n).toLocaleString()
const isYen = (label: string) => label.includes('¥')
const fmt = (n: number, label: string) => (isYen(label) ? yen(n) : Math.round(n).toLocaleString())

// B-5: a plain-language read of the latest period — biggest mover, top performer,
// and a nudge. Deterministic by default; upgradeable to an AI narrative on demand.
function deterministicComment(profile: ImportProfile, snaps: DatasetSnapshot[], lang: 'en' | 'ko'): string {
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const desc = [...snaps].sort((a, b) => b.periodLabel.localeCompare(a.periodLabel))
  const latest = desc[0]
  const prev = desc[1]
  const labels = latest.mapping.metrics.map((m) => m.label)
  const salesLabel = labels.find((l) => l.includes('판매액')) ?? labels[0] ?? ''
  const top = latest.groups[0]
  const cmpUnit = profile === 'booking' ? L('전주', 'last week') : L('전월', 'last month')

  // biggest-moving metric vs previous period
  let moverLabel = ''
  let moverDelta = 0
  for (const label of labels) {
    const cur = latest.totals[label] ?? 0
    const p = prev?.totals[label]
    if (!p) continue
    const d = ((cur - p) / p) * 100
    if (Math.abs(d) > Math.abs(moverDelta)) { moverDelta = d; moverLabel = label }
  }

  const parts: string[] = []
  if (moverLabel) {
    const dir = moverDelta >= 0 ? L('증가', 'up') : L('감소', 'down')
    parts.push(L(
      `${moverLabel}이 ${cmpUnit} 대비 ${Math.abs(moverDelta).toFixed(0)}% ${dir}한 것이 가장 큰 변화입니다.`,
      `The biggest shift: ${moverLabel} is ${dir} ${Math.abs(moverDelta).toFixed(0)}% vs ${cmpUnit}.`,
    ))
  } else {
    parts.push(L(`${latest.periodLabel} 기준 요약입니다.`, `Summary for ${latest.periodLabel}.`))
  }
  if (top) {
    parts.push(L(
      `${top.key}가 ${fmt(top.metrics[salesLabel] ?? 0, salesLabel)}로 선두입니다.`,
      `${top.key} leads at ${fmt(top.metrics[salesLabel] ?? 0, salesLabel)}.`,
    ))
  }
  if (moverLabel && moverDelta < -10) {
    parts.push(L('하락 폭이 큰 채널/호텔을 먼저 점검해 보세요.', 'Worth checking the steepest decliners first.'))
  } else if (moverLabel && moverDelta > 10) {
    parts.push(L('상승 모멘텀을 이어갈 액션을 우선순위로 두세요.', 'Prioritize actions that sustain the upward momentum.'))
  }
  return parts.join(' ')
}

function Pulse({ profile, snaps, lang }: { profile: ImportProfile; snaps: DatasetSnapshot[]; lang: 'en' | 'ko' }) {
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const desc = [...snaps].sort((a, b) => b.periodLabel.localeCompare(a.periodLabel)) // newest first
  const latest = desc[0]
  const prev = desc[1]
  const labels = latest.mapping.metrics.map((m) => m.label)
  const title = profile === 'booking' ? L('이번 주 부킹', 'This week · Booking') : L('이번 달 체크아웃', 'This month · Check Out')
  const cmp = profile === 'booking' ? L('전주比', 'vs last wk') : L('전월比', 'vs last mo')
  const top = latest.groups[0]

  return (
    <div className="rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</span>
        <Badge tone={profile === 'booking' ? 'violet' : 'sky'} dot>{latest.periodLabel}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {labels.map((label) => {
          const cur = latest.totals[label] ?? 0
          const p = prev?.totals[label]
          const delta = p && p !== 0 ? ((cur - p) / p) * 100 : undefined
          const up = (delta ?? 0) >= 0
          return (
            <div key={label} className="rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-white/5">
              <div className="text-[10px] text-slate-400">{label}</div>
              <div className="text-sm font-bold tracking-tight text-slate-800">{fmt(cur, label)}</div>
              {delta !== undefined && (
                <div className={`mt-0.5 text-[10px] font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>{up ? '▲' : '▼'} {Math.abs(delta).toFixed(0)}% {cmp}</div>
              )}
            </div>
          )
        })}
      </div>
      {top && (
        <div className="mt-2 text-[11px] text-slate-500">
          {L('톱', 'Top')} {latest.mapping.dimension}: <span className="font-semibold text-slate-700">{top.key}</span> ({fmt(top.metrics[labels[0]] ?? 0, labels[0])})
        </div>
      )}
      <PulseComment profile={profile} snaps={snaps} lang={lang} />
    </div>
  )
}

// B-5: the AI/auto comment line under each pulse.
function PulseComment({ profile, snaps, lang }: { profile: ImportProfile; snaps: DatasetSnapshot[]; lang: 'en' | 'ko' }) {
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const ai = useAiSettings()
  const [aiText, setAiText] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const base = deterministicComment(profile, snaps, lang)

  const askAi = async () => {
    if (busy || !ai.isLive) return
    setBusy(true)
    try {
      const r = await generateInsight({
        question: profile === 'booking' ? L('이번 주 부킹 핵심 인사이트', 'key insight for this week booking') : L('이번 달 체크아웃 핵심 인사이트', 'key insight for this month checkout'),
        snapshots: snaps,
        lang,
        live: { provider: ai.provider, apiKey: ai.activeKey, model: ai.model },
      })
      setAiText(r.text)
    } catch {
      setAiText(L('AI 코멘트 생성에 실패했습니다.', 'Could not generate an AI comment.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg bg-brand-50/50 px-2.5 py-2 dark:bg-brand-500/10">
      <span className="mt-0.5 shrink-0 text-brand-500"><SparkIcon /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{aiText || base}</p>
        {ai.isLive && !aiText && (
          <button onClick={askAi} disabled={busy} className="mt-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50">
            {busy ? L('AI 분석 중…', 'Analyzing…') : L('✨ AI 심층 코멘트', '✨ AI deep comment')}
          </button>
        )}
        {aiText && <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-brand-400">{L('AI 생성', 'AI generated')} · {ai.model.replace('claude-', '')}</span>}
      </div>
    </div>
  )
}

function SparkIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg>
}

/** Auto "this week/month" summary from imported RawData — shown without asking. */
export function DataPulse() {
  const { lang } = useT()
  const ds = useDatasets()
  if (!ds.snapshots.length) return null
  const booking = ds.byProfile('booking')
  const checkout = ds.byProfile('checkout')
  return (
    <Card className="mb-5">
      <CardHeader title={lang === 'ko' ? '데이터 펄스' : 'Data pulse'} subtitle={lang === 'ko' ? '가져온 RawData의 자동 요약' : 'Auto summary of your imported RawData'} icon={<PulseIcon />} />
      <div className="space-y-3">
        {booking.length > 0 && <Pulse profile="booking" snaps={booking} lang={lang} />}
        {checkout.length > 0 && <Pulse profile="checkout" snaps={checkout} lang={lang} />}
      </div>
    </Card>
  )
}

function PulseIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>
}
