import { describe, it, expect } from 'vitest';
import {
  createJobSchema,
  listJobsSchema,
  updateJobSchema,
  jobPlatformSchema,
  jobStatusSchema,
} from '../validation/schemas/job.schema.js';

describe('Job Validation - Create Job', () => {
  const validJobData = {
    companyName: 'Test Company',
    jobTitle: 'Software Engineer',
    location: 'Remote',
    description: 'A great job opportunity',
    jobUrl: 'https://example.com/job/123',
    platform: 'LINKEDIN' as const,
    appliedAt: new Date().toISOString(),
  };

  it('should reject missing required field - companyName', () => {
    const { companyName, ...data } = validJobData;
    const result = createJobSchema.safeParse({ body: data });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('companyName');
    }
  });

  it('should reject missing required field - jobTitle', () => {
    const { jobTitle, ...data } = validJobData;
    const result = createJobSchema.safeParse({ body: data });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('jobTitle');
    }
  });

  it('should reject missing required field - jobUrl', () => {
    const { jobUrl, ...data } = validJobData;
    const result = createJobSchema.safeParse({ body: data });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('jobUrl');
    }
  });

  it('should reject missing required field - platform', () => {
    const { platform, ...data } = validJobData;
    const result = createJobSchema.safeParse({ body: data });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('platform');
    }
  });

  it('should reject invalid URL format', () => {
    const invalidUrls = [
      'not-a-url',
      'just-text',
    ];

    invalidUrls.forEach((jobUrl) => {
      const result = createJobSchema.safeParse({
        body: { ...validJobData, jobUrl },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toContain('Invalid URL format');
      }
    });
  });

  it('should reject invalid platform enum', () => {
    const result = createJobSchema.safeParse({
      body: { ...validJobData, platform: 'INVALID_PLATFORM' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('Platform must be one of');
    }
  });

  it('should accept valid platforms', () => {
    const platforms = ['LINKEDIN', 'NAUKRI', 'INTERNSHALA'];
    platforms.forEach((platform) => {
      const result = createJobSchema.safeParse({
        body: { ...validJobData, platform },
      });
      expect(result.success).toBe(true);
    });
  });

  it('should reject companyName exceeding 200 characters', () => {
    const result = createJobSchema.safeParse({
      body: { ...validJobData, companyName: 'a'.repeat(201) },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('200 characters');
    }
  });

  it('should reject jobTitle exceeding 200 characters', () => {
    const result = createJobSchema.safeParse({
      body: { ...validJobData, jobTitle: 'a'.repeat(201) },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('200 characters');
    }
  });

  it('should reject location exceeding 200 characters', () => {
    const result = createJobSchema.safeParse({
      body: { ...validJobData, location: 'a'.repeat(201) },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('200 characters');
    }
  });

  it('should reject description exceeding 5000 characters', () => {
    const result = createJobSchema.safeParse({
      body: { ...validJobData, description: 'a'.repeat(5001) },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('5000 characters');
    }
  });

  it('should reject invalid date format', () => {
    const result = createJobSchema.safeParse({
      body: { ...validJobData, appliedAt: 'not-a-date' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('Invalid date format');
    }
  });

  it('should accept valid job data', () => {
    const result = createJobSchema.safeParse({ body: validJobData });
    expect(result.success).toBe(true);
  });

  it('should accept job data without optional fields', () => {
    const { location, description, ...requiredData } = validJobData;
    const result = createJobSchema.safeParse({ body: requiredData });
    expect(result.success).toBe(true);
  });

  it('should trim whitespace from text fields', () => {
    const result = createJobSchema.safeParse({
      body: {
        ...validJobData,
        companyName: '  Test Company  ',
        jobTitle: '  Software Engineer  ',
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.companyName).toBe('Test Company');
      expect(result.data.body.jobTitle).toBe('Software Engineer');
    }
  });
});

describe('Job Validation - List Jobs (Pagination)', () => {
  it('should reject invalid page - zero', () => {
    const result = listJobsSchema.safeParse({
      query: { page: '0', limit: '10' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid page - negative', () => {
    const result = listJobsSchema.safeParse({
      query: { page: '-1', limit: '10' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid limit - zero', () => {
    const result = listJobsSchema.safeParse({
      query: { page: '1', limit: '0' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid limit - exceeds 100', () => {
    const result = listJobsSchema.safeParse({
      query: { page: '1', limit: '101' },
    });
    expect(result.success).toBe(false);
  });

  it('should default page to 1 when not provided', () => {
    const result = listJobsSchema.safeParse({
      query: { limit: '10' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.page).toBe(1);
    }
  });

  it('should default limit to 15 when not provided', () => {
    const result = listJobsSchema.safeParse({
      query: { page: '1' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(15);
    }
  });

  it('should coerce string to number for page and limit', () => {
    const result = listJobsSchema.safeParse({
      query: { page: '5', limit: '25' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.page).toBe(5);
      expect(result.data.query.limit).toBe(25);
    }
  });

  it('should accept valid pagination parameters', () => {
    const result = listJobsSchema.safeParse({
      query: { page: '1', limit: '50' },
    });
    expect(result.success).toBe(true);
  });
});

describe('Job Validation - Update Job', () => {
  it('should reject invalid UUID format', () => {
    const invalidUuids = [
      'not-a-uuid',
      '12345',
      'abc-def-ghi',
      '123e4567-e89b-12d3-a456',
    ];

    invalidUuids.forEach((id) => {
      const result = updateJobSchema.safeParse({
        params: { id },
        body: { status: 'APPLIED' },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toContain('Invalid ID format');
      }
    });
  });

  it('should reject invalid status enum', () => {
    const result = updateJobSchema.safeParse({
      params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      body: { status: 'INVALID_STATUS' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('Status must be one of');
    }
  });

  it('should accept valid status values', () => {
    const statuses = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];
    statuses.forEach((status) => {
      const result = updateJobSchema.safeParse({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { status },
      });
      expect(result.success).toBe(true);
    });
  });

  it('should accept valid UUID and status', () => {
    const result = updateJobSchema.safeParse({
      params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      body: { status: 'INTERVIEW' },
    });
    expect(result.success).toBe(true);
  });
});

describe('Job Validation - Enum Schemas', () => {
  it('should validate platform enum independently', () => {
    expect(jobPlatformSchema.safeParse('LINKEDIN').success).toBe(true);
    expect(jobPlatformSchema.safeParse('NAUKRI').success).toBe(true);
    expect(jobPlatformSchema.safeParse('INTERNSHALA').success).toBe(true);
    expect(jobPlatformSchema.safeParse('INVALID').success).toBe(false);
  });

  it('should validate status enum independently', () => {
    expect(jobStatusSchema.safeParse('APPLIED').success).toBe(true);
    expect(jobStatusSchema.safeParse('INTERVIEW').success).toBe(true);
    expect(jobStatusSchema.safeParse('OFFER').success).toBe(true);
    expect(jobStatusSchema.safeParse('REJECTED').success).toBe(true);
    expect(jobStatusSchema.safeParse('INVALID').success).toBe(false);
  });
});
