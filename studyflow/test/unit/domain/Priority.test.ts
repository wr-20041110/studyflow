import { Priority } from '../../../src/domain/valueobject/Priority.js';

describe('Priority Value Object', () => {
  it('should have HIGH value', () => {
    expect(Priority.HIGH).toBe('HIGH');
  });

  it('should have MEDIUM value', () => {
    expect(Priority.MEDIUM).toBe('MEDIUM');
  });

  it('should have LOW value', () => {
    expect(Priority.LOW).toBe('LOW');
  });
});