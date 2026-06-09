import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge, type BadgeTone } from '../components/Badge'
import { Button } from '../components/Button'
import { ContextBadge } from '../components/ContextBadge'
import { InsightBox } from '../components/InsightBox'
import { Timeline, type TimelineEntry } from '../components/Timeline'
import { MetricCard } from '../components/MetricCard'
import { EntitySelector } from '../components/EntitySelector'
import { Sparkline, GaugeBar, Donut } from '../components/DemoChart'
import { useToast } from '../components/Toast'
import { entities, entityById, healthBand, type Entity } from '../data/entities'
import { metricsByEntity } from '../data/salesData'
import { tasksByEntity } from '../data/tasks'
import { emailsByEntity, draftSeedForEntity } from '../data/emails'
import { teamsByEntity } from '../data/teamsMessages'
import { meetingsByEntity } from '../data/meetings'
import { insightByEntity } from '../data/insights'
import { reportByEntityAndType } from '../data/reports'
import { formatUsd, formatNumber, formatPct, formatDate, daysAgo, initials } from '../utils/format'

const bandTone: Record<string, BadgeTone> = {
  Healthy: 'green',
  Stable: 'sky',
  Watch: 'amber',
  'At Risk': 'red',
}

const statusTone: Record<string, BadgeTone> = {
  Confirmed: 'green',
  Partial: 'amber',
  Pending: 'slate',
  Ready: 'green',
  'Near Ready': 'sky',
  'In Progress': 'amber',
  Early: 'slate',
  'Not Started': 'slate',
  Low: 'green',
  Medium: 'amber',
  High: 'red',
  Moderate: 'sky',
}

export function Relationship360() {
  const { id } = useParams()
  const navigate = useNavigate()
  const entity = id ? entityById(id) : entities[0]
  if (!entity) return <RelationshipPicker />
  return <RelationshipDetail entity={entity} key={entity.id} navigateTo={navigate} />
}

function RelationshipPicker() {
  const navigate = useNavigate()
  return (
    <div className="oac-fade-in">
      <PageHeader title="Relationship 360" subtitle="One place for every meeting, email, Teams message, task, report, and data insight." />
      <Card>
        <EntitySelector value={entities[0].id} onChange={(id) => navigate(`/relationship/${id}`)} />
      </Card>
    </div>
  )
}

type Tab = 'overview' | 'timeline' | 'communication' | 'tasks' | 'data' | 'ai'

