// Unified assistant engine: routes a user turn to either the mock engine (demo)
// or the real Anthropic API (live), and normalizes the result into prose +
// optional structured CRM records.

import { callAssistant, buildEntityContext, type ChatTurnLite } from './aiClient'
import { structureCapture, type StructuredCapture, type Category, type Priority } from './captureAI'
import { entities, localizeEntity } from './../data/entities'
import type { Attachment } from './files'
import type { Lang } from '../i18n'
import { TODAY } from './format'

export interface AssistantReply {
  text: string
  structured?: StructuredCapture
  entityId?: string // existing relationship to offer a "View Relationship 360" link
  error?: string
}

interface RunOpts {
  isLive: boolean
  apiKey: string
  model: string
  lang: Lang
  history: ChatTurnLite[]
  userText: string
  attachments: Attachment[]
  capturedContext: string // compact list of recently captured accounts
}

const CATEGORIES: Category[] = ['Customer', 'Supplier', 'Partner', 'Project', 'Recruiting', 'Legal', 'Operations', 'Finance', 'General']
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']

const addDays = (iso: string, n: number): string => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const matchEntity = (text: string) => {
  const q = text.toLowerCase()
  return [...entities]
    .sort((a, b) => b.name.length - a.name.length)
    .find((e) => q.includes(e.name.toLowerCase()))
}

const hasCaptureCues = (text: string): boolean =>
  text.trim().length > 14 &&
  /(해야|필요|까지|마감|리스크|이슈|미팅|메일|보내|확인|준비|요청|검토|결정|todo|risk|issue|meeting|deadline|follow|next step|send|review|prepare|schedule)/i.test(text)

const looksLikeQuestion = (text: string): boolean =>
  /[?？]/.test(text) ||
  /^(show|what|how|who|when|draft|create|summari|tell|give|보여|알려|요약|무엇|뭐|어떻게|누가|언제|작성|만들|초안)/i.test(text.trim())

// ── demo briefing for an existing relationship ───────────────────────────────
const briefing = (entityId: string, lang: Lang): string => {
  const e = localizeEntity(entities.find((x) => x.id === entityId)!)
  const L =
    lang === 'ko'
      ? { ctx: '감지된 맥락', issues: '오픈 이슈', next: '다음 베스트 액션' }
      : { ctx: 'Detected context', issues: 'Open issues', next: 'Next best action' }
  const issues = e.openIssues.map((i) => `• ${i}`).join('\n')
  return `**${e.name}** — ${e.detectedContext}\n\n${e.summary}\n\n**${L.issues}:**\n${issues}\n\n**${L.next}:** ${e.nextBestAction}`
}

// ── normalize a live JSON block into a StructuredCapture ─────────────────────
const resolveAccount = (name: string): { name: string; id: string; isExisting: boolean } => {
  const lower = (name ?? '').toLowerCase()
  const hit = [...entities].sort((a, b) => b.name.length - a.name.length).find((e) => lower.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(lower))
  if (hit && lower) return { name: hit.name, id: hit.id, isExisting: true }
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

const parseStructured = (raw: unknown, lang: Lang): StructuredCapture | undefined => {
  if (!raw || typeof raw !== 'object') return undefined
  const j = raw as Record<string, unknown>
  const acct = resolveAccount(String(j.account ?? ''))
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
  }
}

const OAC_BLOCK = /```oac\s*([\s\S]*?)```/i

export async function runAssistant(opts: RunOpts): Promise<AssistantReply> {
  // ── live: real Anthropic API ──────────────────────────────────────────────
  if (opts.isLive) {
    try {
      const crmContext = `${buildEntityContext()}\n${opts.capturedContext}`.trim()
      const raw = await callAssistant({
        apiKey: opts.apiKey,
        model: opts.model,
        lang: opts.lang,
        history: opts.history,
        userText: opts.userText,
        attachments: opts.attachments,
        crmContext,
      })
      const m = raw.match(OAC_BLOCK)
      let structured: StructuredCapture | undefined
      let text = raw
      if (m) {
        text = raw.replace(m[0], '').trim()
        try {
          structured = parseStructured(JSON.parse(m[1].trim()), opts.lang)
        } catch {
          structured = undefined
        }
      }
      const ent = matchEntity(opts.userText)
      const entityId = structured?.isExisting ? structured.accountId : ent?.id
      return { text: text || (opts.lang === 'ko' ? '응답을 받았습니다.' : 'Done.'), structured, entityId }
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
  const ent = matchEntity(opts.userText)
  const fileNote =
    opts.attachments.length > 0
      ? opts.lang === 'ko'
        ? '\n\n*(데모 모드는 파일 내용을 읽지 않습니다. 설정에서 AI 엔진(API 키)을 연결하면 이미지·문서를 실제로 분석·요약합니다.)*'
        : '\n\n*(Demo mode does not read file contents. Connect the AI Engine with an API key in Settings to analyze and summarize images & documents for real.)*'
      : ''

  if (ent && (looksLikeQuestion(opts.userText) || !hasCaptureCues(opts.userText))) {
    return { text: briefing(ent.id, opts.lang) + fileNote, entityId: ent.id }
  }

  const structured = structureCapture(opts.userText || (opts.attachments[0]?.name ?? ''), opts.lang)
  const lead =
    opts.lang === 'ko'
      ? `입력을 **${structured.detectedContext}** 맥락으로 정리했어요. Account·Timeline·To Do·Risk로 구조화했습니다.`
      : `I structured this as a **${structured.detectedContext}** context — Account, Timeline, To Do and Risk below.`
  return { text: lead + fileNote, structured, entityId: structured.isExisting ? structured.accountId : undefined }
}
