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

// Read scopes — requested at login (user-consentable on most tenants).
export const GRAPH_SCOPES = ['User.Read', 'Mail.Read', 'Chat.Read']
// Send is requested INCREMENTALLY — only when the user actually sends an email —
// so the more sensitive Mail.Send permission never blocks login/read/sync.
export const SEND_SCOPES = ['Mail.Send']
// File read (OneDrive / SharePoint) — incremental, only when importing from the cloud drive.
export const FILES_SCOPES = ['Files.Read.All']

export interface MsConnection {
  clientId: string
  tenant: string
}

export interface NormalizedItem {
  source: 'outlook' | 'teams'
  personName: string
  personEmail?: string
  company?: string // derived from the sender's email domain (업체)
  title: string
  preview: string
  body?: string // fuller cleaned body text (for AI summary)
  date: string // ISO date (yyyy-mm-dd)
  link?: string
}

// Free/public mail providers — for these we can't infer a company from the domain.
const PUBLIC_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'gmx.com',
  'naver.com', 'daum.net', 'hanmail.net', 'nate.com', 'kakao.com',
  'qq.com', '163.com', '126.com',
])
const CC_SLDS = new Set(['co.kr', 'co.jp', 'com.cn', 'com.vn', 'co.uk', 'com.tw', 'com.hk', 'or.kr', 'ne.jp'])

