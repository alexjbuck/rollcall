import { describe, expect, it } from 'vitest';
import { startOfMonth, endOfMonth, isoDate } from './date';

describe('date utils', () => {
  it('startOfMonth', () => {
    const d = new Date('2025-02-15T12:00:00Z');
    expect(isoDate(startOfMonth(d))).toBe('2025-02-01');
  });

  it('endOfMonth', () => {
    const d = new Date('2024-02-05T12:00:00Z');
    expect(isoDate(endOfMonth(d))).toBe('2024-02-29');
  });
});

