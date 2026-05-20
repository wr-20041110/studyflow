import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
export declare class TaskController {
    private createTaskUseCase;
    private updateTaskStatusUseCase;
    private getProgressReportUseCase;
    constructor(taskRepository: ITaskRepository);
    createTask(req: any, res: any): Promise<void>;
    updateTaskStatus(req: any, res: any): Promise<void>;
    getProgressReport(req: any, res: any): Promise<void>;
}
//# sourceMappingURL=TaskController.d.ts.map