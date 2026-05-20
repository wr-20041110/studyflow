import { Priority } from '../../domain/valueobject/Priority.js';
export interface CreateTaskDto {
    userId: string;
    title: string;
    description: string;
    priority: Priority;
    dueDate: Date | null;
}
//# sourceMappingURL=CreateTaskDto.d.ts.map