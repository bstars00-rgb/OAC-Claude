import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { MetricCard } from '../components/MetricCard'
import { Badge, type BadgeTone } from '../components/Badge'
import { ContextBadge } from '../components/ContextBadge'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { useT } from '../i18n'
import { entities, getEntities, healthBand, contextGroups, entityById, type Entity } from '../data/entities'
import { getTodaysBriefing, insightByEntity } from '../data/insights'
import { openTasksSorted } from '../data/tasks'
import { latestMeetings } from '../data/meetings'
import { draftEmails } from '../data/emails'
import { portfolioTotals } from '../data/salesData'
import { useRelationships } from '../data/useRelationships'
import { useCaptureStore } from '../data/captureStore'
import { DataPulse } from '../components/DataPulse'
import { DueAlerts } from '../components/DueAlerts'
import { WeeklyReport } from '../components/WeeklyReport'
import { formatUsd, formatNumber, formatDate, daysAgo, initials } from '../utils/format'

const bandTone: Record<string, BadgeTone> = {
  Healthy: 'green',
  Stable: 'sky',
  Watch: 'amber',
  'At Risk': 'red',
}

// Detected contexts that the briefing wants surfaced as "needing attention".
const ATTENTION_CONTEXTS = [
  'API Integration / Channel Expansion',
  'Hotel Contracting / Rate Negotiation',
  'Corporate Client / Net Rate Sales',
  'Supplier Product / Operation Setup',
  'SLA / Contract Risk',
  'Booking Failure / Technical Accuracy Issue',
]

export function Dashboard() {
  const rel = useRelationships()
  return rel.isDemo ? <DemoDashboard /> : <RealDashboard relationships={rel.list} />
}

