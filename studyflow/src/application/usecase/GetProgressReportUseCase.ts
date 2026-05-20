import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { ProgressReport, TaskStatistics } from '../../domain/entity/ProgressReport.js';
import { DateRange } from '../../domain/valueobject/DateRange.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';

export class GetProgressReportUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(userId: string, startDate: Date, endDate: Date): Promise<ProgressReport> {
    const period = new DateRange(startDate, endDate);
    const tasks = await this.taskRepository.findByUserId(userId);

    const statistics = this.calculateStatistics(tasks);

    const reportId = this.generateReportId();
    return new ProgressReport(reportId, userId, period, statistics);
  }

  private calculateStatistics(tasks: any[]): TaskStatistics {
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

  private generateReportId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}