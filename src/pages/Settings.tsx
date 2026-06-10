import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { useT } from '../i18n'
import { useAiSettings, AI_MODELS } from '../utils/aiSettings'
import { useCaptureStore } from '../data/captureStore'
import { useToast } from '../components/Toast'
import { IntegrationsContent } from './Integrations'
import {
  connect as msConnect,
  disconnect as msDisconnect,
  restore as msRestore,
  fetchOutlook,
  fetchTeams,
  itemToCapture,
  redirectUri,
  GRAPH_SCOPES,
} from '../utils/graph'

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

      {/* Data source — real vs demo */}
      <Card>
        <CardHeader title={t('set.dataSource')} subtitle={t('set.dataSourceSub')} icon={<DbIcon />} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {([false, true] as const).map((demo) => (
            <button key={String(demo)} onClick={() => ai.setDemoData(demo)} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${ai.demoData === demo ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${ai.demoData === demo ? 'border-brand-600' : 'border-slate-300'}`}>{ai.demoData === demo && <span className="h-2 w-2 rounded-full bg-brand-600" />}</span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">{demo ? t('set.demoDataLabel') : t('set.realData')}</span>
                <span className="block text-xs text-slate-500">{demo ? t('set.demoDataDesc') : t('set.realDataDesc')}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Workspace */}
      <Card>
        <CardHeader title={t('set.workspace')} subtitle={`${store.stats.accounts} accounts · ${store.stats.entries} captures · ${store.stats.openTodos} open to-dos`} icon={<DbIcon />} />
        <Button variant="secondary" size="sm" onClick={store.clearAll}>{t('set.clearWorkspace')}</Button>
      </Card>

      {/* Microsoft 365 — Outlook + Teams (real Graph connection) */}
      <MicrosoftCard />

      {/* Integrations */}
      <IntegrationsContent />
    </div>
  )
}

function MicrosoftCard() {
  const { lang } = useT()
  const ai = useAiSettings()
  const store = useCaptureStore()
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
      const [mail, teams] = await Promise.all([
        fetchOutlook(conn).catch(() => []),
        fetchTeams(conn).catch(() => []),
      ])
      const items = [...mail, ...teams]
      for (const it of items) store.addEntry(itemToCapture(it, lang), `${it.title}\n${it.preview}`)
      toast.notify(
        L('동기화 완료', 'Sync complete'),
        L(
          `Outlook ${mail.length}건 · Teams ${teams.length}건을 관계로 가져왔어요`,
          `Imported ${mail.length} Outlook · ${teams.length} Teams items into relationships`,
        ),
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
            <label className="mb-1 block text-xs font-medium text-slate-500">{L('계정 유형 (Tenant)', 'Account type (Tenant)')}</label>
            <select
              value={ai.msTenant}
              onChange={(e) => ai.setMsTenant(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            >
              <option value="common">{L('개인 + 회사/학교 계정 (common)', 'Personal + work/school (common)')}</option>
              <option value="organizations">{L('회사/학교 계정만 (organizations)', 'Work/school only (organizations)')}</option>
              <option value="consumers">{L('개인 계정만 (consumers)', 'Personal only (consumers)')}</option>
            </select>
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
              {busy === 'sync' ? L('가져오는 중…', 'Importing…') : L('지금 동기화 (메일·Teams)', 'Sync now (Mail · Teams)')}
            </Button>
            <Button variant="secondary" size="sm" onClick={doDisconnect}>{L('연결 해제', 'Disconnect')}</Button>
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
