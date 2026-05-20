import { Priority } from '../valueobject/Priority.js';
export class TaskInvariant {
    static validate(task) {
        TaskInvariant.validateDueDate(task);
        TaskInvariant.validateHighPriorityDueDate(task);
    }
    static validateDueDate(task) {
        const dueDate = task.getDueDate();
        const createdAt = task.getCreatedAt();
        if (dueDate !== null && dueDate < createdAt) {
            throw new Error('INV-01: Task due date cannot be earlier than creation date');
        }
    }
    static validateHighPriorityDueDate(task) {
        const priority = task.getPriority();
        const dueDate = task.getDueDate();
        if (priority === Priority.HIGH && dueDate === null) {
            throw new Error('INV-03: High priority tasks must have a due date');
        }
    }
    static validateStatusTransition(currentStatus, newStatus) {
        if (currentStatus === 'COMPLETED' && newStatus !== 'COMPLETED') {
            throw new Error('INV-02: Completed tasks cannot be changed back to incomplete status');
        }
    }
}
//# sourceMappingURL=TaskInvariant.js.map