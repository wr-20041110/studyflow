import { Task } from '../../domain/entity/Task.js';
export class CreateTaskUseCase {
    taskRepository;
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async execute(dto) {
        const taskId = this.generateId();
        const task = Task.create(taskId, dto.title, dto.description, dto.priority, dto.dueDate, dto.userId);
        await this.taskRepository.save(task);
        return this.toDto(task);
    }
    generateId() {
        return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    toDto(task) {
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
//# sourceMappingURL=CreateTaskUseCase.js.map