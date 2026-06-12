import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { useT } from '../i18n'
import { useAiSettings, AI_MODELS } from '../utils/aiSettings'
import { useCaptureStore } from '../data/captureStore'
import { useDatasets } from '../data/datasetStore'
import { useRelationships } from '../data/useRelationships'
import { useToast } from '../components/Toast'
import { TODAY } from '../utils/format'
import { exportBackup, importBackup } from '../utils/backup'
import {
  isConfigured as sbConfigured,
  getSession as sbSession,
  onAuthChange as sbOnAuth,
  sendMagicLink as sbMagicLink,
  signOut as sbSignOut,
  pushState as sbPush,
  pullState as sbPull,
  getCloudUpdatedAt as sbCloudAt,
  myOrg as sbMyOrg,
  joinOrg as sbJoinOrg,
  leaveOrg as sbLeaveOrg,
} from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { IntegrationsContent } from './Integrations'
import { DataImportPanel } from '../components/DataImportPanel'
import { AccountCleanup } from '../components/AccountCleanup'
import { UsageCard } from '../components/UsageCard'
import { notifySupported, notifyPermission, requestNotifyPermission, showNotification } from '../utils/notify'
import { listMcpTools, callMcpTool, type McpTool } from '../utils/mcpClient'
import {
  connect as msConnect,
  disconnect as msDisconnect,
  restore as msRestore,
  redirectUri,
  GRAPH_SCOPES,
} from '../utils/graph'
import { syncMicrosoft, LAST_SYNC_KEY } from '../utils/msSync'

