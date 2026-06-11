import { describe, it, expect, beforeEach } from 'vitest'
import { recordUsage, costOf, todayTotals, monthTotals, projectMonthly, PRICING } from './usage'

describe('usage cost tracking', () => {
  beforeEach(() => localStorage.clear())

  it('prices a call from list rates (per 1M tokens)', () => {
    // Opus 4.8: $5/M in, $25/M out → 1M in + 1M out = $30
    expect(costOf('claude-opus-4-8', 1_000_000, 1_000_000)).toBeCloseTo(30, 5)
    // Haiku: $1/M in, $5/M out → 500k in + 100k out = 0.5 + 0.5 = $1.00
    expect(costOf('claude-haiku-4-5', 500_000, 100_000)).toBeCloseTo(1.0, 5)
    // unknown model → 0 (no guess)
    expect(costOf('mystery', 1_000_000, 1_000_000)).toBe(0)
  })

  it('records calls and aggregates today / month with cost', () => {
    recordUsage('claude-opus-4-8', 200_000, 50_000) // 0.2*5 + 0.05*25 = 1.0 + 1.25 = $2.25
    recordUsage('claude-haiku-4-5', 1_000_000, 200_000) // 1*1 + 0.2*5 = $2.00
    const today = todayTotals()
    expect(today.calls).toBe(2)
    expect(today.in).toBe(1_200_000)
    expect(today.cost).toBeCloseTo(4.25, 5)
    // month includes today
    expect(monthTotals().cost).toBeCloseTo(4.25, 5)
    // by-model breakdown sorted by cost desc, labelled
    expect(today.byModel[0].label).toBe(PRICING['claude-opus-4-8'].label)
  })

  it('ignores zero-token calls', () => {
    recordUsage('claude-opus-4-8', 0, 0)
    expect(todayTotals().calls).toBe(0)
  })

  it('projects the month from the daily average so far', () => {
    recordUsage('claude-opus-4-8', 1_000_000, 0) // $5 today
    const p = projectMonthly()
    // projected = (monthCost / elapsedDays) * daysInMonth ; with one active day,
    // projected = (5 / today) * daysInMonth where avg = 5/elapsedDays
    expect(p.projected).toBeCloseTo(p.avgPerDay * p.daysInMonth, 5)
    expect(p.projected).toBeGreaterThanOrEqual(5) // at least today's spend
  })
})
