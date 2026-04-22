import { describe, it, expect } from 'vitest';
import { validate } from '../validation/middleware.js';
import {
    listJobsSchema,
    deleteJobSchema,
    jobStatusSchema,
    jobPlatformSchema,
} from '../validation/schemas/job.schema.js';

// ============================================================
// DELETE /jobs/:id — Validation Tests
// ============================================================

describe('DELETE /jobs/:id - Delete Job Validation', () => {
    it('should accept a valid UUID', async () => {
        const mockReq = {
            body: {},
            query: {},
            params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        } as any;

        let nextCalled = false;
        const mockRes = {
            status: () => mockRes,
            json: () => mockRes,
        } as any;

        const middleware = validate(deleteJobSchema);
        await middleware(mockReq, mockRes, () => { nextCalled = true; });
        expect(nextCalled).toBe(true);
    });

    it('should return 400 for invalid UUID format', async () => {
        const mockReq = {
            body: {},
            query: {},
            params: { id: 'not-a-valid-uuid' },
        } as any;

        const mockRes = {
            status: function (code: number) {
                expect(code).toBe(400);
                return this;
            },
            json: function (data: any) {
                expect(data.message).toBe('Validation failed');
                expect(data.errors.some((e: any) => e.message.includes('Invalid ID format'))).toBe(true);
                return this;
            },
        } as any;

        const middleware = validate(deleteJobSchema);
        await middleware(mockReq, mockRes, () => { });
    });

    it('should return 400 for missing id param', async () => {
        const mockReq = {
            body: {},
            query: {},
            params: {},
        } as any;

        const mockRes = {
            status: function (code: number) {
                expect(code).toBe(400);
                return this;
            },
            json: function (data: any) {
                expect(data.message).toBe('Validation failed');
                return this;
            },
        } as any;

        const middleware = validate(deleteJobSchema);
        await middleware(mockReq, mockRes, () => { });
    });
});

// ============================================================
// GET /jobs — Filtering & Search Validation Tests
// ============================================================

describe('GET /jobs - Filtering & Search Validation', () => {
    it('should accept valid status filter', async () => {
        const mockReq = {
            body: {},
            query: { page: '1', limit: '10', status: 'APPLIED' },
            params: {},
        } as any;

        let nextCalled = false;
        const mockRes = {
            status: () => mockRes,
            json: () => mockRes,
        } as any;

        const middleware = validate(listJobsSchema);
        await middleware(mockReq, mockRes, () => { nextCalled = true; });
        expect(nextCalled).toBe(true);
    });

    it('should accept valid platform filter', async () => {
        const mockReq = {
            body: {},
            query: { page: '1', limit: '10', platform: 'LINKEDIN' },
            params: {},
        } as any;

        let nextCalled = false;
        const mockRes = {
            status: () => mockRes,
            json: () => mockRes,
        } as any;

        const middleware = validate(listJobsSchema);
        await middleware(mockReq, mockRes, () => { nextCalled = true; });
        expect(nextCalled).toBe(true);
    });

    it('should accept valid search string', async () => {
        const mockReq = {
            body: {},
            query: { page: '1', limit: '10', search: 'google' },
            params: {},
        } as any;

        let nextCalled = false;
        const mockRes = {
            status: () => mockRes,
            json: () => mockRes,
        } as any;

        const middleware = validate(listJobsSchema);
        await middleware(mockReq, mockRes, () => { nextCalled = true; });
        expect(nextCalled).toBe(true);
    });

    it('should accept combined status + platform + search filters', async () => {
        const mockReq = {
            body: {},
            query: { page: '1', limit: '10', status: 'INTERVIEW', platform: 'NAUKRI', search: 'engineer' },
            params: {},
        } as any;

        let nextCalled = false;
        const mockRes = {
            status: () => mockRes,
            json: () => mockRes,
        } as any;

        const middleware = validate(listJobsSchema);
        await middleware(mockReq, mockRes, () => { nextCalled = true; });
        expect(nextCalled).toBe(true);
    });

    it('should accept request with no filters (backward compatible)', async () => {
        const mockReq = {
            body: {},
            query: {},
            params: {},
        } as any;

        let nextCalled = false;
        const mockRes = {
            status: () => mockRes,
            json: () => mockRes,
        } as any;

        const middleware = validate(listJobsSchema);
        await middleware(mockReq, mockRes, () => { nextCalled = true; });
        expect(nextCalled).toBe(true);
    });

    it('should return 400 for invalid status enum', async () => {
        const mockReq = {
            body: {},
            query: { page: '1', limit: '10', status: 'INVALID_STATUS' },
            params: {},
        } as any;

        const mockRes = {
            status: function (code: number) {
                expect(code).toBe(400);
                return this;
            },
            json: function (data: any) {
                expect(data.message).toBe('Validation failed');
                expect(data.errors.some((e: any) => e.message.includes('Status must be one of'))).toBe(true);
                return this;
            },
        } as any;

        const middleware = validate(listJobsSchema);
        await middleware(mockReq, mockRes, () => { });
    });

    it('should return 400 for invalid platform enum', async () => {
        const mockReq = {
            body: {},
            query: { page: '1', limit: '10', platform: 'INDEED' },
            params: {},
        } as any;

        const mockRes = {
            status: function (code: number) {
                expect(code).toBe(400);
                return this;
            },
            json: function (data: any) {
                expect(data.message).toBe('Validation failed');
                expect(data.errors.some((e: any) => e.message.includes('Platform must be one of'))).toBe(true);
                return this;
            },
        } as any;

        const middleware = validate(listJobsSchema);
        await middleware(mockReq, mockRes, () => { });
    });

    it('should return 400 for search string exceeding 200 characters', async () => {
        const mockReq = {
            body: {},
            query: { page: '1', limit: '10', search: 'a'.repeat(201) },
            params: {},
        } as any;

        const mockRes = {
            status: function (code: number) {
                expect(code).toBe(400);
                return this;
            },
            json: function (data: any) {
                expect(data.message).toBe('Validation failed');
                expect(data.errors.some((e: any) => e.message.includes('200 characters'))).toBe(true);
                return this;
            },
        } as any;

        const middleware = validate(listJobsSchema);
        await middleware(mockReq, mockRes, () => { });
    });

    it('should accept all valid status values as filters', () => {
        const statuses = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];
        statuses.forEach((status) => {
            const result = listJobsSchema.safeParse({
                query: { page: '1', limit: '10', status },
            });
            expect(result.success).toBe(true);
        });
    });

    it('should accept all valid platform values as filters', () => {
        const platforms = ['LINKEDIN', 'NAUKRI', 'INTERNSHALA'];
        platforms.forEach((platform) => {
            const result = listJobsSchema.safeParse({
                query: { page: '1', limit: '10', platform },
            });
            expect(result.success).toBe(true);
        });
    });

    it('should trim whitespace from search string', () => {
        const result = listJobsSchema.safeParse({
            query: { page: '1', limit: '10', search: '  google  ' },
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.query.search).toBe('google');
        }
    });
});

