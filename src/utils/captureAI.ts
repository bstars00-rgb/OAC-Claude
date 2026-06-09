// Mock AI that turns free-form work notes into structured CRM artifacts:
// Account · Timeline · To Do · Risk · Report · Email.
//
// Deterministic keyword extraction dressed up as AI. No real model is called.
// Supports every business relationship: customer, supplier, partner, project,
// recruiting, legal, operations, finance, … — the category is auto-detected,
// the user never classifies it.

import { entities } from '../data/entities'
import { TODAY } from './format'
import type { Lang } from '../i18n'

export type Category =
  | 'Customer'
  | 'Supplier'
  | 'Partner'
  | 'Project'
  | 'Recruiting'
  | 'Legal'
  | 'Operations'
  | 'Finance'
  | 'General'

export type Priority = 'High' | 'Medium' | 'Low'

export interface StructuredTodo {
  text: string
  due: string // ISO date
  priority: Priority
}

export interface StructuredTimeline {
  date: string
  title: string
  detail: string
}

export interface ReportSection {
  heading: string
  body: string
}

export interface StructuredCapture {
  accountName: string
  accountId: string // existing entity id, or a generated slug
  isExisting: boolean
  category: Category
  detectedContext: string
  contextConfidence: number
  summary: string
  timeline: StructuredTimeline
  todos: StructuredTodo[]
  risks: string[]
  report: { title: string; sections: ReportSection[] }
  email: { subject: string; body: string }
}

// ── category detection ───────────────────────────────────────────────────────
interface CatRule {
  category: Category
  keywords: string[]
  context: { en: string; ko: string }
}

const CAT_RULES: CatRule[] = [
  {
    category: 'Recruiting',
    keywords: ['채용', '인터뷰', '면접', '지원자', '오퍼', '레퍼럴', 'recruit', 'interview', 'candidate', 'hire', 'offer', 'headcount'],
    context: { en: 'Recruiting / Hiring Pipeline', ko: '채용 / 채용 파이프라인' },
  },
  {
    category: 'Legal',
    keywords: ['법무', '계약', 'nda', '약관', '소송', '컴플라이언스', '검토', 'legal', 'contract', 'compliance', 'terms', 'clause', '조항'],
    context: { en: 'Legal / Contract Review', ko: '법무 / 계약 검토' },
  },
  {
    category: 'Project',
    keywords: ['프로젝트', '마일스톤', '스프린트', '출시', '배포', '일정', '런칭', 'project', 'milestone', 'sprint', 'launch', 'deploy', 'roadmap', 'release'],
    context: { en: 'Project / Delivery Milestone', ko: '프로젝트 / 딜리버리 마일스톤' },
  },
  {
    category: 'Supplier',
    keywords: ['공급', '공급사', '단가', '발주', '납품', '벤더', 'supplier', 'vendor', 'procure', 'po ', 'sourcing', 'inventory', '재고'],
    context: { en: 'Supplier / Sourcing & Operations', ko: '공급사 / 소싱 & 운영' },
  },
  {
    category: 'Operations',
    keywords: ['이슈', '장애', '버그', '운영', '오류', 'sla', 'incident', 'outage', 'bug', 'error', 'downtime', '모니터링', '실패'],
    context: { en: 'Operations / Issue Tracking', ko: '운영 / 이슈 트래킹' },
  },
  {
    category: 'Finance',
    keywords: ['정산', '결제', '인보이스', '비용', '예산', 'invoice', 'settlement', 'payment', 'budget', 'cost', 'rebate', '리베이트'],
    context: { en: 'Finance / Settlement Follow-up', ko: '재무 / 정산 후속' },
  },
  {
    category: 'Partner',
    keywords: ['파트너', '제휴', '연동', 'api', '통합', 'partner', 'partnership', 'integration', 'connect', 'b2b'],
    context: { en: 'Partner / Integration & Expansion', ko: '파트너 / 연동 & 확장' },
  },
  {
    category: 'Customer',
    keywords: ['고객', '고객사', '영업', '견적', '미팅', '계정', 'client', 'customer', 'sales', 'quote', 'meeting', 'demo', 'account'],
    context: { en: 'Customer / Account Management', ko: '고객사 / 어카운트 관리' },
  },
]

