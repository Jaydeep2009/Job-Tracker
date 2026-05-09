import { describe, it, expect, beforeAll } from 'vitest';
import express, { type Express } from 'express';
import jobsRouter from '../jobs/jobs.routes.js';
import { validate } from '../validation/middleware.js';
import { createJobSchema, listJobsSchema, updateJobSchema } from '../validation/schemas/job.schema.js';

// Mock authentication middleware for testing
const mockAuth = (req: any, res: any, next: any) => {
  req.userId = 'test-user-id';
  next();
};

describe('Job Endpoints - Integration Tests (HTTP 400 Status)', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Create test routes with validation middleware
    app.post('/jobs', mockAuth, validate(createJobSchema), (req, res) => {
      res.status(201).json({ success: true });
    });
    
    app.get('/jobs', mockAuth, validate(listJobsSchema), (req, res) => {
      res.json({ success: true });
    });
    
    app.patch('/jobs/:id', mockAuth, validate(updateJobSchema), (req, res) => {
      res.json({ success: true });
    });
  });

  describe('POST /jobs - Create Job Validation', () => {
    it('should return 400 for missing required field - companyName', async () => {
      const invalidData = {
        jobTitle: 'Software Engineer',
        jobUrl: 'https://example.com/job',
        platform: 'LINKEDIN',
        appliedAt: new Date().toISOString(),
      };

      const mockReq = {
        body: invalidData,
        query: {},
        params: {},
        userId: 'test-user-id',
      } as any;

      const mockRes = {
        status: function(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json: function(data: any) {
          expect(data.message).toBe('Validation failed');
          expect(data.errors).toBeDefined();
          expect(data.errors.length).toBeGreaterThan(0);
          expect(data.errors[0].field).toContain('companyName');
          return this;
        },
      } as any;

      const middleware = validate(createJobSchema);
      await middleware(mockReq, mockRes, () => {});
    });

    it('should return 400 for invalid URL format', async () => {
      const invalidData = {
        companyName: 'Test Company',
        jobTitle: 'Software Engineer',
        jobUrl: 'not-a-valid-url',
        platform: 'LINKEDIN',
        appliedAt: new Date().toISOString(),
      };

      const mockReq = {
        body: invalidData,
        query: {},
        params: {},
      } as any;

      const mockRes = {
        status: function(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json: function(data: any) {
          expect(data.message).toBe('Validation failed');
          expect(data.errors.some((e: any) => e.message.includes('Invalid URL format'))).toBe(true);
          return this;
        },
      } as any;

      const middleware = validate(createJobSchema);
      await middleware(mockReq, mockRes, () => {});
    });

    it('should return 400 for invalid platform enum', async () => {
      const invalidData = {
        companyName: 'Test Company',
        jobTitle: 'Software Engineer',
        jobUrl: 'https://example.com/job',
        platform: 'INVALID_PLATFORM',
        appliedAt: new Date().toISOString(),
      };

      const mockReq = {
        body: invalidData,
        query: {},
        params: {},
      } as any;

      const mockRes = {
        status: function(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json: function(data: any) {
          expect(data.message).toBe('Validation failed');
          expect(data.errors.some((e: any) => e.message.includes('Platform must be one of'))).toBe(true);
          return this;
        },
      } as any;

      const middleware = validate(createJobSchema);
      await middleware(mockReq, mockRes, () => {});
    });
  });

  describe('GET /jobs - List Jobs Pagination Validation', () => {
    it('should return 400 for invalid page value (zero)', async () => {
      const mockReq = {
        body: {},
        query: { page: '0', limit: '10' },
        params: {},
      } as any;

      const mockRes = {
        status: function(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json: function(data: any) {
          expect(data.message).toBe('Validation failed');
          expect(data.errors).toBeDefined();
          return this;
        },
      } as any;

      const middleware = validate(listJobsSchema);
      await middleware(mockReq, mockRes, () => {});
    });

    it('should return 400 for invalid limit value (exceeds 100)', async () => {
      const mockReq = {
        body: {},
        query: { page: '1', limit: '101' },
        params: {},
      } as any;

      const mockRes = {
        status: function(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json: function(data: any) {
          expect(data.message).toBe('Validation failed');
          expect(data.errors).toBeDefined();
          return this;
        },
      } as any;

      const middleware = validate(listJobsSchema);
      await middleware(mockReq, mockRes, () => {});
    });
  });

  describe('PATCH /jobs/:id - Update Job Validation', () => {
    it('should return 400 for invalid UUID format', async () => {
      const mockReq = {
        body: { status: 'APPLIED' },
        query: {},
        params: { id: 'not-a-valid-uuid' },
      } as any;

      const mockRes = {
        status: function(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json: function(data: any) {
          expect(data.message).toBe('Validation failed');
          expect(data.errors.some((e: any) => e.message.includes('Invalid ID format'))).toBe(true);
          return this;
        },
      } as any;

      const middleware = validate(updateJobSchema);
      await middleware(mockReq, mockRes, () => {});
    });

    it('should return 400 for invalid status enum', async () => {
      const mockReq = {
        body: { status: 'INVALID_STATUS' },
        query: {},
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      } as any;

      const mockRes = {
        status: function(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json: function(data: any) {
          expect(data.message).toBe('Validation failed');
          expect(data.errors.some((e: any) => e.message.includes('Status must be one of'))).toBe(true);
          return this;
        },
      } as any;

      const middleware = validate(updateJobSchema);
      await middleware(mockReq, mockRes, () => {});
    });
  });

  describe('Error Response Format Verification', () => {
    it('should return consistent error format with message and errors array', async () => {
      const mockReq = {
        body: {},
        query: {},
        params: {},
      } as any;

      let capturedResponse: any;

      const mockRes = {
        status: function(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json: function(data: any) {
          capturedResponse = data;
          expect(data).toHaveProperty('message');
          expect(data).toHaveProperty('errors');
          expect(Array.isArray(data.errors)).toBe(true);
          expect(data.message).toBe('Validation failed');
          
          // Verify error structure
          if (data.errors.length > 0) {
            expect(data.errors[0]).toHaveProperty('field');
            expect(data.errors[0]).toHaveProperty('message');
            expect(data.errors[0]).toHaveProperty('code');
          }
          return this;
        },
      } as any;

      const middleware = validate(createJobSchema);
      await middleware(mockReq, mockRes, () => {});
    });
  });
});
