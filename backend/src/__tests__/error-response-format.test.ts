import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middleware/errorHandler.js';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
} from '../errors/index.js';
import { Prisma } from '@prisma/client';

describe('Error Response Format', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: any;
  let statusSpy: any;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    
    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });
    
    mockReq = {
      method: 'GET',
      path: '/api/test',
    };
    
    mockRes = {
      status: statusSpy,
      json: jsonSpy,
    };
    
    mockNext = vi.fn();
    
    // Mock logger to avoid console output during tests
    vi.mock('../utils/logger.js', () => ({
      logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      },
    }));
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.clearAllMocks();
  });

  describe('Consistent JSON Structure', () => {
    it('should return error response with message and error fields', () => {
      const error = new ValidationError('Invalid input');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid input',
          error: expect.any(String),
        })
      );
    });

    it('should include error code in response', () => {
      const error = new ValidationError('Invalid input', 'INVALID_INPUT');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response.error).toBe('INVALID_INPUT');
    });

    it('should generate error code from class name if not provided', () => {
      const error = new NotFoundError('Resource not found');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response.error).toBe('NOTFOUND');
    });
  });

  describe('Stack Traces in Development Mode', () => {
    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new ValidationError('Invalid input');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response).toHaveProperty('stack');
      expect(response.stack).toBeDefined();
    });

    it('should exclude stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new ValidationError('Invalid input');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response).not.toHaveProperty('stack');
    });

    it('should include stack trace for unexpected errors in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Unexpected error');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response).toHaveProperty('stack');
      expect(response.stack).toBeDefined();
    });

    it('should exclude stack trace for unexpected errors in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Unexpected error');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response).not.toHaveProperty('stack');
    });
  });

  describe('HTTP Status Code Mapping', () => {
    it('should return 400 for ValidationError', () => {
      const error = new ValidationError('Validation failed');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
    });

    it('should return 401 for UnauthorizedError', () => {
      const error = new UnauthorizedError('Authentication required');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
    });

    it('should return 403 for ForbiddenError', () => {
      const error = new ForbiddenError('Access forbidden');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(403);
    });

    it('should return 404 for NotFoundError', () => {
      const error = new NotFoundError('Resource not found');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
    });

    it('should return 409 for ConflictError', () => {
      const error = new ConflictError('Resource already exists');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(409);
    });

    it('should return 503 for ServiceUnavailableError', () => {
      const error = new ServiceUnavailableError('Service unavailable');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(503);
    });

    it('should return 500 for unexpected errors', () => {
      const error = new Error('Unexpected error');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
    });
  });

  describe('Prisma Error Handling', () => {
    it('should return 409 for Prisma unique constraint violation (P2002)', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(409);
      const response = jsonSpy.mock.calls[0][0];
      expect(response.error).toBe('CONFLICT');
      expect(response.message).toBe('Resource already exists');
    });

    it('should return 404 for Prisma record not found (P2025)', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0',
      });
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
      const response = jsonSpy.mock.calls[0][0];
      expect(response.error).toBe('NOT_FOUND');
      expect(response.message).toBe('Resource not found');
    });

    it('should return 400 for Prisma foreign key constraint (P2003)', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003',
        clientVersion: '5.0.0',
      });
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      const response = jsonSpy.mock.calls[0][0];
      expect(response.error).toBe('INVALID_REFERENCE');
    });
  });

  describe('Error Response Consistency Across Error Types', () => {
    it('should have consistent structure for all custom errors', () => {
      const errors = [
        new ValidationError('Validation failed'),
        new UnauthorizedError('Auth required'),
        new ForbiddenError('Forbidden'),
        new NotFoundError('Not found'),
        new ConflictError('Conflict'),
        new ServiceUnavailableError('Unavailable'),
      ];

      errors.forEach((error) => {
        vi.clearAllMocks();
        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const response = jsonSpy.mock.calls[0][0];
        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('error');
        expect(typeof response.message).toBe('string');
        expect(typeof response.error).toBe('string');
      });
    });

    it('should have consistent structure for Prisma errors', () => {
      const prismaErrors = [
        new Prisma.PrismaClientKnownRequestError('Error', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
        new Prisma.PrismaClientKnownRequestError('Error', {
          code: 'P2025',
          clientVersion: '5.0.0',
        }),
        new Prisma.PrismaClientKnownRequestError('Error', {
          code: 'P2003',
          clientVersion: '5.0.0',
        }),
      ];

      prismaErrors.forEach((error) => {
        vi.clearAllMocks();
        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const response = jsonSpy.mock.calls[0][0];
        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('error');
        expect(typeof response.message).toBe('string');
        expect(typeof response.error).toBe('string');
      });
    });
  });

  describe('Error Details Field', () => {
    it('should include details for Prisma errors when available', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response).toHaveProperty('details');
      expect(response.details).toEqual({ target: ['email'] });
    });

    it('should include details for unexpected errors in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Unexpected error message');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response).toHaveProperty('details');
      expect(response.details).toBe('Unexpected error message');
    });
  });

  describe('Error Code Format', () => {
    it('should use uppercase for error codes', () => {
      const error = new ValidationError('Test', 'test_error');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response.error).toBe('test_error');
    });

    it('should generate uppercase error code from class name', () => {
      const error = new NotFoundError('Test');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = jsonSpy.mock.calls[0][0];
      expect(response.error).toMatch(/^[A-Z_]+$/);
    });
  });
});
