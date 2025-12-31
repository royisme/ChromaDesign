import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    testTimeout: 60000, // 60s for AI API calls
    alias: {
      'cloudflare:workers': path.resolve(__dirname, './src/mocks/cloudflare-workers.ts'),
    }
  },
})
