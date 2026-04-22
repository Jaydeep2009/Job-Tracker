import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/index.js';

/**
 * Handles requests to undefined routes
 * Throws NotFoundError with route information
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}
