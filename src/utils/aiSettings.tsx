import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type AiMode = 'demo' | 'live'

export interface AiModelOption {
  id: string
  label: string
}

// Default to the most capable model; the user can switch for cost.
export const AI_MODELS: AiModelOption[] = [
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 (most capable)' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (balanced)' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (fastest)' },
]

interface AiSettings {
  mode: AiMode
  apiKey: string
  model: string
  // When false, the seeded Ohmyhotel demo relationships & mock data are hidden,
  // and the app runs on the user's own captured data only.
  demoData: boolean
  // Microsoft 365 (Outlook / Teams) — the user's own Azure SPA app registration.
  msClientId: string
  msTenant: string // 'common' | 'organizations' | a tenant id
}

interface AiSettingsCtx extends AiSettings {
  setMode: (m: AiMode) => void
  setApiKey: (k: string) => void
  setModel: (m: string) => void
  setDemoData: (v: boolean) => void
  setMsClientId: (v: string) => void
  setMsTenant: (v: string) => void
  isLive: boolean
}

const KEY = 'oac-ai-settings-v1'

const read = (): AiSettings => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<AiSettings>
      return {
        mode: p.mode === 'live' ? 'live' : 'demo',
        apiKey: typeof p.apiKey === 'string' ? p.apiKey : '',
        model: typeof p.model === 'string' ? p.model : AI_MODELS[0].id,
        demoData: typeof p.demoData === 'boolean' ? p.demoData : false,
        msClientId: typeof p.msClientId === 'string' ? p.msClientId : '',
        msTenant: typeof p.msTenant === 'string' && p.msTenant ? p.msTenant : 'common',
      }
    }
  } catch {
    /* ignore */
  }
  // Default to REAL mode (no demo data) — the user is starting to use OAC for real.
  return { mode: 'demo', apiKey: '', model: AI_MODELS[0].id, demoData: false, msClientId: '', msTenant: 'common' }
}

const Ctx = createContext<AiSettingsCtx | null>(null)

export function AiSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AiSettings>(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])

  const setMode = (mode: AiMode) => setSettings((s) => ({ ...s, mode }))
  const setApiKey = (apiKey: string) => setSettings((s) => ({ ...s, apiKey }))
  const setModel = (model: string) => setSettings((s) => ({ ...s, model }))
  const setDemoData = (demoData: boolean) => setSettings((s) => ({ ...s, demoData }))
  const setMsClientId = (msClientId: string) => setSettings((s) => ({ ...s, msClientId }))
  const setMsTenant = (msTenant: string) => setSettings((s) => ({ ...s, msTenant }))

  const isLive = settings.mode === 'live' && settings.apiKey.trim().length > 0

  return (
    <Ctx.Provider value={{ ...settings, setMode, setApiKey, setModel, setDemoData, setMsClientId, setMsTenant, isLive }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAiSettings(): AiSettingsCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAiSettings must be used within AiSettingsProvider')
  return ctx
}
