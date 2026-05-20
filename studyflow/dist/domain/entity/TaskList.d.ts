export declare class TaskList {
    readonly id: string;
    private name;
    private readonly taskIds;
    constructor(id: string, name: string, taskIds?: string[]);
    getName(): string;
    getTaskIds(): string[];
    addTask(taskId: string): void;
    removeTask(taskId: string): void;
    containsTask(taskId: string): boolean;
    getTaskCount(): number;
}
//# sourceMappingURL=TaskList.d.ts.map