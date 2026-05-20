import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { Task } from '../../domain/entity/Task.js';
import { Priority } from '../../domain/valueobject/Priority.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';
export declare class InMemoryTaskRepository implements ITaskRepository {
    private tasks;
    save(task: Task): Promise<void>;
    findById(id: string): Promise<Task | null>;
    findByUserId(userId: string): Promise<Task[]>;
    delete(id: string): Promise<void>;
    findByStatus(status: TaskStatus): Promise<Task[]>;
    findByPriority(priority: Priority): Promise<Task[]>;
    findByUserIdAndStatus(userId: string, status: TaskStatus): Promise<Task[]>;
    clear(): void;
    size(): number;
}
//# sourceMappingURL=InMemoryTaskRepository.d.ts.map