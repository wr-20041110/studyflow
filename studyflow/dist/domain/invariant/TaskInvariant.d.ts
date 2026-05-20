import { Task } from '../entity/Task.js';
export declare class TaskInvariant {
    static validate(task: Task): void;
    private static validateDueDate;
    private static validateHighPriorityDueDate;
    static validateStatusTransition(currentStatus: string, newStatus: string): void;
}
//# sourceMappingURL=TaskInvariant.d.ts.map