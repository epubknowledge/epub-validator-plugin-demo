import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Mirrors tsconfig's `paths`, which vitest doesn't read on its own.
  resolve: {
    alias: { '@/': fileURLToPath(new URL('./src/', import.meta.url)) }
  },
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/__tests__/**'],
      // json-summary writes coverage/coverage-summary.json, which the release
      // workflow commits as release/coverage-summary.json.
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 }
    }
  }
})
