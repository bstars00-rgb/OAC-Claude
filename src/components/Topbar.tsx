import { SearchBar } from './SearchBar'

interface Connection {
  label: string
  tone: string
}

// Demo connection badges — make the app feel fully integrated.
const connections: Connection[] = [
  { label: 'Outlook', tone: 'bg-sky-500' },
  { label: 'Teams', tone: 'bg-violet-500' },
  { label: 'Excel', tone: 'bg-emerald-500' },
  { label: 'Internal DB', tone: 'bg-slate-500' },
  { label: 'Meeting Recorder', tone: 'bg-brand-500' },
]

export function Topbar() {
  return (
    <header className="z-10 flex items-center gap-4 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur">
      <SearchBar />

      <div className="ml-auto flex items-center gap-3">
        {/* Connection badges */}
        <div className="hidden items-center gap-1.5 xl:flex">
          {connections.map((c) => (
            <span
              key={c.label}
              title={`${c.label} Connected Demo`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.tone}`} />
              {c.label}
            </span>
          ))}
        </div>

        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 lg:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          All Connected · Demo
        </span>

        {/* User */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-xs font-bold text-white">
            JP
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-xs font-semibold text-slate-800">Jihoon Park</div>
            <div className="text-[10px] text-slate-400">Sales Lead</div>
          </div>
        </div>
      </div>
    </header>
  )
}
