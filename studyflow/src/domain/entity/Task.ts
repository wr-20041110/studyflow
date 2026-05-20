import { TaskStatus } from '../valueobject/TaskStatus.js';
import { Priority } from '../valueobject/Priority.js';

export class Task {
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(
    public readonly id: string,
    private title: string,
    private description: string,
    private status: TaskStatus,
    private priority: Priority,
    private dueDate: Date | null,
    private readonly userId: string
  ) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validateInvariant();
  }

  static create(
    id: string,
    title: string,
    description: string,
    priority: Priority,
    dueDate: Date | null,
    userId: string
  ): Task {
    const task = new Task(id, title, description, TaskStatus.NOT_STARTED, priority, dueDate, userId);
    return task;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getPriority(): Priority {
    return this.priority;
  }

  getDueDate(): Date | null {
    return this.dueDate;
  }

  getUserId(): string {
    return this.userId;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  updateTitle(title: string): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot update a completed task');
    }
    this.title = title;
    this.touch();
  }

  updateDescription(description: string): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot update a completed task');
    }
    this.description = description;
    this.touch();
  }

  updatePriority(priority: Priority): void {
    this.priority = priority;
    this.validateInvariant();
    this.touch();
  }

  updateDueDate(dueDate: Date | null): void {
    if (dueDate !== null && dueDate < this.createdAt) {
      throw new Error('Due date cannot be before creation date');
    }
    this.dueDate = dueDate;
    this.validateInvariant();
    this.touch();
  }

  updateStatus(status: TaskStatus): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot update status of a completed task');
    }
    this.status = status;
    this.touch();
  }

  markAsCompleted(): void {
    if (this.status === TaskStatus.COMPLETED) {
      return;
    }
    this.status = TaskStatus.COMPLETED;
    this.touch();
  }

  private validateInvariant(): void {
    if (this.dueDate && this.dueDate < this.createdAt) {
      throw new Error('Due date cannot be before creation date');
    }

    if (this.priority === Priority.HIGH && !this.dueDate) {
      throw new Error('High priority tasks must have a due date');
    }
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}