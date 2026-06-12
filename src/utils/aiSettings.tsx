import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type AiMode = 'demo' | 'live'
export type AiProvider = 'anthropic' | 'openai'
export type AssistantMode = 'oac' | 'chatgpt' // CRM-focused vs general ChatGPT-style

export interface AiModelOption {
  id: string
  label: string
  provider: AiProvider
}

// Models span BOTH providers — the selected model decides which key/endpoint is
// used, so the user can store both keys once and switch Claude ↔ ChatGPT anytime.
export const AI_MODELS: AiModelOption[] = [
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 (most capable)', provider: 'anthropic' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (balanced)', provider: 'anthropic' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (fastest)', provider: 'anthropic' },
  { id: 'gpt-4o', label: 'ChatGPT · GPT-4o (OpenAI)', provider: 'openai' },
  { id: 'gpt-4o-mini', label: 'ChatGPT · GPT-4o mini (fast)', provider: 'openai' },
]

export const providerForModel = (model: string): AiProvider =>
  AI_MODELS.find((m) => m.id === model)?.provider ?? 'anthropic'

interface AiSettings {
  mode: AiMode
  apiKey: string // Anthropic (Claude) key
  openaiKey: string // OpenAI (ChatGPT) key
  model: string
  // When false, the seeded Ohmyhotel demo relationships & mock data are hidden,
  // and the app runs on the user's own captured data only.
  demoData: boolean
  // Microsoft 365 (Outlook / Teams) — the user's own Azure SPA app registration.
  msClientId: string
  msTenant: string // 'common' | 'organizations' | a tenant id
  // Supabase cloud sync — the user's own project (URL + anon key are public-safe; RLS protects data).
  supabaseUrl: string
  supabaseAnonKey: string
  // Email signature (name / title / contacts) — auto-added to drafted emails, editable before sending.
  userSignature: string
  // Assistant persona: 'oac' (CRM-focused) or 'chatgpt' (general, ChatGPT-style).
  assistantMode: AssistantMode
  // Ohmyhotel internal DB via MCP-over-HTTP (experimental). Endpoint is a URL;
  // the token is a SECRET (excluded from backup & cloud sync, like the API keys).
  mcpEndpoint: string
  mcpToken: string
  // Outlook/Teams periodic auto-sync interval in minutes (0 = off). Only runs
  // while the app is open and a Microsoft account is connected.
  msAutoSyncMin: number
  // Desktop notifications (due/overdue tasks, new synced mail) while the app is open.
  notifyEnabled: boolean
}

interface AiSettingsCtx extends AiSettings {
  setMode: (m: AiMode) => void
  setApiKey: (k: string) => void
  setOpenaiKey: (k: string) => void
  setModel: (m: string) => void
  setDemoData: (v: boolean) => void
  setMsClientId: (v: string) => void
  setMsTenant: (v: string) => void
  setSupabaseUrl: (v: string) => void
  setSupabaseAnonKey: (v: string) => void
  setUserSignature: (v: string) => void
  setAssistantMode: (v: AssistantMode) => void
  setMcpEndpoint: (v: string) => void
  setMcpToken: (v: string) => void
  setMsAutoSyncMin: (v: number) => void
  setNotifyEnabled: (v: boolean) => void
  provider: AiProvider // derived from the selected model
  activeKey: string // the key for the active provider
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
        openaiKey: typeof p.openaiKey === 'string' ? p.openaiKey : '',
        model: typeof p.model === 'string' ? p.model : AI_MODELS[0].id,
        demoData: typeof p.demoData === 'boolean' ? p.demoData : false,
        msClientId: typeof p.msClientId === 'string' ? p.msClientId : '',
        msTenant: typeof p.msTenant === 'string' && p.msTenant ? p.msTenant : 'common',
        supabaseUrl: typeof p.supabaseUrl === 'string' ? p.supabaseUrl : '',
        supabaseAnonKey: typeof p.supabaseAnonKey === 'string' ? p.supabaseAnonKey : '',
        userSignature: typeof p.userSignature === 'string' ? p.userSignature : '',
        assistantMode: p.assistantMode === 'chatgpt' ? 'chatgpt' : 'oac',
        mcpEndpoint: typeof p.mcpEndpoint === 'string' ? p.mcpEndpoint : '',
        mcpToken: typeof p.mcpToken === 'string' ? p.mcpToken : '',
        msAutoSyncMin: typeof p.msAutoSyncMin === 'number' ? p.msAutoSyncMin : 0,
        notifyEnabled: typeof p.notifyEnabled === 'boolean' ? p.notifyEnabled : false,
      }
    }
  } catch {
    /* ignore */
  }
  // Default to REAL mode (no demo data) — the user is starting to use OAC for real.
  return { mode: 'demo', apiKey: '', openaiKey: '', model: AI_MODELS[0].id, demoData: false, msClientId: '', msTenant: 'common', supabaseUrl: '', supabaseAnonKey: '', userSignature: '', assistantMode: 'oac', mcpEndpoint: '', mcpToken: '', msAutoSyncMin: 0, notifyEnabled: false }
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
  const setOpenaiKey = (openaiKey: string) => setSettings((s) => ({ ...s, openaiKey }))
  const setModel = (model: string) => setSettings((s) => ({ ...s, model }))
  const setDemoData = (demoData: boolean) => setSettings((s) => ({ ...s, demoData }))
  const setMsClientId = (msClientId: string) => setSettings((s) => ({ ...s, msClientId }))
  const setMsTenant = (msTenant: string) => setSettings((s) => ({ ...s, msTenant }))
  const setSupabaseUrl = (supabaseUrl: string) => setSettings((s) => ({ ...s, supabaseUrl }))
  const setSupabaseAnonKey = (supabaseAnonKey: string) => setSettings((s) => ({ ...s, supabaseAnonKey }))
  const setUserSignature = (userSignature: string) => setSettings((s) => ({ ...s, userSignature }))
  const setAssistantMode = (assistantMode: AssistantMode) => setSettings((s) => ({ ...s, assistantMode }))
  const setMcpEndpoint = (mcpEndpoint: string) => setSettings((s) => ({ ...s, mcpEndpoint }))
  const setMcpToken = (mcpToken: string) => setSettings((s) => ({ ...s, mcpToken }))
  const setMsAutoSyncMin = (msAutoSyncMin: number) => setSettings((s) => ({ ...s, msAutoSyncMin }))
  const setNotifyEnabled = (notifyEnabled: boolean) => setSettings((s) => ({ ...s, notifyEnabled }))

  const provider = providerForModel(settings.model)
  const activeKey = provider === 'openai' ? settings.openaiKey : settings.apiKey
  const isLive = settings.mode === 'live' && activeKey.trim().length > 0

  return (
    <Ctx.Provider value={{ ...settings, setMode, setApiKey, setOpenaiKey, setModel, setDemoData, setMsClientId, setMsTenant, setSupabaseUrl, setSupabaseAnonKey, setUserSignature, setAssistantMode, setMcpEndpoint, setMcpToken, setMsAutoSyncMin, setNotifyEnabled, provider, activeKey, isLive }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAiSettings(): AiSettingsCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAiSettings must be used within AiSettingsProvider')
  return ctx
}
