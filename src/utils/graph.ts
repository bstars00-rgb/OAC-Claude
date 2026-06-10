// Microsoft 365 (Outlook + Teams) integration via Microsoft Graph.
//
// No backend: we use MSAL.js (PKCE, public client) entirely in the browser with
// the USER'S OWN Azure app registration (Client ID). After sign-in, Graph is
// called directly from the browser (Graph supports CORS for SPA tokens). The
// fetched mail / chats are mapped into the same relationship workspace the rest
// of OAC runs on — so the app works on the user's real data.
//
// Nothing is sent anywhere except Microsoft. No secrets are stored; MSAL keeps
// its token cache in the browser only.

import type { StructuredCapture } from './captureAI'
import { TODAY } from './format'
import type { Lang } from '../i18n'

// Delegated scopes — all user-consentable (no admin) on most tenants.
export const GRAPH_SCOPES = ['User.Read', 'Mail.Read', 'Chat.Read']

export interface MsConnection {
  clientId: string
  tenant: string
}

export interface NormalizedItem {
  source: 'outlook' | 'teams'
  personName: string
  personEmail?: string
  title: string
  preview: string
  date: string // ISO date (yyyy-mm-dd)
  link?: string
}

// The Azure SPA redirect URI the user must register (shown in Settings).
export function redirectUri(): string {
  try {
    return window.location.origin + import.meta.env.BASE_URL
  } catch {
    return '/'
  }
}

// ── MSAL singleton ───────────────────────────────────────────────────────────
// Loaded lazily so the ~70KB auth library never enters the core bundle unless
// the user actually connects Microsoft 365.
type Pca = import('@azure/msal-browser').PublicClientApplication
type Account = import('@azure/msal-browser').AccountInfo

let pca: Pca | null = null
let pcaKey = '' // clientId|tenant the current pca was built for
let account: Account | null = null

async function ensureClient(conn: MsConnection): Promise<Pca> {
  const key = `${conn.clientId}|${conn.tenant}`
  if (pca && pcaKey === key) return pca
  const msal = await import('@azure/msal-browser')
  pca = new msal.PublicClientApplication({
    auth: {
      clientId: conn.clientId.trim(),
      authority: `https://login.microsoftonline.com/${conn.tenant || 'common'}`,
      redirectUri: redirectUri(),
    },
    cache: { cacheLocation: 'localStorage' },
  })
  await pca.initialize()
  pcaKey = key
  // Restore a cached account from a previous session.
  const all = pca.getAllAccounts()
  account = all[0] ?? null
  if (account) pca.setActiveAccount(account)
  return pca
}

/** Re-attach to a cached session (if any) without prompting. Returns the signed-in name or null. */
export async function restore(conn: MsConnection): Promise<string | null> {
  if (!conn.clientId.trim()) return null
  try {
    await ensureClient(conn)
    return account?.name ?? account?.username ?? null
  } catch {
    return null
  }
}

/** Interactive sign-in (popup). Returns the signed-in display name. */
export async function connect(conn: MsConnection): Promise<string> {
  const client = await ensureClient(conn)
  const res = await client.loginPopup({ scopes: GRAPH_SCOPES, prompt: 'select_account' })
  account = res.account
  client.setActiveAccount(account)
  return account?.name ?? account?.username ?? 'Microsoft 365'
}

export async function disconnect(conn: MsConnection): Promise<void> {
  if (!pca || !account) {
    account = null
    return
  }
  try {
    await pca.logoutPopup({ account })
  } catch {
    /* ignore — clear locally anyway */
  }
  account = null
}

export function activeName(): string | null {
  return account?.name ?? account?.username ?? null
}

async function token(conn: MsConnection): Promise<string> {
  const client = await ensureClient(conn)
  if (!account) throw new Error('not-connected')
  try {
    const r = await client.acquireTokenSilent({ scopes: GRAPH_SCOPES, account })
    return r.accessToken
  } catch {
    const r = await client.acquireTokenPopup({ scopes: GRAPH_SCOPES, account })
    return r.accessToken
  }
}

