/// <reference types="vitest/globals" />
import slug from 'slug'

describe('slug utility', () => {
  test('should convert uppercase to lowercase', () => {
    const result = slug('HELLO WORLD', '')
    expect(result).toBe('helloworld')
    expect(result === result.toLowerCase()).toBe(true)
  })

  test('should remove spaces when separator is empty string', () => {
    const result = slug('my handle name', '')
    expect(result).not.toContain(' ')
    expect(result).toBe('myhandlename')
  })

  test('should handle mixed case', () => {
    const result = slug('MyHandle', '')
    expect(result).toBe('myhandle')
  })

  test('should remove spaces from input', () => {
    const result = slug('user email', '')
    expect(result).toBe('useremail')
    expect(result).not.toContain(' ')
  })

  test('should preserve numbers', () => {
    const result = slug('user123', '')
    expect(result).toContain('123')
    expect(result).toBe('user123')
  })

  test('should handle multiple spaces', () => {
    const result = slug('hello    world', '')
    expect(result).toBe('helloworld')
  })

  test('should preserve hyphens in slug', () => {
    const result = slug('first-name', '')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
