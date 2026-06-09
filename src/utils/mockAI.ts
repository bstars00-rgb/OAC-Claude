// Mock AI engine for "Ask OAC" and the Email Assistant.
//
// Deterministic logic dressed up to feel like an AI response. No real model is
// called. The Ask OAC page composes the rich briefing from the data helpers;
// this module resolves intent + entity and generates email drafts.

import { entities, localizeEntity, type Entity } from '../data/entities'
import { draftSeedForEntity } from '../data/emails'

export type Intent =
  | 'overview'
  | 'next-action'
  | 'draft-email'
  | 'report'
  | 'issue-status'
  | 'sales-data'
  | 'meeting-summary'
  | 'unknown'

export interface OACResult {
  intent: Intent
  entity?: Entity
  suggestions: string[]
  notFound?: boolean
}

const matchEntity = (query: string): Entity | undefined => {
  const q = query.toLowerCase()
  const found = [...entities]
    .sort((a, b) => b.name.length - a.name.length)
    .find((e) => q.includes(e.name.toLowerCase()))
  return found ? localizeEntity(found) : undefined
}

export const detectIntent = (query: string): Intent => {
  const q = query.toLowerCase()
  if (/(draft|write|send).*(email|mail)/.test(q) || q.includes('email to')) return 'draft-email'
  if (q.includes('report') || q.includes('briefing') || q.includes('ceo')) return 'report'
  if (q.includes('issue') || q.includes('problem') || q.includes('risk') || q.includes('blocked') || q.includes('status'))
    return 'issue-status'
  if (q.includes('sales') || q.includes('data') || q.includes('revenue') || q.includes('ttv') || q.includes('booking'))
    return 'sales-data'
  if (q.includes('meeting') || q.includes('summarize') || q.includes('call')) return 'meeting-summary'
  if (q.includes('next') || q.includes('what should') || q.includes('do with')) return 'next-action'
  return 'overview'
}

export const askOAC = (query: string): OACResult => {
  const entity = matchEntity(query)
  const intent = detectIntent(query)

  if (!entity) {
    return {
      intent: 'unknown',
      notFound: true,
      suggestions: [
        'Show me Yeogi Eottae',
        'What should I do next with Klook?',
        'Create a CEO report for Hotelbeds',
        'Show me Dida issue status',
      ],
    }
  }

  return {
    intent,
    entity,
    suggestions: [
      `What should I do next with ${entity.name}?`,
      `Draft an email to ${entity.name}`,
      `Create a CEO report for ${entity.name}`,
      `Show me ${entity.name} data`,
    ],
  }
}

// Example prompts shown on the Ask OAC landing state.
export const examplePrompts: string[] = [
  'Show me Yeogi Eottae',
  'Show me Grand Hyatt Jeju',
  'Show me Medical Korea Service',
  'Show me SUP Da Nang',
  'What should I do next with Klook?',
  'Draft an email to iTANK',
  'Create a CEO report for Hotelbeds',
  'Show me Dida issue status',
  'Show me Traveloka data',
]

// ── Email draft generation ──────────────────────────────────────────────────

export type EmailTone = 'Professional' | 'Friendly' | 'Firm' | 'Concise' | 'Executive'
export type EmailLanguage = 'English' | 'Korean' | 'Vietnamese' | 'Chinese'
export type EmailPurpose =
  | 'API Integration Inquiry'
  | 'Follow-up After Meeting'
  | 'Commercial Condition Confirmation'
  | 'SLA Clarification'
  | 'Issue Escalation'
  | 'Hotel Rate Request'
  | 'Supplier Product Confirmation'
  | 'Corporate Cooperation Proposal'
  | 'Internal Alignment Request'
  | 'Thank You Email'

export const emailPurposes: EmailPurpose[] = [
  'API Integration Inquiry',
  'Follow-up After Meeting',
  'Commercial Condition Confirmation',
  'SLA Clarification',
  'Issue Escalation',
  'Hotel Rate Request',
  'Supplier Product Confirmation',
  'Corporate Cooperation Proposal',
  'Internal Alignment Request',
  'Thank You Email',
]

export const emailTones: EmailTone[] = ['Professional', 'Friendly', 'Firm', 'Concise', 'Executive']
export const emailLanguages: EmailLanguage[] = ['English', 'Korean', 'Vietnamese', 'Chinese']

