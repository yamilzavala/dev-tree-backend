/// <reference types="vitest/globals" />
import { hashPassword, checkPassword } from './auth'

describe('hashPassword', () => {
  test('should return a string', async () => {
    const result = await hashPassword('password123')
    expect(typeof result).toBe('string')
  })

  test('should return a bcrypt hash starting with $2b$', async () => {
    const result = await hashPassword('password123')
    expect(result.startsWith('$2b$')).toBe(true)
  })

  test('should return different hashes for the same password (random salt)', async () => {
    const hash1 = await hashPassword('password123')
    const hash2 = await hashPassword('password123')
    expect(hash1).not.toBe(hash2)
  })
})

describe('checkPassword', () => {
  let hash: string

  beforeAll(async () => {
    hash = await hashPassword('testPassword')
  })

  test('should return true when password matches the hash', async () => {
    const result = await checkPassword('testPassword', hash)
    expect(result).toBe(true)
  })

  test('should return false when password does not match', async () => {
    const result = await checkPassword('wrongPassword', hash)
    expect(result).toBe(false)
  })

  test('should return false for empty string', async () => {
    const result = await checkPassword('', hash)
    expect(result).toBe(false)
  })
})

describe('hashPassword + checkPassword round-trip', () => {
  test('hash produced by hashPassword passes checkPassword', async () => {
    const password = 'mySecurePass1'
    const hash = await hashPassword(password)
    expect(await checkPassword(password, hash)).toBe(true)
  })

  test('different password fails checkPassword against the hash', async () => {
    const hash = await hashPassword('correctPassword')
    expect(await checkPassword('wrongPassword', hash)).toBe(false)
  })
})

describe('hashPassword edge cases', () => {
  test('should handle very long password (1000+ characters)', async () => {
    const longPassword = 'a'.repeat(1000) + '123!@#'
    const hash = await hashPassword(longPassword)
    expect(typeof hash).toBe('string')
    expect(hash.startsWith('$2b$')).toBe(true)
    const isValid = await checkPassword(longPassword, hash)
    expect(isValid).toBe(true)
  })

  test('should handle unicode and emoji characters in password', async () => {
    const unicodePassword = 'Pässwörd123!🔐🚀'
    const hash = await hashPassword(unicodePassword)
    expect(typeof hash).toBe('string')
    expect(hash.startsWith('$2b$')).toBe(true)
    const isValid = await checkPassword(unicodePassword, hash)
    expect(isValid).toBe(true)
  })
})
