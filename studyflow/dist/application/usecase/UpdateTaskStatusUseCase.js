export class UpdateTaskStatusUseCase {
    taskRepository;
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async execute(taskId, newStatus) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            return null;
        }
        task.updateStatus(newStatus);
        await this.taskRepository.save(task);
        return this.toDto(task);
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
//# sourceMappingURL=UpdateTaskStatusUseCase.js.map