import { useState, useEffect, useCallback, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge, type BadgeTone } from '../components/Badge'
import { Button } from '../components/Button'
import { ContextBadge } from '../components/ContextBadge'
import { InsightBox } from '../components/InsightBox'
import { Timeline, type TimelineEntry } from '../components/Timeline'
import { MetricCard } from '../components/MetricCard'
import { Donut } from '../components/DemoChart'
import { useToast } from '../components/Toast'
import { useT } from '../i18n'
import { useCaptureStore, type CaptureEntry } from '../data/captureStore'
import { useRelationships } from '../data/useRelationships'
import { useDatasets } from '../data/datasetStore'
import { useAiSettings } from '../utils/aiSettings'
import { callText } from '../utils/aiClient'
import { datasetMetricsFor } from '../data/datasetRelationships'
import { healthBand, type Entity } from '../data/entities'
import { formatDate, daysAgo, initials } from '../utils/format'

const bandTone: Record<string, BadgeTone> = {
  Healthy: 'green',
  Stable: 'sky',
  Watch: 'amber',
  'At Risk': 'red',
}

export function Relationship360() {
  const { id } = useParams()
  const navigate = useNavigate()
  const rel = useRelationships()
  const recents = useRecentSearches()

  if (rel.list.length === 0) return <RelationshipEmpty />

  const pick = (e: PickTarget) => {
    recents.add(e)
    navigate(`/relationship/${e.id}`)
  }

  const entity = id ? rel.byId(id) : undefined
  // No company selected yet → search-first hub.
  if (!entity) return <RelationshipHub list={rel.list} recents={recents} onPick={pick} />
  return (
    <RelationshipDetail
      entity={entity}
      list={rel.list}
      recents={recents}
      onPick={pick}
      key={entity.id}
      navigateTo={navigate}
    />
  )
}

function RelationshipEmpty() {
  const navigate = useNavigate()
  const { t } = useT()
  return (
    <div className="oac-fade-in">
      <PageHeader title={t('page.relationship.title')} subtitle={t('page.relationship.subtitle')} />
      <Card className="flex flex-col items-center py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg></span>
        <h2 className="mt-4 text-lg font-bold text-slate-900">{t('rel.emptyTitle')}</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{t('rel.emptyDesc')}</p>
        <Button className="mt-4" onClick={() => navigate('/assistant')}>{t('nav.assistant')} →</Button>
      </Card>
    </div>
  )
}

type Tab = 'overview' | 'timeline' | 'communication' | 'tasks' | 'data' | 'ai'

// B-6: a synthesized briefing from the real captured history — last contact,
// open work, risks, recommended next move. Deterministic by default; AI on demand.
function deterministicBriefing(entity: Entity, overlay: CaptureEntry[], nextBestAction: string, lang: 'en' | 'ko'): string {
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const openTodos = overlay.flatMap((e) => e.todos.filter((t) => !t.done))
  const risks = overlay.flatMap((e) => e.risks)
  const last = overlay[0]
  const days = last ? daysAgo(last.date) : ''
  const parts: string[] = []
  parts.push(L(
    `${entity.name}와(과)의 최근 접점은 ${formatDate(last.date)}(${days}) "${last.timeline.title}"였고, 지금까지 ${overlay.length}건의 기록이 있습니다.`,
    `Last touch with ${entity.name} was ${formatDate(last.date)} (${days}) — "${last.timeline.title}". ${overlay.length} record(s) so far.`,
  ))
  if (openTodos.length) {
    parts.push(L(
      `미완료 할 일 ${openTodos.length}건${openTodos[0] ? ` (예: ${openTodos[0].text})` : ''}.`,
      `${openTodos.length} open to-do(s)${openTodos[0] ? ` (e.g. ${openTodos[0].text})` : ''}.`,
    ))
  }
  if (risks.length) {
    parts.push(L(`주의 리스크 ${risks.length}건: ${risks[0]}.`, `${risks.length} risk(s) flagged: ${risks[0]}.`))
  }
  parts.push(L(`권장 다음 액션: ${nextBestAction}`, `Recommended next: ${nextBestAction}`))
  return parts.join(' ')
}

