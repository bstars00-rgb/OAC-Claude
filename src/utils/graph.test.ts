import { describe, it, expect } from 'vitest'
import { itemToCapture, companyFromEmail, matchRelationship, type NormalizedItem } from './graph'

describe('graph — company inference', () => {
  it('derives a company from a corporate email domain', () => {
    expect(companyFromEmail('jane@klook.com', 'Jane Lee').company).toBe('Klook')
    expect(companyFromEmail('ops@hotelbeds.co.kr', 'Ops').company).toBe('Hotelbeds')
  })
  it('falls back to the display name for public mail providers', () => {
    expect(companyFromEmail('someone@gmail.com', 'Chris Park').company).toBe('Chris Park')
    expect(companyFromEmail(undefined, 'No Email').company).toBe('No Email')
  })
})

describe('graph — import mapping', () => {
  it('groups an Outlook mail by the sender company (domain)', () => {
    const item: NormalizedItem = {
      source: 'outlook',
      personName: 'Jane Lee',
      personEmail: 'jane@acme.com',
      title: 'Renewal terms',
      preview: 'Sending over the updated SLA for review.',
      date: '2026-06-10',
    }
    const c = itemToCapture(item, 'en')
    expect(c.kind).toBe('email')
    expect(c.accountName).toBe('Acme') // company, not the person
    expect(c.accountId).toBe('ms-acme')
    expect(c.detail).toContain('Jane Lee') // sender kept inside the company timeline
    expect(c.detectedContext).toMatch(/Outlook/)
  })

  it('two mails from the same company share one relationship id', () => {
    const a = itemToCapture({ source: 'outlook', personName: 'A', personEmail: 'a@klook.com', title: 'A', preview: 'x', date: '2026-06-01' }, 'ko')
    const b = itemToCapture({ source: 'outlook', personName: 'B', personEmail: 'b@klook.com', title: 'B', preview: 'y', date: '2026-06-02' }, 'ko')
    expect(a.accountId).toBe(b.accountId)
    expect(a.accountName).toBe('Klook')
  })

  it('attaches to an existing relationship when matched', () => {
    const item: NormalizedItem = { source: 'outlook', personName: 'Sara', personEmail: 'sara@klook.com', company: 'Klook', title: 'Hi', preview: 'p', date: '2026-06-10' }
    const rels = [{ id: 'klook', name: 'Klook' }, { id: 'itank', name: 'iTANK' }]
    const match = matchRelationship(item, rels)
    expect(match?.accountId).toBe('klook')
    const c = itemToCapture(item, 'en', match)
    expect(c.accountId).toBe('klook')
    expect(c.isExisting).toBe(true)
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
