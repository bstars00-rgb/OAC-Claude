import { describe, it, expect } from 'vitest'
import { answerDataQuery, answerDataQueryRich, looksLikeDataQuery, buildDatasetContext } from './datasetQuery'
import { buildSnapshot, type DatasetSnapshot } from './dataImport'

const metrics = [
  { header: '판매액', label: '판매액(¥)' },
  { header: '수익', label: '수익(¥)' },
  { header: '룸나잇', label: '룸나잇' },
]

function snap(period = '2026-W23'): DatasetSnapshot {
  const rows = [
    { 'Hotel Name': 'Grand Hyatt Jeju', 'Seller Name': 'Agoda', '판매액': '200000', '수익': '30000', '룸나잇': '8' },
    { 'Hotel Name': 'Hotel Gracery', 'Seller Name': 'Booking.com', '판매액': '230000', '수익': '45000', '룸나잇': '15' },
    { 'Hotel Name': 'Lotte Seoul', 'Seller Name': 'Agoda', '판매액': '120000', '수익': '12000', '룸나잇': '6' },
  ]
  return buildSnapshot({
    profile: 'booking', periodLabel: period, fileName: 'raw.xlsx', importedAt: '2026-06-10',
    rows, mapping: { dimension: 'Hotel Name', extraDimensions: ['Seller Name'], metrics },
  })
}

// A monthly Check Out snapshot for April, grouped so Agoda is a seller.
function aprilSnap(): DatasetSnapshot {
  const rows = [
    { 'Hotel Name': 'A', 'Seller Name': 'Agoda', '판매액': '500000', '수익': '90000', '룸나잇': '40' },
    { 'Hotel Name': 'B', 'Seller Name': 'Expedia', '판매액': '300000', '수익': '50000', '룸나잇': '20' },
  ]
  return buildSnapshot({
    profile: 'checkout', periodLabel: '2026-04', fileName: 'co.xlsx', importedAt: '2026-05-01',
    rows, mapping: { dimension: 'Hotel Name', extraDimensions: ['Seller Name'], metrics },
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

  it('answers a Korean channel + month query ("아고다 4월 매출") with a number + chart', () => {
    const r = answerDataQueryRich('아고다 4월 매출 어때?', [snap(), aprilSnap()], 'ko')!
    expect(r.text).toContain('Agoda') // matched 아고다 → Agoda via alias
    expect(r.text).toContain('4월')
    expect(r.text).toContain('¥500,000') // April sales for Agoda (checkout snapshot)
    expect(r.chart).toBeDefined()
    expect(r.chart!.unit).toBe('yen')
    expect(r.chart!.points.some((p) => p.label === '2026-04')).toBe(true)
  })

  it('ranks sellers when asked "판매처 수익 Top"', () => {
    const r = answerDataQueryRich('판매처 수익 Top 2', [snap()], 'ko')!
    expect(r.text).toContain('Seller Name')
    expect(r.text).toContain('Agoda') // Agoda revenue = 30000+12000 = 42000 across both rows
    expect(r.chart!.kind).toBe('bar')
  })
})
