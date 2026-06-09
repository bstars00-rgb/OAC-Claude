import type { ReactNode } from 'react'

export type BadgeTone =
  | 'brand'
  | 'green'
  | 'amber'
  | 'red'
  | 'slate'
  | 'violet'
  | 'sky'

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-rose-50 text-rose-700 border-rose-100',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
}

export function Badge({
  tone = 'slate',
  children,
  dot = false,
  className = '',
}: {
  tone?: BadgeTone
  children: ReactNode
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}
