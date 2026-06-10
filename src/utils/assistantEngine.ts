// Unified assistant engine: routes a user turn to either the mock engine (demo)
// or the real Anthropic API (live), and normalizes the result into prose +
// optional structured CRM records.

import { callAssistant, type ChatTurnLite } from './aiClient'
import { structureCapture, type StructuredCapture, type Category, type Priority } from './captureAI'
import { answerDataQueryRich, looksLikeDataQuery, buildDatasetContext, type ChartData } from './datasetQuery'
import type { DatasetSnapshot } from './dataImport'
import { type Entity } from './../data/entities'
import { draftSeedForEntity } from '../data/emails'
import { reportByEntityAndType } from '../data/reports'
import { metricsByEntity } from '../data/salesData'
import type { Attachment } from './files'
import type { Lang } from '../i18n'
import { TODAY, formatDate } from './format'

export interface AssistantReply {
  text: string
  structured?: StructuredCapture // a saved/updated CRM record (rendered as a card)
  log?: StructuredCapture // saved to the relationship silently (no card)
  email?: { to: string; subject: string; body: string } // an inline email draft
  report?: { title: string; sections: { heading: string; body: string }[] } // an inline report
  chart?: ChartData // a data chart (rankings / entity trend) rendered in the chat
  entityId?: string // existing relationship to offer a "View Relationship 360" link
  error?: string
}

export interface MemoryUpdate {
  accountId: string
  date: string
  kind?: string
  summary: string
  detail?: string
  nextBestAction?: string
}

export interface AssistantMemory {
  accounts: { accountId: string; accountName: string; entryCount: number; openTodos: number; detectedContext: string }[]
  updates: MemoryUpdate[] // recent assistant activity across relationships
  totalAccounts: number
  totalOpenTodos: number
  totalRisks: number
}

interface RunOpts {
  isLive: boolean
  provider?: 'anthropic' | 'openai'
  apiKey: string
  model: string
  lang: Lang
  history: ChatTurnLite[]
  userText: string
  attachments: Attachment[]
  memory: AssistantMemory // workspace memory (state before this turn)
  relationships: Entity[] // the active relationships (seeded demo OR the user's own)
  datasets?: DatasetSnapshot[] // imported RawData snapshots (for data questions)
  signature?: string // the user's email signature
  assistantMode?: 'oac' | 'chatgpt'
}

const CATEGORIES: Category[] = ['Customer', 'Supplier', 'Partner', 'Project', 'Recruiting', 'Legal', 'Operations', 'Finance', 'General']
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']

const addDays = (iso: string, n: number): string => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const matchEntity = (text: string, rels: Entity[]) => {
  const q = text.toLowerCase()
  return [...rels]
    .sort((a, b) => b.name.length - a.name.length)
    .find((e) => e.name.length > 1 && q.includes(e.name.toLowerCase()))
}

// Compact CRM context for the live model, built from the active relationships.
const buildContext = (rels: Entity[]): string =>
  rels
    .slice(0, 24)
    .map((e) => {
      const m = metricsByEntity(e.id)
      const metric = m && m.kind === 'booking' ? ` | ${m.bookings} bookings/mo, ${m.failureRate}% failure` : ''
      return `- ${e.name} [${e.detectedContext}] owner ${e.owner}, ${e.region}, health ${e.relationshipHealthScore}. Focus: ${e.currentFocus}. Next: ${e.nextBestAction}${metric}`
    })
    .join('\n')

const hasCaptureCues = (text: string): boolean =>
  text.trim().length > 14 &&
  /(해야|필요|까지|마감|리스크|이슈|미팅|메일|보내|확인|준비|요청|검토|결정|todo|risk|issue|meeting|deadline|follow|next step|send|review|prepare|schedule)/i.test(text)

const looksLikeQuestion = (text: string): boolean =>
  /[?？]/.test(text) ||
  /^(show|what|how|who|when|tell|give|보여|알려|무엇|뭐|어떻게|누가|언제)/i.test(text.trim())

