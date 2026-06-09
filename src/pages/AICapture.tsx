import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge, type BadgeTone } from '../components/Badge'
import { Button } from '../components/Button'
import { ContextBadge } from '../components/ContextBadge'
import { MetricCard } from '../components/MetricCard'
import { useToast } from '../components/Toast'
import { useT } from '../i18n'
import { useCaptureStore, type CaptureEntry } from '../data/captureStore'
import { structureCapture, captureExamples, type Category, type StructuredCapture } from '../utils/captureAI'
import { formatDate, daysAgo } from '../utils/format'

interface FeedItem {
  id: number
  rawText: string
  thinking: boolean
  entryId?: string
  structured?: StructuredCapture
  showReport?: boolean
  showEmail?: boolean
}

const catTone: Record<Category, BadgeTone> = {
  Customer: 'brand',
  Supplier: 'green',
  Partner: 'violet',
  Project: 'sky',
  Recruiting: 'amber',
  Legal: 'slate',
  Operations: 'red',
  Finance: 'green',
  General: 'slate',
}

const catLabel: Record<Category, { en: string; ko: string }> = {
  Customer: { en: 'Customer', ko: '고객사' },
  Supplier: { en: 'Supplier', ko: '공급사' },
  Partner: { en: 'Partner', ko: '파트너' },
  Project: { en: 'Project', ko: '프로젝트' },
  Recruiting: { en: 'Recruiting', ko: '채용' },
  Legal: { en: 'Legal', ko: '법무' },
  Operations: { en: 'Operations', ko: '운영' },
  Finance: { en: 'Finance', ko: '재무' },
  General: { en: 'General', ko: '일반' },
}

let feedSeq = 0

