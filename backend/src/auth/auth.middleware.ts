import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase.js';
import { syncUser } from './auth.service.js';
import { UnauthorizedError } from '../errors/index.js';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if(!token){
      throw new UnauthorizedError('No token provided');
    }
    const decoded = await adminAuth.verifyIdToken(token);
    req.userId = decoded.uid;
    // Sync user to DB on first encounter — no-op after that (memory cache)
    await syncUser(decoded.uid, decoded.email);
    next();
  } catch (err) {
    // Don't double-wrap if it's already an AppError
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}