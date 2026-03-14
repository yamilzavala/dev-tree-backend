/// <reference types="vitest/globals" />
import { setupDB, teardownDB, clearDB } from './db-setup'

// Guard env vars
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-minimum-32-chars-long'
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
process.env.NODE_ENV = 'test'

// Setup/Teardown for database
beforeAll(async () => {
  await setupDB()
})

afterAll(async () => {
  await teardownDB()
})

// Clear database between test files
beforeEach(async () => {
  await clearDB()
})