// Action intents the assistant can perform on an existing relationship.
const A_EMAIL = /(메일|이메일|email|e-mail|\bmail\b)/i
const A_REPORT = /(리포트|레포트|보고서|보고|report|briefing|브리핑)/i
const A_REVIEW = /(검수|독소|조항|검토|리뷰|review|clause|inspect|audit|살펴|점검)/i
const A_STATUS = /(진행|상황|진척|어때|어떻게\s*(돼|됐|되|진행)|어디까지|status|progress|update\?|업데이트.*\?|stand)/i
// A meeting/call that already happened — an event log, takes precedence over a
// bare "review" keyword that may appear inside the note.
const A_MEETING = /(미팅|회의|met\b|통화|call\b|meeting)/i

// ── normalize a live JSON block into a StructuredCapture ─────────────────────
const resolveAccount = (name: string, rels: Entity[]): { name: string; id: string; isExisting: boolean } => {
  const lower = (name ?? '').toLowerCase()
  const hit = [...rels].sort((a, b) => b.name.length - a.name.length).find((e) => lower && (lower.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(lower)))
  if (hit) return { name: hit.name, id: hit.id, isExisting: true }
  const clean = (name || 'New Item').trim()
  const id = 'cap-' + clean.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '')
  return { name: clean, id, isExisting: false }
}

const buildArtifacts = (name: string, context: string, summary: string, todos: { text: string; due: string }[], risks: string[], lang: Lang) => {
  const ko = lang === 'ko'
  const report = {
    title: ko ? `${name} — ${context} 요약 보고` : `${name} — ${context} Summary`,
    sections: [
      { heading: ko ? '상황' : 'Situation', body: summary },
      { heading: ko ? '핵심 To Do' : 'Key To Dos', body: todos.length ? todos.map((t) => `• ${t.text}${t.due ? ` (${t.due})` : ''}`).join('\n') : ko ? '없음' : 'None' },
      { heading: ko ? '리스크' : 'Risks', body: risks.length ? risks.map((r) => `• ${r}`).join('\n') : ko ? '없음' : 'None' },
      { heading: ko ? '다음 액션' : 'Next Action', body: todos[0]?.text ?? (ko ? '후속 정리' : 'Follow up') },
    ],
  }
  const email = {
    subject: ko ? `[${name}] ${context} — 후속 정리` : `[${name}] ${context} — Follow-up`,
    body: ko
      ? `안녕하세요,\n\n${name} 관련 내용을 정리해 공유드립니다.\n\n${summary}\n\n다음 액션:\n${todos.map((t) => `- ${t.text}${t.due ? ` (~${t.due})` : ''}`).join('\n') || '- 후속 확인'}\n\n감사합니다.\nOhmyhotel`
      : `Hello,\n\nSharing a summary regarding ${name}.\n\n${summary}\n\nNext actions:\n${todos.map((t) => `- ${t.text}${t.due ? ` (~${t.due})` : ''}`).join('\n') || '- Follow up'}\n\nBest regards,\nOhmyhotel`,
  }
  return { report, email }
}

const parseStructured = (raw: unknown, lang: Lang, rels: Entity[]): StructuredCapture | undefined => {
  if (!raw || typeof raw !== 'object') return undefined
  const j = raw as Record<string, unknown>
  const acct = resolveAccount(String(j.account ?? ''), rels)
  const category: Category = CATEGORIES.includes(j.category as Category) ? (j.category as Category) : 'General'
  const detectedContext = String(j.detectedContext ?? category)
  const summary = String(j.summary ?? '')
  const todos = Array.isArray(j.todos)
    ? j.todos.slice(0, 6).map((t) => {
        const o = (t ?? {}) as Record<string, unknown>
        const due = typeof o.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.due) ? o.due : addDays(TODAY, 3)
        const priority: Priority = PRIORITIES.includes(o.priority as Priority) ? (o.priority as Priority) : 'Medium'
        return { text: String(o.text ?? '').trim(), due, priority }
      }).filter((t) => t.text)
    : []
  const risks = Array.isArray(j.risks) ? j.risks.slice(0, 6).map((r) => String(r)).filter(Boolean) : []
  const tl = (j.timeline ?? {}) as Record<string, unknown>
  const timeline = {
    date: TODAY,
    title: String(tl.title ?? `${acct.name} — note`),
    detail: String(tl.detail ?? summary).slice(0, 400),
  }
  const { report, email } = buildArtifacts(acct.name, detectedContext, summary, todos, risks, lang)
  const KINDS = ['note', 'review', 'meeting', 'email', 'report', 'update']
  const kind = KINDS.includes(j.kind as string) ? (j.kind as StructuredCapture['kind']) : undefined
  return {
    accountName: acct.name,
    accountId: acct.id,
    isExisting: acct.isExisting,
    category,
    detectedContext,
    contextConfidence: 92,
    summary,
    timeline,
    todos,
    risks,
    report,
    email,
    kind,
    detail: typeof j.detail === 'string' ? j.detail : undefined,
    nextBestAction: typeof j.nextBestAction === 'string' ? j.nextBestAction : undefined,
  }
}

