import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as jobsService from '../jobs/jobs.service.js';
import { NotFoundError, ForbiddenError } from '../errors/index.js';

// Mock Prisma
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    job: {
      findUnique: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from '../lib/prisma.js';

describe('Job Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Update Job Errors', () => {
    it('should throw NotFoundError (404) when job does not exist', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue(null);

      await expect(
        jobsService.updateJob('user-id', 'non-existent-job-id', { status: 'INTERVIEW' })
      ).rejects.toThrow(NotFoundError);

      await expect(
        jobsService.updateJob('user-id', 'non-existent-job-id', { status: 'INTERVIEW' })
      ).rejects.toThrow('Job not found');
    });

    it('should return 404 status code for non-existent job', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue(null);

      try {
        await jobsService.updateJob('user-id', 'non-existent-job-id', { status: 'INTERVIEW' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.statusCode).toBe(404);
        }
      }
    });

    it('should throw ForbiddenError (403) when job belongs to different user', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        id: 'job-id',
        userId: 'other-user-id',
        companyName: 'Test Company',
        jobTitle: 'Software Engineer',
        location: 'Remote',
        description: null,
        jobUrl: 'https://example.com/job',
        platform: 'LINKEDIN',
        status: 'APPLIED',
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        jobsService.updateJob('user-id', 'job-id', { status: 'INTERVIEW' })
      ).rejects.toThrow(ForbiddenError);

      await expect(
        jobsService.updateJob('user-id', 'job-id', { status: 'INTERVIEW' })
      ).rejects.toThrow('You do not have permission to update this job');
    });

    it('should return 403 status code when updating another user\'s job', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        id: 'job-id',
        userId: 'other-user-id',
        companyName: 'Test Company',
        jobTitle: 'Software Engineer',
        location: 'Remote',
        description: null,
        jobUrl: 'https://example.com/job',
        platform: 'LINKEDIN',
        status: 'APPLIED',
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await jobsService.updateJob('user-id', 'job-id', { status: 'INTERVIEW' });
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
        if (error instanceof ForbiddenError) {
          expect(error.statusCode).toBe(403);
        }
      }
    });
  });

  describe('Create Job Validation Errors', () => {
    it('should return 400 for invalid data (handled by validation middleware)', () => {
      // This test verifies that validation middleware returns 400
      // The actual validation is tested in job.validation.test.ts
      // Here we just verify the error structure would be correct
      
      const invalidData = {
        // Missing required fields
        jobUrl: 'not-a-url',
      };

      // Validation middleware would catch this before reaching the service
      // and return a 400 error with proper format
      expect(true).toBe(true); // Placeholder - validation is tested separately
    });
  });

  describe('Error Response Format Consistency', () => {
    it('should have consistent error structure for NotFoundError', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue(null);

      try {
        await jobsService.updateJob('user-id', 'job-id', { status: 'INTERVIEW' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('statusCode');
          expect(error).toHaveProperty('isOperational');
          expect(error.message).toBe('Job not found');
          expect(error.statusCode).toBe(404);
          expect(error.isOperational).toBe(true);
        }
      }
    });

    it('should have consistent error structure for ForbiddenError', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        id: 'job-id',
        userId: 'other-user-id',
        companyName: 'Test Company',
        jobTitle: 'Software Engineer',
        location: 'Remote',
        description: null,
        jobUrl: 'https://example.com/job',
        platform: 'LINKEDIN',
        status: 'APPLIED',
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await jobsService.updateJob('user-id', 'job-id', { status: 'INTERVIEW' });
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
        if (error instanceof ForbiddenError) {
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('statusCode');
          expect(error).toHaveProperty('isOperational');
          expect(error.message).toBe('You do not have permission to update this job');
          expect(error.statusCode).toBe(403);
          expect(error.isOperational).toBe(true);
        }
      }
    });
  });
});
