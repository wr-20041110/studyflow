import { DateRange } from '../valueobject/DateRange.js';
export interface TaskStatistics {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    notStartedTasks: number;
    completionRate: number;
}
export declare class ProgressReport {
    readonly id: string;
    private readonly userId;
    private readonly period;
    private readonly statistics;
    constructor(id: string, userId: string, period: DateRange, statistics: TaskStatistics);
    getUserId(): string;
    getPeriod(): DateRange;
    getStatistics(): TaskStatistics;
    getCompletionRate(): number;
    private validateInvariant;
}
//# sourceMappingURL=ProgressReport.d.ts.map