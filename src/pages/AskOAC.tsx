import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card } from '../components/Card'
import { ContextBadge } from '../components/ContextBadge'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { useToast } from '../components/Toast'
import { useT } from '../i18n'
import { askOAC, examplePrompts, type OACResult } from '../utils/mockAI'
import { type Entity } from '../data/entities'
import { meetingsByEntity } from '../data/meetings'
import { emailsByEntity, draftSeedForEntity } from '../data/emails'
import { teamsByEntity } from '../data/teamsMessages'
import { tasksByEntity } from '../data/tasks'
import { metricsByEntity } from '../data/salesData'
import { insightByEntity } from '../data/insights'
import { reportByEntityAndType } from '../data/reports'
import { formatUsd, formatNumber, formatDate } from '../utils/format'

interface ChatTurn {
  id: number
  query: string
  result?: OACResult
  thinking?: boolean
}

let turnId = 0

export function AskOAC() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { demoAction } = useToast()
  const { t } = useT()
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeEntity = [...turns].reverse().find((t) => t.result?.entity)?.result?.entity

  const ask = (raw: string) => {
    const query = raw.trim()
    if (!query) return
    const id = ++turnId
    setTurns((t) => [...t, { id, query, thinking: true }])
    setInput('')
    window.setTimeout(() => {
      const result = askOAC(query)
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, result, thinking: false } : x)))
    }, 650)
  }

  useEffect(() => {
    const q = params.get('q')
    if (q) {
      ask(q)
      params.delete('q')
      setParams(params, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns])

  return (
    <div className="oac-fade-in">
      <PageHeader title={t('page.ask.title')} subtitle={t('page.ask.subtitle')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Chat */}
        <div className="flex h-[calc(100vh-12rem)] flex-col lg:col-span-2">
          <div ref={scrollRef} className="flex-1 overflow-auto">
            {turns.length === 0 ? (
              <EmptyState onPick={ask} />
            ) : (
              <div className="space-y-5 pb-4">
                {turns.map((turn) => (
                  <div key={turn.id} className="space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm">{turn.query}</div>
                    </div>
                    <div className="flex justify-start">
                      <div className="flex w-full max-w-[95%] gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white"><SparkIcon /></span>
                        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                          {turn.thinking ? (
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="oac-typing text-brand-500"><span /><span /><span /></span>
                              <span className="text-xs">OAC is reading meetings, emails, Teams & Excel…</span>
                            </div>
                          ) : turn.result?.entity ? (
                            <Briefing entity={turn.result.entity} suggestions={turn.result.suggestions} onAsk={ask} />
                          ) : (
                            <NotFound suggestions={turn.result?.suggestions ?? []} onAsk={ask} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    ask(input)
                  }
                }}
                rows={1}
                placeholder="Ask anything — “What should I do next with Klook?”"
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <Button onClick={() => ask(input)} disabled={!input.trim()} icon={<SendIcon />}>Ask</Button>
            </div>
          </div>
        </div>

        {/* Source / context panel */}
        <div className="lg:col-span-1">
          <ContextPanel entity={activeEntity} navigate={navigate} demoAction={demoAction} />
        </div>
      </div>
    </div>
  )

  function Briefing({ entity, suggestions, onAsk }: { entity: Entity; suggestions: string[]; onAsk: (q: string) => void }) {
    const meeting = meetingsByEntity(entity.id)[0]
    const email = emailsByEntity(entity.id)[0]
    const teams = teamsByEntity(entity.id)[0]
    const metrics = metricsByEntity(entity.id)
    const insight = insightByEntity(entity.id)
    const ceoReport = reportByEntityAndType(entity.id, 'CEO Briefing')
    const seed = draftSeedForEntity(entity.id)

    return (
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h4 className="text-base font-bold text-slate-900">{entity.name} {t('l.briefing')}</h4>
          <ContextBadge context={entity.detectedContext} confidence={entity.contextConfidence} size="sm" />
        </div>

        <Section label={t('s.currentStatus')}>{entity.summary}</Section>

        <Section label={t('s.recentComm')}>
          <ul className="space-y-1.5">
            {meeting && <CommLine source="Meeting Recorder" date={meeting.date} text={meeting.title} />}
            {email && <CommLine source="Outlook" date={email.date} text={`${email.subject} — ${email.aiIntent}`} />}
            {teams && <CommLine source="Teams" date={teams.date} text={teams.messageSummary} />}
          </ul>
        </Section>

        <Section label={t('s.openIssues')}>
          <BulletList items={entity.openIssues} tone="amber" />
        </Section>

        <Section label={t('s.risks')}>
          <BulletList items={entity.risks} tone="rose" />
        </Section>

        <Section label={t('s.nextBestAction')}>
          <p className="font-medium text-brand-700">{entity.nextBestAction}</p>
          <p className="mt-1 text-slate-600">{entity.recommendedAction}</p>
        </Section>

        <Section label={t('s.suggestedEmail')}>
          {seed ? `“${seed.subject}” → ${seed.to}` : `Draft a context-aware email for ${entity.name}.`}
        </Section>

        <Section label={t('s.suggestedReport')}>
          {ceoReport ? `“${ceoReport.title}” is ready to generate.` : `Generate a CEO briefing summarizing ${entity.detectedContext.toLowerCase()} status and next actions.`}
        </Section>

        {metrics && (
          <Section label={t('s.relatedData')}>
            {metrics.kind === 'booking'
              ? `${formatNumber(metrics.bookings)} bookings · ${formatUsd(metrics.ttv)} TTV · ${metrics.failureRate}% failure rate. ${insight?.strategicDirection ?? ''}`
              : `${metrics.pendingConfirmationCount} pending confirmations · setup ${metrics.productSetupProgress}% · risk ${metrics.riskLevel}. ${metrics.aiComment}`}
          </Section>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Button size="sm" variant="demo" onClick={() => navigate(`/email?entity=${entity.id}`)}>{t('b.draftEmail')}</Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/report?entity=${entity.id}`)}>{t('b.createCeoReport')}</Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/relationship/${entity.id}`)}>{t('b.viewRel360')}</Button>
          <Button size="sm" variant="secondary" onClick={() => demoAction('Create Task Demo')}>{t('b.createTask')}</Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/data?entity=${entity.id}`)}>{t('b.showData')}</Button>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('l.suggestedFollowups')}</div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => onAsk(s)} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 py-2.5 first:border-t-0 first:pt-0">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand-600">{label}</div>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  )
}

function BulletList({ items, tone }: { items: string[]; tone: 'amber' | 'rose' }) {
  return (
    <ul className="space-y-1">
      {items.map((i, idx) => (
        <li key={idx} className="flex gap-2">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`} />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  )
}

function CommLine({ source, date, text }: { source: string; date: string; text: string }) {
  return (
    <li className="flex items-start gap-2">
      <Badge tone="slate">{source}</Badge>
      <span className="min-w-0 flex-1">
        <span className="text-slate-600">{text}</span>
        <span className="ml-1 text-[11px] text-slate-400">· {formatDate(date)}</span>
      </span>
    </li>
  )
}

function NotFound({ suggestions, onAsk }: { suggestions: string[]; onAsk: (q: string) => void }) {
  return (
    <div>
      <p className="text-sm text-slate-700">OAC didn't find a relationship in that question. Try a name like <strong>Yeogi Eottae</strong>, <strong>Grand Hyatt Jeju</strong>, <strong>Klook</strong>, or <strong>Dida</strong>. OAC detects the business context automatically — you never classify the account.</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button key={s} onClick={() => onAsk(s)} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">{s}</button>
        ))}
      </div>
    </div>
  )
}

function ContextPanel({
  entity,
  navigate,
  demoAction,
}: {
  entity?: Entity
  navigate: (to: string) => void
  demoAction: (label: string) => void
}) {
  const { t } = useT()
  if (!entity) {
    return (
      <Card className="sticky top-0">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Source &amp; Context</div>
        <p className="mt-3 text-sm text-slate-500">Ask about a relationship and OAC will show the detected context, confidence, and every connected source it used.</p>
        <div className="mt-4 space-y-1.5">
          {['Outlook', 'Teams', 'Excel', 'Internal DB'].map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{s} Connected Demo
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const records = [
    { label: t('r.meetings'), count: meetingsByEntity(entity.id).length },
    { label: t('r.emails'), count: emailsByEntity(entity.id).length },
    { label: t('r.teams'), count: teamsByEntity(entity.id).length },
    { label: t('r.tasks'), count: tasksByEntity(entity.id).length },
    { label: t('r.sales'), count: metricsByEntity(entity.id) ? 1 : 0 },
  ]

  return (
    <Card className="sticky top-0">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('l.detectedRel')}</div>
      <div className="mt-1.5 text-base font-bold text-slate-900">{entity.name}</div>
      <div className="text-xs text-slate-400">{entity.owner} · {entity.region}</div>

      <div className="mt-3">
        <ContextBadge context={entity.detectedContext} confidence={entity.contextConfidence} />
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] text-slate-500"><span>{t('l.contextConfidence')}</span><span className="font-semibold text-slate-700">{entity.contextConfidence}%</span></div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${entity.contextConfidence}%` }} />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('l.connectedSources')}</div>
        <div className="space-y-1.5">
          {['Outlook', 'Teams', 'Excel', 'Internal DB'].map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{s} Connected Demo
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('l.relatedRecords')}</div>
        <div className="grid grid-cols-2 gap-1.5">
          {records.map((r) => (
            <div key={r.label} className="rounded-lg border border-slate-100 px-2.5 py-1.5">
              <div className="text-sm font-semibold text-slate-800">{r.count}</div>
              <div className="text-[10px] text-slate-400">{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button size="sm" variant="primary" onClick={() => navigate(`/relationship/${entity.id}`)}>{t('l.openRel360')}</Button>
        <Button size="sm" variant="secondary" onClick={() => demoAction('Save to Timeline Demo')}>Save to Timeline Demo</Button>
      </div>
    </Card>
  )
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  const { t } = useT()
  return (
    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/20"><SparkIcon big /></span>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{t('l.askAnything')}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">OAC reads your meetings, emails, Teams messages, Excel and internal data — then detects the business context automatically. You never classify an account.</p>
      <p className="mt-2 text-sm font-medium text-brand-700">검색만 하세요. 분류와 정리는 OAC가 합니다.</p>
      <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {examplePrompts.map((p) => (
          <button key={p} onClick={() => onPick(p)} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700">
            <Badge tone="brand">Ask</Badge>{p}
          </button>
        ))}
      </div>
    </div>
  )
}

function SparkIcon({ big = false }: { big?: boolean }) {
  const s = big ? 26 : 15
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg>
}
function SendIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg> }
