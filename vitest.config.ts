import { defineConfig } from 'vitest/config'

// Unit tests cover the pure logic (no DOM, no network, no API key needed):
// capture structuring, context detection, the mock AI router, formatting, and
// the demo assistant engine.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
