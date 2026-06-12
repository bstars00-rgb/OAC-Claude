import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useRelationships } from '../data/useRelationships'
import { useCaptureStore } from '../data/captureStore'

// A-3: Global search / command palette. Press Ctrl/⌘+K anywhere to search across
// relationships, captures, open to-dos, and pages — then jump straight there.
// `search` carries extra hidden text (capture bodies, email content, owners) so
// the palette matches on full content, not just the visible title/sub. (B-5)
type Item = { id: string; group: string; title: string; sub?: string; to: string; search?: string }

export function CommandPalette() {
  const navigate = useNavigate()
  const { lang } = useT()
  const rel = useRelationships()
  const store = useCaptureStore()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)

  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Ctrl/⌘+K toggles; '/' opens when not typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  const pages: Item[] = useMemo(() => [
    { id: 'p-dash', group: L('페이지', 'Pages'), title: L('대시보드', 'Dashboard'), to: '/' },
    { id: 'p-ask', group: L('페이지', 'Pages'), title: L('OAC 어시스턴트', 'OAC Assistant'), to: '/assistant' },
    { id: 'p-rel', group: L('페이지', 'Pages'), title: L('관계 360', 'Relationship 360'), to: '/relationship' },
    { id: 'p-data', group: L('페이지', 'Pages'), title: L('데이터 인사이트', 'Data Insight'), to: '/data' },
    { id: 'p-central', group: L('페이지', 'Pages'), title: 'Central', to: '/central' },
    { id: 'p-set', group: L('페이지', 'Pages'), title: L('설정', 'Settings'), to: '/settings' },
  ], [lang])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    const relG = L('관계', 'Relationships')
    const capG = L('기록', 'Captures')
    const todoG = L('할 일', 'To-dos')

    const relItems: Item[] = rel.list.map((e) => ({ id: 'r-' + e.id, group: relG, title: e.name, sub: `${e.detectedContext}${e.region ? ' · ' + e.region : ''}`, to: `/relationship/${e.id}`, search: `${e.owner ?? ''} ${e.currentFocus ?? ''} ${e.nextBestAction ?? ''}` }))
    // capture search also covers the summary, the longer detail/body (e.g. email
    // or report text), risks, and the raw note — so you can find a record by its content.
    const capItems: Item[] = store.entries.map((e) => ({ id: 'c-' + e.id, group: capG, title: e.timeline?.title || e.summary, sub: `${e.accountName} · ${e.date}`, to: `/relationship/${e.accountId}`, search: `${e.summary} ${e.detail ?? ''} ${e.timeline?.detail ?? ''} ${(e.risks ?? []).join(' ')} ${e.rawText ?? ''}` }))
    const todoItems: Item[] = store.entries.flatMap((e) => e.todos.filter((td) => !td.done).map((td) => ({ id: 't-' + td.id, group: todoG, title: td.text, sub: `${e.accountName}${td.due ? ' · ' + L('마감 ', 'due ') + td.due : ''}`, to: `/relationship/${e.accountId}` })))

    const all = [...pages, ...relItems, ...capItems, ...todoItems]
    if (!term) return pages
    const match = (it: Item) => (it.title + ' ' + (it.sub || '') + ' ' + (it.search || '')).toLowerCase().includes(term)
    // de-dup captures/todos that collapse to the same title+target
    const seen = new Set<string>()
    return all.filter(match).filter((it) => {
      const k = it.group + '|' + it.title + '|' + it.to
      if (seen.has(k)) return false
      seen.add(k)
      return true
    }).slice(0, 24)
  }, [q, rel.list, store.entries, pages, lang])

  useEffect(() => { setActive(0) }, [q])

  if (!open) return null

  const go = (it?: Item) => {
    const target = it ?? results[active]
    if (!target) {
      if (q.trim()) { navigate(`/assistant?q=${encodeURIComponent(q)}`); setOpen(false) }
      return
    }
    navigate(target.to)
    setOpen(false)
  }

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0))) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go() }
  }

  // group consecutive items for headers
  let lastGroup = ''

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={L('빠른 검색', 'Quick search')} className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-white/10 dark:bg-slate-900" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3 dark:border-white/5">
          <svg aria-hidden="true" className="shrink-0 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onListKey}
            aria-label={L('빠른 검색', 'Quick search')}
            placeholder={L('관계·기록·할 일·페이지 검색…', 'Search relationships, captures, to-dos, pages…')}
            className="w-full bg-transparent text-[15px] text-slate-800 placeholder:text-slate-500 focus:outline-none dark:text-slate-100" />
          <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 sm:block dark:border-white/10 dark:bg-white/5">Esc</kbd>
        </div>

        <div className="max-h-[52vh] overflow-auto py-1">
          {results.length === 0 ? (
            <button onClick={() => go()} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-brand-700 hover:bg-brand-50">
              <SparkIcon /> {L('OAC에게 묻기', 'Ask OAC')}: “{q}”
            </button>
          ) : results.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null
            lastGroup = it.group
            return (
              <div key={it.id}>
                {header && <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{header}</div>}
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(it)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition ${i === active ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{it.title}</span>
                    {it.sub && <span className="block truncate text-[11px] text-slate-500">{it.sub}</span>}
                  </span>
                  {i === active && <span className="shrink-0 text-[11px] text-slate-500">↵</span>}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500 dark:border-white/5">
          <span><kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">↑↓</kbd> {L('이동', 'navigate')}</span>
          <span><kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">↵</kbd> {L('열기', 'open')}</span>
          <span className="ml-auto"><kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">⌘/Ctrl K</kbd></span>
        </div>
      </div>
    </div>
  )
}

function SparkIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg>
}
