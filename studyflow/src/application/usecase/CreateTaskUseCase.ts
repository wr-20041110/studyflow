import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { CreateTaskDto } from '../dto/CreateTaskDto.js';
import { Task } from '../../domain/entity/Task.js';
import { TaskDto } from '../dto/TaskDto.js';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(dto: CreateTaskDto): Promise<TaskDto> {
    const taskId = this.generateId();
    const task = Task.create(
      taskId,
      dto.title,
      dto.description,
      dto.priority,
      dto.dueDate,
      dto.userId
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
      updatedAt: task.getUpdatedAt()
    };
  }
}