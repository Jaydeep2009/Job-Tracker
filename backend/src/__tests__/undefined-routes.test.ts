import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { notFoundHandler } from '../middleware/notFound.js';
import { NotFoundError } from '../errors/index.js';

describe('Undefined Routes - 404 Handler', () => {
  describe('GET requests to undefined routes', () => {
    it('should throw NotFoundError for GET request to undefined route', () => {
      const req = {
        method: 'GET',
        path: '/api/undefined-route',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = next.mock.calls[0]![0];
      expect(error.message).toContain('GET');
      expect(error.message).toContain('/api/undefined-route');
    });

    it('should return 404 status code for GET request', () => {
      const req = {
        method: 'GET',
        path: '/api/nonexistent',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      const error = next.mock.calls[0]![0];
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('POST requests to undefined routes', () => {
    it('should throw NotFoundError for POST request to undefined route', () => {
      const req = {
        method: 'POST',
        path: '/api/undefined-endpoint',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = next.mock.calls[0]![0];
      expect(error.message).toContain('POST');
      expect(error.message).toContain('/api/undefined-endpoint');
    });

    it('should return 404 status code for POST request', () => {
      const req = {
        method: 'POST',
        path: '/api/nonexistent',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      const error = next.mock.calls[0]![0];
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('Other HTTP methods', () => {
    it('should throw NotFoundError for PUT request to undefined route', () => {
      const req = {
        method: 'PUT',
        path: '/api/undefined',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = next.mock.calls[0]![0];
      expect(error.message).toContain('PUT');
    });

    it('should throw NotFoundError for DELETE request to undefined route', () => {
      const req = {
        method: 'DELETE',
        path: '/api/undefined',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = next.mock.calls[0]![0];
      expect(error.message).toContain('DELETE');
    });

    it('should throw NotFoundError for PATCH request to undefined route', () => {
      const req = {
        method: 'PATCH',
        path: '/api/undefined',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = next.mock.calls[0]![0];
      expect(error.message).toContain('PATCH');
    });
  });

  describe('Error message includes route information', () => {
    it('should include HTTP method in error message', () => {
      const req = {
        method: 'GET',
        path: '/api/test',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      const error = next.mock.calls[0]![0];
      expect(error.message).toMatch(/GET/);
    });

    it('should include route path in error message', () => {
      const req = {
        method: 'GET',
        path: '/api/test-route',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      const error = next.mock.calls[0]![0];
      expect(error.message).toMatch(/\/api\/test-route/);
    });

    it('should format error message as "Route METHOD PATH not found"', () => {
      const req = {
        method: 'POST',
        path: '/api/users',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      const error = next.mock.calls[0]![0];
      expect(error.message).toBe('Route POST /api/users not found');
    });
  });

  describe('Error structure consistency', () => {
    it('should have consistent error properties', () => {
      const req = {
        method: 'GET',
        path: '/api/undefined',
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      notFoundHandler(req, res, next as unknown as NextFunction);

      const error = next.mock.calls[0]![0];
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('statusCode');
      expect(error).toHaveProperty('isOperational');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
  });
});

