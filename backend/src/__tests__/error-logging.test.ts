import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../utils/logger.js';

describe('Error Logging', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Log Levels', () => {
    it('should log info messages with info level', () => {
      logger.info('Test info message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('info');
      expect(loggedData.message).toBe('Test info message');
    });

    it('should log warn messages with warn level', () => {
      logger.warn('Test warning message');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('warn');
      expect(loggedData.message).toBe('Test warning message');
    });

    it('should log error messages with error level', () => {
      logger.error('Test error message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('error');
      expect(loggedData.message).toBe('Test error message');
    });
  });

  describe('Timestamp', () => {
    it('should include timestamp in log messages', () => {
      logger.info('Test message');

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData).toHaveProperty('timestamp');
      expect(loggedData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should use ISO 8601 format for timestamp', () => {
      logger.error('Test error');

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      const timestamp = new Date(loggedData.timestamp);
      expect(timestamp.toISOString()).toBe(loggedData.timestamp);
    });
  });

  describe('Context Information', () => {
    it('should include context in log messages', () => {
      logger.info('Test message', { userId: 'user-123', action: 'login' });

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.userId).toBe('user-123');
      expect(loggedData.action).toBe('login');
    });

    it('should include error stack trace in context', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', { stack: error.stack });

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.stack).toBeDefined();
      expect(loggedData.stack).toContain('Error: Test error');
    });

    it('should include request context (method, path, userId)', () => {
      logger.error('Request failed', {
        method: 'POST',
        path: '/api/jobs',
        userId: 'user-456',
      });

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.method).toBe('POST');
      expect(loggedData.path).toBe('/api/jobs');
      expect(loggedData.userId).toBe('user-456');
    });

    it('should handle multiple context properties', () => {
      logger.warn('Multiple context test', {
        prop1: 'value1',
        prop2: 'value2',
        prop3: 123,
        prop4: true,
      });

      const loggedData = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(loggedData.prop1).toBe('value1');
      expect(loggedData.prop2).toBe('value2');
      expect(loggedData.prop3).toBe(123);
      expect(loggedData.prop4).toBe(true);
    });
  });

  describe('JSON Format', () => {
    it('should format logs as valid JSON', () => {
      logger.info('Test message');

      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();
    });

    it('should include all required fields in JSON structure', () => {
      logger.error('Test error', { userId: 'user-123' });

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData).toHaveProperty('timestamp');
      expect(loggedData).toHaveProperty('level');
      expect(loggedData).toHaveProperty('message');
      expect(loggedData).toHaveProperty('userId');
    });
  });

  describe('Different Log Levels Usage', () => {
    it('should use error level for 500 errors', () => {
      logger.error('Internal server error', {
        statusCode: 500,
        error: 'Database connection failed',
      });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('error');
      expect(loggedData.statusCode).toBe(500);
    });

    it('should use warn level for 400 errors', () => {
      logger.warn('Validation error', {
        statusCode: 400,
        error: 'Invalid input',
      });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('warn');
      expect(loggedData.statusCode).toBe(400);
    });

    it('should use info level for successful operations', () => {
      logger.info('Server started', { port: 4000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('info');
    });
  });

  describe('Error Details', () => {
    it('should log error name and message', () => {
      const error = new Error('Test error message');
      logger.error('Error occurred', {
        error: error.message,
        name: error.name,
      });

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.error).toBe('Test error message');
      expect(loggedData.name).toBe('Error');
    });

    it('should log custom error properties', () => {
      logger.error('Custom error', {
        error: 'Validation failed',
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
      });

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.error).toBe('Validation failed');
      expect(loggedData.statusCode).toBe(400);
      expect(loggedData.errorCode).toBe('VALIDATION_ERROR');
    });
  });
});
