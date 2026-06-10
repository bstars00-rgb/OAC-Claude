// Real AI engine — calls the Anthropic Messages API directly from the browser.
//
// ⚠️ This requires the user's own API key, stored locally, and sends the
// `anthropic-dangerous-direct-browser-access` header so the call is allowed
// from the browser (CORS). Intended for personal/demo use only — never ship a
// shared/production key to the client.

import type { Attachment } from './files'
import type { Lang } from '../i18n'

const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions'

export type AiProvider = 'anthropic' | 'openai'

export interface ChatTurnLite {
  role: 'user' | 'assistant'
  text: string
}

interface CallOpts {
  provider: AiProvider
  apiKey: string
  model: string
  lang: Lang
  history: ChatTurnLite[]
  userText: string
  attachments: Attachment[]
  crmContext: string
  signature?: string // the user's email signature (name/title/contacts)
  assistantMode?: 'oac' | 'chatgpt'
}

// Build the OAC system prompt, grounded with a compact CRM snapshot.
const systemPrompt = (lang: Lang, crmContext: string, signature?: string, assistantMode: 'oac' | 'chatgpt' = 'oac'): string => {
  const sigLine = signature?.trim()
    ? `\n\nWhen you draft an email, end it with EXACTLY this signature (verbatim, do NOT invent placeholders like [your name] / [직책] / [연락처]):\n${signature.trim()}`
    : ''
  const langLine =
    lang === 'ko'
      ? 'Always answer in Korean (한국어).'
      : "Answer in the user's language (Korean if they write Korean, otherwise English)."
  const persona =
    assistantMode === 'chatgpt'
      ? `You are a brilliant, general-purpose AI assistant (ChatGPT-style) embedded in OAC. Answer ANYTHING the user asks — general knowledge, analysis, writing, coding, brainstorming, document & image understanding — thoroughly, helpfully, and naturally, exactly like ChatGPT would. Do not restrict yourself to CRM topics. You ALSO have the user's CRM context and tools below; weave them in when relevant.`
      : `You are OAC (Ohmyhotel AI CRM), a context-based AI sales & relationship CRM assistant.
You help with EVERY business relationship: customers, suppliers, partners, projects, recruiting, legal, and operations.
Behave like an AI workspace: answer questions, summarize uploaded images and documents, and when the user shares work notes or updates worth tracking, save them as CRM records.`
  return `${persona}
Be concise, practical, and specific. ${langLine}

Reply naturally and conversationally, like a sharp colleague — do NOT announce that you are "structuring this into Account / Timeline / To Do / Risk". When you save a note, reference relevant prior context from the snapshot below (e.g. "this updates X", "that's your 2nd note on X", running to-do counts), and end with one short, proactive suggestion or follow-up.

When the user's message (or an attached document/image) contains trackable work content — including when you DO something on an existing relationship (review a contract, log a meeting, draft an email/report, or record an update) — append EXACTLY ONE fenced block at the very end of your reply:
\`\`\`oac
{ "account": "string", "isExisting": true|false, "category": "Customer|Supplier|Partner|Project|Recruiting|Legal|Operations|Finance|General", "detectedContext": "short label", "summary": "string", "kind": "note|review|meeting|email|report|update", "nextBestAction": "string (updated recommendation)", "detail": "string (longer result, e.g. review findings)", "timeline": { "title": "string", "detail": "string" }, "todos": [ { "text": "string", "due": "YYYY-MM-DD or empty", "priority": "High|Medium|Low" } ], "risks": [ "string" ] }
\`\`\`
For an existing relationship set "isExisting": true and the matching "account" name, and fill "kind" + "nextBestAction" so Relationship 360 stays in sync. If the message is only a question or chit-chat with nothing to track, do NOT append the block. Never wrap the block in extra commentary.

When the user asks you to draft, write, or send an EMAIL, ALSO append EXACTLY ONE additional fenced block so the app can render a Send button:
\`\`\`oac-email
{ "to": "recipient@example.com or empty if unknown", "subject": "string", "body": "the full email body as plain text" }
\`\`\`
Put the complete email in the "body" field (plain text, with greeting and sign-off). Leave "to" empty if you don't know the address — the user can fill it in. Keep your prose to a short intro line (e.g. "초안입니다:") and put the email itself ONLY inside the oac-email block, not also in the prose, to avoid duplication.

Known CRM relationships and recent captures (use to ground your answers; do not invent data):
${crmContext}${sigLine}`
}

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
  if (opts.provider === 'openai') return callOpenAI(opts)
  return callAnthropic(opts)
}

