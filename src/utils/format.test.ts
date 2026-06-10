import { describe, it, expect } from 'vitest'
import { formatUsd, formatNumber, formatPct, formatDate, daysAgo, initials, TODAY } from './format'

describe('format', () => {
  it('formatUsd', () => {
    expect(formatUsd(2_640_000)).toBe('$2.64M')
    expect(formatUsd(540_000)).toBe('$540K')
    expect(formatUsd(500)).toBe('$500')
  })

  it('formatNumber', () => {
    expect(formatNumber(18400)).toBe('18,400')
  })

  it('formatPct', () => {
    expect(formatPct(12.4)).toBe('12.4%')
    expect(formatPct(12.4, true)).toBe('+12.4%')
    expect(formatPct(-1.3, true)).toBe('-1.3%')
  })

  it('formatDate', () => {
    expect(formatDate('2026-06-09')).toBe('Jun 9, 2026')
  })

  it('daysAgo is anchored to TODAY', () => {
    expect(TODAY).toBe('2026-06-09')
    expect(daysAgo('2026-06-09')).toBe('Today')
    expect(daysAgo('2026-06-08')).toBe('Yesterday')
    expect(daysAgo('2026-06-05')).toBe('4 days ago')
  })

  it('initials', () => {
    expect(initials('Grand Hyatt Jeju')).toBe('GH')
    expect(initials('Klook')).toBe('K')
  })
})
