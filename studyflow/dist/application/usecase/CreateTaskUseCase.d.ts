import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { CreateTaskDto } from '../dto/CreateTaskDto.js';
import { TaskDto } from '../dto/TaskDto.js';
export declare class CreateTaskUseCase {
    private readonly taskRepository;
    constructor(taskRepository: ITaskRepository);
    execute(dto: CreateTaskDto): Promise<TaskDto>;
    private generateId;
    private toDto;
}
//# sourceMappingURL=CreateTaskUseCase.d.ts.map