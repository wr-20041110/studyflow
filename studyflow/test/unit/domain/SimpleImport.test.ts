import { Priority } from '../../../src/domain/valueobject/Priority.js';
import { TaskStatus } from '../../../src/domain/valueobject/TaskStatus.js';

describe('Simple Import Test', () => {
  it('should be able to import Priority', () => {
    expect(Priority.HIGH).toBe('HIGH');
    expect(Priority.MEDIUM).toBe('MEDIUM');
    expect(Priority.LOW).toBe('LOW');
  });

  it('should be able to import TaskStatus', () => {
    expect(TaskStatus.NOT_STARTED).toBe('NOT_STARTED');
    expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
    expect(TaskStatus.COMPLETED).toBe('COMPLETED');
  });
});