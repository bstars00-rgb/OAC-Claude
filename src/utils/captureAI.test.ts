import { describe, it, expect } from 'vitest'
import { structureCapture } from './captureAI'
import { TODAY } from './format'

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

describe('structureCapture', () => {
  it('matches an existing relationship by name', () => {
    const s = structureCapture('Klook SLA meeting — review the compensation wording', 'en')
    expect(s.accountId).toBe('klook')
    expect(s.isExisting).toBe(true)
    expect(s.accountName).toBe('Klook')
  })

  it('extracts the company name, not a common Korean word like 경쟁사', () => {
    const s = structureCapture(
      'Acme Corp 갱신 미팅. 다음주까지 제안서 보내야 함. 리스크: 경쟁사 가격 후려침.',
      'ko',
    )
    expect(s.accountName).toBe('Acme Corp')
    expect(s.accountName).not.toBe('경쟁')
    expect(s.isExisting).toBe(false)
  })

  it('extracts to-dos with a parsed due date', () => {
    const s = structureCapture('Acme Corp — 다음주까지 제안서 보내야 함.', 'ko')
    expect(s.todos.length).toBeGreaterThan(0)
    expect(s.todos[0].text).toContain('제안서')
    expect(s.todos[0].due).toBe(addDays(TODAY, 7)) // 다음주 → +7
  })

  it('parses relative due dates', () => {
    expect(structureCapture('내일까지 보내야 함', 'ko').todos[0].due).toBe(addDays(TODAY, 1))
    expect(structureCapture('send the report tomorrow', 'en').todos[0].due).toBe(addDays(TODAY, 1))
  })

  it('extracts risks', () => {
    const s = structureCapture('Risk: competitor is undercutting our price.', 'en')
    expect(s.risks.length).toBeGreaterThan(0)
  })

  it('detects categories', () => {
    expect(structureCapture('legal contract NDA review needed', 'en').category).toBe('Legal')
    expect(structureCapture('백엔드 지원자 면접, 오퍼 보내야 함', 'ko').category).toBe('Recruiting')
    expect(structureCapture('Atlas migration project cutover plan', 'en').category).toBe('Project')
  })

  it('always produces report and email artifacts', () => {
    const s = structureCapture('Met Northstar about Q3 pricing, send PO next week', 'en')
    expect(s.report.sections.length).toBeGreaterThan(0)
    expect(s.email.subject.length).toBeGreaterThan(0)
    expect(s.email.body).toContain(s.accountName)
  })
})
