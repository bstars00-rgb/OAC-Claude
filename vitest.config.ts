import { defineConfig } from 'vitest/config'

// Tests cover both the pure logic (capture structuring, context detection, the
// mock AI router, formatting, the demo assistant engine, MS sync de-dup) and
// React component integration (rendering with the app providers). jsdom provides
// the DOM; the setup file registers @testing-library matchers.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
