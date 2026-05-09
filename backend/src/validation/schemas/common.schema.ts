import { z } from 'zod';

/**
 * Reusable email schema with RFC 5322 validation
 * - Validates email format
 * - Converts to lowercase
 * - Trims whitespace
 * - Max length 254 characters
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email must not exceed 254 characters')
  .toLowerCase()
  .trim();

/**
 * Reusable password schema with strength requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * UUID validation for route parameters
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Pagination schema for page parameter
 * - Coerces string to number
 * - Must be positive integer >= 1
 * - Defaults to 1 if not provided
 */
export const pageSchema = z.coerce.number().int().min(1).default(1);

/**
 * Pagination schema for limit parameter
 * - Coerces string to number
 * - Must be between 1 and 100
 * - Defaults to 15 if not provided
 */
export const limitSchema = z.coerce.number().int().min(1).max(100).default(15);
