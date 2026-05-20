import { TaskStatus } from '../valueobject/TaskStatus.js';
import { Priority } from '../valueobject/Priority.js';
export declare class Task {
    readonly id: string;
    private title;
    private description;
    private status;
    private priority;
    private dueDate;
    private readonly userId;
    private readonly createdAt;
    private updatedAt;
    constructor(id: string, title: string, description: string, status: TaskStatus, priority: Priority, dueDate: Date | null, userId: string);
    static create(id: string, title: string, description: string, priority: Priority, dueDate: Date | null, userId: string): Task;
    getTitle(): string;
    getDescription(): string;
    getStatus(): TaskStatus;
    getPriority(): Priority;
    getDueDate(): Date | null;
    getUserId(): string;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    updateTitle(title: string): void;
    updateDescription(description: string): void;
    updatePriority(priority: Priority): void;
    updateDueDate(dueDate: Date | null): void;
    updateStatus(status: TaskStatus): void;
    markAsCompleted(): void;
    private validateInvariant;
    private touch;
}
//# sourceMappingURL=Task.d.ts.map