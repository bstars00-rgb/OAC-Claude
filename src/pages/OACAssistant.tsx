import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge, type BadgeTone } from '../components/Badge'
import { Button } from '../components/Button'
import { ContextBadge } from '../components/ContextBadge'
import { MetricCard } from '../components/MetricCard'
import { useToast } from '../components/Toast'
import { useT } from '../i18n'
import { useAiSettings, AI_MODELS } from '../utils/aiSettings'
import { useCaptureStore } from '../data/captureStore'
import { useDatasets } from '../data/datasetStore'
import { useRelationships } from '../data/useRelationships'
import { runAssistant } from '../utils/assistantEngine'
import type { ChartData } from '../utils/datasetQuery'
import { readAttachment, formatBytes, type Attachment } from '../utils/files'
import type { StructuredCapture, Category } from '../utils/captureAI'
import { formatDate, daysAgo } from '../utils/format'

interface ChatMsg {
  id: number
  role: 'user' | 'assistant'
  text: string
  attachments?: { name: string; kind: string }[]
  thinking?: boolean
  structured?: StructuredCapture
  email?: { to: string; subject: string; body: string }
  report?: { title: string; sections: { heading: string; body: string }[] }
  chart?: ChartData
  entryId?: string
  entityId?: string
  showDetails?: boolean
  showReport?: boolean
  showEmail?: boolean
}

const EXAMPLES: { en: string; ko: string }[] = [
  { en: 'Review the toxic clauses in the SLA Klook sent today', ko: '오늘 KLOOK에서 보내온 SLA의 독소조항을 검수해줘' },
  { en: "What's the status on Klook?", ko: 'Klook 진행상황 어때?' },
  { en: 'Draft an email to iTANK', ko: 'iTANK에 보낼 메일 작성해줘' },
  { en: 'Met Acme today — send the proposal next week, legal to review the NDA. Risk: competitor undercutting our price.', ko: '오늘 Acme 미팅 — 다음주 제안서 발송, 법무 NDA 검토. 리스크: 경쟁사 가격 후려침.' },
]

const catTone: Record<Category, BadgeTone> = {
  Customer: 'brand', Supplier: 'green', Partner: 'violet', Project: 'sky',
  Recruiting: 'amber', Legal: 'slate', Operations: 'red', Finance: 'green', General: 'slate',
}
const catLabel: Record<Category, { en: string; ko: string }> = {
  Customer: { en: 'Customer', ko: '고객사' }, Supplier: { en: 'Supplier', ko: '공급사' },
  Partner: { en: 'Partner', ko: '파트너' }, Project: { en: 'Project', ko: '프로젝트' },
  Recruiting: { en: 'Recruiting', ko: '채용' }, Legal: { en: 'Legal', ko: '법무' },
  Operations: { en: 'Operations', ko: '운영' }, Finance: { en: 'Finance', ko: '재무' }, General: { en: 'General', ko: '일반' },
}

// Seed from the current time so a hot-reload (which resets module state) can't
// collide new message ids with ones already in React state.
let msgSeq = Date.now()

// ── projects + conversations (ChatGPT-style, fully persisted) ────────────────
interface Project { id: string; name: string }
interface Conversation { id: string; projectId: string; title: string; messages: ChatMsg[]; updatedAt: number }
interface ChatState { projects: Project[]; conversations: Conversation[]; activeId: string }

const CHATS_KEY = 'oac-chats-v2'
let idSeq = 0
const newId = (p: string) => `${p}-${Date.now().toString(36)}-${(idSeq++).toString(36)}`
const defaultTitle = (lang: 'en' | 'ko') => (lang === 'ko' ? '새 대화' : 'New chat')

function defaultState(lang: 'en' | 'ko'): ChatState {
  const pid = 'p-default'
  const cid = newId('c')
  return { projects: [{ id: pid, name: lang === 'ko' ? '일반' : 'General' }], conversations: [{ id: cid, projectId: pid, title: defaultTitle(lang), messages: [], updatedAt: Date.now() }], activeId: cid }
}