export interface GeneratedDraft {
  to: string
  subject: string
  body: string
}

const purposeSubject: Record<EmailPurpose, string> = {
  'API Integration Inquiry': 'API Integration and Partner Connectivity Inquiry',
  'Follow-up After Meeting': 'Follow-up — Next Steps',
  'Commercial Condition Confirmation': 'Commercial Conditions — Confirmation',
  'SLA Clarification': 'SLA — Clarification & Proposal',
  'Issue Escalation': 'Issue Escalation — Action Required',
  'Hotel Rate Request': 'Rate, Availability & Allotment Request',
  'Supplier Product Confirmation': 'Product Setup — Operating Conditions Confirmation',
  'Corporate Cooperation Proposal': 'Cooperation Proposal — Net Rate & Settlement',
  'Internal Alignment Request': 'Internal Alignment Request',
  'Thank You Email': 'Thank You',
}

const greeting = (lang: EmailLanguage, name: string): string => {
  switch (lang) {
    case 'Korean':
      return `${name} 팀께,`
    case 'Vietnamese':
      return `Kính gửi đội ngũ ${name},`
    case 'Chinese':
      return `尊敬的 ${name} 团队，`
    default:
      return `Dear ${name} Team,`
  }
}

const signoff = (lang: EmailLanguage, owner: string): string => {
  switch (lang) {
    case 'Korean':
      return `감사합니다.\n\n${owner}\nOhmyhotel`
    case 'Vietnamese':
      return `Trân trọng,\n${owner}\nOhmyhotel`
    case 'Chinese':
      return `此致敬礼，\n${owner}\nOhmyhotel`
    default:
      return `Best regards,\n${owner}\nOhmyhotel`
  }
}

/**
 * Generate a context-aware email draft. Prefers a curated seed for the entity
 * (e.g. the iTANK official inquiry), otherwise synthesizes from the relationship
 * context, then adapts to tone / language.
 */
export const buildEmailDraft = (
  entity: Entity,
  purpose: EmailPurpose,
  tone: EmailTone,
  language: EmailLanguage,
): GeneratedDraft => {
  const seed = draftSeedForEntity(entity.id)
  // Use the curated seed when it matches the natural purpose of the relationship.
  if (seed && language === 'English' && tone !== 'Concise') {
    return seed
  }

  const to = seed?.to ?? `partnerships@${entity.id}.example`
  const subject =
    seed && language === 'English' ? seed.subject : purposeSubject[purpose]

  let bodyCore: string
  if (language === 'English') {
    const open =
      tone === 'Executive'
        ? `This is ${entity.owner} from Ohmyhotel.`
        : tone === 'Friendly'
          ? `This is ${entity.owner} from Ohmyhotel — hope you're well.`
          : `This is ${entity.owner} from Ohmyhotel.`
    bodyCore = `${open}

Regarding ${entity.currentFocus.toLowerCase()}, ${entity.recommendedAction}

${tone === 'Firm' ? 'We would appreciate your confirmation on the items above so we can proceed without delay.' : 'Could you kindly confirm the next steps so we can move forward together?'}`
    if (tone === 'Concise') {
      bodyCore = `This is ${entity.owner} from Ohmyhotel. ${entity.nextBestAction}. Could you confirm the next step?`
    }
  } else if (language === 'Korean') {
    bodyCore = `Ohmyhotel ${entity.owner}입니다.

${entity.currentFocus} 관련하여 다음 사항을 확인 부탁드립니다.

${entity.recommendedAction}`
  } else if (language === 'Vietnamese') {
    bodyCore = `Tôi là ${entity.owner} từ Ohmyhotel.

Về việc ${entity.currentFocus.toLowerCase()}, mong quý đối tác xác nhận các bước tiếp theo. ${entity.nextBestAction}.`
  } else {
    bodyCore = `我是 Ohmyhotel 的 ${entity.owner}。

关于${entity.currentFocus}，希望确认后续步骤。${entity.nextBestAction}。`
  }

  const body = `${greeting(language, entity.name)}\n\n${bodyCore}\n\n${signoff(language, entity.owner)}`
  return { to, subject, body }
}
