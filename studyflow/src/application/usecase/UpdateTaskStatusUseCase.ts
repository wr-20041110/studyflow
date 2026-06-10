import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';
import { TaskDto } from '../dto/TaskDto.js';

export class UpdateTaskStatusUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(taskId: string, newStatus: TaskStatus): Promise<TaskDto | null> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      return null;
    }

    task.updateStatus(newStatus);
    await this.taskRepository.save(task);

    return this.toDto(task);
  }

  private toDto(task: any): TaskDto {
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
      tags: (task.getTags ? task.getTags() : []).map((t: any) => ({ name: t.getName(), color: t.getColor() }))
    };
  }
}