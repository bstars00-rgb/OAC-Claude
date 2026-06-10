import { useState, useRef, useEffect } from 'react'
import { getEntities, entityById, type Entity } from '../data/entities'
import { initials } from '../utils/format'
import { useT } from '../i18n'

// A dropdown to pick a business relationship. Pass `options` to drive it from a
// specific list (e.g. the user's own captured relationships); otherwise it uses
// the seeded relationships. Selects by name — never an "account type".
export function EntitySelector({
  value,
  onChange,
  options,
  label = 'Business Relationship',
}: {
  value: string
  onChange: (id: string) => void
  options?: Entity[]
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  useT() // re-render on language change
  const list = options ?? getEntities()
  const selected = list.find((e) => e.id === value) ?? entityById(value)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-500">{label}</label>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-300"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-bold text-white">
            {selected ? initials(selected.name) : '—'}
          </span>
          <span className="text-sm font-medium text-slate-800">
            {selected?.name ?? 'Select a relationship'}
          </span>
        </span>
        <svg className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10">
          {list.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                onChange(e.id)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-slate-50 ${
                e.id === value ? 'bg-brand-50/60' : ''
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                {initials(e.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-800">{e.name}</span>
                <span className="block truncate text-[11px] text-slate-400">{e.detectedContext}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
