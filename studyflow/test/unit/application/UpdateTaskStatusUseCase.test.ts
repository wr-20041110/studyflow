import { UpdateTaskStatusUseCase } from '../../../src/application/usecase/UpdateTaskStatusUseCase.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/repository/InMemoryTaskRepository.js';
import { Task } from '../../../src/domain/entity/Task.js';
import { TaskStatus } from '../../../src/domain/valueobject/TaskStatus.js';
import { Priority } from '../../../src/domain/valueobject/Priority.js';

describe('UpdateTaskStatusUseCase', () => {
  let useCase: UpdateTaskStatusUseCase;
  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
    useCase = new UpdateTaskStatusUseCase(repository);
  });

  it('should update task status successfully', async () => {
    const task = Task.create(
      'task-1',
      '完成 TypeScript 课程',
      '学习 TypeScript 基础语法',
      Priority.MEDIUM,
      null,
      'user-1'
    );
    await repository.save(task);

    const result = await useCase.execute('task-1', TaskStatus.IN_PROGRESS);

    expect(result).not.toBeNull();
    expect(result?.status).toBe(TaskStatus.IN_PROGRESS);
    expect(result?.id).toBe('task-1');
  });

  it('should return null when task not found', async () => {
    const result = await useCase.execute('non-existent', TaskStatus.IN_PROGRESS);

    expect(result).toBeNull();
  });

  it('should update status from NOT_STARTED to IN_PROGRESS', async () => {
    const task = Task.create(
      'task-1',
      '完成 TypeScript 课程',
      '学习 TypeScript 基础语法',
      Priority.MEDIUM,
      null,
      'user-1'
    );
    await repository.save(task);

    const result = await useCase.execute('task-1', TaskStatus.IN_PROGRESS);

    expect(result?.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should update status from IN_PROGRESS to COMPLETED', async () => {
    const task = Task.create(
      'task-1',
      '完成 TypeScript 课程',
      '学习 TypeScript 基础语法',
      Priority.MEDIUM,
      null,
      'user-1'
    );
    task.updateStatus(TaskStatus.IN_PROGRESS);
    await repository.save(task);

    const result = await useCase.execute('task-1', TaskStatus.COMPLETED);

    expect(result?.status).toBe(TaskStatus.COMPLETED);
  });

  it('should throw error when updating status of completed task', async () => {
    const task = Task.create(
      'task-1',
      '完成 TypeScript 课程',
      '学习 TypeScript 基础语法',
      Priority.MEDIUM,
      null,
      'user-1'
    );
    task.markAsCompleted();
    await repository.save(task);

    await expect(
      useCase.execute('task-1', TaskStatus.IN_PROGRESS)
    ).rejects.toThrow('Cannot update status of a completed task');
  });
});