function AutoBriefing({ entity, overlay, nextBestAction, lang }: { entity: Entity; overlay: CaptureEntry[]; nextBestAction: string; lang: 'en' | 'ko' }) {
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const ai = useAiSettings()
  const [aiText, setAiText] = useState('')
  const [busy, setBusy] = useState(false)
  const base = deterministicBriefing(entity, overlay, nextBestAction, lang)

  const askAi = async () => {
    if (busy || !ai.isLive) return
    setBusy(true)
    try {
      const history = overlay.slice(0, 10).map((e) => `- ${e.date} [${e.kind ?? 'note'}] ${e.timeline.title}: ${e.summary}${e.detail ? ` — ${e.detail.slice(0, 200)}` : ''}`).join('\n')
      const openTodos = overlay.flatMap((e) => e.todos.filter((t) => !t.done)).map((t) => `- ${t.text} (${t.due})`).join('\n')
      const risks = overlay.flatMap((e) => e.risks).map((r) => `- ${r}`).join('\n')
      const system = L(
        '당신은 오마이호텔 B2B 관계 매니저입니다. 주어진 실제 히스토리만 근거로, 이 관계의 현황 브리핑을 4~5문장으로 작성하세요: 지금 상태, 진행 중 이슈/할 일, 리스크, 그리고 다음에 해야 할 가장 중요한 1가지. 구체적 날짜/내용을 인용하고 데이터에 없는 건 추측하지 마세요. 한국어로.',
        'You are an Ohmyhotel B2B relationship manager. Using ONLY the real history below, write a 4-5 sentence status briefing: where things stand, in-flight issues/to-dos, risks, and the single most important next move. Cite concrete dates/items; never invent anything not present.',
      )
      const user = `Relationship: ${entity.name} [${entity.detectedContext}]\nHealth: ${entity.relationshipHealthScore}\n\nHistory:\n${history}\n\nOpen to-dos:\n${openTodos || '(none)'}\n\nRisks:\n${risks || '(none)'}`
      const text = await callText({ provider: ai.provider, apiKey: ai.activeKey, model: ai.model, system, user })
      setAiText(text || base)
    } catch {
      setAiText(L('AI 브리핑 생성에 실패했습니다.', 'Could not generate an AI briefing.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/70 via-white to-white p-4 dark:bg-none">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-white"><BoltIcon /></span>
          <span className="text-xs font-bold uppercase tracking-wide text-brand-700">{L('자동 브리핑', 'Auto briefing')}</span>
        </div>
        {ai.isLive && (
          <button onClick={askAi} disabled={busy} className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50">
            {busy ? L('AI 분석 중…', 'Analyzing…') : aiText ? L('다시 생성', 'Regenerate') : L('✨ AI 브리핑', '✨ AI briefing')}
          </button>
        )}
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">{aiText || base}</p>
      {aiText && <span className="mt-1.5 block text-[9px] uppercase tracking-wide text-brand-400">{L('AI 생성', 'AI generated')} · {ai.model.replace('claude-', '')}</span>}
    </div>
  )
}

function RelationshipDetail({ entity, list, recents, onPick, navigateTo }: { entity: Entity; list: Entity[]; recents: RecentSearches; onPick: (e: PickTarget) => void; navigateTo: (to: string) => void }) {
  const { demoAction } = useToast()
  const { t, lang } = useT()
  const store = useCaptureStore()
  const [tab, setTab] = useState<Tab>('overview')
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)

  // Remember this company as a recent search whenever it's viewed.
  useEffect(() => {
    recents.add({ id: entity.id, name: entity.name })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.id])
  const band = healthBand(entity.relationshipHealthScore)
  const datasets = useDatasets()
  const dataRef = datasetMetricsFor(datasets.snapshots, entity.name) // imported ¥ metrics for this hotel/seller, if any

  // Overlay: everything captured/synced for this relationship (assistant notes,
  // synced Outlook mail (in/sent), Teams, reviews, AI updates). All REAL data.
  const overlay = store.entriesByEntity(entity.id) // newest first
  const overlayNext = overlay.find((e) => e.nextBestAction)?.nextBestAction
  const nextBestAction = overlayNext ?? entity.nextBestAction
  const latestUpdate = overlay[0]
  const commEntries = overlay.filter((e) => e.kind === 'email' || e.kind === 'meeting')
  const reviewEntries = overlay.filter((e) => e.kind === 'review' || e.kind === 'update')

  const tabs: { id: Tab; tKey: string }[] = [
    { id: 'overview', tKey: 'tab.overview' },
    { id: 'timeline', tKey: 'tab.timeline' },
    { id: 'communication', tKey: 'tab.communication' },
    { id: 'tasks', tKey: 'tab.tasks' },
    { id: 'data', tKey: 'tab.data' },
    { id: 'ai', tKey: 'tab.ai' },
  ]

  return (
    <div className="oac-fade-in">
      <PageHeader title={t('page.relationship.title')} subtitle={t('page.relationship.subtitle')} />

      {/* Header card */}
      <Card className="mb-5">
        <div className="mb-4">
          <RelationshipSearchBar list={list} onPick={onPick} placeholder={L('다른 업체·호텔·파트너 검색…', 'Search another company, hotel, partner…')} />
          {recents.items.filter((r) => r.id !== entity.id).length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">{L('최근', 'Recent')}</span>
              {recents.items.filter((r) => r.id !== entity.id).slice(0, 6).map((r) => (
                <button key={r.id} onClick={() => onPick(r)} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:bg-white/5">
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-lg font-bold text-white shadow-sm">{initials(entity.name)}</span>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{entity.name}</h2>
                <Badge tone={bandTone[band]} dot>{band}</Badge>
              </div>
              <div className="mt-1 text-sm text-slate-500">{t('l.owner')} {entity.owner} · {entity.region} · {t('l.lastContact')} {formatDate(entity.lastContactDate)} ({daysAgo(entity.lastContactDate)})</div>
              <div className="mt-2.5"><ContextBadge context={entity.detectedContext} confidence={entity.contextConfidence} /></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Donut value={entity.relationshipHealthScore} label={`${entity.relationshipHealthScore}`} tone={entity.relationshipHealthScore < 60 ? '#e11d48' : '#1f48f0'} />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{t('l.healthScore')}</div>
              <div className="text-sm font-semibold text-slate-700">{band}</div>
            </div>
          </div>
        </div>

        {/* Next best action banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white"><BoltIcon /></span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-brand-600">{t('l.nextBestAction')}</div>
              <div className="text-sm font-medium text-slate-800">{nextBestAction}</div>
              {overlayNext && <div className="mt-0.5 text-[10px] font-medium text-brand-500">{t('rel.updatedByAssistant')} · {formatDate(latestUpdate!.date)}</div>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigateTo(`/assistant?q=${encodeURIComponent(lang === 'ko' ? `${entity.name}에 보낼 메일 작성해줘` : `Draft an email to ${entity.name}`)}`)}>{t('b.draftEmail')}</Button>
            <Button size="sm" variant="secondary" onClick={() => navigateTo(`/assistant?q=${encodeURIComponent(lang === 'ko' ? `${entity.name} 리포트 작성해줘` : `Create a report for ${entity.name}`)}`)}>{t('b.createReport')}</Button>
            <Button size="sm" variant="demo" onClick={() => navigateTo(`/assistant?q=${encodeURIComponent(lang === 'ko' ? `${entity.name} 진행상황 어때?` : `What's the status on ${entity.name}?`)}`)}>{t('rel.askAssistant')}</Button>
          </div>
        </div>
      </Card>

      {/* B-6: auto briefing — synthesized from the real captured history */}
      {overlay.length > 0 && <AutoBriefing entity={entity} overlay={overlay} nextBestAction={nextBestAction} lang={lang} />}

      {/* Main AI summary */}
      <InsightBox label={t('l.relSummary')} title={`${entity.name} — ${t('l.whatsHappening')}`} variant={entity.relationshipHealthScore < 60 ? 'critical' : 'ai'}>
        {entity.summary}
        <div className="mt-2 text-xs text-slate-500">{t('l.generatedFrom')}</div>
      </InsightBox>

      {/* Latest from the OAC Assistant */}
      {overlay.length > 0 && (
        <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4 dark:bg-brand-500/10">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-white"><BoltIcon /></span>
            <span className="text-xs font-bold uppercase tracking-wide text-violet-700">{t('rel.latestFromAssistant')}</span>
          </div>
          <ul className="space-y-2.5">
            {overlay.slice(0, 4).map((u) => (
              <li key={u.id} className="rounded-lg border border-slate-100 bg-white/70 p-2.5 dark:bg-white/5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-800">{u.timeline.title}</span>
                  <span className="text-[11px] text-slate-500">{formatDate(u.date)} · {daysAgo(u.date)}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600">{u.summary}</p>
                {u.detail && <p className="mt-1 line-clamp-3 whitespace-pre-line text-[11px] text-slate-500">{u.detail}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 mt-5 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={`relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition ${tab === tb.id ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'}`}>
            {t(tb.tKey)}
            {tab === tb.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'timeline' && <TimelineTab />}
      {tab === 'communication' && <CommunicationTab />}
      {tab === 'tasks' && <TasksTab />}
      {tab === 'data' && <DataTab />}
      {tab === 'ai' && <AITab />}
    </div>
  )

  function OverviewTab() {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title={t('l.currentFocusOpp')} />
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t('l.currentFocus')}</div>
                <p className="text-sm font-medium text-slate-700">{entity.currentFocus || L('아직 정리된 포커스가 없습니다.', 'No focus captured yet.')}</p>
              </div>
              {entity.opportunity && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t('l.opportunity')}</div>
                  <p className="text-sm text-slate-600">{entity.opportunity}</p>
                </div>
              )}
            </div>
          </Card>
          <Card>
            <CardHeader title={t('l.recommendedAction')} subtitle={t('l.oacStrategy')} />
            <p className="text-sm leading-relaxed text-slate-700">{entity.recommendedAction}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigateTo(`/assistant?q=${encodeURIComponent(lang === 'ko' ? `${entity.name} 진행상황 어때?` : `What's the status on ${entity.name}?`)}`)}>{t('rel.askAssistant')}</Button>
              <Button size="sm" variant="secondary" onClick={() => navigateTo(`/assistant?q=${encodeURIComponent(lang === 'ko' ? `${entity.name}에 보낼 메일 작성해줘` : `Draft an email to ${entity.name}`)}`)}>{t('l.draftTheEmail')}</Button>
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          {entity.openIssues.length > 0 && (
            <Card>
              <CardHeader title={t('l.openIssues')} />
              <ul className="space-y-2">
                {entity.openIssues.map((i, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{i}</li>
                ))}
              </ul>
            </Card>
          )}
          {entity.risks.length > 0 && (
            <Card>
              <CardHeader title={t('l.risks')} />
              <ul className="space-y-2">
                {entity.risks.map((r, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{r}</li>
                ))}
              </ul>
            </Card>
          )}
          <Card>
            <CardHeader title={t('l.relatedSources')} />
            <div className="flex flex-wrap gap-1.5">
              {entity.relatedSources.map((s) => <Badge key={s} tone="slate" dot>{s}</Badge>)}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  function TimelineTab() {
    const entries: TimelineEntry[] = overlay.map((u) => ({
      date: u.date,
      source: u.detectedContext || 'OAC',
      title: u.timeline.title,
      detail: u.detail ? `${u.summary}\n${u.detail.split('\n')[0]}` : u.summary,
    }))
    entries.sort((a, b) => b.date.localeCompare(a.date))
    if (!entries.length) return <Card><p className="py-6 text-center text-sm text-slate-500">{L('아직 활동 기록이 없습니다. OAC 어시스턴트에 입력하거나 Microsoft 365를 동기화하세요.', 'No activity yet. Add notes in the assistant or sync Microsoft 365.')}</p></Card>
    return (
      <Card>
        <CardHeader title={L('활동 타임라인', 'Activity Timeline')} subtitle={L('메일·Teams·메모·검수·AI 업데이트 통합', 'Mail · Teams · notes · reviews · AI updates')} />
        <Timeline entries={entries} />
      </Card>
    )
  }

  function CommunicationTab() {
    const mails = commEntries.filter((e) => e.kind === 'email')
    const msgs = commEntries.filter((e) => e.kind === 'meeting')
    if (!commEntries.length) {
      return (
        <Card className="flex flex-col items-center py-10 text-center">
          <p className="text-sm text-slate-500">{L('동기화된 메일/메시지가 없습니다.', 'No synced mail or messages.')}</p>
          <Button size="sm" className="mt-3" onClick={() => navigateTo('/settings')}>{L('설정 → Microsoft 365 동기화', 'Settings → Sync Microsoft 365')} →</Button>
        </Card>
      )
    }
    const Col = ({ title, items, empty }: { title: string; items: typeof mails; empty: string }) => (
      <Card>
        <CardHeader title={title} subtitle={`${items.length}`} />
        {items.length ? items.slice(0, 12).map((e) => (
          <div key={e.id} className="mb-2.5 rounded-lg border border-slate-100 p-3 last:mb-0 dark:border-white/10">
            <div className="truncate text-sm font-medium text-slate-700">{e.timeline.title}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{e.detectedContext} · {formatDate(e.date)}</div>
            <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-xs text-slate-500">{e.detail || e.summary}</p>
          </div>
        )) : <p className="text-sm text-slate-500">{empty}</p>}
      </Card>
    )
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Col title={L('메일 (Outlook)', 'Mail (Outlook)')} items={mails} empty={L('메일 없음', 'No mail')} />
        <Col title={L('Teams / 미팅', 'Teams / Meetings')} items={msgs} empty={L('메시지 없음', 'No messages')} />
      </div>
    )
  }

  function TasksTab() {
    const todos = overlay.flatMap((u) => u.todos.map((td) => ({ ...td, entryId: u.id })))
    if (!todos.length) return <Card><p className="py-6 text-center text-sm text-slate-500">{L('진행 중 할 일이 없습니다. 어시스턴트에 "다음주까지 법무 검토 필요" 처럼 입력하면 할 일로 잡힙니다.', 'No open to-dos. Tell the assistant a follow-up and it becomes a task.')}</p></Card>
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {todos.map((td) => (
          <Card key={td.id}>
            <button onClick={() => store.toggleTodo(td.entryId, td.id)} className="flex w-full items-start gap-2 text-left">
              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${td.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>{td.done && <span className="text-[9px] text-white">✓</span>}</span>
              <span className="min-w-0 flex-1">
                <span className={`text-sm font-medium ${td.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{td.text}</span>
                <span className="mt-1 flex items-center gap-2 text-[11px] text-slate-500"><Badge tone={td.priority === 'High' ? 'red' : td.priority === 'Medium' ? 'amber' : 'slate'}>{td.priority}</Badge> {td.due ? `${L('마감', 'due')} ${formatDate(td.due)}` : ''}</span>
              </span>
            </button>
          </Card>
        ))}
      </div>
    )
  }

  function DataTab() {
    const yen = (n: number) => '¥' + Math.round(n).toLocaleString()
    if (!dataRef) {
      return (
        <Card className="flex flex-col items-center py-10 text-center">
          <p className="text-sm text-slate-500">{L('이 관계에 연결된 RawData가 없습니다.', 'No RawData linked to this relationship.')}</p>
          <Button size="sm" className="mt-3" onClick={() => navigateTo('/data')}>{L('데이터 인사이트 열기', 'Open Data Insight')} →</Button>
        </Card>
      )
    }
    const { group, snapshot } = dataRef
    return (
      <div className="space-y-5">
        <div className="text-xs text-slate-500">{snapshot.profile === 'booking' ? 'Booking' : 'Check Out'} · {snapshot.periodLabel} · {group.rows.toLocaleString()}{L('건', ' rows')}</div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {snapshot.mapping.metrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.label.includes('¥') ? yen(group.metrics[m.label] ?? 0) : Math.round(group.metrics[m.label] ?? 0).toLocaleString()} />
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigateTo('/data')}>{L('전체 데이터 인사이트 열기', 'Open full Data Insight')} →</Button>
      </div>
    )
  }

  function AITab() {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <InsightBox label={L('OAC 전략', 'OAC strategy')} title={nextBestAction}>
            <div className="text-sm">{entity.recommendedAction}</div>
          </InsightBox>
          {reviewEntries.length > 0 ? (
            <Card>
              <CardHeader title={L('AI 검수 · 업데이트', 'AI reviews · updates')} />
              <ul className="space-y-2.5">
                {reviewEntries.slice(0, 6).map((u) => (
                  <li key={u.id} className="rounded-lg border border-slate-100 p-2.5 dark:border-white/10">
                    <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-slate-800">{u.timeline.title}</span><span className="text-[11px] text-slate-500">{formatDate(u.date)}</span></div>
                    <p className="mt-0.5 text-xs text-slate-600">{u.summary}</p>
                    {u.detail && <p className="mt-1 line-clamp-3 whitespace-pre-line text-[11px] text-slate-500">{u.detail}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card><p className="py-4 text-center text-sm text-slate-500">{L('AI 검수/업데이트가 아직 없습니다. 어시스턴트에 "SLA 검수해줘" 등으로 요청하세요.', 'No AI reviews yet. Ask the assistant, e.g. "review the SLA".')}</p></Card>
          )}
        </div>
        <div className="space-y-5">
          {entity.risks.length > 0 && (
            <Card className="border-rose-100 bg-rose-50/40">
              <CardHeader title={t('l.risks')} />
              <ul className="space-y-2">
                {entity.risks.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{r}</li>
                ))}
              </ul>
            </Card>
          )}
          <Card>
            <CardHeader title={L('메일 작성', 'Draft email')} />
            <Button size="sm" variant="secondary" className="w-full" onClick={() => navigateTo(`/assistant?q=${encodeURIComponent(lang === 'ko' ? `${entity.name}에 보낼 메일 작성해줘` : `Draft an email to ${entity.name}`)}`)}>{t('cap.draftEmail')}</Button>
          </Card>
          <Card>
            <CardHeader title={L('리포트 작성', 'Create report')} />
            <Button size="sm" variant="secondary" className="w-full" onClick={() => navigateTo(`/assistant?q=${encodeURIComponent(lang === 'ko' ? `${entity.name} 리포트 작성해줘` : `Create a report for ${entity.name}`)}`)}>{t('cap.genReport')}</Button>
          </Card>
        </div>
      </div>
    )
  }
}

function BoltIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg> }
function SearchIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg> }

// ── search-first hub ─────────────────────────────────────────────────────────
export interface PickTarget { id: string; name: string }
export interface RecentSearches {
  items: PickTarget[]
  add: (e: PickTarget) => void
  clear: () => void
}

const RECENT_KEY = 'oac-recent-rel-v1'

function useRecentSearches(): RecentSearches {
  const [items, setItems] = useState<PickTarget[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) return JSON.parse(raw) as PickTarget[]
    } catch {
      /* ignore */
    }
    return []
  })
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items])
  const add = useCallback((e: PickTarget) => {
    setItems((prev) => [{ id: e.id, name: e.name }, ...prev.filter((x) => x.id !== e.id)].slice(0, 8))
  }, [])
  const clear = useCallback(() => setItems([]), [])
  return { items, add, clear }
}

function matchEntity(e: Entity, q: string): boolean {
  const s = q.trim().toLowerCase()
  if (!s) return false
  return [e.name, e.detectedContext, e.region, e.owner]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(s))
}

function RelationshipSearchBar({
  list,
  onPick,
  placeholder,
  autoFocus,
}: {
  list: Entity[]
  onPick: (e: PickTarget) => void
  placeholder: string
  autoFocus?: boolean
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const results = q.trim() ? list.filter((e) => matchEntity(e, q)).slice(0, 7) : []

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(ev.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (e: PickTarget) => {
    onPick(e)
    setQ('')
    setOpen(false)
  }

  const onKey = (ev: ReactKeyboardEvent) => {
    if (!open || results.length === 0) return
    if (ev.key === 'ArrowDown') { ev.preventDefault(); setActive((a) => (a + 1) % results.length) }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length) }
    else if (ev.key === 'Enter') { ev.preventDefault(); pick(results[Math.min(active, results.length - 1)]) }
    else if (ev.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 dark:bg-white/5">
        <span className="text-slate-500"><SearchIcon /></span>
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none"
        />
        {q && <button onClick={() => setQ('')} className="text-slate-300 hover:text-slate-500">✕</button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:bg-slate-800">
          {results.map((e, i) => (
            <button
              key={e.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(e)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${i === active ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-xs font-bold text-white">{initials(e.name)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">{e.name}</span>
                <span className="block truncate text-[11px] text-slate-500">{e.detectedContext} · {e.region}</span>
              </span>
              <Badge tone={bandTone[healthBand(e.relationshipHealthScore)]}>{e.relationshipHealthScore}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RelationshipHub({ list, recents, onPick }: { list: Entity[]; recents: RecentSearches; onPick: (e: PickTarget) => void }) {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const recentEntities = recents.items.filter((r) => list.some((e) => e.id === r.id))

  return (
    <div className="oac-fade-in">
      <PageHeader title={t('page.relationship.title')} subtitle={t('page.relationship.subtitle')} />
      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        {/* main: search + browse */}
        <div>
          <Card className="mb-5 bg-gradient-to-br from-brand-50/70 to-violet-50/50 dark:from-brand-500/10 dark:to-violet-500/10">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">{L('찾고 싶은 업체·호텔·파트너를 검색하세요', 'Search for any company, hotel or partner')}</h2>
            <p className="mt-1 text-sm text-slate-500">{L('이름만 입력하세요. OAC가 컨텍스트를 찾아 상태를 정리하고 다음 액션을 준비합니다.', 'Just type a name. OAC finds the context, summarizes the status, and prepares the next action.')}</p>
            <div className="mt-3.5">
              <RelationshipSearchBar list={list} onPick={onPick} autoFocus placeholder={L('업체·호텔·파트너 검색…', 'Search company, hotel, partner…')} />
            </div>
          </Card>

          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">{L('전체 관계', 'All relationships')}</span>
            <Badge tone="slate">{list.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((e) => (
              <button key={e.id} onClick={() => onPick(e)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:bg-white/5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-bold text-white">{initials(e.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{e.name}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500">{e.detectedContext}</span>
                </span>
                <Badge tone={bandTone[healthBand(e.relationshipHealthScore)]} dot>{e.relationshipHealthScore}</Badge>
              </button>
            ))}
          </div>
        </div>

        {/* side: recent searches */}
        <aside className="space-y-4">
          <Card>
            <div className="mb-2.5 flex items-center justify-between">
              <CardHeader title={L('최근 검색', 'Recent searches')} />
              {recentEntities.length > 0 && (
                <button onClick={recents.clear} className="text-[11px] font-medium text-slate-500 hover:text-slate-600">{L('지우기', 'Clear')}</button>
              )}
            </div>
            {recentEntities.length === 0 ? (
              <p className="text-xs text-slate-500">{L('검색하면 여기에 최근 본 업체가 쌓입니다.', 'Companies you open will appear here for quick access.')}</p>
            ) : (
              <ul className="space-y-1">
                {recentEntities.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => onPick(r)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-white/5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-white/10">{initials(r.name)}</span>
                      <span className="truncate text-sm font-medium text-slate-700">{r.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-brand-600 to-violet-600 text-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-90"><BoltIcon /> OAC {L('어시스턴트', 'Assistant')}</div>
            <p className="mt-1.5 text-sm leading-relaxed opacity-95">{L('못 찾으셨나요? 어시스턴트에게 자연어로 물어보세요.', "Can't find it? Ask the assistant in plain language.")}</p>
            <Button variant="secondary" size="sm" className="mt-3 !bg-white !text-brand-700" onClick={() => navigate('/assistant')}>{L('어시스턴트 열기', 'Open assistant')} →</Button>
          </Card>
        </aside>
      </div>
    </div>
  )
}
