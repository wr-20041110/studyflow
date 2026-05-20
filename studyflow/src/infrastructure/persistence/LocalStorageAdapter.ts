import { Task } from '../../domain/entity/Task.js';

declare const localStorage: any;

export interface IPersistenceAdapter {
  saveTasks(tasks: Task[]): Promise<void>;
  loadTasks(): Promise<Task[]>;
}

export class LocalStorageAdapter implements IPersistenceAdapter {
  private readonly storageKey = 'studyflow_tasks';

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      const serialized = JSON.stringify(tasks.map(task => this.serializeTask(task)));
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      throw new Error('Failed to save tasks to local storage');
    }
  }

  async loadTasks(): Promise<Task[]> {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        return [];
      }
      const data = JSON.parse(serialized);
      return data.map((item: any) => this.deserializeTask(item));
    } catch (error) {
      throw new Error('Failed to load tasks from local storage');
    }
  }

  private serializeTask(task: Task): any {
    return {
      id: task.id,
      title: task.getTitle(),
      description: task.getDescription(),
      status: task.getStatus(),
      priority: task.getPriority(),
      dueDate: task.getDueDate(),
      userId: task.getUserId(),
      createdAt: task.getCreatedAt().toISOString(),
      updatedAt: task.getUpdatedAt().toISOString()
    };
  }

  private deserializeTask(data: any): Task {
    const TaskClass = this.getTaskClass();
    return new TaskClass(
      data.id,
      data.title,
      data.description,
      data.status,
      data.priority,
      data.dueDate ? new Date(data.dueDate) : null,
      data.userId
    );
  }

  private getTaskClass(): typeof Task {
    return Task;
  }
}