const OAC_BLOCK = /```oac(?!-)\s*([\s\S]*?)```/i
const OAC_EMAIL_BLOCK = /```oac-email\s*([\s\S]*?)```/i

/** Pull an inline email draft (```oac-email block) out of a model reply. */
export function extractEmailBlock(raw: string): { text: string; email?: { to: string; subject: string; body: string } } {
  const em = raw.match(OAC_EMAIL_BLOCK)
  if (!em) return { text: raw }
  const text = raw.replace(em[0], '').trim()
  try {
    const e = JSON.parse(em[1].trim()) as { to?: string; subject?: string; body?: string }
    if (e.subject || e.body) return { text, email: { to: e.to ?? '', subject: e.subject ?? '', body: e.body ?? '' } }
  } catch {
    /* ignore */
  }
  return { text }
}

// ── demo handlers for actions on an existing relationship ────────────────────

const recentUpdatesFor = (entityId: string, mem: AssistantMemory): MemoryUpdate[] =>
  mem.updates.filter((u) => u.accountId === entityId)

// Status / progress answer, merged with what the assistant already did.
const briefingWithMemory = (e: Entity, mem: AssistantMemory, lang: Lang): string => {
  const ko = lang === 'ko'
  const updates = recentUpdatesFor(e.id, mem)
  const latestAction = updates.find((u) => u.nextBestAction)?.nextBestAction ?? e.nextBestAction
  const L = ko
    ? { issues: '오픈 이슈', next: '다음 베스트 액션', recent: '최근에 한 일' }
    : { issues: 'Open issues', next: 'Next best action', recent: 'What I did recently' }
  const issues = e.openIssues.map((i) => `• ${i}`).join('\n')
  let out = `**${e.name}** — ${e.detectedContext}\n\n${e.summary}`
  if (updates.length) {
    const lines = updates.slice(0, 3).map((u) => `• ${formatDate(u.date)} — ${u.summary}${u.detail ? `\n   ${u.detail.split('\n')[0]}` : ''}`).join('\n')
    out += `\n\n**${L.recent}:**\n${lines}`
  }
  out += `\n\n**${L.issues}:**\n${issues}\n\n**${L.next}:** ${latestAction}`
  return out
}

const reviewUpdate = (e: Entity, lang: Lang): { text: string; structured: StructuredCapture } => {
  const ko = lang === 'ko'
  const clauses = e.risks
  const checks = e.openIssues.slice(0, 3)
  const findings = ko
    ? `눈에 띄는 독소/리스크 조항:\n${clauses.map((c) => `• ${c}`).join('\n')}\n\n추가로 확인이 필요한 부분:\n${checks.map((c) => `• ${c}`).join('\n')}`
    : `Problematic / risk clauses:\n${clauses.map((c) => `• ${c}`).join('\n')}\n\nNeeds confirmation:\n${checks.map((c) => `• ${c}`).join('\n')}`
  const text = ko
    ? `${e.name}에서 보내온 ${e.detectedContext} 내용을 검수했어요.\n\n${findings}\n\n**권고:** ${e.recommendedAction}\n\n다음 액션은 "${e.nextBestAction}"로 잡아 뒀어요. 릴레이션십 360의 ${e.name}에도 반영했습니다.`
    : `I reviewed the ${e.detectedContext} from ${e.name}.\n\n${findings}\n\n**Recommendation:** ${e.recommendedAction}\n\nI set the next action to "${e.nextBestAction}" and updated the ${e.name} relationship view.`
  const summary = ko ? `${e.name} 독소조항/리스크 검수 완료` : `Reviewed ${e.name} clauses & risks`
  const detail = `${findings}\n\n${ko ? '권고' : 'Recommendation'}: ${e.recommendedAction}`
  const { report, email } = buildArtifacts(e.name, e.detectedContext, summary, [{ text: e.nextBestAction, due: addDays(TODAY, 3) }], e.risks, lang)
  const structured: StructuredCapture = {
    accountName: e.name, accountId: e.id, isExisting: true, category: 'Legal', detectedContext: e.detectedContext,
    contextConfidence: e.contextConfidence, summary, detail, kind: 'review',
    timeline: { date: TODAY, title: ko ? '계약/SLA 독소조항 검수' : 'Contract / SLA clause review', detail: clauses[0] ?? summary },
    todos: [{ text: e.nextBestAction, due: addDays(TODAY, 3), priority: 'High' }],
    risks: e.risks, nextBestAction: e.nextBestAction, report, email,
  }
  return { text, structured }
}

