import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
    env: {
      JWT_SECRET: 'test-jwt-secret-minimum-32-chars-long',
      FRONTEND_URL: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
  },
})
