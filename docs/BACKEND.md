# Backend — In-Depth Documentation

## Overview

The backend is a **Node.js + Express 5** REST API written in **TypeScript**. It handles authentication, job tracking, and serves as the bridge between the Chrome extension and the web dashboard. Data is persisted in **PostgreSQL** via **Prisma ORM**.

- Runtime: Node.js 18+
- Framework: Express 5
- Language: TypeScript 5
- ORM: Prisma 7 (with `@prisma/adapter-pg` for connection pooling)
- Database: PostgreSQL
- Auth: JWT (7-day expiry) + bcrypt password hashing
- Validation: Zod 4
- Testing: Vitest (177 tests, all passing)

---

## Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Data models and enums
├── src/
│   ├── app.ts                 # Express app setup, CORS config
│   ├── index.ts               # Server entry point, route registration
│   ├── auth/
│   │   ├── auth.controller.ts # Request handlers for auth routes
│   │   ├── auth.middleware.ts # JWT verification middleware
│   │   ├── auth.routes.ts     # Route definitions
│   │   └── auth.service.ts    # Business logic (register, login, profile)
│   ├── jobs/
│   │   ├── jobs.controller.ts # Request handlers for job routes
│   │   ├── jobs.routes.ts     # Route definitions
│   │   └── jobs.service.ts    # Business logic (CRUD, stats, filters)
│   ├── config/
│   │   └── jwt.ts             # JWT secret and expiry constants
│   ├── errors/
│   │   ├── AppError.ts        # Base error class
│   │   ├── ValidationError.ts # 400
│   │   ├── UnauthorizedError.ts # 401
│   │   ├── ForbiddenError.ts  # 403
│   │   ├── NotFoundError.ts   # 404
│   │   ├── ConflictError.ts   # 409
│   │   ├── ServiceUnavailableError.ts # 503
│   │   └── index.ts           # Re-exports
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton with pg pool
│   ├── middleware/
│   │   ├── asyncHandler.ts    # Wraps async handlers, forwards errors
│   │   ├── errorHandler.ts    # Global error handler
│   │   ├── notFound.ts        # 404 handler for undefined routes
│   │   └── rateLimiter.ts     # Global + auth-specific rate limiters
│   ├── routes/
│   │   └── health.ts          # GET /api/health
│   ├── utils/
│   │   └── logger.ts          # Structured JSON logger
│   ├── validation/
│   │   ├── middleware.ts      # Zod validation middleware factory
│   │   ├── sanitize.ts        # HTML stripping, special char escaping
│   │   └── schemas/
│   │       ├── auth.schema.ts # Register/login schemas + types
│   │       ├── job.schema.ts  # Job CRUD schemas + types
│   │       └── common.schema.ts # Shared: email, password, uuid, pagination
│   └── __tests__/             # 14 test files, 177 tests
└── .env.example
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/jobtracker` |
| `JWT_SECRET` | Secret for signing JWTs — use a long random string in production | `your-super-secret-key` |
| `PORT` | Port the server listens on | `4000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:3000,https://app.example.com` |

> In production, always set a strong `JWT_SECRET`. The fallback `"devSecret"` in `config/jwt.ts` is intentionally weak.

---

## Data Models

Defined in `prisma/schema.prisma`.

### User

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `email` | `String` | Unique |
| `password` | `String` | bcrypt hash |
| `createdAt` | `DateTime` | Auto-set |
| `jobs` | `Job[]` | Relation |

### Job

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `companyName` | `String` | Required |
| `jobTitle` | `String` | Required |
| `location` | `String?` | Optional |
| `description` | `String?` | Optional |
| `jobUrl` | `String` | Required |
| `platform` | `JobPlatform` | Enum |
| `status` | `JobStatus` | Default: `APPLIED` |
| `appliedAt` | `DateTime` | Set by client |
| `userId` | `String` | Foreign key → User |
| `createdAt` | `DateTime` | Auto-set |
| `updatedAt` | `DateTime` | Auto-updated |

Unique constraint: `(userId, jobUrl)` — prevents duplicate applications per user.
Index: `userId` for fast per-user queries.

### Enums

```
JobStatus:   APPLIED | INTERVIEW | OFFER | REJECTED
JobPlatform: LINKEDIN | NAUKRI | INTERNSHALA
```

---

## API Reference

Base URL: `http://localhost:4000/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Returns `{ status: "ok" }` |

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account, returns JWT |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Returns user profile + job count |

#### POST /api/auth/register

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

Password rules: min 8 chars, at least one uppercase, one lowercase, one number.

Response `200`:
```json
{ "token": "<jwt>" }
```

Response `409` (email taken):
```json
{ "error": "CONFLICT", "message": "Email already exists" }
```

#### POST /api/auth/login

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

Response `200`:
```json
{ "token": "<jwt>" }
```

Response `401` (wrong credentials):
```json
{ "error": "UNAUTHORIZED", "message": "Invalid credentials" }
```

#### GET /api/auth/me

Response `200`:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "jobCount": 42
}
```

---

### Jobs

