import { useState } from 'react'

export interface ActionItem {
  label: string
  meta?: string
}

// A checkable list of next actions. Checking is local-only (prototype).
export function ActionList({
  items,
  onComplete,
}: {
  items: (string | ActionItem)[]
  onComplete?: (label: string) => void
}) {
  const normalized: ActionItem[] = items.map((i) =>
    typeof i === 'string' ? { label: i } : i,
  )
  const [done, setDone] = useState<Record<number, boolean>>({})

  return (
    <ul className="space-y-1.5">
      {normalized.map((item, i) => {
        const checked = !!done[i]
        return (
          <li key={i}>
            <button
              onClick={() => {
                setDone((d) => ({ ...d, [i]: !d[i] }))
                if (!checked) onComplete?.(item.label)
              }}
              className="group flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50"
            >
              <span
                className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition ${
                  checked
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white group-hover:border-brand-400'
                }`}
                style={{ height: '18px', width: '18px' }}
              >
                {checked && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="flex-1">
                <span
                  className={`text-sm ${
                    checked ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}
                >
                  {item.label}
                </span>
                {item.meta && (
                  <span className="ml-2 text-xs text-slate-400">{item.meta}</span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
