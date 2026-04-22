import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
} from '../errors/index.js';

describe('Error Classes - Custom Error Classes', () => {
  describe('AppError Base Class', () => {
    it('should create error with correct status code', () => {
      const error = new AppError('Test error', 500);
      expect(error.statusCode).toBe(500);
    });

    it('should create error with correct message', () => {
      const error = new AppError('Test error message', 500);
      expect(error.message).toBe('Test error message');
    });

    it('should create error with optional error code', () => {
      const error = new AppError('Test error', 500, 'TEST_ERROR');
      expect(error.errorCode).toBe('TEST_ERROR');
    });

    it('should be operational by default', () => {
      const error = new AppError('Test error', 500);
      expect(error.isOperational).toBe(true);
    });

    it('should support non-operational errors', () => {
      const error = new AppError('Test error', 500, undefined, false);
      expect(error.isOperational).toBe(false);
    });

    it('should pass instanceof check', () => {
      const error = new AppError('Test error', 500);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 500);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Test error');
    });
  });

  describe('ValidationError', () => {
    it('should have 400 status code', () => {
      const error = new ValidationError();
      expect(error.statusCode).toBe(400);
    });

    it('should have default message', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
    });

    it('should accept custom message', () => {
      const error = new ValidationError('Custom validation error');
      expect(error.message).toBe('Custom validation error');
    });

    it('should accept error code', () => {
      const error = new ValidationError('Validation failed', 'INVALID_INPUT');
      expect(error.errorCode).toBe('INVALID_INPUT');
    });

    it('should pass instanceof checks', () => {
      const error = new ValidationError();
      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('UnauthorizedError', () => {
    it('should have 401 status code', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
    });

    it('should have default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Authentication required');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });

    it('should pass instanceof checks', () => {
      const error = new UnauthorizedError();
      expect(error instanceof UnauthorizedError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ForbiddenError', () => {
    it('should have 403 status code', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
    });

    it('should have default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Access forbidden');
    });

    it('should accept custom message', () => {
      const error = new ForbiddenError('You cannot access this resource');
      expect(error.message).toBe('You cannot access this resource');
    });

    it('should pass instanceof checks', () => {
      const error = new ForbiddenError();
      expect(error instanceof ForbiddenError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('NotFoundError', () => {
    it('should have 404 status code', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
    });

    it('should have default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('Job not found');
      expect(error.message).toBe('Job not found');
    });

    it('should pass instanceof checks', () => {
      const error = new NotFoundError();
      expect(error instanceof NotFoundError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ConflictError', () => {
    it('should have 409 status code', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
    });

    it('should have default message', () => {
      const error = new ConflictError();
      expect(error.message).toBe('Resource already exists');
    });

    it('should accept custom message', () => {
      const error = new ConflictError('Email already exists');
      expect(error.message).toBe('Email already exists');
    });

    it('should pass instanceof checks', () => {
      const error = new ConflictError();
      expect(error instanceof ConflictError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should have 503 status code', () => {
      const error = new ServiceUnavailableError();
      expect(error.statusCode).toBe(503);
    });

    it('should have default message', () => {
      const error = new ServiceUnavailableError();
      expect(error.message).toBe('Service temporarily unavailable');
    });

    it('should accept custom message', () => {
      const error = new ServiceUnavailableError('Database connection failed');
      expect(error.message).toBe('Database connection failed');
    });

    it('should pass instanceof checks', () => {
      const error = new ServiceUnavailableError();
      expect(error instanceof ServiceUnavailableError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });
});
