import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter — 100 requests per 15 minutes per IP
 * Applied to all routes to prevent general API abuse
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later.',
    },
});

/**
 * Auth rate limiter — 10 requests per 15 minutes per IP
 * Applied to login/register to prevent brute-force attacks
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: 'TOO_MANY_REQUESTS',
        message: 'Too many authentication attempts, please try again later.',
    },
});