const emailReply = (e: Entity, lang: Lang): { text: string; email: { to: string; subject: string; body: string }; log: StructuredCapture } => {
  const ko = lang === 'ko'
  const seed = draftSeedForEntity(e.id)
  const built = buildArtifacts(e.name, e.detectedContext, e.summary, [{ text: e.nextBestAction, due: addDays(TODAY, 3) }], e.risks, lang).email
  const email = seed ? { to: seed.to, subject: seed.subject, body: seed.body } : { to: `partnerships@${e.id}.example`, subject: built.subject, body: built.body }
  const text = ko
    ? `${e.name}에 보낼 이메일 초안을 작성했어요. 바로 수정하거나 Send via Outlook Demo로 보낼 수 있어요.`
    : `Here's a draft email to ${e.name}. Edit it inline or use Send via Outlook Demo.`
  const log: StructuredCapture = {
    accountName: e.name, accountId: e.id, isExisting: true, category: 'General', detectedContext: e.detectedContext, contextConfidence: e.contextConfidence,
    summary: ko ? `${e.name}에 이메일 초안 작성` : `Drafted email to ${e.name}`, kind: 'email', detail: `${email.subject}\n\n${email.body}`,
    timeline: { date: TODAY, title: ko ? '이메일 초안 작성' : 'Email drafted', detail: email.subject },
    todos: [], risks: [], report: { title: '', sections: [] }, email,
  }
  return { text, email, log }
}

const reportReply = (e: Entity, lang: Lang): { text: string; report: { title: string; sections: { heading: string; body: string }[] }; log: StructuredCapture } => {
  const ko = lang === 'ko'
  const prebaked = reportByEntityAndType(e.id, 'CEO Briefing') ?? reportByEntityAndType(e.id, 'Hotel Contracting Summary') ?? reportByEntityAndType(e.id, 'Commercial Negotiation Summary')
  const report = prebaked
    ? { title: prebaked.title, sections: prebaked.sections }
    : buildArtifacts(e.name, e.detectedContext, e.summary, [{ text: e.nextBestAction, due: addDays(TODAY, 3) }], e.risks, lang).report
  const text = ko
    ? `${e.name} 리포트를 작성했어요. Export to Word Demo로 내보낼 수 있어요.`
    : `I drafted a report for ${e.name}. Export it with Export to Word Demo.`
  const log: StructuredCapture = {
    accountName: e.name, accountId: e.id, isExisting: true, category: 'General', detectedContext: e.detectedContext, contextConfidence: e.contextConfidence,
    summary: ko ? `${e.name} 리포트 작성` : `Drafted report for ${e.name}`, kind: 'report', detail: report.title,
    timeline: { date: TODAY, title: ko ? '리포트 작성' : 'Report drafted', detail: report.title },
    todos: [], risks: [], report, email: { subject: '', body: '' },
  }
  return { text, report, log }
}

const meetingUpdate = (text: string, e: Entity, mem: AssistantMemory, lang: Lang): { text: string; structured: StructuredCapture } => {
  const ko = lang === 'ko'
  const s = structureCapture(text, lang)
  s.accountName = e.name
  s.accountId = e.id
  s.isExisting = true
  s.kind = 'meeting'
  s.nextBestAction = s.todos[0]?.text ?? e.nextBestAction
  s.timeline = { date: TODAY, title: ko ? '미팅 기록' : 'Meeting note', detail: s.timeline.detail }
  const reply = naturalCaptureReply(s, mem, lang) + (ko ? ` 릴레이션십 360의 ${e.name}에도 반영했어요.` : ` I updated the ${e.name} relationship view too.`)
  return { text: reply, structured: s }
}

