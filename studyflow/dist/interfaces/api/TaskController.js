import { CreateTaskUseCase } from '../../application/usecase/CreateTaskUseCase.js';
import { UpdateTaskStatusUseCase } from '../../application/usecase/UpdateTaskStatusUseCase.js';
import { GetProgressReportUseCase } from '../../application/usecase/GetProgressReportUseCase.js';
export class TaskController {
    createTaskUseCase;
    updateTaskStatusUseCase;
    getProgressReportUseCase;
    constructor(taskRepository) {
        this.createTaskUseCase = new CreateTaskUseCase(taskRepository);
        this.updateTaskStatusUseCase = new UpdateTaskStatusUseCase(taskRepository);
        this.getProgressReportUseCase = new GetProgressReportUseCase(taskRepository);
    }
    async createTask(req, res) {
        try {
            const { userId, title, description, priority, dueDate } = req.body;
            const result = await this.createTaskUseCase.execute({
                userId,
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null
            });
            res.status(201).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create task'
            });
        }
    }
    async updateTaskStatus(req, res) {
        try {
            const { taskId } = req.params;
            const { status } = req.body;
            const result = await this.updateTaskStatusUseCase.execute(taskId, status);
            if (result) {
                res.json({
                    success: true,
                    data: result
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update task status'
            });
        }
    }
    async getProgressReport(req, res) {
        try {
            const { userId } = req.params;
            const { startDate, endDate } = req.query;
            const report = await this.getProgressReportUseCase.execute(userId, new Date(startDate), new Date(endDate));
            res.json({
                success: true,
                data: {
                    reportId: report.id,
                    userId: report.getUserId(),
                    period: report.getPeriod(),
                    statistics: report.getStatistics()
                }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get progress report'
            });
        }
    }
}
//# sourceMappingURL=TaskController.js.map