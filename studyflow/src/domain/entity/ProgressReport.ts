import { DateRange } from '../valueobject/DateRange.js';

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  completionRate: number;
}

export class ProgressReport {
  constructor(
    public readonly id: string,
    private readonly userId: string,
    private readonly period: DateRange,
    private readonly statistics: TaskStatistics
  ) {
    this.validateInvariant();
  }

  getUserId(): string {
    return this.userId;
  }

  getPeriod(): DateRange {
    return this.period;
  }

  getStatistics(): TaskStatistics {
    return { ...this.statistics };
  }

  getCompletionRate(): number {
    return this.statistics.completionRate;
  }

  private validateInvariant(): void {
    if (this.statistics.completionRate < 0 || this.statistics.completionRate > 100) {
      throw new Error('Completion rate must be between 0 and 100');
    }
  }
}