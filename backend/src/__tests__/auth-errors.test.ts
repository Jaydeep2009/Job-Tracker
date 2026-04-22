import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as authService from '../auth/auth.service.js';
import { authenticate } from '../auth/auth.middleware.js';
import { UnauthorizedError, ConflictError } from '../errors/index.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import { Prisma } from '@prisma/client';

// Mock Prisma
vi.mock('../lib/prisma.js', () => ({
  default: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Auth Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Registration Errors', () => {
    it('should throw ConflictError (409) when email already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });

      vi.mocked(prisma.user.create).mockRejectedValue(prismaError);

      await expect(
        authService.register('existing@example.com', 'Password123')
      ).rejects.toThrow(ConflictError);

      await expect(
        authService.register('existing@example.com', 'Password123')
      ).rejects.toThrow('Email already exists');
    });

    it('should return 409 status code for duplicate email', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });

      vi.mocked(prisma.user.create).mockRejectedValue(prismaError);

      try {
        await authService.register('existing@example.com', 'Password123');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
        if (error instanceof ConflictError) {
          expect(error.statusCode).toBe(409);
        }
      }
    });
  });

  describe('Login Errors', () => {
    it('should throw UnauthorizedError (401) when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'Password123')
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        authService.login('nonexistent@example.com', 'Password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedError (401) when password is invalid', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed_password',
        createdAt: new Date(),
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login('user@example.com', 'WrongPassword')
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        authService.login('user@example.com', 'WrongPassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should return 401 status code for invalid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      try {
        await authService.login('user@example.com', 'Password123');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedError);
        if (error instanceof UnauthorizedError) {
          expect(error.statusCode).toBe(401);
        }
      }
    });
  });

  describe('Authentication Middleware Errors', () => {
    it('should throw UnauthorizedError when token is missing', () => {
      const req = {
        headers: {},
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      expect(() => authenticate(req as any, res, next)).toThrow(UnauthorizedError);
      expect(() => authenticate(req as any, res, next)).toThrow('Authentication required');
    });

    it('should throw UnauthorizedError when authorization header has no token', () => {
      const req = {
        headers: {
          authorization: 'Bearer ',
        },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      expect(() => authenticate(req as any, res, next)).toThrow(UnauthorizedError);
      expect(() => authenticate(req as any, res, next)).toThrow('Authentication required');
    });

    it('should throw UnauthorizedError when token is invalid', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      expect(() => authenticate(req as any, res, next)).toThrow(UnauthorizedError);
      expect(() => authenticate(req as any, res, next)).toThrow('Invalid or expired token');
    });

    it('should throw UnauthorizedError when token is expired', () => {
      const expiredToken = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '-1h' });

      const req = {
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      expect(() => authenticate(req as any, res, next)).toThrow(UnauthorizedError);
      expect(() => authenticate(req as any, res, next)).toThrow('Invalid or expired token');
    });

    it('should return 401 status code for missing token', () => {
      const req = {
        headers: {},
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      try {
        authenticate(req as any, res, next);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedError);
        if (error instanceof UnauthorizedError) {
          expect(error.statusCode).toBe(401);
        }
      }
    });
  });

  describe('Error Response Format Consistency', () => {
    it('should have consistent error structure for ConflictError', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });

      vi.mocked(prisma.user.create).mockRejectedValue(prismaError);

      try {
        await authService.register('existing@example.com', 'Password123');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
        if (error instanceof ConflictError) {
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('statusCode');
          expect(error).toHaveProperty('isOperational');
          expect(error.message).toBe('Email already exists');
          expect(error.statusCode).toBe(409);
          expect(error.isOperational).toBe(true);
        }
      }
    });

    it('should have consistent error structure for UnauthorizedError', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      try {
        await authService.login('user@example.com', 'Password123');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedError);
        if (error instanceof UnauthorizedError) {
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('statusCode');
          expect(error).toHaveProperty('isOperational');
          expect(error.message).toBe('Invalid credentials');
          expect(error.statusCode).toBe(401);
          expect(error.isOperational).toBe(true);
        }
      }
    });
  });
});
