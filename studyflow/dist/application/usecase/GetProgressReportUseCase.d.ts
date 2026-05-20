import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { ProgressReport } from '../../domain/entity/ProgressReport.js';
export declare class GetProgressReportUseCase {
    private readonly taskRepository;
    constructor(taskRepository: ITaskRepository);
    execute(userId: string, startDate: Date, endDate: Date): Promise<ProgressReport>;
    private calculateStatistics;
    private generateReportId;
}
//# sourceMappingURL=GetProgressReportUseCase.d.ts.map