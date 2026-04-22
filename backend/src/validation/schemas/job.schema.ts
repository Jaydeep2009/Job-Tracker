import { z } from 'zod';
import { uuidSchema, pageSchema, limitSchema } from './common.schema.js';

/**
 * Job platform enum validation
 * Validates that platform is one of the allowed values
 */
export const jobPlatformSchema = z.enum(['LINKEDIN', 'NAUKRI', 'INTERNSHALA'], {
  message: 'Platform must be one of: LINKEDIN, NAUKRI, INTERNSHALA',
});

/**
 * Job status enum validation
 * Validates that status is one of the allowed values
 */
export const jobStatusSchema = z.enum(['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'], {
  message: 'Status must be one of: APPLIED, INTERVIEW, OFFER, REJECTED',
});

/**
 * Create job schema
 * Validates all required fields for job creation
 */
export const createJobSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(1, 'Company name is required').max(200, 'Company name must not exceed 200 characters'),
    jobTitle: z.string().trim().min(1, 'Job title is required').max(200, 'Job title must not exceed 200 characters'),
    location: z.string().trim().max(200, 'Location must not exceed 200 characters').optional(),
    description: z.string().trim().max(5000, 'Description must not exceed 5000 characters').optional(),
    jobUrl: z.string().url('Invalid URL format'),
    platform: jobPlatformSchema,
    appliedAt: z.string().datetime('Invalid date format'),
  }),
});

/**
 * List jobs schema
 * Validates pagination, filtering, and search parameters
 */
export const listJobsSchema = z.object({
  query: z.object({
    page: pageSchema,
    limit: limitSchema,
    status: jobStatusSchema.optional(),
    platform: jobPlatformSchema.optional(),
    search: z.string().trim().max(200, 'Search query must not exceed 200 characters').optional(),
  }),
});

/**
 * Update job schema
 * Validates job ID parameter and status update
 */
export const updateJobSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    status: jobStatusSchema,
  }),
});

/**
 * Delete job schema
 * Validates job ID parameter for deletion
 */
export const deleteJobSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// Export TypeScript types for controller use
export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type ListJobsQuery = z.infer<typeof listJobsSchema>['query'];
export type UpdateJobParams = z.infer<typeof updateJobSchema>['params'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>['body'];
export type DeleteJobParams = z.infer<typeof deleteJobSchema>['params'];