export async function runAssistant(opts: RunOpts): Promise<AssistantReply> {
  // ── live: real Anthropic API ──────────────────────────────────────────────
  if (opts.isLive) {
    try {
      const captures = opts.memory.accounts.length
        ? 'Recent captures (your memory):\n' +
          opts.memory.accounts.slice(0, 10).map((a) => `- ${a.accountName} [${a.detectedContext}] ${a.entryCount} note(s), ${a.openTodos} open to-do(s)`).join('\n')
        : ''
      const activity = opts.memory.updates.length
        ? '\nRecent assistant activity (what you already did):\n' +
          opts.memory.updates.slice(0, 10).map((u) => `- ${u.accountId} (${u.date}) ${u.kind ?? 'note'}: ${u.summary}${u.nextBestAction ? ` → next: ${u.nextBestAction}` : ''}`).join('\n')
        : ''
      const ctx = opts.relationships.length ? buildContext(opts.relationships) : (opts.lang === 'ko' ? '(아직 등록된 관계 없음)' : '(no relationships yet)')
      const dataCtx = opts.datasets?.length ? '\n' + buildDatasetContext(opts.datasets) : ''
      const crmContext = `${ctx}\n${captures}${activity}${dataCtx}`.trim()
      const raw = await callAssistant({
        provider: opts.provider ?? 'anthropic',
        apiKey: opts.apiKey,
        model: opts.model,
        lang: opts.lang,
        history: opts.history,
        userText: opts.userText,
        attachments: opts.attachments,
        crmContext,
        signature: opts.signature,
        assistantMode: opts.assistantMode,
      })
      // Inline email draft → render an EmailCard with a real "Send via Outlook" button.
      const extracted = extractEmailBlock(raw)
      let text = extracted.text
      const email = extracted.email

      const m = text.match(OAC_BLOCK)
      let structured: StructuredCapture | undefined
      if (m) {
        text = text.replace(m[0], '').trim()
        try {
          structured = parseStructured(JSON.parse(m[1].trim()), opts.lang, opts.relationships)
        } catch {
          structured = undefined
        }
      }
      const ent = matchEntity(opts.userText, opts.relationships)
      const entityId = structured?.isExisting ? structured.accountId : ent?.id
      return { text: text || (opts.lang === 'ko' ? '응답을 받았습니다.' : 'Done.'), structured, email, entityId }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return {
        text:
          opts.lang === 'ko'
            ? `실제 AI 호출에 실패했습니다: ${msg}\n\n설정에서 API 키와 모델을 확인하세요. (데모 모드로 전환하면 키 없이 동작합니다.)`
            : `Live AI call failed: ${msg}\n\nCheck your API key and model in Settings. (Switch to Demo mode to run without a key.)`,
        error: msg,
      }
    }
  }

  // ── demo: mock engine ─────────────────────────────────────────────────────
  const ent = matchEntity(opts.userText, opts.relationships)

  // Data question about imported RawData (rankings / metric totals). Triggered when
  // there's no specific relationship in focus, or the user explicitly asks to rank.
  const ranking = /top\s*\d|상위|순위|랭킹|랭크|best|가장\s*(많|높|적|낮)/i.test(opts.userText)
  if (opts.datasets?.length && looksLikeDataQuery(opts.userText) && (!ent || ranking)) {
    const ans = answerDataQueryRich(opts.userText, opts.datasets, opts.lang)
    if (ans) return { text: ans.text, chart: ans.chart }
  }

  const fileNote =
    opts.attachments.length > 0
      ? opts.lang === 'ko'
        ? '\n\n*(데모 모드는 파일 내용을 읽지 않습니다. 설정에서 AI 엔진(API 키)을 연결하면 이미지·문서를 실제로 분석·요약합니다.)*'
        : '\n\n*(Demo mode does not read file contents. Connect the AI Engine with an API key in Settings to analyze and summarize images & documents for real.)*'
      : ''

  // Existing relationship → the assistant can act on it (review, email, report,
  // meeting/update) and reflect the change on Relationship 360, or answer status.
  if (ent) {
    const e = ent // already localized by the relationships source
    const text = opts.userText
    if (A_EMAIL.test(text)) {
      const r = emailReply(e, opts.lang)
      return { text: r.text + fileNote, email: r.email, log: r.log, entityId: e.id }
    }
    if (A_REPORT.test(text)) {
      const r = reportReply(e, opts.lang)
      return { text: r.text + fileNote, report: r.report, log: r.log, entityId: e.id }
    }
    if (A_MEETING.test(text)) {
      const r = meetingUpdate(text, e, opts.memory, opts.lang)
      return { text: r.text + fileNote, structured: r.structured, entityId: e.id }
    }
    if (A_REVIEW.test(text) && e.risks.length > 0) {
      const r = reviewUpdate(e, opts.lang)
      return { text: r.text + fileNote, structured: r.structured, entityId: e.id }
    }
    if (hasCaptureCues(text) && !A_STATUS.test(text) && !looksLikeQuestion(text)) {
      const r = meetingUpdate(text, e, opts.memory, opts.lang)
      return { text: r.text + fileNote, structured: r.structured, entityId: e.id }
    }
    return { text: briefingWithMemory(e, opts.memory, opts.lang) + fileNote, entityId: e.id }
  }

  // No existing relationship → capture a new account.
  const structured = structureCapture(opts.userText || (opts.attachments[0]?.name ?? ''), opts.lang)
  const text = naturalCaptureReply(structured, opts.memory, opts.lang) + fileNote
  return { text, structured, entityId: structured.isExisting ? structured.accountId : undefined }
}

