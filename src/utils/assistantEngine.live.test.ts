import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runAssistant, type AssistantMemory } from './assistantEngine'
import { todayTotals } from './usage'

// The live path calls the real Anthropic/OpenAI endpoints via fetch. Here we mock
// fetch to drive runAssistant's live branch end-to-end: response parsing (prose +
// oac/email blocks), token-usage recording, and provider-aware error handling —
// the path that's otherwise only manually verified.

const emptyMemory: AssistantMemory = { accounts: [], updates: [], totalAccounts: 0, totalOpenTodos: 0, totalRisks: 0 }
const base = { isLive: true as const, apiKey: 'sk-test', lang: 'en' as const, history: [], attachments: [], memory: emptyMemory, relationships: [] }

function mockFetch(data: unknown, { ok = true, status = 200 } = {}) {
  return vi.fn(async () => ({
    ok,
    status,
    statusText: 'mock',
    json: async () => data,
    text: async () => JSON.stringify(data),
  }))
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('runAssistant · live path (mocked API)', () => {
  it('parses prose + oac + email blocks and records token usage (Anthropic)', async () => {
    const F = String.fromCharCode(96, 96, 96) // ``` fence
    const oac = '{"account":"Agoda","isExisting":true,"category":"Partner","summary":"Rate parity gap","timeline":{"title":"Rate sync","detail":"reviewed"},"todos":[{"text":"Send rate sheet","due":"2026-06-20","priority":"High"}],"risks":["parity breach"]}'
    const emailJson = '{"to":"rep@agoda.com","subject":"Rate sheet","body":"Hello, attached."}'
    const anthropic = {
      content: [{
        type: 'text',
        text: `Logged the Agoda update.\n${F}oac\n${oac}\n${F}\n${F}oac-email\n${emailJson}\n${F}`,
      }],
      usage: { input_tokens: 1500, output_tokens: 300 },
    }
    vi.stubGlobal('fetch', mockFetch(anthropic))

    const r = await runAssistant({ ...base, provider: 'anthropic', model: 'claude-opus-4-8', userText: 'met Agoda about rate parity' })

    expect(r.error).toBeUndefined()
    expect(r.text).toBe('Logged the Agoda update.') // fenced blocks stripped from prose
    expect(r.structured?.summary).toBe('Rate parity gap')
    expect(r.structured?.todos).toHaveLength(1)
    expect(r.structured?.todos[0].text).toBe('Send rate sheet')
    expect(r.email).toEqual({ to: 'rep@agoda.com', subject: 'Rate sheet', body: 'Hello, attached.' })

    // usage recorded: opus 4.8 = 1500/1e6*$5 + 300/1e6*$25 = $0.0075 + $0.0075
    const t = todayTotals()
    expect(t.in).toBe(1500)
    expect(t.out).toBe(300)
    expect(t.cost).toBeCloseTo(0.015, 6)
  })

  it('returns a rate-limit hint (not a credit error) on a 429', async () => {
    vi.stubGlobal('fetch', mockFetch({ error: { message: "This request would exceed your rate limit of 10,000 input tokens per minute" } }, { ok: false, status: 429 }))
    const r = await runAssistant({ ...base, provider: 'anthropic', model: 'claude-opus-4-8', userText: 'hi' })
    expect(r.error).toMatch(/429/)
    expect(r.text).toMatch(/rate limit/i)
    expect(r.text).not.toMatch(/no available credit|ChatGPT Plus/i)
  })

  it('handles the OpenAI response shape and records usage', async () => {
    vi.stubGlobal('fetch', mockFetch({ choices: [{ message: { content: 'Hello from GPT-4o.' } }], usage: { prompt_tokens: 1000, completion_tokens: 200 } }))
    const r = await runAssistant({ ...base, provider: 'openai', model: 'gpt-4o', userText: 'hi' })
    expect(r.text).toBe('Hello from GPT-4o.')
    const t = todayTotals()
    // gpt-4o = 1000/1e6*$2.5 + 200/1e6*$10 = $0.0025 + $0.002
    expect(t.in).toBe(1000)
    expect(t.cost).toBeCloseTo(0.0045, 6)
  })
})
