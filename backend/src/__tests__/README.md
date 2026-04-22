# Backend Tests

This directory contains comprehensive tests for the backend validation and error handling systems.

## Test Coverage

### Auth Validation Tests (`auth.validation.test.ts`)
Tests for authentication endpoint validation covering:
- Email format validation (RFC 5322)
- Email length limits (254 characters)
- Email normalization (trim and lowercase)
- Password strength requirements (8+ chars, uppercase, lowercase, number)
- Missing field validation
- Error response format consistency

**Requirements Covered**: 1.2, 2.5, 8.1, 8.2, 8.3, 8.4, 8.5

### Job Validation Tests (`job.validation.test.ts`)
Tests for job endpoint validation covering:
- Required field validation (companyName, jobTitle, jobUrl, platform)
- URL format validation
- Platform enum validation (LINKEDIN, NAUKRI, INTERNSHALA)
- Status enum validation (APPLIED, INTERVIEW, OFFER, REJECTED)
- Field length limits (200 chars for text, 5000 for description)
- Date format validation (ISO 8601)
- Pagination validation (page >= 1, limit 1-100)
- UUID format validation for route parameters
- Whitespace trimming

**Requirements Covered**: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.5, 5.2, 9.1, 9.2

### Sanitization Tests (`sanitization.test.ts`)
Tests for input sanitization utilities covering:
- HTML tag stripping (simple, nested, self-closing, with attributes)
- Script tag handling
- Special character escaping (&, <, >, ", ', /)
- Whitespace trimming
- Comprehensive text sanitization
- Integration scenarios

**Requirements Covered**: 6.1, 6.2, 6.4

### Error Classes Tests (`error-classes.test.ts`)
Tests for custom error classes covering:
- AppError base class functionality
- ValidationError (400)
- UnauthorizedError (401)
- ForbiddenError (403)
- NotFoundError (404)
- ConflictError (409)
- ServiceUnavailableError (503)
- Status code verification
- Error message handling
- instanceof checks
- Stack trace capture

**Requirements Covered**: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7

### Auth Error Tests (`auth-errors.test.ts`)
Tests for authentication error scenarios covering:
- Registration with duplicate email (409)
- Login with invalid credentials (401)
- Missing authentication token (401)
- Invalid/expired token (401)
- Error response format consistency
- Proper error type throwing

**Requirements Covered**: 7.1, 7.2, 7.3, 7.5

### Job Error Tests (`job-errors.test.ts`)
Tests for job operation error scenarios covering:
- Updating non-existent job (404)
- Updating another user's job (403)
- Error response format consistency
- Proper error type throwing

**Requirements Covered**: 9.3, 9.4

### Undefined Routes Tests (`undefined-routes.test.ts`)
Tests for 404 handler covering:
- GET requests to undefined routes
- POST requests to undefined routes
- Other HTTP methods (PUT, DELETE, PATCH)
- Error message includes route information
- Proper 404 status code

**Requirements Covered**: 4.4

### Error Logging Tests (`error-logging.test.ts`)
Tests for error logging utility covering:
- Different log levels (info, warn, error)
- Timestamp inclusion (ISO 8601 format)
- Context information logging
- Request context (method, path, userId)
- Stack trace logging
- JSON format output
- Appropriate log level usage

**Requirements Covered**: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6

### Error Response Format Tests (`error-response-format.test.ts`)
Tests for error handler middleware covering:
- Consistent JSON structure
- Stack traces in development mode only
- HTTP status code mapping
- Prisma error handling
- Error code generation
- Response format consistency across error types

**Requirements Covered**: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7

### Job Integration Tests (`job.integration.test.ts`)
Tests for job endpoint integration covering:
- HTTP 400 validation errors
- Error response format verification

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Test Results

All 177 tests pass successfully:
- 14 auth validation tests
- 29 job validation tests
- 25 sanitization tests
- 32 error class tests
- 12 auth error tests
- 7 job error tests
- 11 undefined route tests
- 16 error logging tests
- 23 error response format tests
- 8 job integration tests

## Test Framework

- **Vitest**: Fast unit test framework with TypeScript support
- **Zod**: Schema validation library being tested
- **Supertest**: HTTP assertion library (installed for future integration tests)
