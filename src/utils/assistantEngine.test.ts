import { describe, it, expect } from 'vitest'
import { runAssistant, type AssistantMemory } from './assistantEngine'

const emptyMemory: AssistantMemory = { accounts: [], totalAccounts: 0, totalOpenTodos: 0, totalRisks: 0 }

const base = {
  isLive: false as const,
  apiKey: '',
  model: 'claude-opus-4-8',
  history: [],
  attachments: [],
}

describe('runAssistant (demo)', () => {
  it('answers a question about an existing relationship with a briefing (no structuring)', async () => {
    const r = await runAssistant({ ...base, lang: 'en', userText: 'What should I do next with Klook?', memory: emptyMemory })
    expect(r.entityId).toBe('klook')
    expect(r.structured).toBeUndefined()
    expect(r.text).toContain('Klook')
  })

  it('saves a free-form note naturally — no rigid "structured into X" wording', async () => {
    const r = await runAssistant({
      ...base,
      lang: 'en',
      userText: 'Met Acme Corp today — send the proposal next week. Risk: competitor undercutting our price.',
      memory: emptyMemory,
    })
    expect(r.structured).toBeDefined()
    expect(r.structured?.accountName).toBe('Acme Corp')
    expect(r.text).not.toMatch(/structured into|Account.?Timeline.?To Do.?Risk/i)
    expect(r.text).toMatch(/workspace now holds/i) // memory feedback
  })

  it('uses workspace memory to recognize a follow-up note (Korean)', async () => {
    const memory: AssistantMemory = {
      accounts: [{ accountId: 'cap-acme-corp', accountName: 'Acme Corp', entryCount: 1, openTodos: 1, detectedContext: 'Customer' }],
      totalAccounts: 1,
      totalOpenTodos: 1,
      totalRisks: 0,
    }
    const r = await runAssistant({ ...base, lang: 'ko', userText: 'Acme Corp 후속: 계약서 초안 검토 필요.', memory })
    expect(r.structured?.accountId).toBe('cap-acme-corp')
    expect(r.text).toContain('2번째')
    expect(r.text).not.toContain('구조화')
  })
})
