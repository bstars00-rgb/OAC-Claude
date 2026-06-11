import { Card, CardHeader } from './Card'
import { Badge } from './Badge'
import { useT } from '../i18n'
import { useDatasets } from '../data/datasetStore'
import type { DatasetSnapshot, ImportProfile } from '../utils/dataImport'

const yen = (n: number) => '¥' + Math.round(n).toLocaleString()
const isYen = (label: string) => label.includes('¥')
const fmt = (n: number, label: string) => (isYen(label) ? yen(n) : Math.round(n).toLocaleString())

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
    </div>
  )
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
