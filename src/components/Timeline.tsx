import type { DataSource } from '../data/entities'
import { formatDate, daysAgo } from '../utils/format'

export interface TimelineEntry {
  date: string
  source: DataSource | string
  title: string
  detail?: string
}

const sourceTone: Record<string, string> = {
  Outlook: 'bg-sky-500',
  Teams: 'bg-violet-500',
  Excel: 'bg-emerald-500',
  'Internal DB': 'bg-slate-500',
  'Meeting Recorder': 'bg-brand-500',
  'Contract Notes': 'bg-amber-500',
  'OAC Assistant': 'bg-violet-500',
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative ml-1.5 border-l border-slate-200">
      {entries.map((e, i) => (
        <li key={i} className="ml-5 pb-5 last:pb-0">
          <span
            className={`absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
              sourceTone[e.source] ?? 'bg-slate-400'
            }`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{e.title}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              {e.source}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {formatDate(e.date)} · {daysAgo(e.date)}
          </div>
          {e.detail && <p className="mt-1 text-sm leading-relaxed text-slate-600">{e.detail}</p>}
        </li>
      ))}
    </ol>
  )
}
