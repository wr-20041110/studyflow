export class TaskList {
  constructor(
    public readonly id: string,
    private name: string,
    private readonly taskIds: string[] = []
  ) {}

  getName(): string {
    return this.name;
  }

  getTaskIds(): string[] {
    return [...this.taskIds];
  }

  addTask(taskId: string): void {
    if (this.taskIds.includes(taskId)) {
      throw new Error('Task already exists in list');
    }
    this.taskIds.push(taskId);
  }

  removeTask(taskId: string): void {
    const index = this.taskIds.indexOf(taskId);
    if (index === -1) {
      throw new Error('Task not found in list');
    }
    this.taskIds.splice(index, 1);
  }

  containsTask(taskId: string): boolean {
    return this.taskIds.includes(taskId);
  }

  getTaskCount(): number {
    return this.taskIds.length;
  }
}