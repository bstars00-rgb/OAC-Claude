import { describe, it, expect } from 'vitest'
import { runAssistant, extractEmailBlock, classifyLiveError, liveErrorHint, type AssistantMemory } from './assistantEngine'
import { getEntities } from '../data/entities'

const emptyMemory: AssistantMemory = { accounts: [], updates: [], totalAccounts: 0, totalOpenTodos: 0, totalRisks: 0 }

describe('live error classification', () => {
  // the exact message the user hit on Anthropic Opus 4.8
  const anthropicRateLimit = "Anthropic API 429: This request would exceed your organization's rate limit of 10,000 input tokens per minute (org: 5b27..., model: claude-opus-4-8)."
  const openaiQuota = 'OpenAI API 429: You exceeded your current quota, please check your plan and billing details. (insufficient_quota)'

  it('treats an Anthropic per-minute 429 as a rate limit, NOT a credit problem', () => {
    expect(classifyLiveError(anthropicRateLimit)).toBe('rateLimit')
    const hint = liveErrorHint(anthropicRateLimit, 'en', 'anthropic')
    expect(hint).toMatch(/rate limit/i)
    expect(hint).not.toMatch(/no available credit|ChatGPT Plus|openai/i)
  })

  it('treats insufficient_quota / billing as a quota problem, provider-aware', () => {
    expect(classifyLiveError(openaiQuota)).toBe('quota')
    expect(liveErrorHint(openaiQuota, 'en', 'openai')).toMatch(/platform\.openai\.com/i)
    // an Anthropic quota error points at the Anthropic console, not OpenAI
    const anthropicQuota = 'Anthropic API 400: Your credit balance is too low to access the API.'
    expect(classifyLiveError(anthropicQuota)).toBe('quota')
    expect(liveErrorHint(anthropicQuota, 'en', 'anthropic')).toMatch(/console\.anthropic\.com/i)
  })

  it('classifies auth and generic errors', () => {
    expect(classifyLiveError('401 invalid x-api-key')).toBe('auth')
    expect(classifyLiveError('network timeout')).toBe('generic')
  })
})

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

  it('extractEmailBlock pulls an inline email draft (live mode) out of the reply', () => {
    const raw = '초안입니다:\n```oac-email\n{ "to": "ops@klook.com", "subject": "연동 일정", "body": "안녕하세요,\\n다음 주 일정 공유드립니다." }\n```'
    const r = extractEmailBlock(raw)
    expect(r.email?.subject).toBe('연동 일정')
    expect(r.email?.to).toBe('ops@klook.com')
    expect(r.email?.body).toContain('다음 주')
    expect(r.text).toBe('초안입니다:') // block stripped from prose
  })

  it('extractEmailBlock leaves a normal reply untouched', () => {
    expect(extractEmailBlock('Klook is healthy this week.').email).toBeUndefined()
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
