import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../validation/schemas/auth.schema.js';

describe('Auth Validation - Registration', () => {
  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'notanemail',
      'missing@domain',
      '@nodomain.com',
      'spaces in@email.com',
      'double@@domain.com',
    ];

    invalidEmails.forEach((email) => {
      const result = registerSchema.safeParse({
        body: { email, password: 'ValidPass123' },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toContain('Invalid email format');
      }
    });
  });

  it('should reject emails longer than 254 characters', () => {
    const longEmail = 'a'.repeat(250) + '@test.com';
    const result = registerSchema.safeParse({
      body: { email: longEmail, password: 'ValidPass123' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('Email must not exceed 254 characters');
    }
  });

  it('should trim and lowercase email addresses', () => {
    // Test that valid emails are trimmed and lowercased
    const result = registerSchema.safeParse({
      body: { email: 'USER@EXAMPLE.COM', password: 'ValidPass123' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.email).toBe('user@example.com');
    }
  });

  it('should reject weak passwords - too short', () => {
    const result = registerSchema.safeParse({
      body: { email: 'user@example.com', password: 'Short1' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('Password must be at least 8 characters');
    }
  });

  it('should reject weak passwords - no uppercase', () => {
    const result = registerSchema.safeParse({
      body: { email: 'user@example.com', password: 'password123' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('uppercase letter');
    }
  });

  it('should reject weak passwords - no lowercase', () => {
    const result = registerSchema.safeParse({
      body: { email: 'user@example.com', password: 'PASSWORD123' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('lowercase letter');
    }
  });

  it('should reject weak passwords - no number', () => {
    const result = registerSchema.safeParse({
      body: { email: 'user@example.com', password: 'PasswordOnly' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('number');
    }
  });

  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      body: { email: 'user@example.com', password: 'ValidPass123' },
    });
    expect(result.success).toBe(true);
  });
});

describe('Auth Validation - Login', () => {
  it('should reject missing email', () => {
    const result = loginSchema.safeParse({
      body: { password: 'password' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('email'))).toBe(true);
    }
  });

  it('should reject missing password', () => {
    const result = loginSchema.safeParse({
      body: { email: 'user@example.com' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Check that password field is in the error
      expect(result.error.issues.some(issue => issue.path.includes('password'))).toBe(true);
    }
  });

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      body: { email: 'user@example.com', password: '' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('Password is required');
    }
  });

  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      body: { email: 'user@example.com', password: 'anypassword' },
    });
    expect(result.success).toBe(true);
  });
});

describe('Auth Validation - Error Response Format', () => {
  it('should return all validation errors at once', () => {
    const result = registerSchema.safeParse({
      body: { email: 'invalid', password: 'weak' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have multiple errors (email format + password requirements)
      expect(result.error.issues.length).toBeGreaterThan(1);
    }
  });

  it('should include field name in error path', () => {
    const result = registerSchema.safeParse({
      body: { email: 'invalid', password: 'ValidPass123' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('email');
    }
  });
});
