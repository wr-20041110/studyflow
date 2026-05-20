export class TaskList {
    id;
    name;
    taskIds;
    constructor(id, name, taskIds = []) {
        this.id = id;
        this.name = name;
        this.taskIds = taskIds;
    }
    getName() {
        return this.name;
    }
    getTaskIds() {
        return [...this.taskIds];
    }
    addTask(taskId) {
        if (this.taskIds.includes(taskId)) {
            throw new Error('Task already exists in list');
        }
        this.taskIds.push(taskId);
    }
    removeTask(taskId) {
        const index = this.taskIds.indexOf(taskId);
        if (index === -1) {
            throw new Error('Task not found in list');
        }
        this.taskIds.splice(index, 1);
    }
    containsTask(taskId) {
        return this.taskIds.includes(taskId);
    }
    getTaskCount() {
        return this.taskIds.length;
    }
}
//# sourceMappingURL=TaskList.js.map