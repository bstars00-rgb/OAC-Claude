import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { seed, bookingSnapshot, capture } from './helpers'

// C-2: automated WCAG 2 A/AA audit with axe-core on the key pages. We gate on
// serious/critical violations (the actionable, high-impact ones) so the bar is
// stable and regressions are caught on every deploy.
const HIGH = new Set(['serious', 'critical'])

async function violations(page: import('@playwright/test').Page) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  return res.violations.filter((v) => HIGH.has(v.impact ?? ''))
}

const pretty = (v: Awaited<ReturnType<typeof violations>>) => JSON.stringify(v.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.map((n) => n.target) })), null, 2)

test.describe('Accessibility · axe-core (WCAG 2 A/AA, serious+)', () => {
  test('dashboard', async ({ page }) => {
    await seed(page, { 'oac-captures-v1': [capture()] }, { route: '/' })
    const v = await violations(page)
    expect(pretty(v)).toBe('[]')
  })

  test('data insight', async ({ page }) => {
    await seed(page, { 'oac-datasets-v1': [bookingSnapshot('2026-W23', [['Agoda', 7e6, 7e5], ['Booking', 3e6, 3e5], ['Klook', 3.5e6, 3.5e5]])] }, { route: '/data' })
    const v = await violations(page)
    expect(pretty(v)).toBe('[]')
  })

  test('relationship 360', async ({ page }) => {
    await seed(page, { 'oac-captures-v1': [capture()] }, { route: '/relationship/agoda' })
    const v = await violations(page)
    expect(pretty(v)).toBe('[]')
  })

  test('settings', async ({ page }) => {
    await seed(page, {}, { route: '/settings' })
    const v = await violations(page)
    expect(pretty(v)).toBe('[]')
  })

  test('assistant', async ({ page }) => {
    await seed(page, {}, { route: '/assistant' })
    const v = await violations(page)
    expect(pretty(v)).toBe('[]')
  })
})