// Natural, history-aware acknowledgement — no rigid "structured into X" wording.
const naturalCaptureReply = (s: StructuredCapture, mem: AssistantMemory, lang: Lang): string => {
  const ko = lang === 'ko'
  const name = s.accountName
  const prior = mem.accounts.find((a) => a.accountId === s.accountId)
  const topTodo = s.todos[0]
  const topRisk = s.risks[0]
  const newTodos = s.todos.length
  const newRisks = s.risks.length

  // after-state totals (memory is the state before this turn)
  const totalAccounts = prior ? mem.totalAccounts : mem.totalAccounts + 1
  const totalTodos = mem.totalOpenTodos + newTodos

  const parts: string[] = []

  // 1) opener — save vs. update, with memory awareness
  if (ko) {
    if (s.isExisting) parts.push(`${name}에 대한 새 업데이트로 기록해 뒀어요.`)
    else if (prior) parts.push(`${name} 관련 ${prior.entryCount + 1}번째 메모네요. 이전 내용에 이어서 정리해 뒀어요.`)
    else parts.push(`${name} 건, 정리해서 저장해 뒀어요.`)
  } else {
    if (s.isExisting) parts.push(`Logged this as a new update on ${name}.`)
    else if (prior) parts.push(`That's note ${prior.entryCount + 1} on ${name} — I added it on top of what you had.`)
    else parts.push(`Saved your note on ${name}.`)
  }

  // 2) what stood out — top to-do / risk, naturally
  if (topTodo) {
    const due = topTodo.due ? (ko ? ` (~${topTodo.due})` : ` (~${topTodo.due})`) : ''
    parts.push(ko ? `가장 먼저 챙길 건 "${topTodo.text}"${due}로 잡아 뒀어요.` : `The most pressing item looks like "${topTodo.text}"${due}.`)
  }
  if (topRisk) {
    parts.push(ko ? `리스크로 "${topRisk}"도 함께 표시해 뒀고요.` : `I also flagged a risk: "${topRisk}".`)
  }

  // 3) memory feedback — running totals
  parts.push(
    ko
      ? `지금 워크스페이스에는 관계 ${totalAccounts}곳, 진행 중 할 일 ${totalTodos}개를 기억하고 있어요.`
      : `Your workspace now holds ${totalAccounts} relationship(s) and ${totalTodos} open to-do(s).`,
  )

  // 4) one proactive suggestion
  if (newRisks > 0) {
    parts.push(ko ? `리스크가 커지기 전에 먼저 한 번 확인해 보시길 추천해요.` : `I'd look at that risk before it grows.`)
  } else if (topTodo && topTodo.priority === 'High') {
    parts.push(ko ? `"${topTodo.text}"부터 처리하면 좋겠어요.` : `Tackling "${topTodo.text}" first would be my move.`)
  } else if (s.isExisting) {
    parts.push(ko ? `${name} 관계 화면에서 전체 맥락을 이어 볼 수 있어요.` : `You can pick up the full context on the ${name} relationship view.`)
  }

  return parts.join(' ')
}
