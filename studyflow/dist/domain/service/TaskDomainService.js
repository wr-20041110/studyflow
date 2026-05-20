import { Priority } from '../valueobject/Priority.js';
export class TaskDomainService {
    validateTask(task) {
        const errors = [];
        if (!task.getTitle().trim()) {
            errors.push('Task title cannot be empty');
        }
        if (task.getPriority() === Priority.HIGH && !task.getDueDate()) {
            errors.push('High priority tasks must have a due date');
        }
        const dueDate = task.getDueDate();
        if (dueDate !== null && dueDate < task.getCreatedAt()) {
            errors.push('Due date cannot be before creation date');
        }
        if (errors.length > 0) {
            throw new Error(`Task validation failed: ${errors.join(', ')}`);
        }
    }
    canUpdateStatus(task) {
        return task.getStatus() !== 'COMPLETED';
    }
}
//# sourceMappingURL=TaskDomainService.js.map