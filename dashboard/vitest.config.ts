import { defineConfig } from 'vitest/config'

// Unit tests only (src). Keep Playwright e2e/ out of the vitest run.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    environment: 'node',
  },
})
