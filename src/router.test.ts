/// <reference types="vitest/globals" />
import { vi } from 'vitest'

// Mock connectDB BEFORE importing server (must be hoisted)
vi.mock('./config/db', () => ({ connectDB: vi.fn() }))

import request from 'supertest'
import app from './server'

const ORIGIN = 'http://localhost:5173'

describe('POST /api/auth/register — validation', () => {
  test('should return 400 with errors array when body is empty', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send({})
    // Assert
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('errors')
    expect(Array.isArray(res.body.errors)).toBe(true)
  })

  test('should return 400 with email error when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send({ handle: 'user', name: 'Test', email: 'notanemail', password: 'password123' })
    expect(res.status).toBe(400)
    expect(res.body.errors.some((e: { msg: string }) => e.msg === 'No valid Email')).toBe(true)
  })

  test('should return 400 when password is shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send({ handle: 'user', name: 'Test', email: 'test@test.com', password: 'short' })
    expect(res.status).toBe(400)
  })

  test('should return 400 when handle is empty', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send({ handle: '', name: 'Test', email: 'test@test.com', password: 'password123' })
    expect(res.status).toBe(400)
    expect(res.body.errors.some((e: { msg: string }) => e.msg === 'Handle field required')).toBe(true)
  })

  test('should return 400 when name is empty', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send({ handle: 'user', name: '', email: 'test@test.com', password: 'password123' })
    expect(res.status).toBe(400)
    expect(res.body.errors.some((e: { msg: string }) => e.msg === 'Name field required')).toBe(true)
  })
})

describe('POST /api/auth/login — validation', () => {
  test('should return 400 when body is empty', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({})
    expect(res.status).toBe(400)
    expect(Array.isArray(res.body.errors)).toBe(true)
  })

  test('should return 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({ email: 'notanemail', password: 'pass123' })
    expect(res.status).toBe(400)
    expect(res.body.errors.some((e: { msg: string }) => e.msg === 'Invalid Email')).toBe(true)
  })

  test('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({ email: 'test@test.com', password: '' })
    expect(res.status).toBe(400)
  })

  test('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({ email: '', password: 'password123' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/user — authenticate guard', () => {
  test('should return 401 when Authorization header is absent', async () => {
    // Arrange: no token
    // Act
    const res = await request(app)
      .get('/api/user')
      .set('Origin', ORIGIN)
    // Assert
    expect(res.status).toBe(401)
    expect(res.body.msg).toBe('Unauthorized')
  })

  test('should return 401 when Authorization header has no token part', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Origin', ORIGIN)
      .set('Authorization', 'Bearer ')
    expect(res.status).toBe(401)
    expect(res.body.msg).toBe('Unauthorized')
  })

  test('should return 500 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Origin', ORIGIN)
      .set('Authorization', 'Bearer thisisnotavalidjwttoken')
    expect(res.status).toBe(500)
    expect(res.body.msg).toBe('Not valid Token')
  })
})

describe('PATCH /api/user — handleInputErrors runs before authenticate', () => {
  test('should return 400 when handle is missing (validation before auth check)', async () => {
    // Note: router.ts line 27-31 → body('handle') → handleInputErrors → authenticate
    // Missing handle triggers 400 BEFORE the 401 auth check
    const res = await request(app)
      .patch('/api/user')
      .set('Origin', ORIGIN)
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.errors.some((e: { msg: string }) => e.msg === 'Handle field required')).toBe(true)
  })
})
