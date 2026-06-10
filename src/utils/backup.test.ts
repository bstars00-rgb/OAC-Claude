import { describe, it, expect } from 'vitest'
import { exportBackup, importBackup } from './backup'

function memStorage(init: Record<string, string> = {}) {
  const m: Record<string, string> = { ...init }
  return {
    getItem: (k: string) => (k in m ? m[k] : null),
    setItem: (k: string, v: string) => {
      m[k] = String(v)
    },
    removeItem: (k: string) => {
      delete m[k]
    },
    _dump: () => m,
  }
}

describe('backup', () => {
  it('exports OAC data but strips API keys', () => {
    const src = memStorage({
      'oac-captures-v1': JSON.stringify([{ id: 'e1' }]),
      'oac-datasets-v1': JSON.stringify([{ id: 'ds1' }]),
      'oac-ai-settings-v1': JSON.stringify({ mode: 'live', apiKey: 'sk-ant-SECRET', openaiKey: 'sk-SECRET', model: 'claude-opus-4-8', demoData: false }),
      'oac-lang': 'ko',
    })
    const json = exportBackup('2026-06-10', src)
    const parsed = JSON.parse(json)
    expect(parsed.app).toBe('OAC')
    expect(parsed.data['oac-captures-v1']).toEqual([{ id: 'e1' }])
    expect(parsed.data['oac-ai-settings-v1'].apiKey).toBeUndefined()
    expect(parsed.data['oac-ai-settings-v1'].openaiKey).toBeUndefined()
    expect(parsed.data['oac-ai-settings-v1'].model).toBe('claude-opus-4-8')
    expect(json).not.toContain('SECRET')
  })

  it('restores into storage and preserves existing local API keys', () => {
    const json = exportBackup('2026-06-10', memStorage({
      'oac-captures-v1': JSON.stringify([{ id: 'e1' }, { id: 'e2' }]),
      'oac-ai-settings-v1': JSON.stringify({ mode: 'live', model: 'gpt-4o', demoData: true, apiKey: 'x' }),
    }))
    // target browser already has a key entered locally
    const dst = memStorage({ 'oac-ai-settings-v1': JSON.stringify({ apiKey: 'sk-ant-LOCAL', model: 'claude-haiku-4-5' }) })
    const { restored } = importBackup(json, dst)
    expect(restored).toBe(2)
    expect(JSON.parse(dst._dump()['oac-captures-v1'])).toHaveLength(2)
    const settings = JSON.parse(dst._dump()['oac-ai-settings-v1'])
    expect(settings.apiKey).toBe('sk-ant-LOCAL') // local secret preserved
    expect(settings.model).toBe('gpt-4o') // backup value applied
    expect(settings.demoData).toBe(true)
  })

  it('rejects a non-OAC file', () => {
    expect(() => importBackup(JSON.stringify({ app: 'other' }), memStorage())).toThrow()
  })
})
