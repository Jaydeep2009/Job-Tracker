import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/index.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      name: err.name,
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      error: 'Database error',
      details: err.message,
    });
    return;
  }

  // Default to 500 for unknown errors
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
