export class ProgressReport {
    id;
    userId;
    period;
    statistics;
    constructor(id, userId, period, statistics) {
        this.id = id;
        this.userId = userId;
        this.period = period;
        this.statistics = statistics;
        this.validateInvariant();
    }
    getUserId() {
        return this.userId;
    }
    getPeriod() {
        return this.period;
    }
    getStatistics() {
        return { ...this.statistics };
    }
    getCompletionRate() {
        return this.statistics.completionRate;
    }
    validateInvariant() {
        if (this.statistics.completionRate < 0 || this.statistics.completionRate > 100) {
            throw new Error('Completion rate must be between 0 and 100');
        }
    }
}
//# sourceMappingURL=ProgressReport.js.map