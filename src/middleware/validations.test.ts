/// <reference types="vitest/globals" />
import { vi } from 'vitest'

// Mock express-validator module before any imports
vi.mock('express-validator', () => ({
  validationResult: vi.fn(() => ({
    isEmpty: () => true,
    array: () => []
  }))
}))

import type { Request, Response, NextFunction } from 'express'
import { handleInputErrors } from './validations'
import { validationResult } from 'express-validator'

describe('handleInputErrors middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockNext = vi.fn()
    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn(),
    } as any
    mockReq = {} as any
  })

  test('should return 400 with errors array when validation errors exist', () => {
    // Mock validationResult to return errors
    const mockVR = validationResult as any
    mockVR.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [
        { msg: 'Email is required', param: 'email' }
      ]
    })

    handleInputErrors(mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalled()
  })

  test('should call next() when no validation errors', () => {
    // Mock validationResult to return no errors
    const mockVR = validationResult as any
    mockVR.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => []
    })

    handleInputErrors(mockReq as Request, mockRes as Response, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRes.status).not.toHaveBeenCalled()
  })

  test('should include error messages in response body', () => {
    const mockVR = validationResult as any
    mockVR.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [
        { msg: 'Email is required', param: 'email' },
        { msg: 'Password too short', param: 'password' }
      ]
    })

    handleInputErrors(mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalled()
    const jsonArg = (mockRes.json as any).mock.calls[0][0]
    expect(jsonArg.errors).toHaveLength(2)
  })
})
