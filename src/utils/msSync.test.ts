import { describe, it, expect } from 'vitest'
import { itemKey, freshItems } from './msSync'
import type { NormalizedItem } from './graph'

const mk = (over: Partial<NormalizedItem>): NormalizedItem => ({
  source: 'outlook', personName: 'x', title: 't', preview: 'p', date: '2026-06-10', ...over,
})

describe('msSync de-duplication', () => {
  it('keys by Graph id when present', () => {
    expect(itemKey(mk({ id: 'AAMk-123' }))).toBe('AAMk-123')
  })

  it('falls back to a stable content key when no id', () => {
    const a = mk({ source: 'outlook', direction: 'in', date: '2026-06-10', title: 'Hi', personEmail: 'a@b.com' })
    const b = mk({ source: 'outlook', direction: 'in', date: '2026-06-10', title: 'Hi', personEmail: 'a@b.com' })
    expect(itemKey(a)).toBe(itemKey(b)) // identical content → identical key
    expect(itemKey(mk({ title: 'Other' }))).not.toBe(itemKey(a))
  })

  it('filters out items already seen, keeps new ones', () => {
    const items = [mk({ id: '1' }), mk({ id: '2' }), mk({ id: '3' })]
    const seen = new Set(['1', '3'])
    const fresh = freshItems(items, seen)
    expect(fresh.map((i) => i.id)).toEqual(['2'])
  })

  it('a second run after marking everything seen yields nothing (no duplicate captures)', () => {
    const items = [mk({ id: 'a' }), mk({ id: 'b' })]
    const seen = new Set<string>()
    const firstRun = freshItems(items, seen)
    expect(firstRun).toHaveLength(2)
    firstRun.forEach((i) => seen.add(itemKey(i)))
    expect(freshItems(items, seen)).toHaveLength(0) // same fetch, nothing new
  })
})
