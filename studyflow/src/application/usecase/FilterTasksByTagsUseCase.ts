import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { TaskDto } from '../dto/TaskDto.js';
import { Task } from '../../domain/entity/Task.js';
import { FilterTasksDto } from '../dto/FilterTasksDto.js';

/**
 * 按标签筛选任务用例
 * 支持按多个标签名称筛选（OR 语义：包含任一标签即匹配）
 */
export class FilterTasksByTagsUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(dto: FilterTasksDto): Promise<TaskDto[]> {
    let tasks: Task[];

    if (dto.tags && dto.tags.length > 0) {
      // 按标签筛选
      tasks = await this.taskRepository.findByTags(dto.tags);

      // 如果同时指定了 userId，进一步过滤
      if (dto.userId) {
        tasks = tasks.filter(t => t.getUserId() === dto.userId);
      }
    } else {
      // 无标签参数时返回空数组
      return [];
    }

    return tasks.map(task => this.toDto(task));
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
