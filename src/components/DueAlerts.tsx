import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './Card'
import { Badge } from './Badge'
import { useT } from '../i18n'
import { useCaptureStore } from '../data/captureStore'
import { formatDate } from '../utils/format'

// A-2: Due / overdue task alerts. Surfaces open to-dos whose due date is in the
// past or within the next few days, sorted by urgency, so nothing slips.
const SOON_DAYS = 3

export function DueAlerts() {
  const navigate = useNavigate()
  const { lang } = useT()
  const store = useCaptureStore()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)

  const alerts = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const out: { id: string; text: string; accountName: string; accountId: string; due: string; days: number; status: 'overdue' | 'today' | 'soon' }[] = []
    for (const e of store.entries) {
      for (const td of e.todos) {
        if (td.done || !td.due) continue
        const d = new Date(td.due)
        if (isNaN(d.getTime())) continue
        d.setHours(0, 0, 0, 0)
        const days = Math.round((d.getTime() - today.getTime()) / 86_400_000)
        if (days > SOON_DAYS) continue
        out.push({ id: td.id, text: td.text, accountName: e.accountName, accountId: e.accountId, due: td.due, days, status: days < 0 ? 'overdue' : days === 0 ? 'today' : 'soon' })
      }
    }
    return out.sort((a, b) => a.days - b.days)
  }, [store.entries])

  if (alerts.length === 0) return null

  const overdue = alerts.filter((a) => a.status === 'overdue').length
  const dueToday = alerts.filter((a) => a.status === 'today').length
  const soon = alerts.filter((a) => a.status === 'soon').length

  const label = (a: (typeof alerts)[number]) =>
    a.status === 'overdue'
      ? L(`${-a.days}일 지남`, `${-a.days}d overdue`)
      : a.status === 'today'
        ? L('오늘 마감', 'due today')
        : L(`${a.days}일 남음`, `in ${a.days}d`)

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-white dark:bg-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600"><BellIcon /></span>
          <div>
            <p className="text-sm font-bold text-slate-800">{L('마감·연체 알림', 'Due & overdue')}</p>
            <p className="text-[11px] text-slate-500">
              {overdue > 0 && <span className="font-semibold text-rose-600">{overdue} {L('연체', 'overdue')}</span>}
              {overdue > 0 && (dueToday + soon > 0) && ' · '}
              {dueToday > 0 && <span className="text-amber-600">{dueToday} {L('오늘', 'today')}</span>}
              {dueToday > 0 && soon > 0 && ' · '}
              {soon > 0 && <span className="text-slate-500">{soon} {L('곧', 'soon')}</span>}
            </p>
          </div>
        </div>
      </div>
      <ul className="mt-3 divide-y divide-amber-100/70 dark:divide-white/5">
        {alerts.slice(0, 6).map((a) => (
          <li key={a.id} className="flex items-center gap-2 py-2">
            <Badge tone={a.status === 'overdue' ? 'red' : a.status === 'today' ? 'amber' : 'slate'}>{label(a)}</Badge>
            <button onClick={() => navigate(`/relationship/${a.accountId}`)} className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium text-slate-700 hover:text-brand-700">{a.text}</span>
              <span className="block truncate text-[11px] text-slate-400">{a.accountName} · {L('마감', 'due')} {formatDate(a.due)}</span>
            </button>
          </li>
        ))}
      </ul>
      {alerts.length > 6 && <p className="mt-1 text-[11px] text-slate-400">+{alerts.length - 6} {L('건 더', 'more')}</p>}
    </Card>
  )
}

function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
}
