import { CreateTaskUseCase } from '../../../src/application/usecase/CreateTaskUseCase.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/repository/InMemoryTaskRepository.js';
import { Priority } from '../../../src/domain/valueobject/Priority.js';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
    useCase = new CreateTaskUseCase(repository);
  });

  it('should create a task successfully', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      title: '完成 TypeScript 课程',
      description: '学习 TypeScript 基础语法',
      priority: Priority.MEDIUM,
      dueDate: null
    });

    expect(result.title).toBe('完成 TypeScript 课程');
    expect(result.description).toBe('学习 TypeScript 基础语法');
    expect(result.priority).toBe(Priority.MEDIUM);
    expect(result.status).toBe('NOT_STARTED');
    expect(result.userId).toBe('user-1');
    expect(result.dueDate).toBeNull();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.id).toMatch(/^task-\d+-[a-z0-9]+$/);
  });

  it('should create a task with due date', async () => {
    const dueDate = new Date('2026-05-27');

    const result = await useCase.execute({
      userId: 'user-1',
      title: '完成 TypeScript 课程',
      description: '学习 TypeScript 基础语法',
      priority: Priority.HIGH,
      dueDate
    });

    expect(result.dueDate).toEqual(dueDate);
  });

  it('should throw error when creating high priority task without due date', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        title: '完成 TypeScript 课程',
        description: '学习 TypeScript 基础语法',
        priority: Priority.HIGH,
        dueDate: null
      })
    ).rejects.toThrow('High priority tasks must have a due date');
  });

  it('should generate unique task ids', async () => {
    const result1 = await useCase.execute({
      userId: 'user-1',
      title: '任务1',
      description: '描述1',
      priority: Priority.MEDIUM,
      dueDate: null
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    const result2 = await useCase.execute({
      userId: 'user-1',
      title: '任务2',
      description: '描述2',
      priority: Priority.MEDIUM,
      dueDate: null
    });

    expect(result1.id).not.toBe(result2.id);
  });
});