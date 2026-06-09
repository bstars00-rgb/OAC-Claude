import type { ReactNode } from 'react'

type Variant = 'ai' | 'critical' | 'opportunity'

const styles: Record<Variant, { wrap: string; chip: string; label: string }> = {
  ai: {
    wrap: 'border-brand-100 bg-gradient-to-br from-brand-50/80 to-violet-50/50',
    chip: 'bg-brand-600 text-white',
    label: 'text-brand-700',
  },
  critical: {
    wrap: 'border-rose-100 bg-gradient-to-br from-rose-50/80 to-amber-50/40',
    chip: 'bg-rose-600 text-white',
    label: 'text-rose-700',
  },
  opportunity: {
    wrap: 'border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-brand-50/40',
    chip: 'bg-emerald-600 text-white',
    label: 'text-emerald-700',
  },
}

export function InsightBox({
  variant = 'ai',
  label = 'OAC AI Insight',
  title,
  children,
  footer,
}: {
  variant?: Variant
  label?: string
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const s = styles[variant]
  return (
    <div className={`rounded-2xl border p-4 ${s.wrap}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${s.chip}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" />
          </svg>
        </span>
        <span className={`text-xs font-bold uppercase tracking-wide ${s.label}`}>{label}</span>
      </div>
      {title && <p className="mb-1 text-sm font-semibold text-slate-900">{title}</p>}
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  )
}
