import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandPalette } from './CommandPalette'

export function Layout({ children }: { children: ReactNode }) {
  // D-11: the nav collapses into a drawer on mobile (toggled from the Topbar).
  const [navOpen, setNavOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fb] dark:bg-[#0b1220]">
      <CommandPalette />
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1760px] px-4 py-5 sm:px-6 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

// Reusable page header used across all pages.
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
