import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { DatasetInsights } from '../components/DatasetInsights'
import { useT } from '../i18n'
import { useDatasets } from '../data/datasetStore'
import type { DatasetSnapshot } from '../utils/dataImport'

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

      {/* trends + Top N (real, from imported snapshots) */}
      <DatasetInsights />

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
