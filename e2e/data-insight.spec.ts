import { test, expect } from '@playwright/test'
import { seed, bookingSnapshot } from './helpers'

test.describe('Data Insight', () => {
  test('renders charts and switches breakdown views', async ({ page }) => {
    await seed(page, {
      'oac-datasets-v1': [
        bookingSnapshot('2026-W22', [['Agoda', 6_000_000, 600_000], ['Booking', 3_500_000, 350_000], ['Klook', 3_200_000, 320_000], ['Expedia', 2_100_000, 210_000], ['Trip', 1_200_000, 120_000], ['Rakuten', 900_000, 90_000], ['Hotels', 700_000, 70_000]]),
        bookingSnapshot('2026-W23', [['Agoda', 7_000_000, 700_000], ['Booking', 3_000_000, 300_000], ['Klook', 3_500_000, 350_000], ['Expedia', 2_400_000, 240_000], ['Trip', 1_500_000, 150_000], ['Rakuten', 1_000_000, 100_000], ['Hotels', 800_000, 80_000]]),
      ],
    }, { route: '/data' })

    // trend card + breakdown render
    await expect(page.getByText(/Booking trend/i)).toBeVisible()
    await expect(page.getByText('Breakdown')).toBeVisible()

    // default Bars view shows the top hotel
    await expect(page.getByText('Agoda').first()).toBeVisible()

    // switch to Donut → composition shows percentages and an "Others" bucket
    await page.getByRole('button', { name: 'Donut', exact: true }).click()
    await expect(page.getByText('Others')).toBeVisible()
    await expect(page.locator('svg path[stroke-width="26"]').first()).toBeVisible()

    // switch to Columns → vertical bar chart renders
    await page.getByRole('button', { name: 'Columns', exact: true }).click()
    await expect(page.getByText(/¥[\d.]+M/).first()).toBeVisible()
  })

  test('shows the import empty state when there is no data', async ({ page }) => {
    await seed(page, {}, { route: '/data' })
    await expect(page.getByText('No RawData yet')).toBeVisible()
  })
})