// ============================================================
// Schema-Level Tests for New Schemas
// ============================================================

describe('Delete Job Schema - Direct Validation', () => {
    it('should accept valid UUID', () => {
        const result = deleteJobSchema.safeParse({
            params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        });
        expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
        const invalidIds = [
            'not-a-uuid',
            '12345',
            'abc-def-ghi',
            '123e4567-e89b-12d3-a456', // incomplete
            '',
        ];

        invalidIds.forEach((id) => {
            const result = deleteJobSchema.safeParse({ params: { id } });
            expect(result.success).toBe(false);
        });
    });

    it('should reject missing id', () => {
        const result = deleteJobSchema.safeParse({ params: {} });
        expect(result.success).toBe(false);
    });
});

describe('List Jobs Schema - Filter Combinations', () => {
    it('should parse combined filters correctly', () => {
        const result = listJobsSchema.safeParse({
            query: {
                page: '2',
                limit: '25',
                status: 'OFFER',
                platform: 'LINKEDIN',
                search: 'senior engineer',
            },
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.query.page).toBe(2);
            expect(result.data.query.limit).toBe(25);
            expect(result.data.query.status).toBe('OFFER');
            expect(result.data.query.platform).toBe('LINKEDIN');
            expect(result.data.query.search).toBe('senior engineer');
        }
    });

    it('should leave optional filters undefined when not provided', () => {
        const result = listJobsSchema.safeParse({
            query: { page: '1', limit: '10' },
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.query.status).toBeUndefined();
            expect(result.data.query.platform).toBeUndefined();
            expect(result.data.query.search).toBeUndefined();
        }
    });

    it('should accept only status filter without platform or search', () => {
        const result = listJobsSchema.safeParse({
            query: { status: 'REJECTED' },
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.query.status).toBe('REJECTED');
            expect(result.data.query.page).toBe(1); // default
            expect(result.data.query.limit).toBe(15); // default
        }
    });

    it('should accept only search without status or platform', () => {
        const result = listJobsSchema.safeParse({
            query: { search: 'frontend' },
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.query.search).toBe('frontend');
        }
    });
});