/** Infer a company name (업체) from an email domain, falling back to the display name. */
export function companyFromEmail(email?: string, fallback?: string): { company: string; domain?: string } {
  if (!email || !email.includes('@')) return { company: (fallback || 'Unknown').trim() }
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return { company: (fallback || 'Unknown').trim() }
  if (PUBLIC_DOMAINS.has(domain)) return { company: (fallback || domain).trim(), domain }
  const labels = domain.split('.')
  const tld2 = labels.slice(-2).join('.')
  const orgLabel = CC_SLDS.has(tld2) ? labels[labels.length - 3] : labels[labels.length - 2]
  const company = orgLabel ? orgLabel.charAt(0).toUpperCase() + orgLabel.slice(1) : domain
  return { company, domain }
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

async function token(conn: MsConnection, scopes: string[] = GRAPH_SCOPES): Promise<string> {
  const client = await ensureClient(conn)
  if (!account) throw new Error('not-connected')
  try {
    const r = await client.acquireTokenSilent({ scopes, account })
    return r.accessToken
  } catch {
    const r = await client.acquireTokenPopup({ scopes, account })
    return r.accessToken
  }
}

async function graphGet<T>(conn: MsConnection, path: string, scopes: string[] = GRAPH_SCOPES): Promise<T> {
  const t = await token(conn, scopes)
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${t}` },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Graph ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

async function graphPost(conn: MsConnection, path: string, payload: unknown, scopes: string[] = GRAPH_SCOPES): Promise<void> {
  const t = await token(conn, scopes)
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok && res.status !== 202) {
    const body = await res.text().catch(() => '')
    throw new Error(`Graph ${res.status}: ${body.slice(0, 200)}`)
  }
}

/** Send an email from the signed-in account (requires Mail.Send). */
export async function sendMail(conn: MsConnection, mail: { to: string; subject: string; body: string; cc?: string }): Promise<void> {
  const toRecipients = mail.to.split(/[,;]\s*/).filter(Boolean).map((address) => ({ emailAddress: { address: address.trim() } }))
  const ccRecipients = (mail.cc ? mail.cc.split(/[,;]\s*/).filter(Boolean) : []).map((address) => ({ emailAddress: { address: address.trim() } }))
  await graphPost(conn, '/me/sendMail', {
    message: {
      subject: mail.subject,
      body: { contentType: 'Text', content: mail.body },
      toRecipients,
      ...(ccRecipients.length ? { ccRecipients } : {}),
    },
    saveToSentItems: true,
  }, SEND_SCOPES)
}

const isoDate = (s?: string) => (s ? s.slice(0, 10) : TODAY)
const clean = (html?: string) =>
  (html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

// ── Outlook ──────────────────────────────────────────────────────────────────
interface MailMsg {
  subject?: string
  bodyPreview?: string
  body?: { contentType?: string; content?: string }
  receivedDateTime?: string
  webLink?: string
  from?: { emailAddress?: { name?: string; address?: string } }
}

const sinceIso = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

export async function fetchOutlook(conn: MsConnection, opts: { sinceDays?: number; top?: number } = {}): Promise<NormalizedItem[]> {
  const sinceDays = opts.sinceDays ?? 7
  const top = opts.top ?? 100
  const filter = encodeURIComponent(`receivedDateTime ge ${sinceIso(sinceDays)}`)
  const data = await graphGet<{ value: MailMsg[] }>(
    conn,
    `/me/messages?$top=${top}&$select=subject,from,receivedDateTime,bodyPreview,body,webLink&$filter=${filter}&$orderby=receivedDateTime%20desc`,
  )
  return (data.value ?? []).map((m) => {
    const email = m.from?.emailAddress?.address
    const name = m.from?.emailAddress?.name || email || 'Unknown sender'
    return {
      source: 'outlook' as const,
      personName: name,
      personEmail: email,
      company: companyFromEmail(email, name).company,
      title: m.subject || '(no subject)',
      preview: clean(m.bodyPreview),
      body: clean(m.body?.content).slice(0, 2000) || clean(m.bodyPreview),
      date: isoDate(m.receivedDateTime),
      link: m.webLink,
    }
  })
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

export async function fetchTeams(conn: MsConnection, opts: { sinceDays?: number; top?: number } = {}): Promise<NormalizedItem[]> {
  const sinceDays = opts.sinceDays ?? 7
  const top = opts.top ?? 50
  const cutoff = sinceIso(sinceDays)
  const data = await graphGet<{ value: Chat[] }>(
    conn,
    `/me/chats?$top=${top}&$expand=members,lastMessagePreview`,
  )
  const items: NormalizedItem[] = []
  for (const c of data.value ?? []) {
    const preview = c.lastMessagePreview
    if (!preview) continue
    if (preview.createdDateTime && preview.createdDateTime < cutoff) continue // last 7 days only
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
      company: companyFromEmail(email, counterpart).company,
      title: c.topic ? `Teams · ${c.topic}` : 'Teams chat',
      preview: clean(preview.body?.content),
      date: isoDate(preview.createdDateTime),
      link: c.webUrl,
    })
  }
  return items
}

// ── OneDrive / SharePoint files ──────────────────────────────────────────────
export interface DriveFile {
  id: string
  name: string
  lastModified: string
  size: number
}

interface DriveItem {
  id?: string
  name?: string
  size?: number
  lastModifiedDateTime?: string
  file?: { mimeType?: string }
}

/** List recent spreadsheet files across the user's OneDrive + shared (SharePoint) files. */
export async function listDriveSpreadsheets(conn: MsConnection, top = 25): Promise<DriveFile[]> {
  const data = await graphGet<{ value: DriveItem[] }>(
    conn,
    `/me/drive/root/search(q='.xlsx')?$top=${top}&$select=id,name,size,lastModifiedDateTime,file`,
    FILES_SCOPES,
  )
  return (data.value ?? [])
    .filter((f) => f.id && f.name && /\.(xlsx|xls|csv)$/i.test(f.name))
    .map((f) => ({ id: f.id!, name: f.name!, lastModified: (f.lastModifiedDateTime ?? '').slice(0, 10), size: f.size ?? 0 }))
}

export interface DriveEntry {
  id: string
  name: string
  isFolder: boolean
  lastModified: string
  size: number
}

interface DriveItem2 extends DriveItem {
  folder?: { childCount?: number }
}

interface DriveItemP extends DriveItem2 {
  parentReference?: { path?: string }
}

/** Auto-locate the latest weekly/monthly RawData spreadsheets (By Booking Date / By Check Out). */
export async function findRawDataFiles(conn: MsConnection): Promise<{ booking?: DriveFile; checkout?: DriveFile }> {
  const data = await graphGet<{ value: DriveItemP[] }>(
    conn,
    `/me/drive/root/search(q='.xlsx')?$top=200&$select=id,name,size,lastModifiedDateTime,file,parentReference`,
    FILES_SCOPES,
  )
  const files = (data.value ?? [])
    .filter((i) => i.id && i.name && /\.(xlsx|xls|csv)$/i.test(i.name))
    .map((i) => ({
      id: i.id!,
      name: i.name!,
      lastModified: (i.lastModifiedDateTime ?? '').slice(0, 10),
      size: i.size ?? 0,
      path: i.parentReference?.path ?? '',
    }))
  // Classify by the containing folder (parentReference.path), not the filename —
  // both files are often named "Hotel Booking List…".
  const latest = (re: RegExp): DriveFile | undefined => {
    const m = files.filter((f) => (f.path ? re.test(f.path) : re.test(f.name))).sort((a, b) => b.lastModified.localeCompare(a.lastModified))[0]
    return m ? { id: m.id, name: m.name, lastModified: m.lastModified, size: m.size } : undefined
  }
  return { booking: latest(/booking/i), checkout: latest(/check\s*-?\s*out|checkout/i) }
}

/** List folders + spreadsheets inside a drive folder (root if no id) — for browsing into e.g. REPORT. */
export async function listDriveChildren(conn: MsConnection, folderId?: string): Promise<DriveEntry[]> {
  const base = folderId ? `/me/drive/items/${folderId}/children` : '/me/drive/root/children'
  const data = await graphGet<{ value: DriveItem2[] }>(
    conn,
    `${base}?$top=200&$select=id,name,size,lastModifiedDateTime,folder,file`,
    FILES_SCOPES,
  )
  return (data.value ?? [])
    .filter((i) => i.id && i.name)
    .map((i) => ({ id: i.id!, name: i.name!, isFolder: !!i.folder, lastModified: (i.lastModifiedDateTime ?? '').slice(0, 10), size: i.size ?? 0 }))
    .filter((e) => e.isFolder || /\.(xlsx|xls|csv)$/i.test(e.name))
    .sort((a, b) => (a.isFolder === b.isFolder ? a.name.localeCompare(b.name) : a.isFolder ? -1 : 1))
}

/** Download a drive item's content as bytes (for the .xlsx parser). */
export async function downloadDriveItem(conn: MsConnection, id: string): Promise<ArrayBuffer> {
  const t = await token(conn, FILES_SCOPES)
  const res = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`, {
    headers: { Authorization: `Bearer ${t}` },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Graph ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.arrayBuffer()
}

// ── Map fetched items → relationship workspace entries ───────────────────────
const slugFor = (name: string) =>
  'ms-' + name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

/** Optional match to an existing relationship so the email updates that company. */
export interface RelMatch {
  accountId: string
  accountName: string
}

export function itemToCapture(item: NormalizedItem, lang: Lang, match?: RelMatch): StructuredCapture {
  const ko = lang === 'ko'
  const ctx = item.source === 'outlook' ? (ko ? '이메일 · Outlook' : 'Email · Outlook') : (ko ? '메시지 · Teams' : 'Message · Teams')
  // Group by company (업체): an explicit relationship match wins, else the email-domain company.
  const company = item.company || companyFromEmail(item.personEmail, item.personName).company
  const accountName = match?.accountName ?? company
  const accountId = match?.accountId ?? slugFor(accountName)
  // keep the sender visible inside the company timeline; use the fuller body when available
  const text = item.body || item.preview
  const detail = item.personName && item.personName !== accountName ? `${item.personName}: ${text}` : text
  return {
    accountName,
    accountId,
    isExisting: !!match,
    category: 'General',
    detectedContext: ctx,
    contextConfidence: 0.9,
    summary: item.title,
    timeline: { date: item.date, title: item.title, detail },
    todos: [],
    risks: [],
    report: { title: '', sections: [] },
    email: { subject: '', body: '' },
    kind: item.source === 'outlook' ? 'email' : 'meeting',
    detail,
    nextBestAction: ko ? '내용 검토 후 다음 액션 결정' : 'Review and decide the next action',
  }
}

/** Find an existing relationship for an item by company/name overlap (≥3 chars). */
export function matchRelationship(
  item: NormalizedItem,
  relationships: { id: string; name: string }[],
): RelMatch | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]/g, '')
  const company = item.company || companyFromEmail(item.personEmail, item.personName).company
  const cands = [company, item.personName].filter(Boolean).map(norm).filter((c) => c.length >= 3)
  for (const e of relationships) {
    const en = norm(e.name)
    if (en.length < 3) continue
    if (cands.some((c) => en.includes(c) || c.includes(en))) return { accountId: e.id, accountName: e.name }
  }
  return undefined
}