function loadChats(lang: 'en' | 'ko'): ChatState {
  try {
    const raw = localStorage.getItem(CHATS_KEY)
    if (raw) {
      const s = JSON.parse(raw) as ChatState
      if (s.conversations?.length && s.projects?.length) return s
    }
    // migrate the old single conversation (oac-chat-v1) into a default project
    const old = localStorage.getItem('oac-chat-v1')
    if (old) {
      const msgs = (JSON.parse(old) as ChatMsg[]).filter((m) => !m.thinking)
      const st = defaultState(lang)
      st.conversations[0].messages = msgs
      const firstUser = msgs.find((m) => m.role === 'user')?.text
      if (firstUser) st.conversations[0].title = firstUser.slice(0, 40)
      return st
    }
  } catch {
    /* ignore */
  }
  return defaultState(lang)
}

function saveChats(s: ChatState): void {
  try {
    const trimmed: ChatState = {
      ...s,
      conversations: s.conversations.slice(0, 60).map((c) => ({ ...c, messages: c.messages.filter((m) => !m.thinking).slice(-120) })),
    }
    localStorage.setItem(CHATS_KEY, JSON.stringify(trimmed))
  } catch {
    /* quota — ignore */
  }
}

export function OACAssistant() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { demoAction } = useToast()
  const { t, lang } = useT()
  const ai = useAiSettings()
  const store = useCaptureStore()
  const datasets = useDatasets()
  const rel = useRelationships()
  // Projects + conversations — persisted, synced via backup/cloud.
  const [chat, setChat] = useState<ChatState>(() => loadChats(lang))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { saveChats(chat) }, [chat])

  const active = chat.conversations.find((c) => c.id === chat.activeId) ?? chat.conversations[0]
  const messages = active?.messages ?? []

  // update the ACTIVE conversation's messages (and auto-title from the first user turn)
  const setMessages = (updater: ChatMsg[] | ((m: ChatMsg[]) => ChatMsg[])) => {
    setChat((prev) => {
      const cur = prev.conversations.find((c) => c.id === prev.activeId)
      if (!cur) return prev
      const next = typeof updater === 'function' ? (updater as (m: ChatMsg[]) => ChatMsg[])(cur.messages) : updater
      const firstUser = next.find((m) => m.role === 'user')?.text
      const title = cur.title === defaultTitle(lang) && firstUser ? firstUser.slice(0, 40) : cur.title
      return { ...prev, conversations: prev.conversations.map((c) => (c.id === prev.activeId ? { ...c, messages: next, title, updatedAt: Date.now() } : c)) }
    })
  }

  const addProject = () => {
    const name = window.prompt(lang === 'ko' ? '새 프로젝트 이름' : 'New project name')?.trim()
    if (!name) return
    const pid = newId('p'); const cid = newId('c')
    setChat((prev) => ({ projects: [...prev.projects, { id: pid, name }], conversations: [{ id: cid, projectId: pid, title: defaultTitle(lang), messages: [], updatedAt: Date.now() }, ...prev.conversations], activeId: cid }))
  }
  const addChat = (projectId: string) => {
    const cid = newId('c')
    setChat((prev) => ({ ...prev, conversations: [{ id: cid, projectId, title: defaultTitle(lang), messages: [], updatedAt: Date.now() }, ...prev.conversations], activeId: cid }))
  }
  const selectChat = (id: string) => setChat((prev) => ({ ...prev, activeId: id }))
  const deleteChat = (id: string) => setChat((prev) => {
    const conversations = prev.conversations.filter((c) => c.id !== id)
    if (!conversations.length) return defaultState(lang)
    return { ...prev, conversations, activeId: prev.activeId === id ? conversations[0].id : prev.activeId }
  })
  const deleteProject = (pid: string) => setChat((prev) => {
    if (prev.projects.length <= 1) return prev
    const projects = prev.projects.filter((p) => p.id !== pid)
    const conversations = prev.conversations.filter((c) => c.projectId !== pid)
    if (!conversations.length) return defaultState(lang)
    return { projects, conversations, activeId: conversations.some((c) => c.id === prev.activeId) ? prev.activeId : conversations[0].id }
  })
  const renameProject = (pid: string, cur: string) => {
    const name = window.prompt(lang === 'ko' ? '프로젝트 이름 변경' : 'Rename project', cur)?.trim()
    if (!name) return
    setChat((prev) => ({ ...prev, projects: prev.projects.map((p) => (p.id === pid ? { ...p, name } : p)) }))
  }

  const submit = async (text: string, attachments: Attachment[]) => {
    const clean = text.trim()
    if (!clean && attachments.length === 0) return
    const userId = ++msgSeq
    const botId = ++msgSeq
    setMessages((m) => [
      ...m,
      { id: userId, role: 'user', text: clean, attachments: attachments.map((a) => ({ name: a.name, kind: a.kind })) },
      { id: botId, role: 'assistant', text: '', thinking: true },
    ])

    const history = messages
      .filter((m) => !m.thinking && m.text)
      .slice(-8)
      .map((m) => ({ role: m.role, text: m.text }))

    const memory = {
      accounts: store.accounts.map((a) => ({
        accountId: a.accountId,
        accountName: a.accountName,
        entryCount: a.entryCount,
        openTodos: a.openTodos,
        detectedContext: a.detectedContext,
      })),
      updates: store.entries.slice(0, 12).map((e) => ({
        accountId: e.accountId,
        date: e.date,
        kind: e.kind,
        summary: e.summary,
        detail: e.detail,
        nextBestAction: e.nextBestAction,
      })),
      totalAccounts: store.stats.accounts,
      totalOpenTodos: store.stats.openTodos,
      totalRisks: store.stats.risks,
    }

    const reply = await runAssistant({
      isLive: ai.isLive,
      provider: ai.provider,
      apiKey: ai.activeKey,
      model: ai.model,
      lang,
      history,
      userText: clean,
      attachments,
      memory,
      relationships: rel.list,
      datasets: datasets.snapshots,
      signature: ai.userSignature,
      assistantMode: ai.assistantMode,
    })

    const raw = clean || attachments.map((a) => a.name).join(', ')
    let entryId: string | undefined
    if (reply.structured) entryId = store.addEntry(reply.structured, raw).id
    if (reply.log) store.addEntry(reply.log, raw) // silent timeline log (email/report)

    setMessages((m) =>
      m.map((x) =>
        x.id === botId
          ? { ...x, thinking: false, text: reply.text, structured: reply.structured, email: reply.email, report: reply.report, chart: reply.chart, entryId, entityId: reply.entityId }
          : x,
      ),
    )
  }

  // deep link ?q=
  useEffect(() => {
    const q = params.get('q')
    if (q) {
      submit(q, [])
      params.delete('q')
      setParams(params, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="oac-fade-in">
      <PageHeader
        title={t('page.assistant.title')}
        subtitle={t('page.assistant.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            {/* persona toggle: OAC (CRM) ↔ ChatGPT (general) */}
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold">
              {(['oac', 'chatgpt'] as const).map((m) => (
                <button key={m} onClick={() => ai.setAssistantMode(m)} className={`px-2.5 py-1.5 transition ${ai.assistantMode === m ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  {m === 'oac' ? 'OAC' : 'ChatGPT'}
                </button>
              ))}
            </div>
            <button onClick={() => addChat(active?.projectId ?? 'p-default')} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50">
              + {lang === 'ko' ? '새 대화' : 'New chat'}
            </button>
            <button onClick={() => setSettingsOpen(true)} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${ai.isLive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${ai.isLive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {ai.isLive ? `${t('asst.liveMode')} · ${ai.model.replace('claude-', '')}` : t('asst.demoMode')}
              <GearIcon />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[12rem_1fr_17rem]">
        {/* Projects sidebar (ChatGPT-style; your own units — country, region, deal…) */}
        <aside className="hidden h-[calc(100vh-12rem)] flex-col overflow-auto rounded-xl border border-slate-200 bg-white p-2 lg:flex dark:bg-white/5">
          <button onClick={addProject} className="mb-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600">+ {lang === 'ko' ? '프로젝트' : 'Project'}</button>
          {chat.projects.map((p) => {
            const convs = chat.conversations.filter((c) => c.projectId === p.id).sort((a, b) => b.updatedAt - a.updatedAt)
            return (
              <div key={p.id} className="mt-2">
                <div className="group flex items-center gap-1 px-1.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <span className="flex-1 cursor-pointer truncate hover:text-slate-600" onDoubleClick={() => renameProject(p.id, p.name)} title={lang === 'ko' ? `${p.name} (더블클릭=이름변경)` : `${p.name} (double-click to rename)`}>{p.name}</span>
                  <button onClick={() => addChat(p.id)} title={lang === 'ko' ? '새 대화' : 'New chat'} className="text-sm text-slate-400 hover:text-brand-600">+</button>
                  {chat.projects.length > 1 && <button onClick={() => deleteProject(p.id)} className="text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100">×</button>}
                </div>
                <div className="space-y-0.5">
                  {convs.map((c) => (
                    <div key={c.id} className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition ${c.id === chat.activeId ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                      <button onClick={() => selectChat(c.id)} className="min-w-0 flex-1 truncate text-left" title={c.title}>{c.title || defaultTitle(lang)}</button>
                      <button onClick={() => deleteChat(c.id)} className="text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </aside>

        {/* Chat */}
        <div className="flex h-[calc(100vh-12rem)] flex-col">
          <div ref={scrollRef} className="flex-1 overflow-auto">
            {messages.length === 0 ? (
              <EmptyState onPick={(q) => submit(q, [])} lang={lang} t={t} />
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((m) =>
                  m.role === 'user' ? (
                    <UserBubble key={m.id} msg={m} />
                  ) : (
                    <AssistantBubble key={m.id} msg={m} />
                  ),
                )}
              </div>
            )}
          </div>
          <Composer onSubmit={submit} t={t} lang={lang} />
        </div>

        {/* Right: live CRM panel — what OAC extracted from your chats */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <CardHeader title={t('asst.engine')} subtitle={ai.isLive ? `${t('set.connected')} · ${ai.model.replace('claude-', '')}` : t('asst.demoMode')} icon={<SparkIcon />} />
              <Button size="sm" variant="secondary" onClick={() => setSettingsOpen(true)}>{t('asst.settings')}</Button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 rounded-full ${ai.isLive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="text-slate-600">{ai.isLive ? t('asst.liveMode') : t('asst.demoMode')}</span>
            </div>
          </Card>

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
              <div className="max-h-[320px] divide-y divide-slate-100 overflow-auto">
                {store.accounts.map((a) => (
                  <div key={a.accountId} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-800">{a.accountName}</span>
                      <Badge tone={catTone[a.category]}>{catLabel[a.category][lang]}</Badge>
                    </div>
                    <div className="mt-1"><ContextBadge context={a.detectedContext} size="sm" /></div>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
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

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} t={t} />}
    </div>
  )

  function UserBubble({ msg }: { msg: ChatMsg }) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mb-1 flex flex-wrap justify-end gap-1.5">
              {msg.attachments.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] text-brand-700">
                  <FileIcon kind={a.kind} />{a.name}
                </span>
              ))}
            </div>
          )}
          {msg.text && <div className="rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm">{msg.text}</div>}
        </div>
      </div>
    )
  }

  function AssistantBubble({ msg }: { msg: ChatMsg }) {
    return (
      <div className="flex justify-start">
        <div className="flex w-full max-w-[92%] gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white"><SparkIcon /></span>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
            {msg.thinking ? (
              <div className="flex items-center gap-2 text-slate-400">
                <span className="oac-typing text-brand-500"><span /><span /><span /></span>
                <span className="text-xs">{t('asst.thinking')}</span>
              </div>
            ) : (
              <>
                <Markdown text={msg.text} />
                {msg.structured && msg.entryId && <StructuredCard msg={msg} />}
                {msg.chart && <ChartCard chart={msg.chart} />}
                {msg.email && <EmailCard email={msg.email} />}
                {msg.report && <ReportCard report={msg.report} />}
                {msg.entityId && !msg.structured && (
                  <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate(`/relationship/${msg.entityId}`)}>{t('cap.viewRel')}</Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  function StructuredCard({ msg }: { msg: ChatMsg }) {
    const s = msg.structured!
    const entry = store.entries.find((e) => e.id === msg.entryId)
    if (!entry) return null
    const setMsg = (patch: Partial<ChatMsg>) => setMessages((all) => all.map((x) => (x.id === msg.id ? { ...x, ...patch } : x)))

    const openTodos = entry.todos.filter((x) => !x.done).length
    return (
      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
        {/* Compact saved line — natural, structure on demand */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckIcon /> {t('asst.saved')}</span>
          <button onClick={() => s.isExisting ? navigate(`/relationship/${s.accountId}`) : undefined} className={`text-sm font-bold text-slate-900 ${s.isExisting ? 'hover:text-brand-700' : ''}`}>{s.accountName}</button>
          <Badge tone={catTone[s.category]}>{catLabel[s.category][lang]}</Badge>
          <span className="text-[11px] text-slate-400">{openTodos} {t('cap.todosShort')}{entry.risks.length > 0 ? ` · ${entry.risks.length} ${t('cap.risk')}` : ''}</span>
          <button onClick={() => setMsg({ showDetails: !msg.showDetails })} className="ml-auto text-[11px] font-medium text-brand-600 hover:text-brand-700">{msg.showDetails ? t('asst.hide') : t('asst.details')}</button>
        </div>

        {!msg.showDetails ? null : (
        <>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={s.isExisting ? 'green' : 'brand'} dot>{s.isExisting ? t('cap.existing') : t('cap.new')}</Badge>
          <ContextBadge context={s.detectedContext} confidence={s.contextConfidence} size="sm" />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-100 p-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-600"><span className="h-2 w-2 rounded-full bg-sky-500" />{t('cap.timeline')}</div>
            <div className="text-xs font-medium text-slate-700">{entry.timeline.title}</div>
            <div className="text-[11px] text-slate-400">{formatDate(entry.timeline.date)}</div>
            <p className="mt-1 line-clamp-4 text-xs text-slate-500">{entry.timeline.detail}</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-600"><span className="h-2 w-2 rounded-full bg-brand-500" />{t('cap.todo')} ({entry.todos.filter((x) => !x.done).length})</div>
            {entry.todos.length === 0 ? <p className="text-xs text-slate-400">{t('cap.noTodo')}</p> : (
              <ul className="space-y-1.5">
                {entry.todos.map((td) => (
                  <li key={td.id}>
                    <button onClick={() => store.toggleTodo(entry.id, td.id)} className="group flex w-full items-start gap-2 text-left">
                      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${td.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 group-hover:border-brand-400'}`}>{td.done && <CheckIcon />}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`text-xs ${td.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{td.text}</span>
                        <span className="mt-0.5 flex items-center gap-1.5"><Badge tone={td.priority === 'High' ? 'red' : td.priority === 'Medium' ? 'amber' : 'slate'}>{td.priority}</Badge><span className="text-[10px] text-slate-400">{t('cap.due')} {formatDate(td.due)}</span></span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-slate-100 p-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-rose-600"><span className="h-2 w-2 rounded-full bg-rose-500" />{t('cap.risk')} ({entry.risks.length})</div>
            {entry.risks.length === 0 ? <p className="text-xs text-slate-400">{t('cap.noRisk')}</p> : (
              <ul className="space-y-1.5">{entry.risks.map((r, i) => <li key={i} className="flex gap-1.5 text-xs text-slate-600"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{r}</li>)}</ul>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Button size="sm" variant={msg.showReport ? 'primary' : 'secondary'} onClick={() => setMsg({ showReport: !msg.showReport })}>{t('cap.genReport')}</Button>
          <Button size="sm" variant={msg.showEmail ? 'primary' : 'secondary'} onClick={() => setMsg({ showEmail: !msg.showEmail })}>{t('cap.draftEmail')}</Button>
          {s.isExisting && <Button size="sm" variant="secondary" onClick={() => navigate(`/relationship/${s.accountId}`)}>{t('cap.viewRel')}</Button>}
          <Button size="sm" variant="demo" onClick={() => demoAction('Create Task Demo')}>Create Tasks Demo</Button>
        </div>

        {msg.showReport && (
          <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3 dark:bg-brand-500/10">
            <div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-bold text-slate-900">{s.report.title}</h4><Button size="sm" variant="demo" onClick={() => demoAction('Export to Word Demo')}>Export to Word Demo</Button></div>
            {s.report.sections.map((sec, i) => (
              <div key={i} className="mb-2"><div className="text-[11px] font-bold uppercase tracking-wide text-brand-600">{sec.heading}</div><p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">{sec.body}</p></div>
            ))}
          </div>
        )}
        {msg.showEmail && (
          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-slate-800">{s.email.subject}</span><Button size="sm" variant="demo" onClick={() => demoAction('Send via Outlook Demo')}>Send via Outlook Demo</Button></div>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600">{s.email.body}</pre>
          </div>
        )}
        </>
        )}
      </div>
    )
  }
}

// ── Composer (isolated state so typing doesn't re-render the thread) ─────────
function Composer({ onSubmit, t, lang }: { onSubmit: (text: string, atts: Attachment[]) => void; t: (k: string) => string; lang: 'en' | 'ko' }) {
  const [input, setInput] = useState('')
  const [atts, setAtts] = useState<Attachment[]>([])
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

  const addFiles = async (files: FileList | File[] | null) => {
    if (!files || (files as FileList).length === 0) return
    setBusy(true)
    try {
      const read = await Promise.all([...(files as File[])].slice(0, 5).map(readAttachment))
      setAtts((a) => [...a, ...read].slice(0, 6))
    } finally {
      setBusy(false)
    }
  }

  // Accept file drops ANYWHERE on the page (not just the small composer) and stop
  // the browser from opening a file dropped outside the drop zone.
  useEffect(() => {
    let depth = 0
    const onOver = (e: DragEvent) => { if ([...(e.dataTransfer?.types ?? [])].includes('Files')) e.preventDefault() }
    const onEnter = (e: DragEvent) => { if ([...(e.dataTransfer?.types ?? [])].includes('Files')) { depth++; setDragOver(true) } }
    const onLeave = () => { depth = Math.max(0, depth - 1); if (depth === 0) setDragOver(false) }
    const onWinDrop = (e: DragEvent) => { e.preventDefault(); depth = 0; setDragOver(false); if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files) }
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('drop', onWinDrop)
    return () => {
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('drop', onWinDrop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPaste = (e: React.ClipboardEvent) => {
    const files = [...(e.clipboardData?.items ?? [])].filter((i) => i.kind === 'file').map((i) => i.getAsFile()).filter(Boolean) as File[]
    if (files.length) { e.preventDefault(); addFiles(files) }
  }

  const go = () => {
    if (!input.trim() && atts.length === 0) return
    onSubmit(input, atts)
    setInput('')
    setAtts([])
  }

  return (
    <div className={`relative mt-3 rounded-2xl border bg-white p-2 shadow-sm transition ${dragOver ? 'border-brand-400 ring-2 ring-brand-200' : 'border-slate-200'}`}>
      {dragOver && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-brand-900/30">
          <div className="rounded-2xl border-2 border-dashed border-brand-400 bg-white px-8 py-6 text-base font-bold text-brand-700 shadow-xl">
            {lang === 'ko' ? '📎 파일을 놓으세요 (이미지·PDF·엑셀·텍스트)' : '📎 Drop files anywhere (image · PDF · Excel · text)'}
          </div>
        </div>
      )}
      {atts.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5 px-1">
          {atts.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
              <FileIcon kind={a.kind} />{a.name} <span className="text-slate-400">{formatBytes(a.size)}</span>
              <button onClick={() => setAtts((x) => x.filter((y) => y.id !== a.id))} className="text-slate-400 hover:text-rose-600">✕</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input ref={imgRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
        <input ref={docRef} type="file" accept=".pdf,.txt,.md,.markdown,.csv,.tsv,.json,.log,.yml,.yaml,.xlsx,.xls,.docx,.doc,.pptx,text/*,application/pdf" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
        <button onClick={() => imgRef.current?.click()} title={t('asst.image')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"><ImageIcon /></button>
        <button onClick={() => docRef.current?.click()} title={t('asst.doc')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"><DocIcon /></button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go() } }}
          onPaste={onPaste}
          rows={1}
          placeholder={t('asst.placeholder')}
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <Button onClick={go} disabled={busy || (!input.trim() && atts.length === 0)} icon={<SendIcon />}>{t('asst.send')}</Button>
      </div>
    </div>
  )
}

function SettingsModal({ onClose, t }: { onClose: () => void; t: (k: string) => string }) {
  const ai = useAiSettings()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{t('set.title')}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">✕</button>
        </div>

        <div className="space-y-2">
          {(['demo', 'live'] as const).map((mode) => (
            <button key={mode} onClick={() => ai.setMode(mode)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${ai.mode === mode ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${ai.mode === mode ? 'border-brand-600' : 'border-slate-300'}`}>{ai.mode === mode && <span className="h-2 w-2 rounded-full bg-brand-600" />}</span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">{mode === 'demo' ? t('set.demo') : t('set.live')}</span>
                <span className="block text-xs text-slate-500">{mode === 'demo' ? t('set.demoDesc') : t('set.liveDesc')}</span>
              </span>
            </button>
          ))}
        </div>

        {ai.mode === 'live' && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('set.model')}</label>
              <select value={ai.model} onChange={(e) => ai.setModel(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
                {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            {ai.provider === 'openai' ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">OpenAI API Key</label>
                <input type="password" value={ai.openaiKey} onChange={(e) => ai.setOpenaiKey(e.target.value)} placeholder="sk-..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-brand-600 hover:text-brand-700">{t('set.getKey')} →</a>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Anthropic API Key</label>
                <input type="password" value={ai.apiKey} onChange={(e) => ai.setApiKey(e.target.value)} placeholder="sk-ant-..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-brand-600 hover:text-brand-700">{t('set.getKey')} →</a>
              </div>
            )}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">⚠️ {t('set.warn')}</div>
          </div>
        )}

        <Button className="mt-4 w-full" onClick={onClose}>{t('set.done')}</Button>
      </div>
    </div>
  )
}

function EmailCard({ email }: { email: { to: string; subject: string; body: string } }) {
  const { demoAction, notify } = useToast()
  const ai = useAiSettings()
  const { lang } = useT()
  const [to, setTo] = useState(email.to)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const msReady = ai.msClientId.trim().length > 0
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)

  // Inject the saved signature: drop placeholder-only lines ([이름]/[직책]/…) and
  // append the user's real signature unless it's already there. Stays editable.
  const sig = ai.userSignature.trim()
  const composeBody = () => {
    let b = email.body
    if (sig) {
      const firstLine = sig.split('\n').map((s) => s.trim()).find(Boolean) || ''
      if (firstLine && !b.includes(firstLine)) {
        b = b
          .split('\n')
          .filter((line) => !/^\s*\[[^\]]*\]\s*$/.test(line))
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trimEnd() + '\n\n' + sig
      }
    }
    return b
  }
  const [bodyText, setBodyText] = useState(composeBody)

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(`To: ${to}\nSubject: ${email.subject}\n\n${bodyText}`).catch(() => {})
    notify(L('복사됨', 'Copied'), L('이메일을 클립보드에 복사했어요', 'Email copied to clipboard'))
  }
  const send = async () => {
    if (!to.includes('@')) { setErr(L('받는사람 이메일을 입력하세요', 'Enter a recipient email')); return }
    setErr(''); setSending(true)
    try {
      const { sendMail } = await import('../utils/graph')
      await sendMail({ clientId: ai.msClientId, tenant: ai.msTenant }, { to, subject: email.subject, body: bodyText })
      setSent(true)
      notify(L('메일 전송됨', 'Email sent'), `${to} · ${email.subject}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">{email.subject}</span>
        {msReady ? (
          <Button size="sm" onClick={send} disabled={sending || sent}>{sent ? L('전송됨 ✓', 'Sent ✓') : sending ? L('전송 중…', 'Sending…') : L('Outlook으로 전송', 'Send via Outlook')}</Button>
        ) : (
          <Button size="sm" variant="demo" onClick={() => demoAction('Send via Outlook Demo')}>Send via Outlook Demo</Button>
        )}
      </div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[11px] text-slate-400">To:</span>
        <input value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 rounded border border-slate-200 px-1.5 py-0.5 text-[11px] focus:border-brand-400 focus:outline-none" />
      </div>
      <textarea
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
        rows={Math.min(16, bodyText.split('\n').length + 1)}
        className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white/60 px-2.5 py-2 font-sans text-xs leading-relaxed text-slate-700 focus:border-brand-400 focus:outline-none dark:bg-white/5"
      />
      {err && <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">{err}</div>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={copy}>{L('복사', 'Copy')}</Button>
        {!sig && <span className="text-[10px] text-amber-600">{L('설정 → 이메일 서명에 이름·연락처를 등록하면 자동으로 들어갑니다', 'Add your signature in Settings → Email signature to auto-fill it')}</span>}
        {!msReady && <span className="text-[10px] text-slate-400">{L('Microsoft 365 연결 시 실제 전송', 'Connect Microsoft 365 to send for real')}</span>}
      </div>
    </div>
  )
}

function ChartCard({ chart }: { chart: ChartData }) {
  const fmt = (n: number) => (chart.unit === 'yen' ? '¥' : '') + Math.round(n).toLocaleString()
  const max = Math.max(...chart.points.map((p) => p.value), 1)
  return (
    <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 14l3-4 4 3 5-7" /></svg>
        {chart.title}
      </div>
      <div className="space-y-1.5">
        {chart.points.map((p) => (
          <div key={p.label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-[11px] font-medium text-slate-600" title={p.label}>{p.label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-violet-600" style={{ width: `${Math.max(2, (p.value / max) * 100)}%` }} />
            </div>
            <span className="w-24 shrink-0 text-right text-[11px] font-semibold text-slate-700">{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportCard({ report }: { report: { title: string; sections: { heading: string; body: string }[] } }) {
  const { demoAction } = useToast()
  return (
    <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3 dark:bg-brand-500/10">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
        <Button size="sm" variant="demo" onClick={() => demoAction('Export to Word Demo')}>Export to Word Demo</Button>
      </div>
      {report.sections.map((s, i) => (
        <div key={i} className="mb-2"><div className="text-[11px] font-bold uppercase tracking-wide text-brand-600">{s.heading}</div><p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">{s.body}</p></div>
      ))}
      <div className="mt-1"><Button size="sm" variant="secondary" onClick={() => demoAction('Post to Teams Demo')}>Post to Teams Demo</Button></div>
    </div>
  )
}

function EmptyState({ onPick, lang, t }: { onPick: (q: string) => void; lang: 'en' | 'ko'; t: (k: string) => string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/20"><SparkIcon big /></span>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{t('asst.emptyTitle')}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{t('asst.emptyDesc')}</p>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('asst.examplesHeader')}</div>
      <div className="mt-3 grid w-full max-w-xl grid-cols-1 gap-2">
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => onPick(ex[lang])} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700">{ex[lang]}</button>
        ))}
      </div>
    </div>
  )
}

// ── markdown (bold, bullets, paragraphs) ─────────────────────────────────────
function Markdown({ text }: { text: string }) {
  if (!text) return null
  return (
    <div className="space-y-1 text-sm leading-relaxed text-slate-700">
      {text.split('\n').map((line, i) => {
        const bullet = /^\s*[•\-*]\s+/.test(line)
        const content = bullet ? line.replace(/^\s*[•\-*]\s+/, '') : line
        if (!content.trim()) return <div key={i} className="h-1" />
        return (
          <p key={i} className={bullet ? 'flex gap-2 pl-1' : ''}>
            {bullet && <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-400" />}
            <span>{renderBold(content)}</span>
          </p>
        )
      })}
    </div>
  )
}
function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  )
}

// ── icons ────────────────────────────────────────────────────────────────────
function SparkIcon({ big = false }: { big?: boolean }) { const s = big ? 26 : 15; return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg> }
function SendIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg> }
function CheckIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg> }
function GearIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.74.66 1.65 1.65 0 0 0-1.51 1H12a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 2.6 14a1.65 1.65 0 0 0-1-1.51V12a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 7" /></svg> }
function ImageIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg> }
function DocIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg> }
function FileIcon({ kind }: { kind: string }) {
  if (kind === 'image') return <ImageIcon />
  return <DocIcon />
}
