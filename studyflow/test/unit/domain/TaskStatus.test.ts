import { TaskStatus } from '../../../src/domain/valueobject/TaskStatus.js';

describe('TaskStatus Value Object', () => {
  it('should have NOT_STARTED value', () => {
    expect(TaskStatus.NOT_STARTED).toBe('NOT_STARTED');
  });

  it('should have IN_PROGRESS value', () => {
    expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
  });

  it('should have COMPLETED value', () => {
    expect(TaskStatus.COMPLETED).toBe('COMPLETED');
  });
});