import { defineConfig, devices } from '@playwright/test'

// End-to-end tests drive the real app in Chromium against the Vite dev server.
// They seed localStorage (the app is client-only) and verify whole user flows —
// data import → charts, capture → Relationship 360, command palette, usage card.
// Kept separate from the vitest unit/component suite (src/**/*.test.tsx).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