All job routes require authentication.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/jobs` | Yes | Create or upsert a job |
| GET | `/api/jobs` | Yes | List jobs with pagination + filters |
| GET | `/api/jobs/stats` | Yes | Get status breakdown counts |
| PATCH | `/api/jobs/:id` | Yes | Update job status |
| DELETE | `/api/jobs/:id` | Yes | Delete a job |

#### POST /api/jobs

Creates a job. If a job with the same `(userId, jobUrl)` already exists, it updates `updatedAt` instead (upsert — idempotent for the extension).

Request:
```json
{
  "companyName": "Acme Corp",
  "jobTitle": "Software Engineer",
  "location": "Remote",
  "description": "Optional job description...",
  "jobUrl": "https://linkedin.com/jobs/view/123456",
  "platform": "LINKEDIN",
  "appliedAt": "2026-04-22T10:00:00.000Z"
}
```

Response `201`: Full job object.

#### GET /api/jobs

Query parameters:

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number (min 1) |
| `limit` | number | `15` | Items per page (1–100) |
| `status` | string | — | Filter by `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED` |
| `platform` | string | — | Filter by `LINKEDIN`, `NAUKRI`, `INTERNSHALA` |
| `search` | string | — | Case-insensitive search on `jobTitle` and `companyName` |

Response `200`:
```json
{
  "jobs": [...],
  "total": 87,
  "page": 1,
  "totalPages": 6,
  "limit": 15
}
```

Jobs are ordered by `appliedAt` descending.

#### GET /api/jobs/stats

Response `200`:
```json
{
  "total": 87,
  "APPLIED": 50,
  "INTERVIEW": 20,
  "OFFER": 5,
  "REJECTED": 12
}
```

> Note: `/stats` is registered before `/:id` in the router to prevent Express treating the string `"stats"` as a UUID param.

#### PATCH /api/jobs/:id

Request:
```json
{ "status": "INTERVIEW" }
```

Response `200`: Updated job object.
Response `403` if the job belongs to a different user.
Response `404` if the job doesn't exist.

#### DELETE /api/jobs/:id

Response `204` (no body).
Response `403` / `404` same as PATCH.

---

## Authentication Flow

```
Client                          Backend
  |                                |
  |-- POST /api/auth/register ---> |
  |                                | hash password (bcrypt, 10 rounds)
  |                                | create User in DB
  |                                | sign JWT { userId } exp 7d
  |<-- { token } ----------------- |
  |                                |
  |-- POST /api/auth/login ------> |
  |                                | find user by email
  |                                | bcrypt.compare(password, hash)
  |                                | sign JWT
  |<-- { token } ----------------- |
  |                                |
  |-- GET /api/jobs                |
  |   Authorization: Bearer <jwt>  |
  |                                | verify JWT → extract userId
  |                                | attach req.userId
  |                                | query DB WHERE userId = req.userId
  |<-- jobs ------------------------|
```

The `authenticate` middleware in `auth.middleware.ts` extracts the Bearer token, verifies it with `jsonwebtoken`, and attaches `userId` to the request object. All job operations are scoped to `req.userId`, so users can only access their own data.

---

## Middleware Stack

Request processing order:

```
Incoming Request
      ↓
globalLimiter          (100 req / 15 min / IP)
      ↓
express.json()         (body parsing)
      ↓
cors()                 (origin check)
      ↓
Route match
      ↓
[authLimiter]          (auth routes only: 10 req / 15 min / IP)
      ↓
[validate(schema)]     (Zod validation on body/query/params)
      ↓
[authenticate]         (JWT check, protected routes only)
      ↓
asyncHandler(controller)
      ↓
Service layer
      ↓
Response
      ↓ (on error)
errorHandler           (global, last middleware)
```

### asyncHandler

Wraps every async controller so thrown errors and rejected promises are automatically forwarded to `next()` — no try/catch boilerplate in controllers.

```typescript
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### Rate Limiting

Two limiters using `express-rate-limit`:

| Limiter | Limit | Window | Applied to |
|---|---|---|---|
| `globalLimiter` | 100 requests | 15 minutes | All routes |
| `authLimiter` | 10 requests | 15 minutes | `/api/auth/*` only |

Uses `draft-8` standard headers (`RateLimit-*`), legacy headers disabled.

### CORS

Configured in `app.ts`. Allowed origins:
- `chrome-extension://` — any extension origin (for the tracker)
- Origins listed in `ALLOWED_ORIGINS` env var
- `null` origin (non-browser clients, curl, etc.)

---

## Error Handling

### Error Class Hierarchy

```
Error (built-in)
  └── AppError (base, isOperational flag)
        ├── ValidationError     → 400
        ├── UnauthorizedError   → 401
        ├── ForbiddenError      → 403
        ├── NotFoundError       → 404
        ├── ConflictError       → 409
        └── ServiceUnavailableError → 503
```

`AppError` captures a proper stack trace via `Error.captureStackTrace` and sets the prototype explicitly for reliable `instanceof` checks across module boundaries.

### Global Error Handler

`middleware/errorHandler.ts` handles three categories:

