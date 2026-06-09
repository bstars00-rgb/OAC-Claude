import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const I = (path: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
)

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: I(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>) },
  { to: '/ask', label: 'Ask OAC', icon: I(<><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></>) },
  { to: '/relationship', label: 'Relationship 360', icon: I(<><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>) },
  { to: '/meeting', label: 'Meeting Recorder', icon: I(<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></>) },
  { to: '/email', label: 'Email Assistant', icon: I(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>) },
  { to: '/report', label: 'Report Generator', icon: I(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>) },
  { to: '/data', label: 'Data Insight', icon: I(<><path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 4-6" /></>) },
  { to: '/integrations', label: 'Integrations', icon: I(<><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>) },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-black text-white shadow-sm">
          OAC
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-slate-900">Ohmyhotel</div>
          <div className="text-[11px] font-medium text-slate-400">AI CRM</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer card */}
      <div className="px-3 pb-4">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 to-violet-50 p-3">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-600 text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-700">AI Engine Demo</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
            검색만 하세요. 분류와 정리는 OAC가 합니다.
          </p>
        </div>
      </div>
    </aside>
  )
}