export function Settings() {
  const { t, lang } = useT()
  const ai = useAiSettings()
  const store = useCaptureStore()

  return (
    <div className="oac-fade-in space-y-5">
      <PageHeader title={t('page.settings.title')} subtitle={t('page.settings.subtitle')} />

      {/* AI Engine */}
      <Card>
        <div className="flex items-center justify-between">
          <CardHeader title={t('set.aiEngine')} subtitle={t('set.aiEngineSub')} icon={<SparkIcon />} />
          <Badge tone={ai.isLive ? 'green' : 'slate'} dot>{ai.isLive ? `${t('asst.liveMode')} · ${ai.model.replace('claude-', '')}` : t('asst.demoMode')}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(['demo', 'live'] as const).map((mode) => (
            <button key={mode} onClick={() => ai.setMode(mode)} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${ai.mode === mode ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
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
              <select value={ai.model} onChange={(e) => ai.setModel(e.target.value)} className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
                {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <p className="mt-1 text-[11px] text-slate-400">{lang === 'ko' ? 'Claude와 ChatGPT 키를 모두 저장해두면, 모델만 바꿔 언제든 둘 다 사용할 수 있어요.' : 'Save both keys once — switch the model anytime to use Claude or ChatGPT.'}</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Anthropic (Claude) API Key</label>
              <input type="password" value={ai.apiKey} onChange={(e) => ai.setApiKey(e.target.value)} placeholder="sk-ant-..." className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-brand-600 hover:text-brand-700">{t('set.getKey')} →</a>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">OpenAI (ChatGPT) API Key</label>
              <input type="password" value={ai.openaiKey} onChange={(e) => ai.setOpenaiKey(e.target.value)} placeholder="sk-..." className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-brand-600 hover:text-brand-700">{t('set.getKey')} →</a>
            </div>
            <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">⚠️ {t('set.warn')}</div>
          </div>
        )}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
          {t('set.autosaved')}
        </div>
      </Card>

      {/* API token usage & cost */}
      <UsageCard />

      {/* Desktop notifications */}
      <NotificationCard />

      {/* Cloud sync (Supabase) */}
      <CloudSyncCard />

      {/* Team / org (RBAC) */}
      <TeamCard />

      {/* Backup & Restore */}
      <BackupCard />

      {/* Account cleanup / merge */}
      <AccountCleanup />

      {/* Workspace */}
      <Card>
        <CardHeader title={t('set.workspace')} subtitle={`${store.stats.accounts} accounts · ${store.stats.entries} captures · ${store.stats.openTodos} open to-dos`} icon={<DbIcon />} />
        <Button variant="secondary" size="sm" onClick={() => { if (window.confirm(lang === 'ko' ? '워크스페이스 데이터를 모두 지울까요?' : 'Clear all workspace data?')) store.clearAll() }}>{t('set.clearWorkspace')}</Button>
      </Card>

      {/* Email signature */}
      <SignatureCard />

      {/* Microsoft 365 — Outlook + Teams (real Graph connection) */}
      <MicrosoftCard />

      {/* Data import (RawData .xlsx → datasets) */}
      <DataImportPanel />

      {/* Ohmyhotel internal DB via MCP (experimental) */}
      <McpCard />

      {/* Integrations */}
      <IntegrationsContent />
    </div>
  )
}

function SignatureCard() {
  const { lang } = useT()
  const ai = useAiSettings()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const placeholder = `Changbae Park (Aiden) / Asia Head of Sales & Marketing
Ohmyhotel Co., Ltd.
Mobile: +84-938-098216  Email: cb.park@ohmyhotel.com`
  return (
    <Card>
      <CardHeader
        title={L('이메일 서명 (내 프로필)', 'Email signature (your profile)')}
        subtitle={L('이름·직책·연락처를 한 번 등록하면 메일 작성 시 자동으로 들어갑니다 (보낼 때 수정 가능)', 'Set your name/title/contacts once — auto-added to drafted emails, editable before sending')}
        icon={<SignIcon />}
      />
      <textarea
        value={ai.userSignature}
        onChange={(e) => ai.setUserSignature(e.target.value)}
        rows={7}
        placeholder={placeholder}
        className="w-full max-w-xl resize-y rounded-lg border border-slate-200 px-3 py-2 font-sans text-xs leading-relaxed text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        {L('자동 저장됨 · 백업/클라우드에 함께 동기화', 'Auto-saved · syncs with backup/cloud')}
      </div>
    </Card>
  )
}

function SignIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17c3-1 4-9 7-9 2 0 1 5 3 5s3-3 5-3" /><path d="M3 21h18" /></svg>
}

function TeamCard() {
  const { lang } = useT()
  const ai = useAiSettings()
  const toast = useToast()
  const navigate = useNavigate()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const cfg = { url: ai.supabaseUrl, anonKey: ai.supabaseAnonKey }
  const configured = sbConfigured(cfg)

  const [org, setOrg] = useState<{ orgId: string; role: 'admin' | 'member'; name?: string } | null>(null)
  const [orgIdInput, setOrgIdInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (configured) sbMyOrg(cfg).then((m) => { setOrg(m); if (m?.name) setNameInput(m.name) }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai.supabaseUrl, ai.supabaseAnonKey])

  const join = async (role: 'admin' | 'member', orgId: string) => {
    if (!orgId.trim()) { setError(L('조직 ID를 입력하세요', 'Enter an org ID')); return }
    if (!nameInput.trim()) { setError(L('이름을 입력하세요', 'Enter your name')); return }
    setError(''); setBusy(true)
    try {
      await sbJoinOrg(cfg, { orgId: orgId.trim(), role, name: nameInput.trim() }, new Date().toISOString())
      setOrg({ orgId: orgId.trim(), role, name: nameInput.trim() })
      toast.notify(L('조직 참여 완료', 'Joined org'), orgId.trim())
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const leave = async () => { try { await sbLeaveOrg(cfg) } catch { /* ignore */ } setOrg(null) }
  const newOrgId = () => 'omh-' + Math.abs([...nameInput].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, Date.parse(new Date().toISOString().slice(0, 10)) % 100000)).toString(36).slice(0, 6)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader title={L('팀 / 조직 (전사 공유)', 'Team / Org (central sharing)')} subtitle={L('세일즈 각자 CRM을 쓰고, 중앙에서 전사 관계·히스토리를 모아 봅니다 (신입 교육·인수인계)', 'Each rep keeps their CRM; the org sees all relationships & history centrally (onboarding & handover)')} icon={<UsersIcon />} />
        {org && <Badge tone={org.role === 'admin' ? 'brand' : 'green'} dot>{org.role === 'admin' ? L('관리자', 'admin') : L('멤버', 'member')}</Badge>}
      </div>

      {!configured ? (
        <p className="text-[11px] text-amber-600">{L('먼저 위 클라우드 동기화(Supabase)를 구성하고 로그인하세요.', 'Set up Cloud Sync (Supabase) above and sign in first.')}</p>
      ) : org ? (
        <div className="mt-1 space-y-2">
          <div className="text-sm text-slate-700">{L('조직', 'Org')}: <span className="font-mono font-medium">{org.orgId}</span> · {org.name}</div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate('/central')}>{L('전사 히스토리 열기', 'Open Central')} →</Button>
            <Button size="sm" variant="secondary" onClick={() => join(org.role, org.orgId)} disabled={busy}>{busy ? L('동기화 중…', 'Syncing…') : L('내 데이터 전사 공유 갱신', 'Publish my data to org')}</Button>
            <Button size="sm" variant="secondary" onClick={leave}>{L('조직 나가기', 'Leave org')}</Button>
          </div>
          <p className="text-[11px] text-slate-400">{L('팀원에게 이 조직 ID를 알려주고 "조직 참여"하게 하면 전사 화면에 모입니다.', 'Share this org ID with teammates to join — everyone’s data aggregates in Central.')}</p>
        </div>
      ) : (
        <div className="mt-1 space-y-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{L('내 이름 (표시용)', 'Your name')}</label>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Aiden Park" className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{L('조직 ID (팀에서 공유하는 값)', 'Org ID (shared by your team)')}</label>
            <input value={orgIdInput} onChange={(e) => setOrgIdInput(e.target.value)} placeholder="omh-sales" className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs focus:border-brand-400 focus:outline-none" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => join('member', orgIdInput)} disabled={busy}>{L('조직 참여 (멤버)', 'Join org (member)')}</Button>
            <Button size="sm" variant="secondary" onClick={() => { const id = orgIdInput.trim() || newOrgId(); setOrgIdInput(id); join('admin', id) }} disabled={busy}>{L('새 조직 만들기 (관리자)', 'Create org (admin)')}</Button>
          </div>
        </div>
      )}

      {error && <div className="mt-2 max-w-md rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">{error}</div>}

      <button onClick={() => setShowHelp((v) => !v)} className="mt-3 text-[11px] font-medium text-brand-600 hover:text-brand-700">{showHelp ? L('설정 방법 닫기', 'Hide setup') : L('처음이신가요? 설정 방법 (SQL)', 'First time? Setup (SQL)')} {showHelp ? '▲' : '▼'}</button>
      {showHelp && (
        <div className="mt-2 max-w-2xl space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
          <p>{L('Supabase SQL Editor에서 한 번 실행 (조직 공유 테이블 + 같은 조직만 읽기):', 'Run once in Supabase SQL Editor (org-shared table + read-within-org):')}</p>
          <pre className="overflow-x-auto rounded bg-white p-2 font-mono text-[10px] leading-relaxed text-slate-700 dark:bg-black/30">{`create table if not exists public.oac_shared (
  user_id uuid primary key references auth.users(id) on delete cascade,
  org_id text not null,
  role text not null default 'member',
  name text, email text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.oac_shared enable row level security;
-- helper avoids RLS recursion
create or replace function public.oac_my_org() returns text language sql security definer stable as $$
  select org_id from public.oac_shared where user_id = auth.uid()
$$;
create policy "shared_read_org" on public.oac_shared for select using (org_id = public.oac_my_org());
create policy "shared_write_self" on public.oac_shared for insert with check (auth.uid() = user_id);
create policy "shared_update_self" on public.oac_shared for update using (auth.uid() = user_id);
create policy "shared_delete_self" on public.oac_shared for delete using (auth.uid() = user_id);`}</pre>
          <p className="text-amber-700">⚠️ {L('전사 공유 데이터에는 API 키가 포함되지 않습니다(백업과 동일하게 제외).', 'Shared data excludes API keys (same as backup).')}</p>
        </div>
      )}
    </Card>
  )
}

function UsersIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7" /></svg>
}

function CloudSyncCard() {
  const { lang } = useT()
  const ai = useAiSettings()
  const toast = useToast()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const cfg = { url: ai.supabaseUrl, anonKey: ai.supabaseAnonKey }
  const configured = sbConfigured(cfg)

  const [email, setEmail] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState<'link' | 'push' | 'pull' | null>(null)
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    let unsub = () => {}
    let alive = true
    if (configured) {
      sbSession(cfg).then((s) => { if (alive) setUserEmail(s?.user?.email ?? null) }).catch(() => {})
      sbOnAuth(cfg, (s) => setUserEmail(s?.user?.email ?? null)).then((u) => { unsub = u }).catch(() => {})
    }
    return () => { alive = false; unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai.supabaseUrl, ai.supabaseAnonKey])

  const sendLink = async () => {
    setError(''); setBusy('link')
    try {
      await sbMagicLink(cfg, email)
      toast.notify(L('매직링크 전송됨', 'Magic link sent'), L(`${email} 메일함에서 링크를 클릭하세요`, `Click the link in ${email}`))
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(null) }
  }
  const doPush = async () => {
    setError(''); setBusy('push')
    try {
      const stamp = new Date().toISOString()
      await sbPush(cfg, stamp) // manual upload = explicit intent, force overwrite
      try { localStorage.setItem('oac-cloud-synced-at', stamp) } catch { /* ignore */ }
      setLastSync(new Date().toLocaleTimeString())
      toast.notify(L('클라우드에 저장됨', 'Saved to cloud'), L('내 데이터를 업로드했어요', 'Your data was uploaded'))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg || L('알 수 없는 오류 (브라우저 콘솔을 확인하세요)', 'Unknown error (check the browser console)'))
    } finally { setBusy(null) }
  }
  const doPull = async () => {
    if (!window.confirm(L('클라우드 데이터로 이 기기를 덮어씁니다. 계속할까요?', 'This overwrites this device with the cloud data. Continue?'))) return
    setError(''); setBusy('pull')
    try {
      const applied = await sbPull(cfg)
      const cloudAt = await sbCloudAt(cfg).catch(() => null)
      if (cloudAt) { try { localStorage.setItem('oac-cloud-synced-at', cloudAt) } catch { /* ignore */ } }
      if (applied) { toast.notify(L('내려받기 완료', 'Downloaded'), L('새로고침합니다', 'Reloading')); setTimeout(() => window.location.reload(), 700) }
      else toast.notify(L('클라우드가 비어 있음', 'Cloud is empty'), L('먼저 업로드하세요', 'Upload first'))
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(null) }
  }
  const doSignOut = async () => { try { await sbSignOut(cfg) } catch { /* ignore */ } setUserEmail(null) }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader title={L('클라우드 동기화 (Supabase)', 'Cloud sync (Supabase)')} subtitle={L('로그인하면 어느 기기에서나 같은 데이터를 씁니다 (미로그인 시 이 브라우저에 저장)', 'Sign in to use the same data on any device (otherwise stored in this browser)')} icon={<CloudIcon />} />
        <Badge tone={userEmail ? 'green' : configured ? 'sky' : 'slate'} dot>{userEmail ? L('로그인됨', 'Signed in') : configured ? L('설정됨', 'Configured') : L('미설정', 'Not set')}</Badge>
      </div>

      {!configured ? (
        <div className="mt-1 space-y-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Supabase Project URL</label>
            <input value={ai.supabaseUrl} onChange={(e) => ai.setSupabaseUrl(e.target.value.trim())} placeholder="https://xxxx.supabase.co" className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs focus:border-brand-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Anon (public) key</label>
            <input value={ai.supabaseAnonKey} onChange={(e) => ai.setSupabaseAnonKey(e.target.value.trim())} placeholder="eyJhbGciOi..." className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs focus:border-brand-400 focus:outline-none" />
            <p className="mt-1 text-[11px] text-slate-400">{L('anon 키는 공개돼도 안전합니다(RLS로 보호). service_role 키는 절대 넣지 마세요.', 'The anon key is safe to expose (RLS-protected). Never paste the service_role key.')}</p>
          </div>
        </div>
      ) : !userEmail ? (
        <div className="mt-1 flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">{L('이메일 (매직링크)', 'Email (magic link)')}</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@company.com" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
          </div>
          <Button size="sm" onClick={sendLink} disabled={!email.includes('@') || busy === 'link'}>{busy === 'link' ? L('전송 중…', 'Sending…') : L('매직링크 보내기', 'Send magic link')}</Button>
          <button onClick={() => { ai.setSupabaseUrl(''); ai.setSupabaseAnonKey('') }} className="text-[11px] text-slate-400 hover:text-slate-600">{L('설정 변경', 'Edit config')}</button>
        </div>
      ) : (
        <div className="mt-1 space-y-2">
          <div className="text-sm text-slate-700">{L('로그인:', 'Signed in:')} <span className="font-medium">{userEmail}</span></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={doPush} disabled={busy === 'push'}>{busy === 'push' ? L('업로드 중…', 'Uploading…') : L('클라우드로 업로드', 'Upload to cloud')}</Button>
            <Button size="sm" variant="secondary" onClick={doPull} disabled={busy === 'pull'}>{busy === 'pull' ? L('내려받는 중…', 'Downloading…') : L('클라우드에서 내려받기', 'Download from cloud')}</Button>
            <Button size="sm" variant="secondary" onClick={doSignOut}>{L('로그아웃', 'Sign out')}</Button>
          </div>
          {lastSync ? (
            <p className="text-[11px] font-medium text-emerald-600">{L(`✓ 마지막 클라우드 저장: ${lastSync}`, `✓ Last saved to cloud: ${lastSync}`)}</p>
          ) : (
            <p className="text-[11px] text-emerald-600">{L('✓ 변경사항은 자동으로 클라우드에 저장됩니다.', '✓ Changes auto-save to the cloud.')}</p>
          )}
        </div>
      )}

      {error && <div className="mt-3 max-w-md rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">{error}</div>}

      <button onClick={() => setShowHelp((v) => !v)} className="mt-3 text-[11px] font-medium text-brand-600 hover:text-brand-700">{showHelp ? L('설정 방법 닫기', 'Hide setup') : L('처음이신가요? 설정 방법', 'First time? Setup steps')} {showHelp ? '▲' : '▼'}</button>
      {showHelp && (
        <div className="mt-2 max-w-2xl space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
          <p>1. <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-brand-600 underline">supabase.com</a> {L('→ 새 프로젝트(무료) 생성', '→ create a free project')}</p>
          <p>2. {L('Settings → API 에서 Project URL과 anon public 키를 복사해 위에 붙여넣기', 'Settings → API: copy the Project URL and anon public key above')}</p>
          <p>3. {L('SQL Editor에서 아래를 실행 (테이블 + 보안 정책):', 'SQL Editor: run this (table + security policies):')}</p>
          <pre className="overflow-x-auto rounded bg-white p-2 font-mono text-[10px] leading-relaxed text-slate-700 dark:bg-black/30">{`create table if not exists public.oac_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.oac_state enable row level security;
create policy "own_select" on public.oac_state for select using (auth.uid() = user_id);
create policy "own_insert" on public.oac_state for insert with check (auth.uid() = user_id);
create policy "own_update" on public.oac_state for update using (auth.uid() = user_id);`}</pre>
          <p>4. {L('Authentication → URL Configuration 의 Redirect URLs에 추가:', 'Authentication → URL Configuration → add to Redirect URLs:')} <code className="rounded bg-white px-1 font-mono text-[10px]">{redirectUri()}</code></p>
          <p className="text-amber-700">⚠️ {L('보안을 위해 API 키(Anthropic/OpenAI)는 클라우드에 저장되지 않습니다 — 기기마다 다시 입력하세요.', 'For security, your AI API keys are NOT stored in the cloud — re-enter them per device.')}</p>
        </div>
      )}
    </Card>
  )
}

function CloudIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.5-1.5A4 4 0 0 0 6.5 19h11z" /></svg>
}

function BackupCard() {
  const { lang } = useT()
  const store = useCaptureStore()
  const datasets = useDatasets()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const [error, setError] = useState('')

  const doExport = () => {
    try {
      const json = exportBackup(TODAY)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `oac-backup-${TODAY}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.notify(L('백업 내보냄', 'Backup exported'), `oac-backup-${TODAY}.json`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const doImport = async (file: File | undefined) => {
    if (!file) return
    setError('')
    try {
      const text = await file.text()
      const { restored } = importBackup(text)
      toast.notify(L('복원 완료', 'Restore complete'), L(`${restored}개 항목 복원 · 새로고침합니다`, `Restored ${restored} items · reloading`))
      setTimeout(() => window.location.reload(), 700)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader
        title={L('백업 & 복원', 'Backup & Restore')}
        subtitle={L('내 데이터를 파일로 보관하고, 다른 기기나 데이터가 지워졌을 때 복원하세요', 'Save your data to a file — restore it on another device or after storage is cleared')}
        icon={<SaveIcon />}
      />
      <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
        <Badge tone="slate">{store.stats.accounts} {L('관계', 'relationships')}</Badge>
        <Badge tone="slate">{store.stats.entries} {L('캡처', 'captures')}</Badge>
        <Badge tone="slate">{datasets.snapshots.length} {L('데이터 스냅샷', 'data snapshots')}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={doExport}>{L('백업 내보내기 (.json)', 'Export backup (.json)')}</Button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => doImport(e.target.files?.[0])} />
        <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>{L('백업에서 복원', 'Restore from backup')}</Button>
      </div>
      {error && <div className="mt-2 max-w-md rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">{error}</div>}
      <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-slate-400">
        {L(
          'OAC는 데이터를 이 브라우저에 저장합니다(같은 브라우저면 종료 후 다시 열어도 유지). 다른 기기로 옮기거나 만일에 대비해 정기적으로 백업하세요. 보안을 위해 API 키는 백업에 포함되지 않습니다(복원 후 다시 입력).',
          'OAC stores data in this browser (it persists across restarts on the same browser). Back up regularly to move to another device or guard against loss. API keys are excluded from backups for security — re-enter them after restoring.',
        )}
      </p>
    </Card>
  )
}

function SaveIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
}

// B-2: desktop notification opt-in (due/overdue tasks + new synced mail).
function NotificationCard() {
  const { lang } = useT()
  const ai = useAiSettings()
  const toast = useToast()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const [perm, setPerm] = useState(notifyPermission())

  const toggle = async () => {
    if (ai.notifyEnabled) { ai.setNotifyEnabled(false); return }
    const ok = await requestNotifyPermission()
    setPerm(notifyPermission())
    if (ok) {
      ai.setNotifyEnabled(true)
      showNotification(L('알림이 켜졌습니다', 'Notifications on'), { body: L('마감·연체와 새 메일을 알려드립니다.', "You'll be notified of due tasks and new mail."), tag: 'oac-test' })
    } else {
      toast.notify(L('알림 권한이 거부되었습니다', 'Notification permission denied'), L('브라우저 사이트 설정에서 알림을 허용해 주세요.', 'Allow notifications in your browser site settings.'))
    }
  }

  const on = ai.notifyEnabled && perm === 'granted'
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <CardHeader
          title={L('데스크톱 알림', 'Desktop notifications')}
          subtitle={L('앱이 열려 있는 동안 마감·연체 작업과 새로 동기화된 메일을 알려줍니다', 'While the app is open, get notified of due/overdue tasks and newly synced mail')}
          icon={<BellIcon />}
        />
        {notifySupported() ? (
          <button onClick={toggle} role="switch" aria-checked={on} aria-label={L('데스크톱 알림', 'Desktop notifications')} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/15'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[1.375rem]' : 'left-0.5'}`} />
          </button>
        ) : (
          <Badge tone="slate">{L('미지원', 'Unsupported')}</Badge>
        )}
      </div>
      {perm === 'denied' && (
        <p className="mt-1 text-[11px] text-amber-600">{L('브라우저에서 알림이 차단돼 있습니다. 주소창의 사이트 설정에서 허용으로 바꿔 주세요.', 'Notifications are blocked in your browser — allow them in the site settings.')}</p>
      )}
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
        {L('탭이 백그라운드여도 동작합니다. 앱을 완전히 닫으면 알림이 멈춥니다(진짜 푸시는 서버가 필요).', 'Works even when the tab is in the background. Stops if you fully close the app (true push needs a server).')}
      </p>
    </Card>
  )
}

function BellIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
}

// Shows when the Microsoft sync last ran, refreshing live.
function LastSync({ L }: { L: (ko: string, en: string) => string }) {
  const [, force] = useState(0)
  useEffect(() => {
    const on = () => force((n) => n + 1)
    window.addEventListener('oac-ms-synced', on)
    const t = window.setInterval(on, 30_000) // keep the relative time fresh
    return () => { window.removeEventListener('oac-ms-synced', on); clearInterval(t) }
  }, [])
  const ts = Number(localStorage.getItem(LAST_SYNC_KEY) || 0)
  if (!ts) return null
  const mins = Math.floor((Date.now() - ts) / 60_000)
  const rel = mins < 1 ? L('방금', 'just now') : mins < 60 ? L(`${mins}분 전`, `${mins}m ago`) : L(`${Math.floor(mins / 60)}시간 전`, `${Math.floor(mins / 60)}h ago`)
  return <p className="mt-1 text-[10px] text-slate-400">{L('마지막 동기화', 'Last synced')}: {rel}</p>
}

// C-10: connect the Ohmyhotel internal DB through an MCP-over-HTTP server.
function McpCard() {
  const { lang } = useT()
  const ai = useAiSettings()
  const toast = useToast()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const [tools, setTools] = useState<McpTool[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')

  const test = async () => {
    setBusy(true); setResult('')
    try {
      const list = await listMcpTools(ai.mcpEndpoint, ai.mcpToken)
      setTools(list)
      toast.notify(L(`MCP 연결 성공 · 도구 ${list.length}개`, `MCP connected · ${list.length} tool(s)`))
    } catch (err) {
      setTools(null)
      toast.notify(L('MCP 연결 실패. 엔드포인트/토큰을 확인하세요.', 'MCP connection failed — check the endpoint/token.'))
      setResult(String(err instanceof Error ? err.message : err))
    } finally {
      setBusy(false)
    }
  }
  const run = async (name: string) => {
    setBusy(true); setResult('')
    try {
      setResult(await callMcpTool(ai.mcpEndpoint, ai.mcpToken, name) || L('(빈 응답)', '(empty response)'))
    } catch (err) {
      setResult(String(err instanceof Error ? err.message : err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title={L('Ohmyhotel 내부 DB · MCP', 'Ohmyhotel internal DB · MCP')}
        subtitle={L('MCP 서버(HTTP)에 직접 연결해 DB 도구를 호출합니다. 실험적 기능.', 'Connect directly to an MCP server (HTTP) and call its DB tools. Experimental.')}
        icon={<DbIcon />}
      />
      <div className="space-y-2.5">
        <label className="block">
          <span className="text-[11px] font-semibold text-slate-500">{L('MCP 엔드포인트 URL', 'MCP endpoint URL')}</span>
          <input value={ai.mcpEndpoint} onChange={(e) => ai.setMcpEndpoint(e.target.value)} placeholder="https://mcp.ohmyhotel.example/rpc" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-slate-500">{L('토큰 (선택) — 이 브라우저에만 저장, 백업·동기화 제외', 'Token (optional) — stored in this browser only, excluded from backup/sync')}</span>
          <input type="password" value={ai.mcpToken} onChange={(e) => ai.setMcpToken(e.target.value)} placeholder="••••••••" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
        </label>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={test} disabled={busy || !ai.mcpEndpoint.trim()}>{busy ? L('확인 중…', 'Testing…') : L('연결 테스트 / 도구 목록', 'Test / list tools')}</Button>
          {tools && <Badge tone="green">{tools.length} {L('도구', 'tools')}</Badge>}
        </div>
        {tools && tools.length > 0 && (
          <div className="rounded-lg border border-slate-200 p-2 dark:border-white/10">
            {tools.map((tl) => (
              <div key={tl.name} className="flex items-center justify-between gap-2 px-1 py-1.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-700">{tl.name}</div>
                  {tl.description && <div className="truncate text-[11px] text-slate-400">{tl.description}</div>}
                </div>
                <button onClick={() => run(tl.name)} disabled={busy} className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50">{L('호출', 'Call')}</button>
              </div>
            ))}
          </div>
        )}
        {result && <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 dark:bg-white/5 dark:text-slate-300">{result}</pre>}
        <p className="text-[11px] text-slate-400">{L('MCP 서버가 준비되면 엔드포인트만 입력하면 됩니다. 토큰은 API 키와 동일하게 이 브라우저에만 보관됩니다.', 'Once an MCP server is ready, just enter its endpoint. The token, like the API keys, never leaves this browser.')}</p>
      </div>
    </Card>
  )
}

function MicrosoftCard() {
  const { lang } = useT()
  const ai = useAiSettings()
  const store = useCaptureStore()
  const rel = useRelationships()
  const toast = useToast()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)

  const [connectedName, setConnectedName] = useState<string | null>(null)
  const [busy, setBusy] = useState<'connect' | 'sync' | null>(null)
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const conn = { clientId: ai.msClientId, tenant: ai.msTenant }
  const hasClientId = ai.msClientId.trim().length > 0

  // Re-attach to a cached session on mount.
  useEffect(() => {
    let alive = true
    if (hasClientId) {
      msRestore(conn).then((name) => {
        if (alive && name) setConnectedName(name)
      })
    }
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai.msClientId, ai.msTenant])

  const doConnect = async () => {
    setError('')
    setBusy('connect')
    try {
      const name = await msConnect(conn)
      setConnectedName(name)
      toast.notify(L('Microsoft 365 연결됨', 'Microsoft 365 connected'), name)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  const doDisconnect = async () => {
    await msDisconnect(conn)
    setConnectedName(null)
  }

  const doSync = async () => {
    setError('')
    setBusy('sync')
    try {
      // Manual sync: pull last 7 days, de-dup against already-imported items, and
      // (live) AI-summarize each company. Shared with the periodic auto-sync.
      const r = await syncMicrosoft({
        conn,
        lang,
        relList: rel.list.map((e) => ({ id: e.id, name: e.name })),
        addEntry: store.addEntry,
        live: ai.isLive ? { provider: ai.provider, apiKey: ai.activeKey, model: ai.model } : undefined,
        summarize: ai.isLive,
      })
      if (r.fatal) {
        setError(L(`동기화 실패: ${r.error}\n→ 메일 읽기 권한(Mail.Read) 관리자 동의가 필요할 수 있어요. 또는 설정에서 연결 해제 후 다시 로그인해 보세요.`, `Sync failed: ${r.error}\n→ Mail.Read admin consent may be required, or disconnect & sign in again.`))
        return
      }
      if (r.added === 0) {
        toast.notify(L('동기화 완료 · 새 항목 없음', 'Sync complete · no new items'), L(`최근 7일 받은 ${r.inbox} · 보낸 ${r.sent} · Teams ${r.teams} (이미 모두 가져옴)`, `Last 7 days: ${r.inbox} in · ${r.sent} sent · ${r.teams} Teams (all already imported)`))
        return
      }
      toast.notify(
        L('동기화 완료 · 지난 7일', 'Sync complete · last 7 days'),
        ai.isLive
          ? L(`새 항목 ${r.added}건 → 업체 ${r.companies}곳 · AI 요약 ${r.summarized}`, `${r.added} new → ${r.companies} companies · ${r.summarized} AI summaries`)
          : L(`새 항목 ${r.added}건 → 업체 ${r.companies}곳 업데이트`, `${r.added} new → updated ${r.companies} companies`),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader
          title={L('Microsoft 365 (Outlook · Teams)', 'Microsoft 365 (Outlook · Teams)')}
          subtitle={L('내 Microsoft 계정의 실제 메일·Teams 메시지를 OAC 관계로 가져옵니다', 'Bring your real Outlook mail & Teams messages into OAC relationships')}
          icon={<MsIcon />}
        />
        <Badge tone={connectedName ? 'green' : 'slate'} dot>
          {connectedName ? L('연결됨', 'Connected') : L('연결 안 됨', 'Not connected')}
        </Badge>
      </div>

      {!connectedName ? (
        <div className="mt-1 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{L('Azure 앱 클라이언트 ID', 'Azure app Client ID')}</label>
            <input
              value={ai.msClientId}
              onChange={(e) => ai.setMsClientId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{L('디렉터리(테넌트) ID 또는 유형', 'Directory (tenant) ID or type')}</label>
            <input
              value={ai.msTenant}
              onChange={(e) => ai.setMsTenant(e.target.value.trim())}
              placeholder={L('common 또는 테넌트 GUID', 'common or a tenant GUID')}
              className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {['common', 'organizations', 'consumers'].map((p) => (
                <button
                  key={p}
                  onClick={() => ai.setMsTenant(p)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${ai.msTenant === p ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="mt-1.5 max-w-md text-[11px] leading-relaxed text-slate-400">
              {L(
                '앱이 "단일 테넌트"면 common이 막힙니다 (AADSTS50194). Azure 앱 개요의 "디렉터리(테넌트) ID"(GUID)를 여기에 붙여넣으세요. 또는 Azure 인증 설정에서 앱을 멀티테넌트로 바꾸면 common이 동작합니다.',
                'If your app is "single tenant", common is blocked (AADSTS50194). Paste the "Directory (tenant) ID" (GUID) from your Azure app Overview here — or switch the app to multi-tenant in Azure Authentication to use common.',
              )}
            </p>
          </div>
          <Button size="sm" onClick={doConnect} disabled={!hasClientId || busy === 'connect'}>
            {busy === 'connect' ? L('연결 중…', 'Connecting…') : L('Microsoft로 로그인', 'Sign in with Microsoft')}
          </Button>
        </div>
      ) : (
        <div className="mt-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="font-medium">{connectedName}</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">{GRAPH_SCOPES.join(', ')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={doSync} disabled={busy === 'sync'}>
              {busy === 'sync' ? L('가져오는 중…', 'Importing…') : L('지난 7일 동기화 (업체별 업데이트)', 'Sync last 7 days (update by company)')}
            </Button>
            <Button variant="secondary" size="sm" onClick={doDisconnect}>{L('연결 해제', 'Disconnect')}</Button>
          </div>

          {/* Periodic auto-sync (option B) */}
          <div className="rounded-lg border border-slate-200 p-2.5 dark:border-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{L('자동 동기화', 'Auto-sync')}</span>
              <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 text-[11px] font-semibold dark:border-white/10">
                {[{ v: 0, ko: '끔', en: 'Off' }, { v: 15, ko: '15분', en: '15m' }, { v: 30, ko: '30분', en: '30m' }, { v: 60, ko: '60분', en: '60m' }].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => ai.setMsAutoSyncMin(o.v)}
                    className={`px-2.5 py-1 transition ${ai.msAutoSyncMin === o.v ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-transparent dark:text-slate-400'}`}
                  >
                    {L(o.ko, o.en)}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
              {ai.msAutoSyncMin > 0
                ? L(`${ai.msAutoSyncMin}분마다, 그리고 탭으로 돌아오거나 인터넷이 재연결될 때 자동으로 새 메일·Teams를 가져옵니다(중복 제외). 탭을 닫았다 다시 열면 즉시 따라잡습니다. API 비용이 드는 AI 요약은 자동 동기화에서 실행하지 않습니다 — 요약은 위 수동 버튼에서.`, `Syncs every ${ai.msAutoSyncMin} min, plus instantly when you return to the tab or reconnect. Reopening the tab catches up immediately. The API-costing AI summary does NOT run on auto-sync — use the manual button.`)
                : L('자동 동기화가 꺼져 있습니다. 간격을 선택하면 주기적으로 + 탭 복귀/재연결 시 자동으로 가져옵니다.', 'Auto-sync is off. Pick an interval to import periodically, and on tab-return / reconnect.')}
            </p>
            <LastSync L={L} />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 max-w-md rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[11px] leading-relaxed text-rose-700">
          {error}
        </div>
      )}

      <button onClick={() => setShowHelp((v) => !v)} className="mt-3 text-[11px] font-medium text-brand-600 hover:text-brand-700">
        {showHelp ? L('설정 방법 닫기', 'Hide setup steps') : L('처음이신가요? 설정 방법 보기', 'First time? Show setup steps')} {showHelp ? '▲' : '▼'}
      </button>
      {showHelp && (
        <div className="mt-2 max-w-xl space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
          <p>1. <a href="https://entra.microsoft.com" target="_blank" rel="noreferrer" className="text-brand-600 underline">Microsoft Entra (Azure AD)</a> → {L('앱 등록 → 새 등록', 'App registrations → New registration')}</p>
          <p>2. {L('플랫폼:', 'Platform:')} <b>Single-page application (SPA)</b>, {L('리디렉션 URI:', 'Redirect URI:')} <code className="rounded bg-white px-1 font-mono text-[10px]">{redirectUri()}</code></p>
          <p>3. {L('API 권한 → Microsoft Graph → 위임됨:', 'API permissions → Microsoft Graph → Delegated:')} <code className="font-mono text-[10px]">{GRAPH_SCOPES.join(', ')}</code></p>
          <p>4. {L('개요의 애플리케이션(클라이언트) ID를 위에 붙여넣고 로그인하세요.', 'Copy the Application (client) ID from Overview, paste it above, and sign in.')}</p>
          <p className="mt-1.5 text-amber-700">⚠️ {L('OAC는 내 브라우저에서만 동작하며 토큰은 브라우저에만 저장됩니다. 데이터는 Microsoft 외 어디로도 전송되지 않습니다.', 'OAC runs entirely in your browser; the token is stored only in your browser. No data is sent anywhere except Microsoft.')}</p>
        </div>
      )}
    </Card>
  )
}

function MsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  )
}

function SparkIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg> }
function DbIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg> }
