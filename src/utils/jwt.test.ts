/// <reference types="vitest/globals" />
import jwt from 'jsonwebtoken'
import { generateJWT, decodeJWT } from './jwt'

describe('generateJWT', () => {
  test('should return a non-empty string', () => {
    const token = generateJWT({ id: 'user123' })
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  test('should return a string with three dot-separated segments', () => {
    const token = generateJWT({ id: 'user123' })
    expect(token.split('.')).toHaveLength(3)
  })
})

describe('decodeJWT', () => {
  test('should decode a token produced by generateJWT', () => {
    const token = generateJWT({ id: 'user123' })
    const decoded = decodeJWT(token) as { payload: { id: string }; iat: number; exp: number }
    expect(decoded).toBeTruthy()
  })

  test('decoded result should have a "payload" key wrapping the original object', () => {
    const token = generateJWT({ id: 'user123' })
    const decoded = decodeJWT(token) as { payload: { id: string } }
    expect(decoded).toHaveProperty('payload')
    expect(decoded.payload).toHaveProperty('id', 'user123')
  })

  test('decoded result should include iat and exp fields', () => {
    const token = generateJWT({ id: 'user123' })
    const decoded = decodeJWT(token) as { iat: number; exp: number }
    expect(typeof decoded.iat).toBe('number')
    expect(typeof decoded.exp).toBe('number')
  })

  test('should throw when token is malformed', () => {
    expect(() => decodeJWT('not.a.valid.jwt')).toThrow()
  })

  test('should throw when token was signed with a different secret', () => {
    const foreignToken = jwt.sign({ payload: { id: 'x' } }, 'different-secret')
    expect(() => decodeJWT(foreignToken)).toThrow()
  })
})

describe('generateJWT + decodeJWT round-trip', () => {
  test('should recover the original payload id', () => {
    const token = generateJWT({ id: 'abc123' })
    const decoded = decodeJWT(token) as { payload: { id: string } }
    expect(decoded.payload.id).toBe('abc123')
  })
})

describe('JWT edge cases', () => {
  test('should handle empty payload object', () => {
    const token = generateJWT({})
    const decoded = decodeJWT(token) as { payload: Record<string, any> }
    expect(decoded.payload).toBeDefined()
    expect(typeof decoded.payload).toBe('object')
  })

  test('should include exp claim for 180 day expiration', () => {
    const token = generateJWT({ id: 'test' })
    const decoded = decodeJWT(token) as { payload: any; iat: number; exp: number }

    expect(decoded.exp).toBeDefined()
    const expirationSeconds = decoded.exp - decoded.iat
    const oneDay = 86400
    const daysUntilExpiry = expirationSeconds / oneDay

    // 180 days ± 1 day tolerance
    expect(daysUntilExpiry).toBeGreaterThan(179)
    expect(daysUntilExpiry).toBeLessThan(181)
  })

  test('should decode token with multiple payload fields', () => {
    const token = generateJWT({ id: 'user123', role: 'admin', email: 'test@test.com' })
    const decoded = decodeJWT(token) as { payload: any }

    expect(decoded.payload.id).toBe('user123')
    expect(decoded.payload.role).toBe('admin')
    expect(decoded.payload.email).toBe('test@test.com')
  })
})
