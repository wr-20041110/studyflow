import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { CreateTaskDto } from '../dto/CreateTaskDto.js';
import { Task } from '../../domain/entity/Task.js';
import { TaskDto } from '../dto/TaskDto.js';
import { Tag } from '../../domain/valueobject/Tag.js';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(dto: CreateTaskDto): Promise<TaskDto> {
    const taskId = this.generateId();

    // 将标签名称转换为 Tag 对象
    const tags = (dto.tags || []).map(tagName => Tag.fromName(tagName));

    const task = Task.create(
      taskId,
      dto.title,
      dto.description,
      dto.priority,
      dto.dueDate,
      dto.userId,
      tags
    );

    await this.taskRepository.save(task);

    return this.toDto(task);
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private toDto(task: Task): TaskDto {
    return {
      id: task.id,
      title: task.getTitle(),
      description: task.getDescription(),
      status: task.getStatus(),
      priority: task.getPriority(),
      dueDate: task.getDueDate(),
      userId: task.getUserId(),
      createdAt: task.getCreatedAt(),
      updatedAt: task.getUpdatedAt(),
      tags: task.getTags().map(t => ({ name: t.getName(), color: t.getColor() }))
    };
  }
}