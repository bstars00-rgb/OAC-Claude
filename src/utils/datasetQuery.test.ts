import { describe, it, expect } from 'vitest'
import { answerDataQuery, looksLikeDataQuery, buildDatasetContext } from './datasetQuery'
import { buildSnapshot, type DatasetSnapshot } from './dataImport'

function snap(): DatasetSnapshot {
  const rows = [
    { 'Hotel Name': 'Grand Hyatt Jeju', '판매액': '200000', '수익': '30000', '룸나잇': '8' },
    { 'Hotel Name': 'Hotel Gracery', '판매액': '230000', '수익': '45000', '룸나잇': '15' },
    { 'Hotel Name': 'Lotte Seoul', '판매액': '120000', '수익': '12000', '룸나잇': '6' },
  ]
  return buildSnapshot({
    profile: 'booking',
    periodLabel: '2026-W23',
    fileName: 'raw.xlsx',
    importedAt: '2026-06-10',
    rows,
    mapping: {
      dimension: 'Hotel Name',
      extraDimensions: [],
      metrics: [
        { header: '판매액', label: '판매액(¥)' },
        { header: '수익', label: '수익(¥)' },
        { header: '룸나잇', label: '룸나잇' },
      ],
    },
  })
}

describe('datasetQuery', () => {
  it('detects data questions', () => {
    expect(looksLikeDataQuery('이번 주 수익 Top5 호텔 알려줘')).toBe(true)
    expect(looksLikeDataQuery('오늘 날씨 어때')).toBe(false)
  })

  it('answers a revenue ranking using the JPY revenue metric', () => {
    const ans = answerDataQuery('이번 주 수익 Top 2 호텔', [snap()], 'ko')!
    expect(ans).toContain('수익(¥)')
    // Gracery (45,000) ranks above Hyatt (30,000)
    const gIdx = ans.indexOf('Hotel Gracery')
    const hIdx = ans.indexOf('Grand Hyatt Jeju')
    expect(gIdx).toBeGreaterThan(-1)
    expect(gIdx).toBeLessThan(hIdx)
    expect(ans).toContain('¥45,000')
  })

  it('ranks by 판매액 when sales is asked, and respects Top N', () => {
    const ans = answerDataQuery('판매액 상위 1곳', [snap()], 'ko')!
    expect(ans).toContain('Hotel Gracery') // highest sales 230,000
    expect(ans).not.toContain('Lotte Seoul')
  })

  it('builds a compact live context grounded on snapshots', () => {
    const ctx = buildDatasetContext([snap()])
    expect(ctx).toContain('2026-W23')
    expect(ctx).toContain('Hotel Name')
    expect(ctx).toMatch(/JPY/)
  })
})
