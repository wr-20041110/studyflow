import { TaskStatus } from '../valueobject/TaskStatus.js';
import { Priority } from '../valueobject/Priority.js';
import { Tag } from '../valueobject/Tag.js';

export class Task {
  private readonly createdAt: Date;
  private updatedAt: Date;
  private tags: Tag[];

  constructor(
    public readonly id: string,
    private title: string,
    private description: string,
    private status: TaskStatus,
    private priority: Priority,
    private dueDate: Date | null,
    private readonly userId: string,
    tags: Tag[] = []
  ) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.tags = [...tags];
    this.validateInvariant();
  }

  static create(
    id: string,
    title: string,
    description: string,
    priority: Priority,
    dueDate: Date | null,
    userId: string,
    tags: Tag[] = []
  ): Task {
    const task = new Task(id, title, description, TaskStatus.NOT_STARTED, priority, dueDate, userId, tags);
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

  // ========== 标签管理 ==========

  /**
   * 添加标签（同名标签不重复添加）
   */
  addTag(tag: Tag): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot add tag to a completed task');
    }
    if (this.hasTagByName(tag.getName())) {
      return; // 幂等：同名标签已存在则不重复添加
    }
    this.tags.push(tag);
    this.touch();
  }

  /**
   * 移除标签
   */
  removeTag(tagName: string): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot remove tag from a completed task');
    }
    const index = this.tags.findIndex(t => t.getName() === tagName);
    if (index === -1) {
      throw new Error(`Tag '${tagName}' not found on task`);
    }
    this.tags.splice(index, 1);
    this.touch();
  }

  /**
   * 检查任务是否包含指定标签（按名称）
   */
  hasTagByName(tagName: string): boolean {
    return this.tags.some(t => t.getName() === tagName);
  }

  /**
   * 获取所有标签
   */
  getTags(): Tag[] {
    return [...this.tags];
  }

  /**
   * 批量设置标签（替换现有标签）
   */
  setTags(tags: Tag[]): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot set tags on a completed task');
    }
    this.tags = [...tags];
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