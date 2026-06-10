import { Priority } from '../../domain/valueobject/Priority.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';

export interface TagDto {
  name: string;
  color: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: TagDto[];
}