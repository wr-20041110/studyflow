// @ts-ignore
import { CreateTaskUseCase } from '../../../src/application/usecase/CreateTaskUseCase.js';
// @ts-ignore
import { UpdateTaskStatusUseCase } from '../../../src/application/usecase/UpdateTaskStatusUseCase.js';
// @ts-ignore
import { GetProgressReportUseCase } from '../../../src/application/usecase/GetProgressReportUseCase.js';
// @ts-ignore
import { InMemoryTaskRepository } from '../../../src/infrastructure/repository/InMemoryTaskRepository.js';
// @ts-ignore
import { TaskStatus } from '../../../src/domain/valueobject/TaskStatus.js';
// @ts-ignore
import { Priority } from '../../../src/domain/valueobject/Priority.js';

describe('Task Management Integration', () => {
  let createTaskUseCase: CreateTaskUseCase;
  let updateTaskStatusUseCase: UpdateTaskStatusUseCase;
  let getProgressReportUseCase: GetProgressReportUseCase;
  let repository: InMemoryTaskRepository;
  const userId = 'user-1';

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
    createTaskUseCase = new CreateTaskUseCase(repository);
    updateTaskStatusUseCase = new UpdateTaskStatusUseCase(repository);
    getProgressReportUseCase = new GetProgressReportUseCase(repository);
  });

  describe('Complete Task Lifecycle', () => {
    it('should create, update status and track progress', async () => {
      const startDate = new Date('2026-12-01');
      const endDate = new Date('2026-12-31');

      const initialReport = await getProgressReportUseCase.execute(userId, startDate, endDate);
      expect(initialReport.getStatistics().totalTasks).toBe(0);

      const task1 = await createTaskUseCase.execute({
        userId,
        title: '完成 TypeScript 课程',
        description: '学习 TypeScript 基础语法',
        priority: Priority.HIGH,
        dueDate: new Date('2026-12-27')
      });

      const task2 = await createTaskUseCase.execute({
        userId,
        title: '复习 JavaScript 闭包',
        description: '理解闭包原理',
        priority: Priority.MEDIUM,
        dueDate: null
      });

      const task3 = await createTaskUseCase.execute({
        userId,
        title: '学习 React Hooks',
        description: '掌握 useState 和 useEffect',
        priority: Priority.LOW,
        dueDate: null
      });
      void task3;

      const reportAfterCreation = await getProgressReportUseCase.execute(userId, startDate, endDate);
      expect(reportAfterCreation.getStatistics().totalTasks).toBe(3);
      expect(reportAfterCreation.getStatistics().notStartedTasks).toBe(3);
      expect(reportAfterCreation.getStatistics().completionRate).toBe(0);

      await updateTaskStatusUseCase.execute(task1.id, TaskStatus.IN_PROGRESS);
      await updateTaskStatusUseCase.execute(task2.id, TaskStatus.IN_PROGRESS);

      const reportAfterUpdate = await getProgressReportUseCase.execute(userId, startDate, endDate);
      expect(reportAfterUpdate.getStatistics().totalTasks).toBe(3);
      expect(reportAfterUpdate.getStatistics().inProgressTasks).toBe(2);
      expect(reportAfterUpdate.getStatistics().notStartedTasks).toBe(1);

      await updateTaskStatusUseCase.execute(task1.id, TaskStatus.COMPLETED);
      await updateTaskStatusUseCase.execute(task2.id, TaskStatus.COMPLETED);

      const finalReport = await getProgressReportUseCase.execute(userId, startDate, endDate);
      expect(finalReport.getStatistics().totalTasks).toBe(3);
      expect(finalReport.getStatistics().completedTasks).toBe(2);
      expect(finalReport.getStatistics().inProgressTasks).toBe(0);
      expect(finalReport.getStatistics().notStartedTasks).toBe(1);
      expect(finalReport.getStatistics().completionRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('Multiple Users', () => {
    it('should track progress separately for different users', async () => {
      const startDate = new Date('2026-12-01');
      const endDate = new Date('2026-12-31');
      const user1Id = 'user-1';
      const user2Id = 'user-2';

      await createTaskUseCase.execute({
        userId: user1Id,
        title: '用户1的任务',
        description: '描述',
        priority: Priority.MEDIUM,
        dueDate: null
      });

      await createTaskUseCase.execute({
        userId: user2Id,
        title: '用户2的任务',
        description: '描述',
        priority: Priority.MEDIUM,
        dueDate: null
      });

      const report1 = await getProgressReportUseCase.execute(user1Id, startDate, endDate);
      const report2 = await getProgressReportUseCase.execute(user2Id, startDate, endDate);

      expect(report1.getStatistics().totalTasks).toBe(1);
      expect(report2.getStatistics().totalTasks).toBe(1);
      expect(report1.getUserId()).toBe(user1Id);
      expect(report2.getUserId()).toBe(user2Id);
    });
  });

  describe('Task Filtering', () => {
    it('should filter tasks by various criteria', async () => {
      const dueDate = new Date('2026-12-27');

      await createTaskUseCase.execute({
        userId,
        title: '高优先级任务',
        description: '描述',
        priority: Priority.HIGH,
        dueDate
      });

      await createTaskUseCase.execute({
        userId,
        title: '中优先级任务',
        description: '描述',
        priority: Priority.MEDIUM,
        dueDate
      });

      await createTaskUseCase.execute({
        userId,
        title: '低优先级任务',
        description: '描述',
        priority: Priority.LOW,
        dueDate
      });

      const highPriorityTasks = await repository.findByPriority(Priority.HIGH);
      const mediumPriorityTasks = await repository.findByPriority(Priority.MEDIUM);
      const lowPriorityTasks = await repository.findByPriority(Priority.LOW);

      expect(highPriorityTasks.length).toBe(1);
      expect(mediumPriorityTasks.length).toBe(1);
      expect(lowPriorityTasks.length).toBe(1);

      expect(highPriorityTasks[0].getTitle()).toBe('高优先级任务');
    });
  });
});