function DemoDashboard() {
  const navigate = useNavigate()
  const { demoAction } = useToast()
  const { t, lang } = useT()
  const totals = portfolioTotals()
  const tasks = openTasksSorted()
  const meetings = latestMeetings(4)
  const drafts = draftEmails().slice(0, 4)

  const localized = getEntities()
  const atRisk = localized.filter((e) => healthBand(e.relationshipHealthScore) === 'At Risk').length
  const priorities = [...localized]
    .sort((a, b) => a.relationshipHealthScore - b.relationshipHealthScore)
    .slice(0, 6)

  const groups = contextGroups()
    .slice()
    .sort((a, b) => {
      const ai = ATTENTION_CONTEXTS.indexOf(a.context)
      const bi = ATTENTION_CONTEXTS.indexOf(b.context)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })

  const recommendedActions = priorities.slice(0, 6).map((e) => ({
    entityId: e.id,
    name: e.name,
    action: insightByEntity(e.id)?.nextBestAction ?? e.nextBestAction,
  }))

  return (
    <div className="oac-fade-in space-y-5">
      <PageHeader
        title={t('page.dashboard.title')}
        subtitle={t('page.dashboard.subtitle')}
        actions={
          <Button onClick={() => navigate('/ask')} variant="primary" icon={<SparkIcon />}>
            {t('common.askOAC')}
          </Button>
        }
      />

      {/* Main AI briefing card */}
      <Card className="border-brand-100 bg-gradient-to-br from-brand-50/80 via-white to-violet-50/50 dark:bg-none">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm">
            <SparkIcon />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-brand-700">{t('l.morningBriefing')}</span>
              <Badge tone="brand" dot>June 9, 2026</Badge>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{getTodaysBriefing()}</p>
            <p className="mt-2 text-xs text-slate-500">
              Generated from meetings, emails, Teams, Excel, and internal DB · AI Engine Demo
            </p>
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('l.activeRel')} value={entities.length} delta={`${atRisk} ${t('l.atRisk')}`} deltaTone={atRisk ? 'down' : 'neutral'} icon={<UsersIcon />} />
        <MetricCard label={t('l.monthlyTtv')} value={formatUsd(totals.totalTtv)} delta="+6.0% QoQ" deltaTone="up" icon={<DollarIcon />} />
        <MetricCard label={t('l.monthlyBookings')} value={formatNumber(totals.totalBookings)} delta="+5.4% QoQ" deltaTone="up" icon={<BedIcon />} />
        <MetricCard label={t('l.openFollowups')} value={tasks.length} delta={`${tasks.filter((tk) => tk.priority === 'High').length} ${t('l.high')}`} deltaTone="neutral" icon={<CheckIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Priority Relationships */}
          <Card padded={false}>
            <div className="flex items-center justify-between px-5 pt-5">
              <CardHeader title={t('l.priorityRel')} subtitle={t('l.rankedHealth')} />
              <button onClick={() => navigate('/relationship')} className="mb-4 text-xs font-medium text-brand-600 hover:text-brand-700">{t('common.viewAll')} →</button>
            </div>
            <div className="divide-y divide-slate-100">
              {priorities.map((e) => {
                const band = healthBand(e.relationshipHealthScore)
                return (
                  <button key={e.id} onClick={() => navigate(`/relationship/${e.id}`)} className="flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-slate-50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{initials(e.name)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{e.name}</span>
                        <Badge tone={bandTone[band]} dot>{band} · {e.relationshipHealthScore}</Badge>
                        <ContextBadge context={e.detectedContext} size="sm" />
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-600">{t('l.issue')}:</span> {e.openIssues[0]}
                      </div>
                      <div className="mt-0.5 text-xs text-brand-700">
                        <span className="font-medium">{t('l.nextBestActionShort')}:</span> {e.nextBestAction}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Recent Meetings */}
          <Card padded={false}>
            <div className="px-5 pt-5"><CardHeader title={t('l.recentMeetings')} subtitle={t('l.capturedRecorder')} /></div>
            <div className="divide-y divide-slate-100">
              {meetings.map((m) => {
                const ent = entityById(m.entityId)
                return (
                  <div key={m.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => navigate(`/relationship/${m.entityId}`)} className="text-sm font-semibold text-slate-800 hover:text-brand-700">{ent?.name}</button>
                      <span className="text-[11px] text-slate-500">{formatDate(m.date)} · {m.followUps.length} follow-ups</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{m.aiSummary}</p>
                  </div>
                )
              })}
            </div>
            <button onClick={() => navigate('/assistant')} className="block w-full border-t border-slate-100 px-5 py-2.5 text-xs font-medium text-brand-600 hover:bg-slate-50">{t('nav.assistant')} →</button>
          </Card>

          {/* Contexts Needing Attention */}
          <Card>
            <CardHeader title={t('l.contextsAttention')} subtitle={t('l.groupedContext')} />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {groups.map((g) => (
                <div key={g.context} className="rounded-xl border border-slate-200 p-3">
                  <ContextBadge context={entityById(g.entityIds[0])?.detectedContext ?? g.context} size="sm" />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.entityIds.map((id) => {
                      const ent = entityById(id)!
                      return (
                        <button key={id} onClick={() => navigate(`/relationship/${id}`)} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">{ent.name}</button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Open Follow-ups */}
          <Card padded={false}>
            <div className="px-5 pt-5"><CardHeader title={t('l.openFollowups')} subtitle={`${tasks.length} ${t('l.acrossRel')}`} /></div>
            <ul className="divide-y divide-slate-100">
              {tasks.slice(0, 6).map((t) => {
                const ent = entityById(t.entityId)
                return (
                  <li key={t.id} className="px-5 py-3">
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${t.priority === 'High' ? 'bg-rose-500' : t.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                      <div className="min-w-0 flex-1">
                        <button onClick={() => navigate(`/relationship/${t.entityId}`)} className="text-left text-sm font-medium text-slate-700 hover:text-brand-700">{t.title}</button>
                        <div className="mt-0.5 text-[11px] text-slate-500">{ent?.name} · {t.owner} · due {formatDate(t.dueDate)}</div>
                        <div className="mt-1 text-[11px] italic text-slate-500">“{t.aiReason}”</div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <button onClick={() => demoAction('Create Task Demo')} className="block w-full border-t border-slate-100 px-5 py-2.5 text-xs font-medium text-brand-600 hover:bg-slate-50">Create Task Demo</button>
          </Card>

          {/* Draft Emails */}
          <Card>
            <CardHeader title={t('l.draftEmails')} subtitle={t('l.suggestedByOAC')} icon={<MailIcon />} />
            <ul className="space-y-2.5">
              {drafts.map((d) => {
                const ent = entityById(d.entityId)
                return (
                  <li key={d.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="text-xs font-semibold text-slate-500">{ent?.name}</div>
                    <div className="mt-0.5 text-sm font-medium text-slate-800">{d.subject}</div>
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{d.aiIntent}</div>
                    <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => navigate(`/assistant?q=${encodeURIComponent(lang === 'ko' ? `${ent?.name}에 보낼 메일 작성해줘` : `Draft an email to ${ent?.name}`)}`)}>{t('l.openInEmail')}</Button>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* AI Recommended Actions */}
          <Card className="bg-gradient-to-br from-slate-900 to-brand-900 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15"><SparkIcon /></span>
              <span className="text-xs font-bold uppercase tracking-wide text-white/80">{t('l.aiRecActions')}</span>
            </div>
            <ul className="mt-3 space-y-2.5">
              {recommendedActions.map((r, i) => (
                <li key={r.entityId} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/15 text-[11px] font-bold">{i + 1}</span>
                  <button onClick={() => navigate(`/relationship/${r.entityId}`)} className="text-left text-sm leading-snug text-white/90 hover:text-white">
                    <span className="font-semibold">{r.name}:</span> {r.action}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/60">
              검색만 하세요. 분류와 정리는 OAC가 합니다.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── Real-mode dashboard (the user's own captured data) ───────────────────────
function RealDashboard({ relationships }: { relationships: Entity[] }) {
  const navigate = useNavigate()
  const { t, lang } = useT()
  const store = useCaptureStore()

  const priorities = [...relationships].sort((a, b) => a.relationshipHealthScore - b.relationshipHealthScore).slice(0, 6)
  const openTodos = store.entries.flatMap((e) => e.todos.filter((td) => !td.done).map((td) => ({ ...td, accountName: e.accountName, accountId: e.accountId })))
  const recent = store.entries.slice(0, 6)

  // group by detected context
  const ctxMap = new Map<string, Entity[]>()
  for (const r of relationships) ctxMap.set(r.detectedContext, [...(ctxMap.get(r.detectedContext) ?? []), r])
  const groups = [...ctxMap.entries()]

  if (relationships.length === 0) {
    return (
      <div className="oac-fade-in">
        <PageHeader title={t('page.dashboard.title')} subtitle={t('page.dashboard.subtitle')} />
        <Card className="flex flex-col items-center py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white"><SparkIcon /></span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">{t('dash.emptyTitle')}</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">{t('dash.emptyDesc')}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => navigate('/assistant')} icon={<SparkIcon />}>{t('nav.assistant')}</Button>
            <Button variant="secondary" onClick={() => navigate('/settings')}>{lang === 'ko' ? '데이터 가져오기' : 'Import data'}</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="oac-fade-in space-y-5">
      <PageHeader title={t('page.dashboard.title')} subtitle={t('page.dashboard.subtitle')} actions={<div className="flex items-center gap-2"><WeeklyReport /><Button onClick={() => navigate('/assistant')} icon={<SparkIcon />}>{t('common.askOAC')}</Button></div>} />

      {/* Auto RawData summary — shown without asking */}
      <DataPulse />

      {/* A-2: due / overdue task alerts */}
      <DueAlerts />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('cap.accounts')} value={store.stats.accounts} icon={<UsersIcon />} />
        <MetricCard label={t('cap.openTodos')} value={store.stats.openTodos} icon={<CheckIcon />} />
        <MetricCard label={t('cap.risks')} value={store.stats.risks} deltaTone={store.stats.risks ? 'down' : 'neutral'} />
        <MetricCard label={t('cap.captures')} value={store.stats.entries} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card padded={false}>
            <div className="px-5 pt-5"><CardHeader title={t('l.priorityRel')} subtitle={t('l.rankedHealth')} /></div>
            <div className="divide-y divide-slate-100">
              {priorities.map((e) => (
                <button key={e.id} onClick={() => navigate(`/relationship/${e.id}`)} className="flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-slate-50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{initials(e.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-800">{e.name}</span><ContextBadge context={e.detectedContext} size="sm" /></div>
                    <div className="mt-1 text-xs text-brand-700"><span className="font-medium">{t('l.nextBestActionShort')}:</span> {e.nextBestAction}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card padded={false}>
            <div className="px-5 pt-5"><CardHeader title={t('dash.recentActivity')} subtitle={t('cap.liveStructured')} /></div>
            <div className="divide-y divide-slate-100">
              {recent.map((e) => (
                <div key={e.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <button onClick={() => navigate(`/relationship/${e.accountId}`)} className="text-sm font-semibold text-slate-800 hover:text-brand-700">{e.accountName}</button>
                    <span className="text-[11px] text-slate-500">{formatDate(e.date)} · {daysAgo(e.date)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{e.timeline.title} — {e.summary}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title={t('l.contextsAttention')} subtitle={t('l.groupedContext')} />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {groups.map(([ctx, rels]) => (
                <div key={ctx} className="rounded-xl border border-slate-200 p-3">
                  <ContextBadge context={ctx} size="sm" />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {rels.map((r) => <button key={r.id} onClick={() => navigate(`/relationship/${r.id}`)} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700">{r.name}</button>)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card padded={false}>
            <div className="px-5 pt-5"><CardHeader title={t('l.openFollowups')} subtitle={`${openTodos.length} ${t('l.acrossRel')}`} /></div>
            {openTodos.length === 0 ? <p className="px-5 pb-5 text-sm text-slate-500">{t('dash.noTodos')}</p> : (
              <ul className="divide-y divide-slate-100">
                {openTodos.slice(0, 8).map((td) => (
                  <li key={td.id} className="px-5 py-3">
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${td.priority === 'High' ? 'bg-rose-500' : td.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                      <div className="min-w-0 flex-1">
                        <button onClick={() => navigate(`/relationship/${td.accountId}`)} className="text-left text-sm font-medium text-slate-700 hover:text-brand-700">{td.text}</button>
                        <div className="mt-0.5 text-[11px] text-slate-500">{td.accountName} · {t('cap.due')} {formatDate(td.due)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-brand-900 text-white">
            <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15"><SparkIcon /></span><span className="text-xs font-bold uppercase tracking-wide text-white/80">{t('l.aiRecActions')}</span></div>
            <ul className="mt-3 space-y-2.5">
              {priorities.slice(0, 5).map((e, i) => (
                <li key={e.id} className="flex gap-2.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/15 text-[11px] font-bold">{i + 1}</span><button onClick={() => navigate(`/relationship/${e.id}`)} className="text-left text-sm leading-snug text-white/90 hover:text-white"><span className="font-semibold">{e.name}:</span> {e.nextBestAction}</button></li>
              ))}
            </ul>
            <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/60">{lang === 'ko' ? '검색만 하세요. 분류와 정리는 OAC가 합니다.' : 'Search the name. OAC finds the context and prepares the next action.'}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────────────────────────
function SparkIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg> }
function UsersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7" /></svg> }
function DollarIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> }
function BedIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v11M3 13h18v5M21 18v-5a3 3 0 0 0-3-3h-6v3" /><circle cx="7" cy="11" r="1.5" /></svg> }
function CheckIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg> }
function MailIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg> }