async function graphGet<T>(conn: MsConnection, path: string): Promise<T> {
  const t = await token(conn)
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${t}` },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Graph ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

const isoDate = (s?: string) => (s ? s.slice(0, 10) : TODAY)
const clean = (html?: string) =>
  (html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

// ── Outlook ──────────────────────────────────────────────────────────────────
interface MailMsg {
  subject?: string
  bodyPreview?: string
  receivedDateTime?: string
  webLink?: string
  from?: { emailAddress?: { name?: string; address?: string } }
}

export async function fetchOutlook(conn: MsConnection, top = 15): Promise<NormalizedItem[]> {
  const data = await graphGet<{ value: MailMsg[] }>(
    conn,
    `/me/messages?$top=${top}&$select=subject,from,receivedDateTime,bodyPreview,webLink&$orderby=receivedDateTime desc`,
  )
  return (data.value ?? []).map((m) => ({
    source: 'outlook' as const,
    personName: m.from?.emailAddress?.name || m.from?.emailAddress?.address || 'Unknown sender',
    personEmail: m.from?.emailAddress?.address,
    title: m.subject || '(no subject)',
    preview: clean(m.bodyPreview),
    date: isoDate(m.receivedDateTime),
    link: m.webLink,
  }))
}

// ── Teams ────────────────────────────────────────────────────────────────────
interface ChatMember {
  displayName?: string
  email?: string
  userId?: string
}
interface ChatMsgPreview {
  createdDateTime?: string
  body?: { content?: string }
  from?: { user?: { displayName?: string } }
}
interface Chat {
  topic?: string
  chatType?: string
  members?: ChatMember[]
  lastMessagePreview?: ChatMsgPreview
  webUrl?: string
}

export async function fetchTeams(conn: MsConnection, top = 15): Promise<NormalizedItem[]> {
  const data = await graphGet<{ value: Chat[] }>(
    conn,
    `/me/chats?$top=${top}&$expand=members,lastMessagePreview`,
  )
  const items: NormalizedItem[] = []
  for (const c of data.value ?? []) {
    const preview = c.lastMessagePreview
    if (!preview) continue
    const others = (c.members ?? []).filter((m) => m.displayName)
    const counterpart =
      c.topic ||
      preview.from?.user?.displayName ||
      others.map((m) => m.displayName).filter(Boolean).slice(0, 2).join(', ') ||
      'Teams chat'
    const email = others.find((m) => m.email)?.email
    items.push({
      source: 'teams',
      personName: counterpart,
      personEmail: email,
      title: c.topic ? `Teams · ${c.topic}` : 'Teams chat',
      preview: clean(preview.body?.content),
      date: isoDate(preview.createdDateTime),
      link: c.webUrl,
    })
  }
  return items
}

// ── Map fetched items → relationship workspace entries ───────────────────────
const slugFor = (name: string) =>
  'ms-' + name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

export function itemToCapture(item: NormalizedItem, lang: Lang): StructuredCapture {
  const ko = lang === 'ko'
  const ctx = item.source === 'outlook' ? (ko ? '이메일 · Outlook' : 'Email · Outlook') : (ko ? '메시지 · Teams' : 'Message · Teams')
  return {
    accountName: item.personName,
    accountId: slugFor(item.personName),
    isExisting: false,
    category: 'General',
    detectedContext: ctx,
    contextConfidence: 0.9,
    summary: item.title,
    timeline: { date: item.date, title: item.title, detail: item.preview },
    todos: [],
    risks: [],
    report: { title: '', sections: [] },
    email: { subject: '', body: '' },
    kind: item.source === 'outlook' ? 'email' : 'meeting',
    detail: item.preview,
    nextBestAction: ko ? '내용 검토 후 다음 액션 결정' : 'Review and decide the next action',
  }
}
