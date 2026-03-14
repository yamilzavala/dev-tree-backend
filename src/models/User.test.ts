/// <reference types="vitest/globals" />
import { vi } from 'vitest'

// Mock connectDB before importing mongoose
vi.mock('../config/db', () => ({ connectDB: vi.fn() }))

import User from './User'

describe('User Model', () => {
  test('should have email field with unique index', () => {
    const schema = User.schema
    expect(schema.paths.email).toBeDefined()
    expect(schema.paths.email.options.required).toBe(true)
    expect(schema.paths.email.options.unique).toBe(true)
  })

  test('should have handle field with unique index', () => {
    const schema = User.schema
    expect(schema.paths.handle).toBeDefined()
    expect(schema.paths.handle.options.required).toBe(true)
    expect(schema.paths.handle.options.unique).toBe(true)
  })

  test('should have default values for optional fields', () => {
    const schema = User.schema
    expect(schema.paths.description.options.default).toBe('')
    expect(schema.paths.image.options.default).toBe('')
  })

  test('should require name field', () => {
    const schema = User.schema
    expect(schema.paths.name).toBeDefined()
    expect(schema.paths.name.options.required).toBe(true)
  })

  test('should require password field', () => {
    const schema = User.schema
    expect(schema.paths.password).toBeDefined()
    expect(schema.paths.password.options.required).toBe(true)
  })
})
