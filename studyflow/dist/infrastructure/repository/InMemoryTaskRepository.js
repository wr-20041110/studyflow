export class InMemoryTaskRepository {
    tasks = new Map();
    async save(task) {
        this.tasks.set(task.id, task);
    }
    async findById(id) {
        return this.tasks.get(id) || null;
    }
    async findByUserId(userId) {
        return Array.from(this.tasks.values()).filter(task => task.getUserId() === userId);
    }
    async delete(id) {
        this.tasks.delete(id);
    }
    async findByStatus(status) {
        return Array.from(this.tasks.values()).filter(task => task.getStatus() === status);
    }
    async findByPriority(priority) {
        return Array.from(this.tasks.values()).filter(task => task.getPriority() === priority);
    }
    async findByUserIdAndStatus(userId, status) {
        return Array.from(this.tasks.values()).filter(task => task.getUserId() === userId && task.getStatus() === status);
    }
    clear() {
        this.tasks.clear();
    }
    size() {
        return this.tasks.size;
    }
}
//# sourceMappingURL=InMemoryTaskRepository.js.map