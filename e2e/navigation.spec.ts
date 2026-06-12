import { test, expect } from '@playwright/test'
import { seed, capture } from './helpers'

test.describe('App-wide navigation & resilience', () => {
  test('command palette searches and navigates', async ({ page }) => {
    await seed(page, { 'oac-captures-v1': [capture()] }, { route: '/' })

    // ensure the app is interactive and the window has focus before the shortcut
    await page.getByRole('link', { name: 'Settings', exact: true }).waitFor()
    await page.locator('body').click()
    await page.keyboard.press('Control+KeyK')

    const dialog = page.getByRole('dialog', { name: 'Quick search' })
    await expect(dialog).toBeVisible()

    await dialog.getByRole('textbox').fill('rate parity')
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/\/relationship\/agoda/)
    await expect(dialog).toBeHidden()
  })

  test('lazy route pages load on navigation without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await seed(page, {}, { route: '/' })

    for (const name of ['Settings', 'Data Insight', 'Relationship 360', 'OAC Assistant']) {
      await page.getByRole('link', { name, exact: true }).click()
      await expect(page.locator('main')).not.toBeEmpty()
    }
    expect(errors).toEqual([])
  })

  test('usage card shows seeded token cost', async ({ page }) => {
    const today = new Date().toISOString().slice(0, 10)
    await seed(page, {
      // 0.6M in * $5 + 0.12M out * $25 = $3 + $3 = $6 today (Opus 4.8)
      'oac-usage-v1': { [today]: { 'claude-opus-4-8': { in: 600_000, out: 120_000, calls: 8 } } },
    }, { route: '/settings' })

    await expect(page.getByText(/API usage & cost/i)).toBeVisible()
    await expect(page.getByText('$6.00').first()).toBeVisible()
  })
})
