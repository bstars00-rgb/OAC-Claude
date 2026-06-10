import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { useT } from '../i18n'
import { useAiSettings, AI_MODELS } from '../utils/aiSettings'
import { useCaptureStore } from '../data/captureStore'
import { IntegrationsContent } from './Integrations'

export function Settings() {
  const { t } = useT()
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
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('set.apiKey')}</label>
              <input type="password" value={ai.apiKey} onChange={(e) => ai.setApiKey(e.target.value)} placeholder="sk-ant-..." className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-brand-600 hover:text-brand-700">{t('set.getKey')} →</a>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('set.model')}</label>
              <select value={ai.model} onChange={(e) => ai.setModel(e.target.value)} className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
                {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
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

      {/* Integrations */}
      <IntegrationsContent />
    </div>
  )
}

function SparkIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg> }
function DbIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg> }
