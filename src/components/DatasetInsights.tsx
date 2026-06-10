import { Card, CardHeader } from './Card'
import { Badge } from './Badge'
import { Sparkline } from './DemoChart'
import { useT } from '../i18n'
import { useDatasets } from '../data/datasetStore'
import type { DatasetSnapshot, ImportProfile } from '../utils/dataImport'

const fmt = (n: number, yen: boolean) => (yen ? '¥' : '') + Math.round(n).toLocaleString()
const isYen = (label: string) => label.includes('¥')

function ProfileTrends({ profile, snaps, lang }: { profile: ImportProfile; snaps: DatasetSnapshot[]; lang: 'en' | 'ko' }) {
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  // chronological for trend lines
  const asc = [...snaps].sort((a, b) => a.periodLabel.localeCompare(b.periodLabel))
  const latest = asc[asc.length - 1]
  const labels = latest.mapping.metrics.map((m) => m.label)
  const title = profile === 'booking' ? L('부킹 추세 (주간)', 'Booking trend (weekly)') : L('체크아웃 추세 (월간)', 'Check Out trend (monthly)')

  // top groups in the latest snapshot by the first metric
  const primary = labels[0]
  const topGroups = primary ? [...latest.groups].sort((a, b) => (b.metrics[primary] ?? 0) - (a.metrics[primary] ?? 0)).slice(0, 6) : []
  const topMax = topGroups.length ? Math.max(...topGroups.map((g) => g.metrics[primary] ?? 0), 1) : 1

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader title={title} subtitle={`${L('기간', 'periods')}: ${asc.map((s) => s.periodLabel).join(' → ')}`} icon={<TrendIcon />} />
        <Badge tone={profile === 'booking' ? 'violet' : 'sky'} dot>{latest.periodLabel}</Badge>
      </div>

      {/* metric trend rows */}
      <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {labels.map((label) => {
          const series = asc.map((s) => s.totals[label] ?? 0)
          const cur = series[series.length - 1] ?? 0
          const prev = series.length > 1 ? series[series.length - 2] : undefined
          const delta = prev && prev !== 0 ? ((cur - prev) / prev) * 100 : undefined
          const up = (delta ?? 0) >= 0
          return (
            <div key={label} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] text-slate-400">{label}</div>
                  <div className="text-base font-bold tracking-tight text-slate-800">{fmt(cur, isYen(label))}</div>
                </div>
                {delta !== undefined && (
                  <span className={`mt-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {up ? '▲' : '▼'} {Math.abs(delta).toFixed(0)}% {L('전기比', 'vs prev')}
                  </span>
                )}
              </div>
              <div className="mt-1.5">
                {series.length > 1 ? <Sparkline data={series} width={240} height={32} tone={profile === 'booking' ? '#7c3aed' : '#0ea5e9'} /> : <div className="text-[10px] text-slate-400">{L('스냅샷이 2개 이상이면 추세선이 표시됩니다', 'Trend appears once you have 2+ snapshots')}</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* top groups */}
      {topGroups.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[11px] font-semibold text-slate-500">{L(`${latest.mapping.dimension} Top ${topGroups.length} · ${primary}`, `Top ${topGroups.length} ${latest.mapping.dimension} · ${primary}`)}</div>
          <div className="space-y-1.5">
            {topGroups.map((g) => {
              const v = g.metrics[primary] ?? 0
              return (
                <div key={g.key} className="flex items-center gap-2">
                  <span className="w-32 shrink-0 truncate text-[11px] font-medium text-slate-600" title={g.key}>{g.key}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-violet-600" style={{ width: `${Math.max(2, (v / topMax) * 100)}%` }} />
                  </div>
                  <span className="w-24 shrink-0 text-right text-[11px] font-semibold text-slate-700">{fmt(v, isYen(primary))}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}

export function DatasetInsights() {
  const { lang } = useT()
  const ds = useDatasets()
  if (!ds.snapshots.length) return null

  const booking = ds.byProfile('booking')
  const checkout = ds.byProfile('checkout')

  return (
    <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
      {booking.length > 0 && <ProfileTrends profile="booking" snaps={booking} lang={lang} />}
      {checkout.length > 0 && <ProfileTrends profile="checkout" snaps={checkout} lang={lang} />}
    </div>
  )
}

function TrendIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8M21 7v6M21 7h-6" /></svg>
}
