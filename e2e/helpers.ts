import type { Page } from '@playwright/test'

// Seed the client-only app's localStorage, then load the app fresh so the React
// providers read the seeded state on mount.
export async function seed(page: Page, entries: Record<string, unknown>, opts: { lang?: 'en' | 'ko'; route?: string } = {}) {
  await page.goto('/')
  await page.evaluate(
    ({ entries, lang }) => {
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, typeof v === 'string' ? (v as string) : JSON.stringify(v))
      if (lang) localStorage.setItem('oac-lang', lang)
    },
    { entries, lang: opts.lang ?? 'en' },
  )
  await page.goto(opts.route ?? '/')
}

export function bookingSnapshot(period: string, hotels: [string, number, number][]) {
  const groups = hotels.map(([key, sales, rev]) => ({ key, metrics: { '판매액(¥)': sales, '수익(¥)': rev }, dims: {}, rows: 10 }))
  return {
    id: 'booking-' + period,
    profile: 'booking',
    periodLabel: period,
    rowCount: 1000,
    fileName: 'raw.xlsx',
    importedAt: '2026-06-10',
    mapping: { dimension: 'Hotel Name', extraDimensions: ['Seller Name'], metrics: [{ header: 's', label: '판매액(¥)' }, { header: 'r', label: '수익(¥)' }] },
    totals: { '판매액(¥)': hotels.reduce((a, h) => a + h[1], 0), '수익(¥)': hotels.reduce((a, h) => a + h[2], 0) },
    groups,
    byDimension: { 'Hotel Name': groups, 'Seller Name': groups },
  }
}

export function capture(over: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    accountId: 'agoda',
    accountName: 'Agoda',
    category: 'Partner',
    detectedContext: 'API Integration',
    isExisting: true,
    date: '2026-06-08',
    rawText: 'x',
    summary: 'Discussed rate parity gaps',
    timeline: { date: '2026-06-08', title: 'Rate parity sync', detail: 'Reviewed parity on 3 hotels' },
    todos: [{ id: 't1', text: 'Send revised rate sheet', due: '2020-01-01', priority: 'High', done: false }],
    risks: ['Parity breach could trigger penalty'],
    kind: 'meeting',
    ...over,
  }
}
