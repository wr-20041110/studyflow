import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { Task } from '../../domain/entity/Task.js';
import { Priority } from '../../domain/valueobject/Priority.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';

export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.getUserId() === userId);
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.getStatus() === status);
  }

  async findByPriority(priority: Priority): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.getPriority() === priority);
  }

  async findByUserIdAndStatus(userId: string, status: TaskStatus): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.getUserId() === userId && task.getStatus() === status
    );
  }

  clear(): void {
    this.tasks.clear();
  }

  size(): number {
    return this.tasks.size;
  }
}