import { DateRange } from '../../../src/domain/valueobject/DateRange.js';

describe('DateRange Value Object', () => {
  it('should create a valid date range', () => {
    const startDate = new Date('2026-12-01');
    const endDate = new Date('2026-12-31');

    const range = new DateRange(startDate, endDate);

    expect(range.startDate).toEqual(startDate);
    expect(range.endDate).toEqual(endDate);
  });

  it('should throw error when start date is after end date', () => {
    const startDate = new Date('2026-12-31');
    const endDate = new Date('2026-12-01');

    expect(() => {
      new DateRange(startDate, endDate);
    }).toThrow('Start date cannot be after end date');
  });

  it('should return true when date is within range', () => {
    const startDate = new Date('2026-12-01');
    const endDate = new Date('2026-12-31');
    const range = new DateRange(startDate, endDate);

    const testDate = new Date('2026-12-15');

    expect(range.contains(testDate)).toBe(true);
  });

  it('should return true when date is start date', () => {
    const startDate = new Date('2026-12-01');
    const endDate = new Date('2026-12-31');
    const range = new DateRange(startDate, endDate);

    expect(range.contains(startDate)).toBe(true);
  });

  it('should return true when date is end date', () => {
    const startDate = new Date('2026-12-01');
    const endDate = new Date('2026-12-31');
    const range = new DateRange(startDate, endDate);

    expect(range.contains(endDate)).toBe(true);
  });

  it('should return false when date is before range', () => {
    const startDate = new Date('2026-12-01');
    const endDate = new Date('2026-12-31');
    const range = new DateRange(startDate, endDate);

    const testDate = new Date('2026-04-30');

    expect(range.contains(testDate)).toBe(false);
  });

  it('should return false when date is after range', () => {
    const startDate = new Date('2026-12-01');
    const endDate = new Date('2026-12-31');
    const range = new DateRange(startDate, endDate);

    const testDate = new Date('2027-01-15');

    expect(range.contains(testDate)).toBe(false);
  });
});