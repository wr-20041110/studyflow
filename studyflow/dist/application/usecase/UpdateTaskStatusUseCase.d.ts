import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';
import { TaskDto } from '../dto/TaskDto.js';
export declare class UpdateTaskStatusUseCase {
    private readonly taskRepository;
    constructor(taskRepository: ITaskRepository);
    execute(taskId: string, newStatus: TaskStatus): Promise<TaskDto | null>;
    private toDto;
}
//# sourceMappingURL=UpdateTaskStatusUseCase.d.ts.map