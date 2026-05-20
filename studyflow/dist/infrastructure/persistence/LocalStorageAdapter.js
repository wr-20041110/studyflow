import { Task } from '../../domain/entity/Task.js';
export class LocalStorageAdapter {
    storageKey = 'studyflow_tasks';
    async saveTasks(tasks) {
        try {
            const serialized = JSON.stringify(tasks.map(task => this.serializeTask(task)));
            localStorage.setItem(this.storageKey, serialized);
        }
        catch (error) {
            throw new Error('Failed to save tasks to local storage');
        }
    }
    async loadTasks() {
        try {
            const serialized = localStorage.getItem(this.storageKey);
            if (!serialized) {
                return [];
            }
            const data = JSON.parse(serialized);
            return data.map((item) => this.deserializeTask(item));
        }
        catch (error) {
            throw new Error('Failed to load tasks from local storage');
        }
    }
    serializeTask(task) {
        return {
            id: task.id,
            title: task.getTitle(),
            description: task.getDescription(),
            status: task.getStatus(),
            priority: task.getPriority(),
            dueDate: task.getDueDate(),
            userId: task.getUserId(),
            createdAt: task.getCreatedAt().toISOString(),
            updatedAt: task.getUpdatedAt().toISOString()
        };
    }
    deserializeTask(data) {
        const TaskClass = this.getTaskClass();
        return new TaskClass(data.id, data.title, data.description, data.status, data.priority, data.dueDate ? new Date(data.dueDate) : null, data.userId);
    }
    getTaskClass() {
        return Task;
    }
}
//# sourceMappingURL=LocalStorageAdapter.js.map