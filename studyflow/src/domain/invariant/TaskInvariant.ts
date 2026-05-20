import { Task } from '../entity/Task.js';
import { Priority } from '../valueobject/Priority.js';

export class TaskInvariant {
  static validate(task: Task): void {
    TaskInvariant.validateDueDate(task);
    TaskInvariant.validateHighPriorityDueDate(task);
  }

  private static validateDueDate(task: Task): void {
    const dueDate = task.getDueDate();
    const createdAt = task.getCreatedAt();

    if (dueDate !== null && dueDate < createdAt) {
      throw new Error('INV-01: Task due date cannot be earlier than creation date');
    }
  }

  private static validateHighPriorityDueDate(task: Task): void {
    const priority = task.getPriority();
    const dueDate = task.getDueDate();

    if (priority === Priority.HIGH && dueDate === null) {
      throw new Error('INV-03: High priority tasks must have a due date');
    }
  }

  static validateStatusTransition(currentStatus: string, newStatus: string): void {
    if (currentStatus === 'COMPLETED' && newStatus !== 'COMPLETED') {
      throw new Error('INV-02: Completed tasks cannot be changed back to incomplete status');
    }
  }
}