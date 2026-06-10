import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { parseArrayBuffer, aggregate, toNum, inferNumericHeaders, buildSnapshot, suggestMapping, derivePeriodLabel } from './dataImport'

// Build a small RawData-like workbook in memory (no file system).
function makeBook(): ArrayBuffer {
  const rows = [
    { 호텔명: 'Grand Hyatt Jeju', 채널: 'Booking.com', 국가: 'KR', 예약건수: '1,200', 객실매출: '₩45,000,000', 취소건수: 80 },
    { 호텔명: 'Grand Hyatt Jeju', 채널: 'Expedia', 국가: 'KR', 예약건수: 300, 객실매출: '₩12,000,000', 취소건수: 20 },
    { 호텔명: 'Lotte Hotel Seoul', 채널: 'Booking.com', 국가: 'KR', 예약건수: 500, 객실매출: '₩30,000,000', 취소건수: 10 },
  ]
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

describe('dataImport', () => {
  it('toNum strips currency, commas and percent', () => {
    expect(toNum('1,200')).toBe(1200)
    expect(toNum('₩45,000,000')).toBe(45000000)
    expect(toNum('12.5%')).toBe(12.5)
    expect(toNum(300)).toBe(300)
    expect(toNum('n/a')).toBe(0)
  })

  it('parses an .xlsx array buffer into headers + rows', async () => {
    const p = await parseArrayBuffer(makeBook())
    expect(p.rows).toHaveLength(3)
    expect(p.headers).toContain('호텔명')
    expect(p.headers).toContain('예약건수')
  })

  it('infers numeric columns as metric candidates', async () => {
    const p = await parseArrayBuffer(makeBook())
    const nums = inferNumericHeaders(p.rows, p.headers)
    expect(nums).toContain('예약건수')
    expect(nums).toContain('취소건수')
    expect(nums).not.toContain('호텔명')
  })

  it('aggregates rows by dimension, summing metrics across messy formats', async () => {
    const p = await parseArrayBuffer(makeBook())
    const groups = aggregate(p.rows, {
      dimension: '호텔명',
      extraDimensions: ['국가'],
      metrics: [
        { header: '예약건수', label: '예약' },
        { header: '객실매출', label: '매출' },
      ],
    })
    expect(groups).toHaveLength(2) // Grand Hyatt + Lotte
    const hyatt = groups.find((g) => g.key === 'Grand Hyatt Jeju')!
    expect(hyatt.metrics['예약']).toBe(1500) // 1200 + 300
    expect(hyatt.metrics['매출']).toBe(57000000) // 45M + 12M
    expect(hyatt.dims['국가']).toBe('KR')
    expect(hyatt.rows).toBe(2)
  })

  it('auto-maps the Ohmyhotel RawData schema to JPY metrics (incl. double-space header)', () => {
    const headers = [
      'Booking Date', 'Hotel Code', 'Hotel Country', 'Hotel Region', 'Hotel Name', 'Chain Brand',
      'Vendor Name', 'Seller Name', 'Week of Booking Date', 'Total Room Nights',
      'Billing Sum by Company Currency_JPY', 'Vendor Sum by Company Currency_JPY',
      'Billing Revenue  by Company Currency_JPY', // note the DOUBLE space, as in the real file
      'Billing Sum by Company Currency_USD',
    ]
    const sug = suggestMapping(headers)
    expect(sug.preset).toBe('ohmyhotel')
    expect(sug.dimension).toBe('Hotel Name')
    const labels = sug.metrics.map((m) => m.label)
    expect(labels).toContain('판매액(¥)')
    expect(labels).toContain('수익(¥)')
    expect(labels).toContain('매입(¥)')
    expect(labels).toContain('룸나잇')
    // the 수익 metric resolves the double-space JPY header, not the USD one
    const revenue = sug.metrics.find((m) => m.label === '수익(¥)')!
    expect(revenue.header).toBe('Billing Revenue  by Company Currency_JPY')
    expect(sug.extraDimensions).toContain('Seller Name')
    expect(sug.periodColumn).toBe('Booking Date') // prefer the full date → ISO week
  })

  it('falls back to generic for an unknown schema', () => {
    expect(suggestMapping(['name', 'count', 'value']).preset).toBe('generic')
  })

  it('uses a Check Out period column for the checkout profile', () => {
    const headers = [
      'Check Out Date', 'Week of Check In Date', 'Hotel Name', 'Hotel Country', 'Total Room Nights',
      'Billing Sum by Company Currency_JPY', 'Vendor Sum by Company Currency_JPY', 'Billing Revenue by Company Currency_JPY',
    ]
    const booking = suggestMapping(headers, 'booking')
    const checkout = suggestMapping(headers, 'checkout')
    expect(checkout.preset).toBe('ohmyhotel')
    expect(checkout.periodColumn).toBe('Check Out Date')
    // booking has no Booking Date column here, so it falls back to a check-in week
    expect(booking.periodColumn).toBe('Week of Check In Date')
  })

  it('derives a monthly label for checkout and an ISO week for booking', () => {
    expect(derivePeriodLabel('2026-05-20', 'checkout')).toBe('2026-05')
    expect(derivePeriodLabel('2026/5/3', 'checkout')).toBe('2026-05')
    expect(derivePeriodLabel('2026-W23', 'booking')).toBe('2026-W23') // already a week label
    expect(derivePeriodLabel('2026-06-08', 'booking')).toMatch(/^2026-W\d{2}$/) // full date → ISO week
    expect(derivePeriodLabel('23', 'booking')).toBe('W23') // bare week number
    expect(derivePeriodLabel('', 'checkout')).toBe('')
  })

  it('buildSnapshot computes totals and a stable id', async () => {
    const p = await parseArrayBuffer(makeBook())
    const snap = buildSnapshot({
      profile: 'booking',
      periodLabel: '2026-W23',
      fileName: 'raw.xlsx',
      importedAt: '2026-06-10',
      rows: p.rows,
      mapping: { dimension: '호텔명', extraDimensions: [], metrics: [{ header: '예약건수', label: '예약' }] },
    })
    expect(snap.totals['예약']).toBe(2000) // 1200+300+500
    expect(snap.groups[0].key).toBe('Grand Hyatt Jeju') // sorted by first metric desc
    expect(snap.profile).toBe('booking')
  })
})
