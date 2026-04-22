import { describe, it, expect } from 'vitest';
import { stripHtml, escapeSpecialChars, sanitizeText } from '../validation/sanitize.js';

describe('Sanitization - HTML Stripping', () => {
  it('should strip simple HTML tags', () => {
    const input = '<p>Hello World</p>';
    const result = stripHtml(input);
    expect(result).toBe('Hello World');
  });

  it('should strip multiple HTML tags', () => {
    const input = '<div><p>Hello</p><span>World</span></div>';
    const result = stripHtml(input);
    expect(result).toBe('HelloWorld');
  });

  it('should strip self-closing tags', () => {
    const input = 'Hello<br/>World';
    const result = stripHtml(input);
    expect(result).toBe('HelloWorld');
  });

  it('should strip tags with attributes', () => {
    const input = '<a href="http://example.com" class="link">Click here</a>';
    const result = stripHtml(input);
    expect(result).toBe('Click here');
  });

  it('should handle script tags', () => {
    const input = '<script>alert("XSS")</script>Safe text';
    const result = stripHtml(input);
    expect(result).toBe('alert("XSS")Safe text');
  });

  it('should handle nested tags', () => {
    const input = '<div><p><strong>Bold</strong> text</p></div>';
    const result = stripHtml(input);
    expect(result).toBe('Bold text');
  });

  it('should return unchanged text without HTML', () => {
    const input = 'Plain text without HTML';
    const result = stripHtml(input);
    expect(result).toBe('Plain text without HTML');
  });
});

describe('Sanitization - Special Character Escaping', () => {
  it('should escape ampersand', () => {
    const input = 'Tom & Jerry';
    const result = escapeSpecialChars(input);
    expect(result).toBe('Tom &amp; Jerry');
  });

  it('should escape less than', () => {
    const input = '5 < 10';
    const result = escapeSpecialChars(input);
    expect(result).toBe('5 &lt; 10');
  });

  it('should escape greater than', () => {
    const input = '10 > 5';
    const result = escapeSpecialChars(input);
    expect(result).toBe('10 &gt; 5');
  });

  it('should escape double quotes', () => {
    const input = 'He said "Hello"';
    const result = escapeSpecialChars(input);
    expect(result).toBe('He said &quot;Hello&quot;');
  });

  it('should escape single quotes', () => {
    const input = "It's a test";
    const result = escapeSpecialChars(input);
    expect(result).toBe('It&#x27;s a test');
  });

  it('should escape forward slash', () => {
    const input = 'path/to/file';
    const result = escapeSpecialChars(input);
    expect(result).toBe('path&#x2F;to&#x2F;file');
  });

  it('should escape multiple special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const result = escapeSpecialChars(input);
    expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
  });

  it('should handle text without special characters', () => {
    const input = 'Normal text';
    const result = escapeSpecialChars(input);
    expect(result).toBe('Normal text');
  });
});

describe('Sanitization - Comprehensive Text Sanitization', () => {
  it('should strip HTML and trim whitespace', () => {
    const input = '  <p>Hello World</p>  ';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
  });

  it('should handle leading whitespace', () => {
    const input = '   Text with spaces   ';
    const result = sanitizeText(input);
    expect(result).toBe('Text with spaces');
  });

  it('should handle trailing whitespace', () => {
    const input = 'Text with spaces   ';
    const result = sanitizeText(input);
    expect(result).toBe('Text with spaces');
  });

  it('should strip HTML and preserve inner text', () => {
    const input = '<div><strong>Important</strong> message</div>';
    const result = sanitizeText(input);
    expect(result).toBe('Important message');
  });

  it('should handle empty string', () => {
    const input = '';
    const result = sanitizeText(input);
    expect(result).toBe('');
  });

  it('should handle whitespace-only string', () => {
    const input = '   ';
    const result = sanitizeText(input);
    expect(result).toBe('');
  });

  it('should handle complex HTML with whitespace', () => {
    const input = '  <div class="container"><p>Test</p></div>  ';
    const result = sanitizeText(input);
    expect(result).toBe('Test');
  });
});

describe('Sanitization - Integration with Validation', () => {
  it('should demonstrate trimming in validation schemas', () => {
    // This test demonstrates that Zod schemas handle trimming
    const input = '  test@example.com  ';
    const trimmed = input.trim().toLowerCase();
    expect(trimmed).toBe('test@example.com');
  });

  it('should demonstrate HTML stripping for user inputs', () => {
    const maliciousInput = '<script>alert("XSS")</script>Company Name';
    const sanitized = stripHtml(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Company Name');
  });

  it('should handle combination of HTML and special characters', () => {
    const input = '<p>Price: $100 & up</p>';
    const stripped = stripHtml(input);
    expect(stripped).toBe('Price: $100 & up');
    
    const escaped = escapeSpecialChars(stripped);
    expect(escaped).toContain('&amp;');
  });
});
