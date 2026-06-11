import type { ReactNode } from 'react'

export function MetricCard({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  icon,
  hint,
}: {
  label: string
  value: ReactNode
  delta?: string
  deltaTone?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  hint?: string
}) {
  const deltaClass =
    deltaTone === 'up'
      ? 'text-emerald-600 bg-emerald-50'
      : deltaTone === 'down'
        ? 'text-rose-600 bg-rose-50'
        : 'text-slate-500 bg-slate-100'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
        {delta && (
          <span className={`mb-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${deltaClass}`}>
            {delta}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}