const detectCategory = (text: string): CatRule => {
  const t = text.toLowerCase()
  let best: { rule: CatRule; hits: number } | null = null
  for (const rule of CAT_RULES) {
    const hits = rule.keywords.reduce((n, kw) => (t.includes(kw) ? n + 1 : n), 0)
    if (hits > 0 && (!best || hits > best.hits)) best = { rule, hits }
  }
  return (
    best?.rule ?? {
      category: 'General',
      keywords: [],
      context: { en: 'General Business Relationship', ko: '일반 업무 관계' },
    }
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────
const addDays = (iso: string, n: number): string => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const splitSentences = (text: string): string[] =>
  text
    .split(/[.\n。!?·•]| - |、/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)

const TODO_CUES = ['해야', '필요', '까지', '보내', '확인', '준비', '요청', '검토', '잡아', '확정', '정리', '전달', '받아', '결정', 'todo', 'follow up', 'follow-up', 'need to', 'must ', 'should ', 'send', 'prepare', 'confirm', 'review', 'schedule', 'decide']
const RISK_CUES = ['리스크', '문제', '우려', '지연', '위험', '불가', '차단', '노출', '과도', '실패', '이슈', 'risk', 'issue', 'problem', 'delay', 'block', 'fail', 'concern', 'exposure', 'urgent', '긴급', '병목']
const HIGH_CUES = ['긴급', '오늘', '내일', 'asap', 'urgent', '리스크', '위험', '즉시', 'critical', 'block']

const parseDue = (sentence: string): string => {
  const s = sentence.toLowerCase()
  if (/(오늘|today|asap|즉시|긴급|urgent)/.test(s)) return TODAY
  if (/(내일|tomorrow)/.test(s)) return addDays(TODAY, 1)
  if (/(모레)/.test(s)) return addDays(TODAY, 2)
  if (/(이번\s?주|this week)/.test(s)) return addDays(TODAY, 3)
  if (/(다음\s?주|next week)/.test(s)) return addDays(TODAY, 7)
  if (/(이번\s?달|this month)/.test(s)) return addDays(TODAY, 14)
  const inDays = s.match(/(\d+)\s*(일|days?)/)
  if (inDays) return addDays(TODAY, Math.min(60, parseInt(inDays[1], 10)))
  return addDays(TODAY, 3)
}

const extractAccountName = (text: string, lang: Lang): { name: string; id: string; existing: boolean } => {
  // 1) existing relationship by name
  const lower = text.toLowerCase()
  const match = [...entities]
    .sort((a, b) => b.name.length - a.name.length)
    .find((e) => lower.includes(e.name.toLowerCase()))
  if (match) return { name: match.name, id: match.id, existing: true }

  // 2) "프로젝트 X" / "X 프로젝트"
  const projKo = text.match(/프로젝트\s*([가-힣A-Za-z0-9]+)/) || text.match(/([가-힣A-Za-z0-9]+)\s*프로젝트/)
  if (projKo) return mkNew(projKo[1])

  // 3) English proper noun (company-like) — checked before the loose Korean
  //    suffix heuristic, since company names are usually capitalized English.
  const skip = new Set(['The', 'We', 'They', 'Our', 'Need', 'Today', 'Met', 'Call', 'Sent', 'Review', 'I', 'A', 'An'])
  const enCandidates = [...text.matchAll(/\b([A-Z][A-Za-z0-9&.]+(?:\s+[A-Z][A-Za-z0-9&.]+){0,2})\b/g)]
    .map((m) => m[1].trim())
    .filter((n) => !skip.has(n.split(/\s+/)[0]))
  if (enCandidates.length) return mkNew(enCandidates[0])

  // 4) Korean "X사/팀/와/과" relationship marker — skip common non-name words.
  const KO_STOP = new Set(['경쟁', '협력', '고객', '파트너', '관계', '계열', '당', '본', '지', '자', '우리', '저희', '상대'])
  const ko = text.match(/([가-힣]{2,})\s*(?:사|팀|측|님|와의|과의|와|과)/)
  if (ko && !KO_STOP.has(ko[1]) && !KO_STOP.has(ko[1].slice(0, 2))) return mkNew(ko[1])

  return mkNew(lang === 'ko' ? '새 업무 항목' : 'New Item')

  function mkNew(name: string) {
    const id = 'cap-' + name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '')
    return { name: name.trim(), id, existing: false }
  }
}

// ── main ─────────────────────────────────────────────────────────────────────
export const structureCapture = (text: string, lang: Lang = 'en'): StructuredCapture => {
  const ko = lang === 'ko'
  const cat = detectCategory(text)
  const acct = extractAccountName(text, lang)
  const sentences = splitSentences(text)

  const todoSentences = sentences.filter((s) => TODO_CUES.some((c) => s.toLowerCase().includes(c)))
  const riskSentences = sentences.filter((s) => RISK_CUES.some((c) => s.toLowerCase().includes(c)))

  const todos: StructuredTodo[] = (todoSentences.length ? todoSentences : sentences.slice(0, 1)).slice(0, 5).map((s) => ({
    text: s.replace(/\s+/g, ' ').trim(),
    due: parseDue(s),
    priority: HIGH_CUES.some((c) => s.toLowerCase().includes(c)) ? 'High' : 'Medium',
  }))

  const risks = (riskSentences.length ? riskSentences : []).slice(0, 4).map((s) => s.replace(/\s+/g, ' ').trim())

  const confidence = Math.min(96, 74 + (cat.keywords.length ? 6 : 0) + Math.min(todos.length + risks.length, 4) * 4)

  const summary = ko
    ? `OAC가 "${cat.context.ko}" 맥락을 감지했습니다. ${truncate(text, 180)}`
    : `OAC detected a "${cat.context.en}" context. ${truncate(text, 180)}`

  const timeline: StructuredTimeline = {
    date: TODAY,
    title: ko ? `${acct.name} — 업무 기록` : `${acct.name} — Work note`,
    detail: truncate(text, 220),
  }

  const context = ko ? cat.context.ko : cat.context.en

  // Report draft
  const report = {
    title: ko ? `${acct.name} — ${context} 요약 보고` : `${acct.name} — ${context} Summary`,
    sections: [
      { heading: ko ? '상황' : 'Situation', body: truncate(text, 400) },
      {
        heading: ko ? '핵심 To Do' : 'Key To Dos',
        body: todos.length ? todos.map((t) => `• ${t.text} (${t.due})`).join('\n') : ko ? '없음' : 'None',
      },
      {
        heading: ko ? '리스크' : 'Risks',
        body: risks.length ? risks.map((r) => `• ${r}`).join('\n') : ko ? '식별된 리스크 없음' : 'No risks identified',
      },
      {
        heading: ko ? '다음 액션' : 'Next Action',
        body: todos[0]?.text ?? (ko ? '후속 정리 필요' : 'Follow up'),
      },
    ],
  }

  // Email draft
  const email = {
    subject: ko ? `[${acct.name}] ${context} — 후속 정리` : `[${acct.name}] ${context} — Follow-up`,
    body: ko
      ? `안녕하세요,\n\n${acct.name} 관련 논의 내용을 정리해 공유드립니다.\n\n${truncate(text, 300)}\n\n다음 액션:\n${todos.map((t) => `- ${t.text} (~${t.due})`).join('\n') || '- 후속 확인'}\n\n감사합니다.\nOhmyhotel`
      : `Hello,\n\nSharing a summary of our discussion regarding ${acct.name}.\n\n${truncate(text, 300)}\n\nNext actions:\n${todos.map((t) => `- ${t.text} (~${t.due})`).join('\n') || '- Follow up'}\n\nBest regards,\nOhmyhotel`,
  }

  return {
    accountName: acct.name,
    accountId: acct.id,
    isExisting: acct.existing,
    category: cat.category,
    detectedContext: context,
    contextConfidence: confidence,
    summary,
    timeline,
    todos,
    risks,
    report,
    email,
  }
}

function truncate(s: string, n: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n) + '…' : t
}

