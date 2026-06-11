// Supabase cloud sync — the user's own project (URL + anon key, both public-safe;
// Row-Level Security restricts every row to its owner). Auth is email magic-link.
// Cloud state reuses the local Backup JSON (secrets already stripped), stored as a
// single JSONB row per user in `oac_state`.
//
// The library is dynamically imported so it never enters the core bundle unless
// the user configures cloud sync.

import { exportBackup, importBackup } from './backup'

type Client = import('@supabase/supabase-js').SupabaseClient
type Session = import('@supabase/supabase-js').Session | null

export interface SbConfig {
  url: string
  anonKey: string
}

let client: Client | null = null
let clientKey = ''

// Forgive common paste mistakes: dashboard URLs, trailing slashes, missing scheme,
// or an accidental path. Returns the clean API origin: https://<ref>.supabase.co
export function normalizeSupabaseUrl(raw: string): string {
  let s = (raw || '').trim()
  if (!s) return ''
  const dash = s.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i)
  if (dash) return `https://${dash[1]}.supabase.co`
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s
  try {
    const u = new URL(s)
    return `${u.protocol}//${u.host}`
  } catch {
    return s.replace(/\/+$/, '')
  }
}

export function isConfigured(c: SbConfig): boolean {
  return /^https?:\/\/.+\..+/.test(normalizeSupabaseUrl(c.url)) && c.anonKey.trim().length > 20
}

async function getClient(c: SbConfig): Promise<Client> {
  const url = normalizeSupabaseUrl(c.url)
  const key = `${url}|${c.anonKey}`
  if (client && clientKey === key) return client
  const { createClient } = await import('@supabase/supabase-js')
  client = createClient(url, c.anonKey.trim(), {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
  clientKey = key
  return client
}

function redirectUrl(): string {
  try {
    return window.location.origin + import.meta.env.BASE_URL
  } catch {
    return '/'
  }
}

export async function getSession(c: SbConfig): Promise<Session> {
  if (!isConfigured(c)) return null
  const sb = await getClient(c)
  const { data } = await sb.auth.getSession()
  return data.session
}

export async function onAuthChange(c: SbConfig, cb: (session: Session) => void): Promise<() => void> {
  const sb = await getClient(c)
  const { data } = sb.auth.onAuthStateChange((_evt, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export async function sendMagicLink(c: SbConfig, email: string): Promise<void> {
  const sb = await getClient(c)
  const { error } = await sb.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: redirectUrl() },
  })
  if (error) throw new Error(error.message)
}

export async function signOut(c: SbConfig): Promise<void> {
  const sb = await getClient(c)
  await sb.auth.signOut()
}

/** The cloud row's last-updated timestamp (for conflict detection), or null. */
export async function getCloudUpdatedAt(c: SbConfig): Promise<string | null> {
  const sb = await getClient(c)
  const { data: u } = await sb.auth.getUser()
  if (!u.user) return null
  const { data } = await sb.from('oac_state').select('updated_at').eq('user_id', u.user.id).maybeSingle()
  return (data?.updated_at as string | undefined) ?? null
}

/**
 * Upload the local OAC state (Backup JSON, secrets stripped) to the cloud.
 * If `ifNewerThan` is given and the cloud row is newer than it, the push is
 * SKIPPED (another device wrote newer data — don't clobber it). Returns whether
 * it actually pushed, plus the cloud timestamp when skipped.
 */
export async function pushState(c: SbConfig, stampedAt: string, opts?: { ifNewerThan?: string }): Promise<{ pushed: boolean; cloudUpdatedAt?: string }> {
  const sb = await getClient(c)
  const { data: u } = await sb.auth.getUser()
  if (!u.user) throw new Error('not-signed-in')
  if (opts?.ifNewerThan) {
    const cloudAt = await getCloudUpdatedAt(c)
    if (cloudAt && cloudAt > opts.ifNewerThan) return { pushed: false, cloudUpdatedAt: cloudAt }
  }
  const backup = JSON.parse(exportBackup(stampedAt))
  const { error } = await sb
    .from('oac_state')
    .upsert({ user_id: u.user.id, data: backup, updated_at: stampedAt }, { onConflict: 'user_id' })
  if (error) throw new Error(error.message)
  return { pushed: true }
}

/** Pull the cloud state into localStorage. Returns false if the cloud is empty. */
export async function pullState(c: SbConfig): Promise<boolean> {
  const sb = await getClient(c)
  const { data: u } = await sb.auth.getUser()
  if (!u.user) throw new Error('not-signed-in')
  const { data, error } = await sb.from('oac_state').select('data').eq('user_id', u.user.id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data?.data) return false
  importBackup(JSON.stringify(data.data))
  return true
}
