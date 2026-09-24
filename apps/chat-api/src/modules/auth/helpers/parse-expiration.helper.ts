import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addWeeks,
  addYears,
} from 'date-fns';

/**
 * Parses expiration string format (e.g., '1d', '7d', '1M', '1h') and returns the expiration date.
 * Supported formats:
 * - m: minutes (e.g., '30m')
 * - h: hours (e.g., '24h')
 * - d: days (e.g., '7d')
 * - w: weeks (e.g., '2w')
 * - M: months (e.g., '1M')
 * - y: years (e.g., '1y')
 */
export function parseExpiration(
  expiration: string,
  fromDate: Date = new Date(),
): Date {
  const match = /^(\d+)([mhdwMy])$/.exec(expiration);

  if (!match) {
    throw new Error(
      `Invalid expiration format: "${expiration}". Use format like "30m", "24h", "7d", "2w", "1M", "1y"`,
    );
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'm':
      return addMinutes(fromDate, amount);
    case 'h':
      return addHours(fromDate, amount);
    case 'd':
      return addDays(fromDate, amount);
    case 'w':
      return addWeeks(fromDate, amount);
    case 'M':
      return addMonths(fromDate, amount);
    case 'y':
      return addYears(fromDate, amount);
    default:
      throw new Error(`Unknown time unit: "${unit}"`);
  }
}
