import { Task } from '../entity/Task.js';
import { Priority } from '../valueobject/Priority.js';
import { TaskStatus } from '../valueobject/TaskStatus.js';

export interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
  delete(id: string): Promise<void>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByPriority(priority: Priority): Promise<Task[]>;
  findByUserIdAndStatus(userId: string, status: TaskStatus): Promise<Task[]>;
}