// Example prompts for the empty state (bilingual handled in the page).
export const captureExamples: { en: string; ko: string }[] = [
  {
    en: 'Met Klook today on the SLA. 24/7 support not feasible, legal needs to review the compensation wording by next week. Compensation exposure is a big risk.',
    ko: '오늘 Klook과 SLA 미팅. 24/7 지원 불가, 보상 문구 법무 검토 다음주까지 필요. 보상 노출 리스크 큼.',
  },
  {
    en: 'Interviewed a backend candidate for the Platform team. Strong on APIs. Need to send the offer by Friday, schedule a final culture-fit round.',
    ko: '플랫폼팀 백엔드 지원자 면접함. API 강점. 금요일까지 오퍼 보내야 하고, 최종 컬처핏 라운드 잡아야 함.',
  },
  {
    en: 'Grand Hyatt Jeju July contracting — confirm net rate and allotment. Risk: suite inventory may sell out before terms are locked.',
    ko: '그랜드 하얏트 제주 7월 컨트랙팅 — 넷 요율과 얼롯먼트 확정 필요. 리스크: 조건 확정 전 스위트 인벤토리 소진 가능.',
  },
  {
    en: 'Project Atlas migration: API schema update slipping. Need to finalize the cutover plan, ops worried about downtime risk.',
    ko: 'Atlas 마이그레이션 프로젝트: API 스키마 업데이트 지연. 컷오버 계획 확정 필요, 운영팀이 다운타임 리스크 우려.',
  },
]
