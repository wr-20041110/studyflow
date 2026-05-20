import { ProgressReport } from '../../domain/entity/ProgressReport.js';
import { DateRange } from '../../domain/valueobject/DateRange.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';
export class GetProgressReportUseCase {
    taskRepository;
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async execute(userId, startDate, endDate) {
        const period = new DateRange(startDate, endDate);
        const tasks = await this.taskRepository.findByUserId(userId);
        const statistics = this.calculateStatistics(tasks);
        const reportId = this.generateReportId();
        return new ProgressReport(reportId, userId, period, statistics);
    }
    calculateStatistics(tasks) {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.getStatus() === TaskStatus.COMPLETED).length;
        const inProgressTasks = tasks.filter(t => t.getStatus() === TaskStatus.IN_PROGRESS).length;
        const notStartedTasks = tasks.filter(t => t.getStatus() === TaskStatus.NOT_STARTED).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            notStartedTasks,
            completionRate
        };
    }
    generateReportId() {
        return `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}
//# sourceMappingURL=GetProgressReportUseCase.js.map