async function callAnthropic(opts: CallOpts): Promise<string> {
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
      system: systemPrompt(opts.lang, opts.crmContext, opts.signature, opts.assistantMode),
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

// ── lightweight single-turn text completion (provider-aware) ─────────────────
export async function callText(opts: { provider: AiProvider; apiKey: string; model: string; system: string; user: string }): Promise<string> {
  if (opts.provider === 'openai') {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}` },
      body: JSON.stringify({ model: opts.model, max_tokens: 600, messages: [{ role: 'system', content: opts.system }, { role: 'user', content: opts.user }] }),
    })
    if (!res.ok) throw new Error(`OpenAI ${res.status}`)
    const data = await res.json()
    return String(data.choices?.[0]?.message?.content ?? '').trim()
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': opts.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: opts.model, max_tokens: 600, system: opts.system, messages: [{ role: 'user', content: opts.user }] }),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}`)
  const data = await res.json()
  return ((data.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n')).trim()
}

/** One-line, action-oriented summary of a company's recent emails. */
export async function summarizeCompanyEmails(
  opts: { provider: AiProvider; apiKey: string; model: string; lang: Lang },
  company: string,
  emails: { subject: string; body: string; date: string }[],
): Promise<string> {
  const langLine = opts.lang === 'ko' ? '한국어로' : 'in English'
  const system = `You are OAC, a B2B relationship CRM. Summarize a company's recent emails into ONE concise, action-oriented line ${langLine} (status + what to do next). No preamble, no bullet points.`
  const corpus = emails
    .slice(0, 8)
    .map((e) => `[${e.date}] ${e.subject}\n${e.body}`)
    .join('\n\n---\n\n')
    .slice(0, 6000)
  const user = `Company: ${company}\n\nRecent emails:\n${corpus}\n\nOne-line summary + next action:`
  return callText({ ...opts, system, user })
}

// ── OpenAI (ChatGPT) ─────────────────────────────────────────────────────────
// Browser-direct, BYO key. The OpenAI API returns CORS headers, so a fetch from
// the browser works (the same model the official SDK enables via
// `dangerouslyAllowBrowser`). Personal/demo use only.
type OpenAIContent =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

const buildOpenAIContent = (userText: string, attachments: Attachment[]): OpenAIContent[] => {
  const blocks: OpenAIContent[] = []
  for (const a of attachments) {
    if (a.kind === 'image' && a.dataBase64) {
      blocks.push({ type: 'image_url', image_url: { url: `data:${a.mediaType};base64,${a.dataBase64}` } })
    } else if (a.kind === 'text' && a.text) {
      blocks.push({ type: 'text', text: `Attached file "${a.name}":\n\n${a.text}` })
    } else if (a.kind === 'pdf') {
      blocks.push({ type: 'text', text: `Attached PDF "${a.name}" — (PDF binary not sent to ChatGPT in this prototype; paste key text if you need it analyzed).` })
    } else {
      blocks.push({ type: 'text', text: `Attached file "${a.name}" (${a.mediaType}) — content not extractable in this prototype.` })
    }
  }
  blocks.push({ type: 'text', text: userText || 'Please review the attached file(s).' })
  return blocks
}

async function callOpenAI(opts: CallOpts): Promise<string> {
  const messages = [
    { role: 'system' as const, content: systemPrompt(opts.lang, opts.crmContext, opts.signature, opts.assistantMode) },
    ...opts.history.map((t) => ({ role: t.role, content: t.text })),
    { role: 'user' as const, content: buildOpenAIContent(opts.userText, opts.attachments) },
  ]

  const res = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 2048,
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
    throw new Error(`OpenAI API ${res.status}: ${detail}`)
  }

  const data = await res.json()
  return String(data.choices?.[0]?.message?.content ?? '').trim()
}
