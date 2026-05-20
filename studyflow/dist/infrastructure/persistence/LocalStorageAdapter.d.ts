import { Task } from '../../domain/entity/Task.js';
export interface IPersistenceAdapter {
    saveTasks(tasks: Task[]): Promise<void>;
    loadTasks(): Promise<Task[]>;
}
export declare class LocalStorageAdapter implements IPersistenceAdapter {
    private readonly storageKey;
    saveTasks(tasks: Task[]): Promise<void>;
    loadTasks(): Promise<Task[]>;
    private serializeTask;
    private deserializeTask;
    private getTaskClass;
}
//# sourceMappingURL=LocalStorageAdapter.d.ts.map