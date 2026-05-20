import { InMemoryTaskRepository } from '../../infrastructure/repository/InMemoryTaskRepository.js';
import { Priority } from '../../domain/valueobject/Priority.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';
export declare class TaskCLI {
    private createTaskUseCase;
    private updateTaskStatusUseCase;
    private getProgressReportUseCase;
    private repository;
    constructor();
    createTask(title: string, description: string, priority: Priority, dueDate: Date | null): Promise<void>;
    updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>;
    showProgressReport(userId: string): Promise<void>;
    listTasks(userId: string): Promise<void>;
    private getStatusIcon;
    private getPriorityColor;
    getRepository(): InMemoryTaskRepository;
}
//# sourceMappingURL=TaskCLI.d.ts.map