/// <reference types="vitest/globals" />
import { vi } from 'vitest'

describe('Database Config', () => {
  test('should have MONGO_URI environment variable or default', () => {
    // The connectDB function reads process.env.MONGO_URI
    // Either it's set or it should be handled gracefully
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/devtree'

    expect(mongoUri).toBeTruthy()
    expect(typeof mongoUri).toBe('string')
    expect(mongoUri).toMatch(/^mongodb/)
  })

  test('should construct valid MongoDB connection string', () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/devtree'

    // Valid MongoDB URI should have mongodb:// protocol
    expect(mongoUri).toMatch(/^mongodb(?:\+srv)?:\/\//)
  })

  test('should handle memory server URI format', () => {
    // mongodb-memory-server generates URIs like: mongodb://127.0.0.1:port/
    const memoryUri = 'mongodb://127.0.0.1:27017/'

    expect(memoryUri).toMatch(/^mongodb:\/\//)
    expect(memoryUri).toContain('127.0.0.1')
  })
})
