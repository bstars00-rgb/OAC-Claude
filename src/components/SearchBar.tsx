import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchEntities } from '../data/entities'
import { ContextBadge } from './ContextBadge'

// Global search — the heart of the product. "Search the name. OAC finds the context."
export function SearchBar({ variant = 'topbar' }: { variant?: 'topbar' | 'hero' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)

  const results = query.trim() ? searchEntities(query).slice(0, 6) : []

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submit = (q: string) => {
    if (!q.trim()) return
    setOpen(false)
    navigate(`/ask?q=${encodeURIComponent(q)}`)
  }

  const hero = variant === 'hero'

  return (
    <div ref={wrapRef} className={`relative ${hero ? 'w-full' : 'w-full max-w-xl'}`}>
      <div
        className={`flex items-center gap-2.5 rounded-xl border bg-white transition ${
          hero
            ? 'border-slate-200 px-4 py-3 shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100'
            : 'border-slate-200 px-3 py-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100'
        }`}
      >
        <svg className="shrink-0 text-slate-400" width={hero ? 20 : 16} height={hero ? 20 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && submit(query)}
          placeholder={
            hero
              ? 'Search a name or ask OAC — “What should I do next with Klook?”'
              : 'Search a relationship or ask OAC…'
          }
          className={`w-full bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none ${
            hero ? 'text-base' : 'text-sm'
          }`}
        />
        {query && (
          <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 sm:block">
            Enter
          </kbd>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          {results.length > 0 ? (
            <>
              <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Business Relationships
              </div>
              {results.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setOpen(false)
                    navigate(`/relationship/${e.id}`)
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{e.name}</div>
                    <div className="truncate text-xs text-slate-400">
                      {e.owner} · {e.region}
                    </div>
                  </div>
                  <ContextBadge context={e.detectedContext} size="sm" />
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-3 text-sm text-slate-500">
              No relationship matched. Press Enter to ask OAC anyway.
            </div>
          )}
          <button
            onClick={() => submit(query)}
            className="flex w-full items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-3 py-2.5 text-left text-sm font-medium text-brand-700 transition hover:bg-brand-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" />
            </svg>
            Ask OAC: “{query}”
          </button>
        </div>
      )}
    </div>
  )
}
