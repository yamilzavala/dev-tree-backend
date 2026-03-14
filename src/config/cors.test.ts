/// <reference types="vitest/globals" />
import { corsConfig } from './cors'

describe('CORS Config', () => {
  test('should allow requests from whitelisted FRONTEND_URL', () => {
    process.env.FRONTEND_URL = 'http://localhost:5173'

    let callbackError: Error | null = null
    let callbackAllow: boolean = false

    corsConfig.origin!('http://localhost:5173', (err: Error | null, allow: boolean) => {
      callbackError = err
      callbackAllow = allow
    })

    expect(callbackError).toBeNull()
    expect(callbackAllow).toBe(true)
  })

  test('should reject requests from unknown origins', () => {
    process.env.FRONTEND_URL = 'http://localhost:5173'

    let callbackError: Error | null = null

    corsConfig.origin!('http://malicious-site.com', (err: Error | null) => {
      callbackError = err
    })

    expect(callbackError).toBeTruthy()
    expect(callbackError?.message).toContain('CORS error')
  })

  test('should allow undefined origin when --api flag is set', () => {
    process.env.FRONTEND_URL = 'http://localhost:5173'
    // Mock process.argv to include --api flag
    const originalArgv = process.argv
    process.argv = [...originalArgv, '--api']

    let callbackError: Error | null = null
    let callbackAllow: boolean = false

    corsConfig.origin!(undefined as any, (err: Error | null, allow: boolean) => {
      callbackError = err
      callbackAllow = allow
    })

    // Restore argv
    process.argv = originalArgv

    // With --api flag, undefined should be in whitelist
    expect(callbackAllow).toBe(true)
  })
})