export function AICapture() {
  const navigate = useNavigate()
  const { demoAction } = useToast()
  const { t, lang } = useT()
  const store = useCaptureStore()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const feedRef = useRef<HTMLDivElement>(null)

  const submit = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    const id = ++feedSeq
    setFeed((f) => [{ id, rawText: text, thinking: true }, ...f])
    window.setTimeout(() => {
      const structured = structureCapture(text, lang)
      const entry = store.addEntry(structured, text)
      setFeed((f) => f.map((x) => (x.id === id ? { ...x, thinking: false, structured, entryId: entry.id } : x)))
    }, 900)
  }

  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [feed.length])

  return (
    <div className="oac-fade-in">
      <PageHeader title={t('page.capture.title')} subtitle={t('page.capture.subtitle')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Capture + feed */}
        <div className="space-y-5 lg:col-span-2">
          {/* Composer */}
          <Composer onSubmit={submit} t={t} />

          {/* Feed */}
          <div ref={feedRef} className="space-y-5">
            {feed.length === 0 && <EmptyState onPick={submit} lang={lang} t={t} />}
            {feed.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-1">
          <div className="sticky top-0 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label={t('cap.accounts')} value={store.stats.accounts} />
              <MetricCard label={t('cap.openTodos')} value={store.stats.openTodos} />
              <MetricCard label={t('cap.risks')} value={store.stats.risks} deltaTone={store.stats.risks ? 'down' : 'neutral'} />
              <MetricCard label={t('cap.captures')} value={store.stats.entries} />
            </div>

            <Card padded={false}>
              <div className="flex items-center justify-between px-5 pt-5">
                <CardHeader title={t('cap.recentAccounts')} subtitle={t('cap.liveStructured')} />
                {store.entries.length > 0 && (
                  <button onClick={store.clearAll} className="mb-4 text-[11px] font-medium text-slate-400 hover:text-rose-600">{t('cap.clear')}</button>
                )}
              </div>
              {store.accounts.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-slate-400">{t('cap.noAccounts')}</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {store.accounts.map((a) => (
                    <div key={a.accountId} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-slate-800">{a.accountName}</span>
                        <Badge tone={catTone[a.category]}>{catLabel[a.category][lang]}</Badge>
                      </div>
                      <div className="mt-1"><ContextBadge context={a.detectedContext} size="sm" /></div>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{a.entryCount} {t('cap.entries')}</span>
                        <span className="text-amber-600">{a.openTodos} {t('cap.todosShort')}</span>
                        {a.riskCount > 0 && <span className="text-rose-600">{a.riskCount} {t('cap.risks')}</span>}
                        <span className="ml-auto">{daysAgo(a.lastDate)}</span>
                      </div>
                      {a.isExisting && (
                        <button onClick={() => navigate(`/relationship/${a.accountId}`)} className="mt-1.5 text-[11px] font-medium text-brand-600 hover:text-brand-700">{t('cap.viewRel')} →</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  function FeedCard({ item }: { item: FeedItem }) {
    if (item.thinking) {
      return (
        <Card>
          <div className="mb-2 text-sm text-slate-500">“{item.rawText}”</div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="oac-typing text-brand-500"><span /><span /><span /></span>
            <span className="text-xs">{t('cap.thinking')}</span>
          </div>
        </Card>
      )
    }
    if (!item.structured || !item.entryId) return null
    const s = item.structured
    const entry = store.entries.find((e) => e.id === item.entryId)
    if (!entry) return null

    const setItem = (patch: Partial<FeedItem>) => setFeed((f) => f.map((x) => (x.id === item.id ? { ...x, ...patch } : x)))

    return (
      <Card className="oac-fade-in">
        {/* raw echo */}
        <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">“{item.rawText}”</div>

        {/* Account header */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('cap.account')}</span>
          <span className="text-base font-bold text-slate-900">{s.accountName}</span>
          <Badge tone={s.isExisting ? 'green' : 'brand'} dot>{s.isExisting ? t('cap.existing') : t('cap.new')}</Badge>
          <Badge tone={catTone[s.category]}>{catLabel[s.category][lang]}</Badge>
          <ContextBadge context={s.detectedContext} confidence={s.contextConfidence} size="sm" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.summary}</p>

        {/* Structured grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Timeline */}
          <div className="rounded-xl border border-slate-100 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-600"><DotIcon className="bg-sky-500" />{t('cap.timeline')}</div>
            <div className="text-xs font-medium text-slate-700">{entry.timeline.title}</div>
            <div className="mt-0.5 text-[11px] text-slate-400">{formatDate(entry.timeline.date)}</div>
            <p className="mt-1 line-clamp-4 text-xs text-slate-500">{entry.timeline.detail}</p>
          </div>

          {/* To Do */}
          <div className="rounded-xl border border-slate-100 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-600"><DotIcon className="bg-brand-500" />{t('cap.todo')} ({entry.todos.filter((x) => !x.done).length})</div>
            {entry.todos.length === 0 ? (
              <p className="text-xs text-slate-400">{t('cap.noTodo')}</p>
            ) : (
              <ul className="space-y-1.5">
                {entry.todos.map((td) => (
                  <li key={td.id}>
                    <button onClick={() => store.toggleTodo(entry.id, td.id)} className="group flex w-full items-start gap-2 text-left">
                      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${td.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 group-hover:border-brand-400'}`}>
                        {td.done && <CheckIcon />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`text-xs ${td.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{td.text}</span>
                        <span className="mt-0.5 flex items-center gap-1.5">
                          <Badge tone={td.priority === 'High' ? 'red' : td.priority === 'Medium' ? 'amber' : 'slate'}>{td.priority}</Badge>
                          <span className="text-[10px] text-slate-400">{t('cap.due')} {formatDate(td.due)}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Risk */}
          <div className="rounded-xl border border-slate-100 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-rose-600"><DotIcon className="bg-rose-500" />{t('cap.risk')} ({entry.risks.length})</div>
            {entry.risks.length === 0 ? (
              <p className="text-xs text-slate-400">{t('cap.noRisk')}</p>
            ) : (
              <ul className="space-y-1.5">
                {entry.risks.map((r, i) => (
                  <li key={i} className="flex gap-1.5 text-xs text-slate-600"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{r}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Badge tone="green" dot>{t('cap.savedToCrm')}</Badge>
          <span className="flex-1" />
          <Button size="sm" variant={item.showReport ? 'primary' : 'secondary'} onClick={() => setItem({ showReport: !item.showReport })}>{t('cap.genReport')}</Button>
          <Button size="sm" variant={item.showEmail ? 'primary' : 'secondary'} onClick={() => setItem({ showEmail: !item.showEmail })}>{t('cap.draftEmail')}</Button>
          {s.isExisting && <Button size="sm" variant="secondary" onClick={() => navigate(`/relationship/${s.accountId}`)}>{t('cap.viewRel')}</Button>}
          <Button size="sm" variant="demo" onClick={() => demoAction('Save to Timeline Demo')}>Save to Timeline Demo</Button>
          <Button size="sm" variant="demo" onClick={() => demoAction('Create Task Demo')}>Create Tasks Demo</Button>
        </div>

        {/* Report draft */}
        {item.showReport && (
          <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:bg-brand-500/10">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">{s.report.title}</h4>
              <Button size="sm" variant="demo" onClick={() => demoAction('Export to Word Demo')}>Export to Word Demo</Button>
            </div>
            {s.report.sections.map((sec, i) => (
              <div key={i} className="mb-2">
                <div className="text-[11px] font-bold uppercase tracking-wide text-brand-600">{sec.heading}</div>
                <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">{sec.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Email draft */}
        {item.showEmail && (
          <div className="mt-3 rounded-xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">{s.email.subject}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="demo" onClick={() => demoAction('Send via Outlook Demo')}>Send via Outlook Demo</Button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600">{s.email.body}</pre>
          </div>
        )}
      </Card>
    )
  }
}

function Composer({ onSubmit, t }: { onSubmit: (text: string) => void; t: (k: string) => string }) {
  const [input, setInput] = useState('')
  const go = () => {
    if (!input.trim()) return
    onSubmit(input)
    setInput('')
  }
  return (
    <Card className="border-brand-100">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white"><SparkIcon /></span>
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                go()
              }
            }}
            rows={4}
            placeholder={t('cap.placeholder')}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">⌘/Ctrl + Enter</span>
            <Button onClick={go} disabled={!input.trim()} icon={<SparkIcon />}>{t('cap.structure')}</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function EmptyState({ onPick, lang, t }: { onPick: (q: string) => void; lang: 'en' | 'ko'; t: (k: string) => string }) {
  return (
    <Card className="flex flex-col items-center py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/20"><SparkIcon big /></span>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{t('cap.emptyTitle')}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{t('cap.emptyDesc')}</p>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('cap.tryExample')}</div>
      <div className="mt-3 grid w-full max-w-xl grid-cols-1 gap-2">
        {captureExamples.map((ex, i) => (
          <button key={i} onClick={() => onPick(ex[lang])} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700">
            {ex[lang]}
          </button>
        ))}
      </div>
    </Card>
  )
}

function SparkIcon({ big = false }: { big?: boolean }) {
  const s = big ? 26 : 15
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg>
}
function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
}
function DotIcon({ className }: { className: string }) {
  return <span className={`h-2 w-2 rounded-full ${className}`} />
}
