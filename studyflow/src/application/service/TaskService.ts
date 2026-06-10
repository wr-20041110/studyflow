import {
  ITaskService,
  CreateTaskCommand,
  ProgressSummary
} from './ITaskService.js';
import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { Task } from '../../domain/entity/Task.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';
import { Priority } from '../../domain/valueobject/Priority.js';
import { Tag } from '../../domain/valueobject/Tag.js';

export class TaskService implements ITaskService {
  private readonly TITLE_MAX_LENGTH = 200;
  private readonly DESCRIPTION_MAX_LENGTH = 1000;

  constructor(private readonly taskRepository: ITaskRepository) {}

  async createTask(input: CreateTaskCommand): Promise<Task> {
    if (!input.title || input.title.trim() === '') {
      throw new Error('Title cannot be empty');
    }

    if (input.title.length > this.TITLE_MAX_LENGTH) {
      throw new Error(`Title cannot exceed ${this.TITLE_MAX_LENGTH} characters`);
    }

    if (input.description.length > this.DESCRIPTION_MAX_LENGTH) {
      throw new Error(`Description cannot exceed ${this.DESCRIPTION_MAX_LENGTH} characters`);
    }

    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (input.dueDate && input.dueDate < new Date()) {
      throw new Error('Due date cannot be in the past');
    }

    const taskId = this.generateId();
    const task = Task.create(
      taskId,
      input.title,
      input.description,
      input.priority,
      input.dueDate,
      input.userId
    );

    await this.taskRepository.save(task);

    return task;
  }

  async completeTask(taskId: string): Promise<Task> {
    if (!taskId || taskId.trim() === '') {
      throw new Error('Task ID cannot be empty');
    }

    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    task.markAsCompleted();
    await this.taskRepository.save(task);

    return task;
  }

  async listTasksByPriority(userId: string): Promise<Task[]> {
    if (!userId || userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    const tasks = await this.taskRepository.findByUserId(userId);

    const priorityOrder: Record<Priority, number> = {
      [Priority.HIGH]: 0,
      [Priority.MEDIUM]: 1,
      [Priority.LOW]: 2
    };

    return tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[a.getPriority()] - priorityOrder[b.getPriority()];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const aDueDate = a.getDueDate();
      const bDueDate = b.getDueDate();

      if (aDueDate === null && bDueDate === null) {
        return 0;
      }

      if (aDueDate === null) {
        return 1;
      }

      if (bDueDate === null) {
        return -1;
      }

      return aDueDate.getTime() - bDueDate.getTime();
    });
  }

  async listDueTasks(date: Date): Promise<Task[]> {
    const allTasks: Task[] = [];

    const notStartedTasks = await this.taskRepository.findByStatus(TaskStatus.NOT_STARTED);
    const inProgressTasks = await this.taskRepository.findByStatus(TaskStatus.IN_PROGRESS);

    allTasks.push(...notStartedTasks, ...inProgressTasks);

    const dueTasks = allTasks.filter(task => {
      const dueDate = task.getDueDate();
      if (dueDate === null) {
        return false;
      }

      const dueDateMidnight = new Date(dueDate);
      dueDateMidnight.setHours(0, 0, 0, 0);

      const queryDateMidnight = new Date(date);
      queryDateMidnight.setHours(0, 0, 0, 0);

      return dueDateMidnight <= queryDateMidnight;
    });

    return dueTasks;
  }

  async getProgressByUser(userId: string): Promise<ProgressSummary> {
    const completedTasks = await this.taskRepository.findByUserIdAndStatus(
      userId,
      TaskStatus.COMPLETED
    );
    const inProgressTasks = await this.taskRepository.findByUserIdAndStatus(
      userId,
      TaskStatus.IN_PROGRESS
    );
    const notStartedTasks = await this.taskRepository.findByUserIdAndStatus(
      userId,
      TaskStatus.NOT_STARTED
    );

    const totalTasks = completedTasks.length + inProgressTasks.length + notStartedTasks.length;
    const completionRate = totalTasks > 0 ? completedTasks.length / totalTasks : 0;

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      notStartedTasks: notStartedTasks.length,
      completionRate
    };
  }

  async filterByTags(userId: string, tagNames: string[]): Promise<Task[]> {
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    if (!userId || userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    const tasks = await this.taskRepository.findByTags(tagNames);

    // 按 userId 过滤
    return tasks.filter(t => t.getUserId() === userId);
  }

  async addTagsToTask(taskId: string, tagNames: string[]): Promise<Task> {
    if (!taskId || taskId.trim() === '') {
      throw new Error('Task ID cannot be empty');
    }

    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    for (const name of tagNames) {
      const tag = Tag.fromName(name);
      task.addTag(tag);
    }

    await this.taskRepository.save(task);

    return task;
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}