import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/index.js';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger.js';

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * Global error handler middleware
 * Handles AppError instances, Prisma errors, and unexpected errors
 * Formats consistent error responses with appropriate status codes
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error with context
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    userId: (req as any).userId,
  });

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    return handleAppError(err, res);
  }

  // Handle unexpected errors
  return handleUnexpectedError(err, res);
}

function handlePrismaError(
  err: Prisma.PrismaClientKnownRequestError,
  res: Response
) {
  switch (err.code) {
    case 'P2002': // Unique constraint violation
      return res.status(409).json({
        error: 'CONFLICT',
        message: 'Resource already exists',
        details: err.meta,
      });
    
    case 'P2025': // Record not found
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Resource not found',
      });
    
    case 'P2003': // Foreign key constraint violation
      return res.status(400).json({
        error: 'INVALID_REFERENCE',
        message: 'Invalid reference to related resource',
      });
    
    default:
      logger.error('Unhandled Prisma error:', err);
      return res.status(500).json({
        error: 'DATABASE_ERROR',
        message: 'A database error occurred',
      });
  }
}

function handleAppError(err: AppError, res: Response) {
  const response: ErrorResponse = {
    error: err.errorCode || err.constructor.name.replace('Error', '').toUpperCase(),
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
  };

  return res.status(err.statusCode).json(response);
}

function handleUnexpectedError(err: Error, res: Response) {
  logger.error('Unexpected error:', err);

  const response: ErrorResponse = {
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack, details: err.message } : {}),
  };

  return res.status(500).json(response);
}
