// Backup & Restore — export all OAC data to a single JSON file and restore it
// later or on another device. No backend; this is how a no-backend app stays
// durable across machines and protects against the browser clearing its storage.
//
// API keys (Anthropic / OpenAI) are intentionally EXCLUDED from the backup so a
// shared file never leaks a secret — you re-enter keys after restoring.

interface StorageLike {
  getItem: (k: string) => string | null
  setItem: (k: string, v: string) => void
}

export const BACKUP_KEYS = [
  'oac-captures-v1', // assistant captures / relationships
  'oac-datasets-v1', // imported RawData snapshots
  'oac-chat-v1', // full assistant conversation log
  'oac-recent-rel-v1', // recent searches
  'oac-ai-settings-v1', // mode/model/demoData/tenant (secrets stripped)
  'oac-theme',
  'oac-lang',
]

const SECRET_FIELDS = ['apiKey', 'openaiKey']

export interface BackupFile {
  app: 'OAC'
  version: 1
  exportedAt: string
  data: Record<string, unknown>
}

export function exportBackup(exportedAt: string, storage: StorageLike = localStorage): string {
  const data: Record<string, unknown> = {}
  for (const k of BACKUP_KEYS) {
    const raw = storage.getItem(k)
    if (raw == null) continue
    if (k === 'oac-ai-settings-v1') {
      try {
        const o = JSON.parse(raw) as Record<string, unknown>
        for (const f of SECRET_FIELDS) delete o[f]
        data[k] = o
      } catch {
        /* skip malformed */
      }
    } else {
      try {
        data[k] = JSON.parse(raw)
      } catch {
        data[k] = raw
      }
    }
  }
  const file: BackupFile = { app: 'OAC', version: 1, exportedAt, data }
  return JSON.stringify(file, null, 2)
}

export function importBackup(json: string, storage: StorageLike = localStorage): { restored: number } {
  const parsed = JSON.parse(json) as BackupFile
  if (parsed?.app !== 'OAC' || !parsed.data || typeof parsed.data !== 'object') {
    throw new Error('Not a valid OAC backup file')
  }
  let restored = 0
  for (const [k, v] of Object.entries(parsed.data)) {
    if (!k.startsWith('oac-')) continue
    if (k === 'oac-ai-settings-v1') {
      // keep any keys already entered in this browser; backup never carries secrets
      let cur: Record<string, unknown> = {}
      try {
        cur = JSON.parse(storage.getItem(k) ?? '{}') as Record<string, unknown>
      } catch {
        cur = {}
      }
      storage.setItem(k, JSON.stringify({ ...cur, ...(v as Record<string, unknown>) }))
    } else {
      storage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
    }
    restored++
  }
  return { restored }
}
