import { TaskStatus } from '../valueobject/TaskStatus.js';
import { Priority } from '../valueobject/Priority.js';
export class Task {
    id;
    title;
    description;
    status;
    priority;
    dueDate;
    userId;
    createdAt;
    updatedAt;
    constructor(id, title, description, status, priority, dueDate, userId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.dueDate = dueDate;
        this.userId = userId;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.validateInvariant();
    }
    static create(id, title, description, priority, dueDate, userId) {
        const task = new Task(id, title, description, TaskStatus.NOT_STARTED, priority, dueDate, userId);
        return task;
    }
    getTitle() {
        return this.title;
    }
    getDescription() {
        return this.description;
    }
    getStatus() {
        return this.status;
    }
    getPriority() {
        return this.priority;
    }
    getDueDate() {
        return this.dueDate;
    }
    getUserId() {
        return this.userId;
    }
    getCreatedAt() {
        return new Date(this.createdAt);
    }
    getUpdatedAt() {
        return new Date(this.updatedAt);
    }
    updateTitle(title) {
        if (this.status === TaskStatus.COMPLETED) {
            throw new Error('Cannot update a completed task');
        }
        this.title = title;
        this.touch();
    }
    updateDescription(description) {
        if (this.status === TaskStatus.COMPLETED) {
            throw new Error('Cannot update a completed task');
        }
        this.description = description;
        this.touch();
    }
    updatePriority(priority) {
        this.priority = priority;
        this.validateInvariant();
        this.touch();
    }
    updateDueDate(dueDate) {
        if (dueDate !== null && dueDate < this.createdAt) {
            throw new Error('Due date cannot be before creation date');
        }
        this.dueDate = dueDate;
        this.validateInvariant();
        this.touch();
    }
    updateStatus(status) {
        if (this.status === TaskStatus.COMPLETED) {
            throw new Error('Cannot update status of a completed task');
        }
        this.status = status;
        this.touch();
    }
    markAsCompleted() {
        if (this.status === TaskStatus.COMPLETED) {
            return;
        }
        this.status = TaskStatus.COMPLETED;
        this.touch();
    }
    validateInvariant() {
        if (this.dueDate && this.dueDate < this.createdAt) {
            throw new Error('Due date cannot be before creation date');
        }
        if (this.priority === Priority.HIGH && !this.dueDate) {
            throw new Error('High priority tasks must have a due date');
        }
    }
    touch() {
        this.updatedAt = new Date();
    }
}
//# sourceMappingURL=Task.js.map