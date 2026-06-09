// Real AI engine — calls the Anthropic Messages API directly from the browser.
//
// ⚠️ This requires the user's own API key, stored locally, and sends the
// `anthropic-dangerous-direct-browser-access` header so the call is allowed
// from the browser (CORS). Intended for personal/demo use only — never ship a
// shared/production key to the client.

import type { Attachment } from './files'
import { entities } from '../data/entities'
import { metricsByEntity } from '../data/salesData'
import type { Lang } from '../i18n'

const ENDPOINT = 'https://api.anthropic.com/v1/messages'

export interface ChatTurnLite {
  role: 'user' | 'assistant'
  text: string
}

interface CallOpts {
  apiKey: string
  model: string
  lang: Lang
  history: ChatTurnLite[]
  userText: string
  attachments: Attachment[]
  crmContext: string
}

// Build the OAC system prompt, grounded with a compact CRM snapshot.
const systemPrompt = (lang: Lang, crmContext: string): string => {
  const langLine =
    lang === 'ko'
      ? 'Always answer in Korean (한국어).'
      : "Answer in the user's language (Korean if they write Korean, otherwise English)."
  return `You are OAC (Ohmyhotel AI CRM), a context-based AI sales & relationship CRM assistant.
You help with EVERY business relationship: customers, suppliers, partners, projects, recruiting, legal, and operations.
Behave like an AI workspace: answer questions, summarize uploaded images and documents, and when the user shares work notes or updates worth tracking, structure them into CRM records. Be concise, practical, and specific. ${langLine}

When the user's message (or an attached document/image) contains trackable work content, append EXACTLY ONE fenced block at the very end of your reply:
\`\`\`oac
{ "account": "string", "isExisting": true|false, "category": "Customer|Supplier|Partner|Project|Recruiting|Legal|Operations|Finance|General", "detectedContext": "short label", "summary": "string", "timeline": { "title": "string", "detail": "string" }, "todos": [ { "text": "string", "due": "YYYY-MM-DD or empty", "priority": "High|Medium|Low" } ], "risks": [ "string" ] }
\`\`\`
If the message is only a question or chit-chat with nothing to track, do NOT append the block. Never wrap the block in extra commentary.

Known CRM relationships and recent captures (use to ground your answers; do not invent data):
${crmContext}`
}

// Compact CRM context from the seeded relationships (English source for grounding).
export const buildEntityContext = (): string =>
  entities
    .map((e) => {
      const m = metricsByEntity(e.id)
      const metric =
        m && m.kind === 'booking'
          ? ` | ${m.bookings} bookings/mo, ${m.failureRate}% failure`
          : ''
      return `- ${e.name} [${e.detectedContext}] owner ${e.owner}, ${e.region}, health ${e.relationshipHealthScore}. Focus: ${e.currentFocus}. Next: ${e.nextBestAction}${metric}`
    })
    .join('\n')

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }

const buildUserContent = (userText: string, attachments: Attachment[]): ContentBlock[] => {
  const blocks: ContentBlock[] = []
  for (const a of attachments) {
    if (a.kind === 'image' && a.dataBase64) {
      blocks.push({ type: 'image', source: { type: 'base64', media_type: a.mediaType, data: a.dataBase64 } })
    } else if (a.kind === 'pdf' && a.dataBase64) {
      blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: a.dataBase64 } })
    } else if (a.kind === 'text' && a.text) {
      blocks.push({ type: 'text', text: `Attached file "${a.name}":\n\n${a.text}` })
    } else {
      blocks.push({ type: 'text', text: `Attached file "${a.name}" (${a.mediaType}) — content not extractable in this prototype.` })
    }
  }
  blocks.push({ type: 'text', text: userText || 'Please review the attached file(s).' })
  return blocks
}

export async function callAssistant(opts: CallOpts): Promise<string> {
  const messages = [
    ...opts.history.map((t) => ({ role: t.role, content: t.text })),
    { role: 'user' as const, content: buildUserContent(opts.userText, opts.attachments) },
  ]

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 2048,
      system: systemPrompt(opts.lang, opts.crmContext),
      messages,
    }),
  })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const err = await res.json()
      detail = err?.error?.message ?? detail
    } catch {
      /* ignore */
    }
    throw new Error(`Anthropic API ${res.status}: ${detail}`)
  }

  const data = await res.json()
  const text: string = (data.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('\n')
    .trim()
  return text
}
