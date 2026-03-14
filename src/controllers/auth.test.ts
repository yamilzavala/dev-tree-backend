/// <reference types="vitest/globals" />
import { vi } from 'vitest'

// Mock connectDB BEFORE importing server
vi.mock('../config/db', () => ({ connectDB: vi.fn() }))

import request from 'supertest'
import app from '../server'
import User from '../models/User'

const ORIGIN = 'http://localhost:5173'

describe('POST /api/auth/register — success path', () => {
  test('should create a new user and return 201', async () => {
    const userData = {
      handle: 'newuser',
      name: 'New User',
      email: 'newuser@test.com',
      password: 'password123'
    }

    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send(userData)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('msg', 'User registered')

    // Verify user was actually created in DB
    const user = await User.findOne({ email: userData.email })
    expect(user).toBeDefined()
    expect(user?.handle).toBe(userData.handle)
  })

  test('should hash the password (not store plaintext)', async () => {
    const userData = {
      handle: 'testuser2',
      name: 'Test User',
      email: 'test2@test.com',
      password: 'password123'
    }

    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send(userData)

    expect(res.status).toBe(201)

    // Verify user in DB has hashed password
    const user = await User.findOne({ email: userData.email })
    expect(user).toBeDefined()
    expect(user?.password).not.toBe(userData.password)
    expect(user?.password).toMatch(/^\$2b\$/)  // bcrypt hash
  })

  test('should return 409 when email already exists', async () => {
    const userData = {
      handle: 'user1',
      name: 'User 1',
      email: 'duplicate@test.com',
      password: 'password123'
    }

    // First user
    const res1 = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send(userData)

    expect(res1.status).toBe(201)

    // Second user with same email
    const res2 = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send({
        ...userData,
        handle: 'user2',
        name: 'User 2'
      })

    expect(res2.status).toBe(409)
  })
})

describe('POST /api/auth/login — success path', () => {
  beforeEach(async () => {
    // Create a test user
    await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send({
        handle: 'logintest',
        name: 'Login Test',
        email: 'login@test.com',
        password: 'correctpassword'
      })
  })

  test('should return 200 and JWT token for correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({
        email: 'login@test.com',
        password: 'correctpassword'
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.split('.')).toHaveLength(3)  // Valid JWT structure
  })

  test('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({
        email: 'nonexistent@test.com',
        password: 'password123'
      })

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('msg', 'User not found')
  })

  test('should return 401 for incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({
        email: 'login@test.com',
        password: 'wrongpassword'
      })

    expect(res.status).toBe(401)
  })
})
