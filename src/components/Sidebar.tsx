import { NavLink } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { useT } from '../i18n'

interface NavItem {
  to: string
  tKey: string
  icon: ReactNode
}

const I = (path: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
)

const navItems: NavItem[] = [
  { to: '/', tKey: 'nav.dashboard', icon: I(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>) },
  { to: '/assistant', tKey: 'nav.assistant', icon: I(<><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></>) },
  { to: '/relationship', tKey: 'nav.relationship', icon: I(<><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>) },
  { to: '/data', tKey: 'nav.data', icon: I(<><path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 4-6" /></>) },
  { to: '/central', tKey: 'nav.central', icon: I(<><circle cx="12" cy="7" r="3" /><circle cx="5" cy="17" r="2.5" /><circle cx="19" cy="17" r="2.5" /><path d="M12 10v3M9.5 15l-2 1M14.5 15l2 1" /></>) },
  { to: '/settings', tKey: 'nav.settings', icon: I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.74.66 1.65 1.65 0 0 0-1.51 1H12a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 2.6 14a1.65 1.65 0 0 0-1-1.51V12a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 7" /></>) },
]

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void } = {}) {
  const { t } = useT()
  // D-11: below lg the sidebar is a fixed drawer; at/above lg it's a static
  // column. matchMedia drives the transform so it never depends on JIT classes.
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const drawerStyle = isDesktop ? undefined : { left: open ? '0px' : '-15rem', transition: 'left 0.2s ease' }
  return (
    <>
      {/* D-11: backdrop when the drawer is open on mobile */}
      {open && !isDesktop && <div onClick={onClose} className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm" />}
      <aside
        style={drawerStyle}
        className="fixed inset-y-0 z-40 flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:static dark:border-white/10 dark:bg-[#0b1220]"
      >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-black text-white shadow-sm">
          OAC
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Ohmyhotel</div>
          <div className="text-[11px] font-medium text-slate-500">AI CRM</div>
        </div>
        <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-600 lg:hidden" aria-label="Close menu">✕</button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            {t(item.tKey)}
          </NavLink>
        ))}
      </nav>

      {/* Footer card */}
      <div className="px-3 pb-4">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 to-violet-50 p-3 dark:bg-none dark:bg-brand-500/10">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-600 text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-700">OAC</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
            {t('top.tagline')}
          </p>
        </div>
      </div>
      </aside>
    </>
  )
}
