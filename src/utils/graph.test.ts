import { describe, it, expect } from 'vitest'
import { itemToCapture, type NormalizedItem } from './graph'

describe('graph — import mapping', () => {
  it('maps an Outlook mail to an email capture grouped by sender', () => {
    const item: NormalizedItem = {
      source: 'outlook',
      personName: 'Acme Corp',
      personEmail: 'jane@acme.com',
      title: 'Renewal terms',
      preview: 'Sending over the updated SLA for review.',
      date: '2026-06-10',
    }
    const c = itemToCapture(item, 'en')
    expect(c.kind).toBe('email')
    expect(c.accountName).toBe('Acme Corp')
    expect(c.accountId).toBe('ms-acme-corp')
    expect(c.timeline.date).toBe('2026-06-10')
    expect(c.summary).toBe('Renewal terms')
    expect(c.detectedContext).toMatch(/Outlook/)
  })

  it('two mails from the same sender share one relationship id', () => {
    const a = itemToCapture({ source: 'outlook', personName: 'Klook', title: 'A', preview: 'x', date: '2026-06-01' }, 'ko')
    const b = itemToCapture({ source: 'outlook', personName: 'Klook', title: 'B', preview: 'y', date: '2026-06-02' }, 'ko')
    expect(a.accountId).toBe(b.accountId)
  })

  it('maps a Teams chat to a meeting-kind capture', () => {
    const c = itemToCapture(
      { source: 'teams', personName: 'Partner Sync', title: 'Teams · Partner Sync', preview: 'See you at 3pm', date: '2026-06-09' },
      'en',
    )
    expect(c.kind).toBe('meeting')
    expect(c.detectedContext).toMatch(/Teams/)
  })
})
