import { parseExpiration } from './parse-expiration.helper';

describe('parseExpiration', () => {
  const baseDate = new Date('2025-12-14T12:00:00Z');

  describe('minutes', () => {
    it.each([
      ['30m', '2025-12-14T12:30:00Z'],
      ['1m', '2025-12-14T12:01:00Z'],
      ['1440m', '2025-12-15T12:00:00Z'],
    ])('should parse %s', (input, expectedDate) => {
      const result = parseExpiration(input, baseDate);
      expect(result).toEqual(new Date(expectedDate));
    });
  });

  describe('hours', () => {
    it.each([
      ['24h', '2025-12-15T12:00:00Z'],
      ['1h', '2025-12-14T13:00:00Z'],
      ['2h', '2025-12-14T14:00:00Z'],
    ])('should parse %s', (input, expectedDate) => {
      const result = parseExpiration(input, baseDate);
      expect(result).toEqual(new Date(expectedDate));
    });
  });

  describe('days', () => {
    it.each([
      ['7d', '2025-12-21T12:00:00Z'],
      ['1d', '2025-12-15T12:00:00Z'],
      ['365d', '2026-12-14T12:00:00Z'],
    ])('should parse %s', (input, expectedDate) => {
      const result = parseExpiration(input, baseDate);
      expect(result).toEqual(new Date(expectedDate));
    });
  });

  describe('weeks', () => {
    it.each([
      ['2w', '2025-12-28T12:00:00Z'],
      ['1w', '2025-12-21T12:00:00Z'],
      ['4w', '2026-01-11T12:00:00Z'],
    ])('should parse %s', (input, expectedDate) => {
      const result = parseExpiration(input, baseDate);
      expect(result).toEqual(new Date(expectedDate));
    });
  });


  describe('months', () => {
    it.each([
      ['1M', '2026-01-14T12:00:00Z'],
      ['3M', '2026-03-14T12:00:00Z'],
      ['12M', '2026-12-14T12:00:00Z'],
    ])('should parse %s', (input, expectedDate) => {
      const result = parseExpiration(input, baseDate);
      expect(result).toEqual(new Date(expectedDate));
    });
  });

  describe('years', () => {
    it('should add years to the current date', () => {
      const result = parseExpiration('1y', baseDate);
      const expected = new Date('2026-12-14T12:00:00Z');
      expect(result).toEqual(expected);
    });

    it('should handle multiple years', () => {
      const result = parseExpiration('5y', baseDate);
      const expected = new Date('2030-12-14T12:00:00Z');
      expect(result).toEqual(expected);
    });
  });

  describe('default behavior', () => {
    it('should use current date when fromDate is not provided', () => {
      const beforeCall = new Date();
      const result = parseExpiration('1h');
      const afterCall = new Date();

      const expectedMinTime = new Date(beforeCall.getTime() + 60 * 60 * 1000);
      const expectedMaxTime = new Date(afterCall.getTime() + 60 * 60 * 1000);

      expect(result.getTime()).toBeGreaterThanOrEqual(
        expectedMinTime.getTime(),
      );
      expect(result.getTime()).toBeLessThanOrEqual(expectedMaxTime.getTime());
    });
  });

  describe('invalid formats', () => {
    it('should throw error for invalid format without unit', () => {
      expect(() => parseExpiration('30', baseDate)).toThrow(
        'Invalid expiration format: "30". Use format like "30m", "24h", "7d", "2w", "1M", "1y"',
      );
    });

    it('should throw error for invalid unit', () => {
      expect(() => parseExpiration('30s', baseDate)).toThrow(
        'Invalid expiration format: "30s". Use format like "30m", "24h", "7d", "2w", "1M", "1y"',
      );
    });

    it('should throw error for unit without number', () => {
      expect(() => parseExpiration('d', baseDate)).toThrow(
        'Invalid expiration format: "d". Use format like "30m", "24h", "7d", "2w", "1M", "1y"',
      );
    });

    it('should throw error for empty string', () => {
      expect(() => parseExpiration('', baseDate)).toThrow(
        'Invalid expiration format: "". Use format like "30m", "24h", "7d", "2w", "1M", "1y"',
      );
    });

    it('should throw error for negative numbers', () => {
      expect(() => parseExpiration('-5d', baseDate)).toThrow(
        'Invalid expiration format: "-5d". Use format like "30m", "24h", "7d", "2w", "1M", "1y"',
      );
    });

    it('should throw error for decimal numbers', () => {
      expect(() => parseExpiration('5.5d', baseDate)).toThrow(
        'Invalid expiration format: "5.5d". Use format like "30m", "24h", "7d", "2w", "1M", "1y"',
      );
    });

    it('should throw error for text with unit', () => {
      expect(() => parseExpiration('abcd', baseDate)).toThrow(
        'Invalid expiration format: "abcd". Use format like "30m", "24h", "7d", "2w", "1M", "1y"',
      );
    });

    it('should throw error for whitespace in format', () => {
      expect(() => parseExpiration('30 d', baseDate)).toThrow(
        'Invalid expiration format: "30 d". Use format like "30m", "24h", "7d", "2w", "1M", "1y"',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle zero value', () => {
      const result = parseExpiration('0d', baseDate);
      expect(result).toEqual(baseDate);
    });

    it('should handle zero minutes', () => {
      const result = parseExpiration('0m', baseDate);
      expect(result).toEqual(baseDate);
    });

    it('should handle very large values', () => {
      const result = parseExpiration('9999d', baseDate);
      expect(result.getFullYear()).toBeGreaterThan(baseDate.getFullYear());
    });

    it('should preserve time across day boundaries', () => {
      const customDate = new Date('2025-12-31T23:59:59Z');
      const result = parseExpiration('1h', customDate);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCDate()).toBe(1);
      expect(result.getUTCFullYear()).toBe(2026);
    });

    it('should handle leap year transitions correctly', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00Z');
      const result = parseExpiration('1y', leapYearDate);
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(1);
      expect(result.getUTCDate()).toBe(28);
    });

    it('should maintain milliseconds from original date', () => {
      const dateWithMs = new Date('2025-12-14T12:00:00.123Z');
      const result = parseExpiration('1d', dateWithMs);
      expect(result.getMilliseconds()).toBe(123);
    });
  });
});
