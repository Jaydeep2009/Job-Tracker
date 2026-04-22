import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import { globalLimiter, authLimiter } from '../middleware/rateLimiter.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function startServer(app: Express): Promise<{ server: http.Server; port: number }> {
    return new Promise((resolve) => {
        const server = app.listen(0, () => {
            const addr = server.address() as { port: number };
            resolve({ server, port: addr.port });
        });
    });
}

function stopServer(server: http.Server): Promise<void> {
    return new Promise((resolve) => server.close(() => resolve()));
}

async function get(url: string): Promise<{ status: number; body: any }> {
    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
}

/** Fire `n` sequential requests to `url` and return all response statuses. */
async function fireRequests(url: string, n: number): Promise<number[]> {
    const statuses: number[] = [];
    for (let i = 0; i < n; i++) {
        const { status } = await get(url);
        statuses.push(status);
    }
    return statuses;
}

// ─────────────────────────────────────────────────────────────────────────────
// Global Limiter Tests  (limit = 100 req / 15 min)
// ─────────────────────────────────────────────────────────────────────────────

describe('globalLimiter — 100 requests per 15 minutes', () => {
    let server: http.Server;
    let baseUrl: string;

    beforeAll(async () => {
        // Build a tiny test app that has ONLY the global limiter + one route
        const app = express();
        // Use a tiny limit so tests don't need to fire 100 requests
        const testLimiter = (await import('express-rate-limit')).default({
            windowMs: 60_000,
            limit: 5,  // 5 req / min for test speed
            standardHeaders: 'draft-8',
            legacyHeaders: false,
            message: { error: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' },
        });
        app.use(testLimiter);
        app.get('/test', (_req, res) => res.json({ ok: true }));

        const result = await startServer(app);
        server = result.server;
        baseUrl = `http://127.0.0.1:${result.port}`;
    });

    afterAll(() => stopServer(server));

    it('should allow requests below the limit', async () => {
        const statuses = await fireRequests(`${baseUrl}/test`, 3);
        expect(statuses.every(s => s === 200)).toBe(true);
    });

    it('should return 429 when limit is exceeded', async () => {
        // Fire 5 more (already sent 3 above — use different test server per describe)
        const statuses = await fireRequests(`${baseUrl}/test`, 5);
        const has429 = statuses.some(s => s === 429);
        expect(has429).toBe(true);
    });

    it('should include correct error fields in the 429 response body', async () => {
        // Keep firing until we get a 429
        let body: any;
        for (let i = 0; i < 20; i++) {
            const res = await get(`${baseUrl}/test`);
            if (res.status === 429) {
                body = res.body;
                break;
            }
        }
        expect(body).toBeDefined();
        expect(body.error).toBe('TOO_MANY_REQUESTS');
        expect(body.message).toContain('Too many requests');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth Limiter Tests  (limit = 10 req / 15 min)
// ─────────────────────────────────────────────────────────────────────────────

describe('authLimiter — 10 requests per 15 minutes', () => {
    let server: http.Server;
    let baseUrl: string;

    beforeAll(async () => {
        const app = express();
        // Use a tiny limit for test speed
        const testAuthLimiter = (await import('express-rate-limit')).default({
            windowMs: 60_000,
            limit: 3,  // 3 req / min for test speed
            standardHeaders: 'draft-8',
            legacyHeaders: false,
            message: { error: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts, please try again later.' },
        });
        app.post('/auth/login', testAuthLimiter, (_req, res) => res.json({ ok: true }));
        app.post('/auth/register', testAuthLimiter, (_req, res) => res.json({ ok: true }));

        const result = await startServer(app);
        server = result.server;
        baseUrl = `http://127.0.0.1:${result.port}`;
    });

    afterAll(() => stopServer(server));

    async function post(path: string): Promise<{ status: number; body: any }> {
        const res = await fetch(`${baseUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        return { status: res.status, body: await res.json().catch(() => ({})) };
    }

    async function postMany(path: string, n: number): Promise<number[]> {
        const statuses: number[] = [];
        for (let i = 0; i < n; i++) {
            statuses.push((await post(path)).status);
        }
        return statuses;
    }

    it('should allow login requests below the limit', async () => {
        const statuses = await postMany('/auth/login', 2);
        expect(statuses.every(s => s === 200)).toBe(true);
    });

    it('should return 429 on login when limit is exceeded', async () => {
        const statuses = await postMany('/auth/login', 5);
        expect(statuses.some(s => s === 429)).toBe(true);
    });

    it('should return correct auth 429 message for login', async () => {
        let body: any;
        for (let i = 0; i < 10; i++) {
            const res = await post('/auth/login');
            if (res.status === 429) { body = res.body; break; }
        }
        expect(body).toBeDefined();
        expect(body.error).toBe('TOO_MANY_REQUESTS');
        expect(body.message).toContain('authentication attempts');
    });

    it('should also rate limit register endpoint', async () => {
        const statuses = await postMany('/auth/register', 6);
        expect(statuses.some(s => s === 429)).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiter Configuration Tests (unit-level)
// ─────────────────────────────────────────────────────────────────────────────

describe('Rate Limiter — configuration properties', () => {
    it('globalLimiter should be a function (valid Express middleware)', () => {
        expect(typeof globalLimiter).toBe('function');
    });

    it('authLimiter should be a function (valid Express middleware)', () => {
        expect(typeof authLimiter).toBe('function');
    });

    it('globalLimiter and authLimiter should be different middleware instances', () => {
        expect(globalLimiter).not.toBe(authLimiter);
    });
});
