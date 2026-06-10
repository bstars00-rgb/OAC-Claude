import { describe, it, expect } from 'vitest'
import { runAssistant, type AssistantMemory } from './assistantEngine'
import { getEntities } from '../data/entities'

const emptyMemory: AssistantMemory = { accounts: [], updates: [], totalAccounts: 0, totalOpenTodos: 0, totalRisks: 0 }

const base = {
  isLive: false as const,
  apiKey: '',
  model: 'claude-opus-4-8',
  history: [],
  attachments: [],
  relationships: getEntities(), // seeded relationships (demo) for the action tests
}

describe('runAssistant (demo) — control center', () => {
  it('answers a status question with a briefing (no structuring)', async () => {
    const r = await runAssistant({ ...base, lang: 'en', userText: "What's the status on Klook?", memory: emptyMemory })
    expect(r.entityId).toBe('klook')
    expect(r.structured).toBeUndefined()
    expect(r.text).toContain('Klook')
  })

  it('reviews an SLA / contract and updates the relationship', async () => {
    const r = await runAssistant({ ...base, lang: 'ko', userText: '오늘 KLOOK에서 보내온 SLA의 독소조항을 검수해줘', memory: emptyMemory })
    expect(r.entityId).toBe('klook')
    expect(r.structured?.kind).toBe('review')
    expect(r.structured?.accountId).toBe('klook')
    expect(r.structured?.nextBestAction).toBeTruthy()
    // findings mention a real Klook risk (24/7 / compensation)
    expect(r.text).toMatch(/24\/7|보상|compensation/i)
  })

  it('drafts an email inline (no separate Email page)', async () => {
    const r = await runAssistant({ ...base, lang: 'en', userText: 'Draft an email to iTANK', memory: emptyMemory })
    expect(r.email).toBeDefined()
    expect(r.email?.subject.length).toBeGreaterThan(0)
    expect(r.log?.kind).toBe('email') // logged to the relationship timeline
    expect(r.entityId).toBe('itank')
  })

  it('drafts a report inline (no separate Report page)', async () => {
    const r = await runAssistant({ ...base, lang: 'en', userText: 'Create a CEO report for Hotelbeds', memory: emptyMemory })
    expect(r.report).toBeDefined()
    expect(r.report?.sections.length).toBeGreaterThan(0)
    expect(r.log?.kind).toBe('report')
  })

  it('logs a meeting note against an existing relationship', async () => {
    const r = await runAssistant({ ...base, lang: 'ko', userText: '오늘 Klook과 미팅: 보상 조항 수정 합의, 다음주까지 법무 검토 필요', memory: emptyMemory })
    expect(r.entityId).toBe('klook')
    expect(r.structured?.kind).toBe('meeting')
    expect(r.text).not.toContain('구조화')
  })

  it('recalls prior assistant activity when asked for status', async () => {
    const memory: AssistantMemory = {
      accounts: [],
      updates: [{ accountId: 'klook', date: '2026-06-09', kind: 'review', summary: 'Klook SLA 독소조항 검수 완료', detail: '24/7 지원 불가', nextBestAction: '24/7 조항 대응 및 보상 상한' }],
      totalAccounts: 1,
      totalOpenTodos: 1,
      totalRisks: 0,
    }
    const r = await runAssistant({ ...base, lang: 'ko', userText: 'Klook 진행상황 어때?', memory })
    expect(r.text).toContain('검수')
    expect(r.text).toContain('24/7')
  })

  it('saves a free-form note on a NEW account naturally', async () => {
    const r = await runAssistant({
      ...base,
      lang: 'en',
      userText: 'Met Brightwave Studios today — send the spec next week. Risk: their API is undocumented.',
      memory: emptyMemory,
    })
    expect(r.structured?.accountName).toBe('Brightwave Studios')
    expect(r.text).not.toMatch(/structured into/i)
    expect(r.text).toMatch(/workspace now holds/i)
  })
})