1. **Prisma errors** — maps known Prisma error codes to HTTP responses:
   - `P2002` (unique constraint) → 409 CONFLICT
   - `P2025` (record not found) → 404 NOT_FOUND
   - `P2003` (foreign key violation) → 400 INVALID_REFERENCE

2. **AppError instances** — uses `err.statusCode` and `err.errorCode` directly.

3. **Unexpected errors** — returns 500, logs full details. Stack trace is included in the response body only in `development` mode.

### Error Response Shape

All errors return consistent JSON:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "details": {},        // optional, e.g. Prisma meta
  "stack": "..."        // development only
}
```

Validation errors from Zod middleware return a slightly different shape:

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "body.email", "message": "Invalid email format", "code": "invalid_string" }
  ]
}
```

---

## Validation

### Middleware

`validation/middleware.ts` exports a `validate(schema)` factory. It runs `schema.parseAsync({ body, query, params })` and replaces the request data with the validated (and coerced) output. On `ZodError`, it returns 400 with the structured error array above.

### Schemas

**common.schema.ts** — shared primitives:
- `emailSchema` — validates format, lowercases, trims, max 254 chars
- `passwordSchema` — min 8 chars, requires uppercase + lowercase + number
- `uuidSchema` — validates UUID format for route params
- `pageSchema` — coerces to int, min 1, default 1
- `limitSchema` — coerces to int, range 1–100, default 15

**auth.schema.ts**:
- `registerSchema` — email + password (full strength rules)
- `loginSchema` — email + password (only `min(1)` on password, no strength check)

**job.schema.ts**:
- `createJobSchema` — all job fields, platform/status enums, ISO 8601 datetime
- `listJobsSchema` — pagination + optional status/platform/search filters
- `updateJobSchema` — UUID param + status enum
- `deleteJobSchema` — UUID param only

All schemas export inferred TypeScript types used directly in controllers, keeping types and validation in sync.

### Sanitization

`validation/sanitize.ts` provides three utilities used in schemas and services:
- `stripHtml(input)` — removes all HTML tags
- `escapeSpecialChars(input)` — escapes `& < > " ' /`
- `sanitizeText(input)` — strips HTML + trims whitespace

---

## Prisma Setup

`lib/prisma.ts` creates a singleton `PrismaClient` using the `@prisma/adapter-pg` driver adapter with a `pg.Pool` for connection pooling. The singleton pattern (`globalThis.prisma`) prevents multiple client instances during hot-reload in development.

```typescript
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
```

---

## Logging

`utils/logger.ts` is a lightweight structured logger that outputs JSON to stdout/stderr:

```json
{
  "timestamp": "2026-04-22T10:00:00.000Z",
  "level": "info",
  "message": "Backend running on port 4000"
}
```

- `logger.info()` → `console.log`
- `logger.warn()` → `console.warn`
- `logger.error()` → `console.error`

The error handler logs every error with `method`, `path`, and `userId` for traceability. Unhandled rejections and uncaught exceptions are also logged before the process exits.

---

## Testing

Tests live in `src/__tests__/` and run with **Vitest**.

```bash
npm test           # single run
npm run test:watch # watch mode
npm run test:ui    # browser UI
```

### Test Files

| File | Tests | What it covers |
|---|---|---|
| `auth.validation.test.ts` | 14 | Email/password validation, normalization |
| `job.validation.test.ts` | 29 | All job schema rules, enums, pagination |
| `sanitization.test.ts` | 25 | HTML stripping, char escaping, trimming |
| `error-classes.test.ts` | 32 | All error classes, status codes, instanceof |
| `auth-errors.test.ts` | 12 | Duplicate email, bad credentials, bad token |
| `job-errors.test.ts` | 7 | 404 on missing job, 403 on wrong user |
| `undefined-routes.test.ts` | 11 | 404 handler for all HTTP methods |
| `error-logging.test.ts` | 16 | Log levels, timestamps, JSON format |
| `error-response-format.test.ts` | 23 | Consistent error shape, Prisma mapping |
| `rate-limiter.test.ts` | — | Rate limit config |
| `job.integration.test.ts` | 8 | HTTP-level validation error responses |
| `new-endpoints.test.ts` | — | Additional endpoint coverage |

**Total: 177 tests, all passing.**

---

## Scripts

```bash
npm run dev          # tsx watch — hot reload for development
npm run build        # tsc — compile to dist/
npm run build:railway # prisma generate + tsc (for Railway deployment)
npm start            # node dist/index.js — run compiled output
npm test             # vitest --run
npm run test:watch   # vitest watch mode
npm run test:ui      # vitest UI
```

`postinstall` runs `prisma migrate deploy` automatically after `npm install`, which is useful for deployment pipelines.

---

## Deployment Notes

- The `build:railway` script is tailored for Railway: it runs `prisma generate` before `tsc` since Railway doesn't persist `node_modules/.prisma`.
- Set `NODE_ENV=production` to suppress stack traces in error responses.
- `ALLOWED_ORIGINS` should include your frontend domain and any other trusted origins.
- The `JWT_SECRET` fallback (`"devSecret"`) must be overridden in production.
- Database migrations: run `npx prisma migrate deploy` on each deploy (handled automatically via `postinstall`).
