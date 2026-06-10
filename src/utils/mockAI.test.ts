import { describe, it, expect } from 'vitest'
import { detectIntent, askOAC } from './mockAI'

describe('detectIntent', () => {
  it('routes common phrasings', () => {
    expect(detectIntent('draft an email to iTANK')).toBe('draft-email')
    expect(detectIntent('create a CEO report for Hotelbeds')).toBe('report')
    expect(detectIntent('show me Dida issue status')).toBe('issue-status')
    expect(detectIntent('show me sales data for Traveloka')).toBe('sales-data')
    expect(detectIntent('what should I do next with Klook?')).toBe('next-action')
    expect(detectIntent('summarize the meeting with Grand Hyatt Jeju')).toBe('meeting-summary')
    expect(detectIntent('show me Yeogi Eottae')).toBe('overview')
  })
})

describe('askOAC', () => {
  it('resolves an entity by name', () => {
    const r = askOAC('Show me Klook')
    expect(r.entity?.id).toBe('klook')
    expect(r.notFound).toBeUndefined()
    expect(r.suggestions.length).toBeGreaterThan(0)
  })

  it('matches the longest name to avoid partials', () => {
    expect(askOAC('summarize the meeting with Grand Hyatt Jeju').entity?.id).toBe('grandhyatt')
  })

  it('flags not-found when no relationship is mentioned', () => {
    const r = askOAC('hello, random unrelated text')
    expect(r.notFound).toBe(true)
    expect(r.entity).toBeUndefined()
  })
})
