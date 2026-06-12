import { test, expect } from '@playwright/test'
import { seed, capture } from './helpers'

test.describe('Relationship 360 from captured data', () => {
  test('dashboard reflects a capture and surfaces overdue alerts', async ({ page }) => {
    await seed(page, { 'oac-captures-v1': [capture()] }, { route: '/' })

    // due/overdue banner surfaces the overdue to-do (due 2020 → overdue)
    await expect(page.getByText(/Due & overdue/i)).toBeVisible()
    await expect(page.getByText('Send revised rate sheet').first()).toBeVisible()
  })

  test('opens a relationship and shows the auto briefing + timeline', async ({ page }) => {
    await seed(page, { 'oac-captures-v1': [capture()] }, { route: '/relationship/agoda' })

    // B-6 auto briefing synthesized from the capture
    await expect(page.getByText(/Last touch with Agoda/i)).toBeVisible()
    // the captured event title appears in the relationship view
    await expect(page.getByText('Rate parity sync').first()).toBeVisible()
  })
})
