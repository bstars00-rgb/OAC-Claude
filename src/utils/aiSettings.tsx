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
}

interface AiSettingsCtx extends AiSettings {
  setMode: (m: AiMode) => void
  setApiKey: (k: string) => void
  setModel: (m: string) => void
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
      }
    }
  } catch {
    /* ignore */
  }
  return { mode: 'demo', apiKey: '', model: AI_MODELS[0].id }
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

  const isLive = settings.mode === 'live' && settings.apiKey.trim().length > 0

  return (
    <Ctx.Provider value={{ ...settings, setMode, setApiKey, setModel, isLive }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAiSettings(): AiSettingsCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAiSettings must be used within AiSettingsProvider')
  return ctx
}
