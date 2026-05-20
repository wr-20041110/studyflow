import { Priority } from '../../domain/valueobject/Priority.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';
export interface UpdateTaskDto {
    id: string;
    title?: string;
    description?: string;
    priority?: Priority;
    dueDate?: Date | null;
    status?: TaskStatus;
}
//# sourceMappingURL=UpdateTaskDto.d.ts.map