function RelationshipDetail({ entity, navigateTo }: { entity: Entity; navigateTo: (to: string) => void }) {
  const { demoAction } = useToast()
  const [tab, setTab] = useState<Tab>('overview')
  const band = healthBand(entity.relationshipHealthScore)
  const tasks = tasksByEntity(entity.id)
  const emails = emailsByEntity(entity.id)
  const teams = teamsByEntity(entity.id)
  const meetings = meetingsByEntity(entity.id)
  const metrics = metricsByEntity(entity.id)
  const insight = insightByEntity(entity.id)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'communication', label: 'Communication' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'data', label: 'Data' },
    { id: 'ai', label: 'AI Recommendation' },
  ]

  return (
    <div className="oac-fade-in">
      <PageHeader title="Relationship 360" subtitle="One place for every meeting, email, Teams message, task, report, and data insight." />

      {/* Header card */}
      <Card className="mb-5">
        <div className="mb-4 max-w-xs">
          <EntitySelector value={entity.id} onChange={(id) => navigateTo(`/relationship/${id}`)} label="Switch relationship" />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-lg font-bold text-white shadow-sm">{initials(entity.name)}</span>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{entity.name}</h2>
                <Badge tone={bandTone[band]} dot>{band}</Badge>
              </div>
              <div className="mt-1 text-sm text-slate-500">Owner {entity.owner} · {entity.region} · Last contact {formatDate(entity.lastContactDate)} ({daysAgo(entity.lastContactDate)})</div>
              <div className="mt-2.5"><ContextBadge context={entity.detectedContext} confidence={entity.contextConfidence} /></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Donut value={entity.relationshipHealthScore} label={`${entity.relationshipHealthScore}`} tone={entity.relationshipHealthScore < 60 ? '#e11d48' : '#1f48f0'} />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Health Score</div>
              <div className="text-sm font-semibold text-slate-700">{band}</div>
            </div>
          </div>
        </div>

        {/* Next best action banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white"><BoltIcon /></span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-brand-600">Next Best Action</div>
              <div className="text-sm font-medium text-slate-800">{entity.nextBestAction}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigateTo(`/email?entity=${entity.id}`)}>Draft Email</Button>
            <Button size="sm" variant="secondary" onClick={() => navigateTo(`/report?entity=${entity.id}`)}>Create Report</Button>
            <Button size="sm" variant="demo" onClick={() => demoAction('Save to Timeline Demo')}>Save to Timeline Demo</Button>
          </div>
        </div>
      </Card>

      {/* Main AI summary */}
      <InsightBox label="OAC Relationship Summary" title={`What's happening with ${entity.name}?`} variant={entity.relationshipHealthScore < 60 ? 'critical' : 'ai'}>
        {entity.summary}
        <div className="mt-2 text-xs text-slate-400">Generated from meetings, emails, Teams, Excel, and internal DB · AI Engine Demo</div>
      </InsightBox>

      {/* Tabs */}
      <div className="mb-5 mt-5 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition ${tab === t.id ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'}`}>
            {t.label}
            {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab entity={entity} demoAction={demoAction} navigateTo={navigateTo} />}
      {tab === 'timeline' && <TimelineTab entity={entity} />}
      {tab === 'communication' && <CommunicationTab emails={emails} teams={teams} meetings={meetings} demoAction={demoAction} />}
      {tab === 'tasks' && <TasksTab tasks={tasks} demoAction={demoAction} />}
      {tab === 'data' && <DataTab entity={entity} navigateTo={navigateTo} demoAction={demoAction} />}
      {tab === 'ai' && insight && <AITab entity={entity} navigateTo={navigateTo} demoAction={demoAction} />}
    </div>
  )

  function OverviewTab({ entity, demoAction, navigateTo }: { entity: Entity; demoAction: (l: string) => void; navigateTo: (to: string) => void }) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Current Focus & Opportunity" />
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Current Focus</div>
                <p className="text-sm font-medium text-slate-700">{entity.currentFocus}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Opportunity</div>
                <p className="text-sm text-slate-600">{entity.opportunity}</p>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Recommended Action" subtitle="OAC strategy" />
            <p className="text-sm leading-relaxed text-slate-700">{entity.recommendedAction}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="demo" onClick={() => demoAction('Create Task Demo')}>Create Task Demo</Button>
              <Button size="sm" variant="secondary" onClick={() => navigateTo(`/email?entity=${entity.id}`)}>Draft the email</Button>
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Open Issues" />
            <ul className="space-y-2">
              {entity.openIssues.map((i, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{i}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Risks" />
            <ul className="space-y-2">
              {entity.risks.map((r, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{r}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Related Data Sources" />
            <div className="flex flex-wrap gap-1.5">
              {entity.relatedSources.map((s) => <Badge key={s} tone="slate" dot>{s} Connected Demo</Badge>)}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  function TimelineTab({ entity }: { entity: Entity }) {
    const entries: TimelineEntry[] = []
    for (const m of meetingsByEntity(entity.id)) entries.push({ date: m.date, source: 'Meeting Recorder', title: m.title, detail: m.aiSummary })
    for (const e of emailsByEntity(entity.id)) entries.push({ date: e.date, source: 'Outlook', title: e.subject, detail: e.summary })
    for (const t of teamsByEntity(entity.id)) entries.push({ date: t.date, source: 'Teams', title: `${t.channel} · ${t.sender}`, detail: t.messageSummary })
    for (const t of tasksByEntity(entity.id)) entries.push({ date: t.dueDate, source: 'Internal DB', title: `Task: ${t.title}`, detail: t.aiReason })
    entries.sort((a, b) => b.date.localeCompare(a.date))
    return (
      <Card>
        <CardHeader title="Activity Timeline" subtitle="Unified across meetings, emails, Teams, tasks & reports" />
        <Timeline entries={entries} />
      </Card>
    )
  }

  function CommunicationTab({ emails, teams, meetings, demoAction }: any) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Outlook" subtitle={`${emails.length} · Connected Demo`} />
          {emails.length ? emails.map((e: any) => (
            <div key={e.id} className="mb-2.5 rounded-lg border border-slate-100 p-3 last:mb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-700">{e.subject}</span>
                {e.followUpNeeded && <Badge tone="brand">Follow-up</Badge>}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">{e.from} · {formatDate(e.date)}</div>
              <p className="mt-1.5 text-xs text-slate-500">{e.summary}</p>
              <p className="mt-1 text-[11px] text-brand-700"><span className="font-semibold">AI intent:</span> {e.aiIntent}</p>
            </div>
          )) : <p className="text-sm text-slate-400">No emails.</p>}
        </Card>
        <Card>
          <CardHeader title="Teams" subtitle={`${teams.length} · Connected Demo`} />
          {teams.length ? teams.map((t: any) => (
            <div key={t.id} className="mb-3 last:mb-0">
              <div className="text-xs text-slate-400"><span className="font-semibold text-slate-600">{t.sender}</span> in {t.channel} · {formatDate(t.date)}</div>
              <div className="mt-1 rounded-lg rounded-tl-sm bg-slate-50 p-2.5 text-sm text-slate-700">{t.messageSummary}</div>
              <p className="mt-1 text-[11px] text-amber-700"><span className="font-semibold">AI issue:</span> {t.aiExtractedIssue}</p>
            </div>
          )) : <p className="text-sm text-slate-400">No Teams messages.</p>}
          <Button size="sm" variant="demo" className="mt-3 w-full" onClick={() => demoAction('Post to Teams Demo')}>Post to Teams Demo</Button>
        </Card>
        <Card>
          <CardHeader title="Meetings" subtitle={`${meetings.length} · Recorder Demo`} />
          {meetings.length ? meetings.map((m: any) => (
            <div key={m.id} className="mb-2.5 rounded-lg border border-slate-100 p-3 last:mb-0">
              <div className="text-sm font-medium text-slate-700">{m.title}</div>
              <div className="mt-0.5 text-[11px] text-slate-400">{formatDate(m.date)} · {m.followUps.length} follow-ups</div>
              <p className="mt-1.5 line-clamp-3 text-xs text-slate-500">{m.aiSummary}</p>
            </div>
          )) : <p className="text-sm text-slate-400">No meetings.</p>}
        </Card>
      </div>
    )
  }

  function TasksTab({ tasks, demoAction }: any) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tasks.map((t: any) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800">{t.title}</span>
                <Badge tone={t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'amber' : 'slate'}>{t.priority}</Badge>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">{t.owner} · due {formatDate(t.dueDate)} · {t.status} · via {t.source}</div>
              <p className="mt-2 rounded-lg bg-brand-50/60 p-2 text-xs italic text-slate-600">AI reason: {t.aiReason}</p>
            </Card>
          ))}
        </div>
        <Button variant="demo" size="sm" className="mt-4" onClick={() => demoAction('Create Task Demo')}>Create Task Demo</Button>
      </div>
    )
  }

  function DataTab({ entity, navigateTo, demoAction }: { entity: Entity; navigateTo: (to: string) => void; demoAction: (l: string) => void }) {
    const m = metricsByEntity(entity.id)
    if (!m) return <Card><p className="text-sm text-slate-400">No data connected.</p></Card>

    if (m.kind === 'booking') {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Bookings / mo" value={formatNumber(m.bookings)} />
            <MetricCard label="TTV" value={formatUsd(m.ttv)} />
            <MetricCard label="Net Revenue" value={formatUsd(m.netRevenue)} />
            <MetricCard label="Avg Booking Value" value={`$${m.averageBookingValue}`} />
            <MetricCard label="Cancellation Rate" value={formatPct(m.cancellationRate)} deltaTone={m.cancellationRate > 10 ? 'down' : 'neutral'} delta={m.cancellationRate > 10 ? 'High' : 'OK'} />
            <MetricCard label="Failure Rate" value={formatPct(m.failureRate)} deltaTone={m.failureRate > 5 ? 'down' : 'up'} delta={m.failureRate > 5 ? 'Elevated' : 'Healthy'} />
            <MetricCard label="Top Destination" value={m.topDestinations[0]?.name ?? '—'} />
            <MetricCard label="Direct Contract" value={formatPct(m.directContractRatio)} />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="6-Month Booking Trend" subtitle="Excel Connected Demo" />
              <div className="flex justify-center py-4"><Sparkline data={m.monthlyTrend.map((p) => p.bookings)} width={520} height={120} tone={m.failureRate > 5 ? '#e11d48' : '#1f48f0'} /></div>
            </Card>
            <Card>
              <CardHeader title="Direct vs Third-Party" />
              <div className="flex items-center justify-around py-2">
                <div className="text-center"><Donut value={m.directContractRatio} label={`${m.directContractRatio}%`} /><div className="mt-1 text-[11px] text-slate-500">Direct</div></div>
                <div className="text-center"><Donut value={m.thirdPartyInventoryRatio} label={`${m.thirdPartyInventoryRatio}%`} tone="#7c3aed" /><div className="mt-1 text-[11px] text-slate-500">Third-party</div></div>
              </div>
            </Card>
          </div>
          <InsightBox label="OAC reads the data" title="What does the data mean?">{m.aiComment}</InsightBox>
          <div className="flex gap-2">
            <Button variant="demo" size="sm" onClick={() => demoAction('Export Excel Demo')}>Export Excel Demo</Button>
            <Button variant="secondary" size="sm" onClick={() => navigateTo(`/data?entity=${entity.id}`)}>Open full Data Insight</Button>
          </div>
        </div>
      )
    }

    // operational
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <MetricCard label="Pending Confirmations" value={m.pendingConfirmationCount} />
          <MetricCard label="Open Issues" value={entity.openIssues.length} />
          <MetricCard label="Risk Level" value={m.riskLevel} deltaTone={m.riskLevel === 'High' ? 'down' : m.riskLevel === 'Low' ? 'up' : 'neutral'} delta={m.communicationActivity + ' activity'} />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Operational Readiness" subtitle="Internal DB Connected Demo" />
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs"><span className="text-slate-500">Product setup progress</span><span className="font-semibold text-slate-700">{m.productSetupProgress}%</span></div>
                <GaugeBar value={m.productSetupProgress} />
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusChip label="Contract readiness" value={m.contractReadiness} />
                <StatusChip label="Rate status" value={m.rateStatus} />
                <StatusChip label="Policy confirmation" value={m.policyConfirmationStatus} />
                <StatusChip label="Communication" value={m.communicationActivity} />
                <StatusChip label="Risk level" value={m.riskLevel} />
              </div>
            </div>
          </Card>
          <InsightBox label="OAC reads the operation" title="Operational status">{m.aiComment}</InsightBox>
        </div>
        <Button variant="demo" size="sm" onClick={() => demoAction('Export Excel Demo')}>Export Excel Demo</Button>
      </div>
    )
  }

  function AITab({ entity, navigateTo, demoAction }: { entity: Entity; navigateTo: (to: string) => void; demoAction: (l: string) => void }) {
    const insight = insightByEntity(entity.id)!
    const seed = draftSeedForEntity(entity.id)
    const ceo = reportByEntityAndType(entity.id, 'CEO Briefing') ?? reportByEntityAndType(entity.id, 'API Integration Review')
    const internal = teamsByEntity(entity.id)[0]?.aiExtractedIssue
    const external = emailsByEntity(entity.id)[0]?.aiIntent

    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <InsightBox label="Recommended Strategy" title={insight.strategicDirection}>
            <div className="text-sm">{insight.insightSummary}</div>
          </InsightBox>
          <Card>
            <CardHeader title="Immediate Action" />
            <p className="text-sm font-medium text-brand-700">{insight.nextBestAction}</p>
            <ul className="mt-2 space-y-1.5">
              {insight.recommendedActions.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />{a}</li>
              ))}
            </ul>
          </Card>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader title="Internal Alignment Needed" />
              <p className="text-sm text-slate-600">{internal ?? 'Align owners on the next action and timeline internally.'}</p>
            </Card>
            <Card>
              <CardHeader title="External Communication Needed" />
              <p className="text-sm text-slate-600">{external ?? 'Send the partner a clear summary of next steps.'}</p>
            </Card>
          </div>
        </div>
        <div className="space-y-5">
          <Card className="border-rose-100 bg-rose-50/40">
            <CardHeader title="Risk Warning" />
            <ul className="space-y-2">
              {insight.riskWarnings.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{r}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Suggested Email" />
            <p className="text-sm font-medium text-slate-800">{seed ? seed.subject : `Email for ${entity.name}`}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{seed?.to ?? 'partner contact'}</p>
            <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => navigateTo(`/email?entity=${entity.id}`)}>Open in Email Assistant</Button>
          </Card>
          <Card>
            <CardHeader title="Suggested Report" />
            <p className="text-sm font-medium text-slate-800">{ceo ? ceo.title : `${entity.name} — Status Report`}</p>
            <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{ceo?.sections[0]?.body}</p>
            <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => navigateTo(`/report?entity=${entity.id}`)}>Open in Report Generator</Button>
          </Card>
          <Button variant="demo" className="w-full" onClick={() => demoAction('Post to Teams Demo')}>Post Recommendation to Teams Demo</Button>
        </div>
      </div>
    )
  }

  function StatusChip({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-lg border border-slate-100 px-2.5 py-1.5">
        <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
        <Badge tone={statusTone[value] ?? 'slate'}>{value}</Badge>
      </div>
    )
  }
}

function BoltIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg> }
