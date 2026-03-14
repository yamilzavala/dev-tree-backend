/// <reference types="vitest/globals" />
import { vi } from 'vitest'

// Mock connectDB BEFORE importing anything that depends on server
vi.mock('../config/db', () => ({ connectDB: vi.fn() }))

import { authenticate } from './auth'
import User from '../models/User'
import { generateJWT } from '../utils/jwt'
import { Request, Response, NextFunction } from 'express'

describe('authenticate middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: ReturnType<typeof vi.fn>
  let testUser: any

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      handle: 'middlewaretest',
      name: 'Middleware Test',
      email: 'middleware@test.com',
      password: 'hashedpassword123',
      description: 'Test middleware user'
    })

    mockNext = vi.fn()
    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn(),
    } as any
  })

  test('should call next() and attach user to req when valid token provided', async () => {
    const token = generateJWT({ id: testUser._id.toString() })

    mockReq = {
      headers: { authorization: `Bearer ${token}` },
      user: undefined
    } as any

    await authenticate(mockReq as Request, mockRes as Response, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.user).toBeDefined()
    expect(mockReq.user?.email).toBe('middleware@test.com')
    expect(mockReq.user?.handle).toBe('middlewaretest')
  })

  test('should return 404 when user not found in DB', async () => {
    const fakeUserId = '507f1f77bcf86cd799439011'
    const token = generateJWT({ id: fakeUserId })

    mockReq = {
      headers: { authorization: `Bearer ${token}` },
    } as any

    await authenticate(mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should NOT include password in req.user when attaching user', async () => {
    const token = generateJWT({ id: testUser._id.toString() })

    mockReq = {
      headers: { authorization: `Bearer ${token}` },
      user: undefined
    } as any

    await authenticate(mockReq as Request, mockRes as Response, mockNext)

    expect(mockReq.user).toBeDefined()
    expect(mockReq.user?.password).toBeUndefined()
    expect(mockReq.user?.email).toBe('middleware@test.com')
  })
})
