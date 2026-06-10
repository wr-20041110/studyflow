import { FilterTasksByTagsUseCase } from '../../../src/application/usecase/FilterTasksByTagsUseCase.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/repository/InMemoryTaskRepository.js';
import { CreateTaskUseCase } from '../../../src/application/usecase/CreateTaskUseCase.js';
import { Priority } from '../../../src/domain/valueobject/Priority.js';

describe('FilterTasksByTagsUseCase', () => {
  let filterUseCase: FilterTasksByTagsUseCase;
  let createUseCase: CreateTaskUseCase;
  let repository: InMemoryTaskRepository;

  beforeEach(async () => {
    repository = new InMemoryTaskRepository();
    filterUseCase = new FilterTasksByTagsUseCase(repository);
    createUseCase = new CreateTaskUseCase(repository);

    // 创建测试数据
    await createUseCase.execute({
      title: '完成数学作业',
      description: '第三章习题',
      priority: Priority.HIGH,
      dueDate: new Date('2026-06-15'),
      userId: 'user-1',
      tags: ['数学', '作业']
    });

    await createUseCase.execute({
      title: '完成英语作业',
      description: '英语作文',
      priority: Priority.MEDIUM,
      dueDate: null,
      userId: 'user-1',
      tags: ['英语', '作业']
    });

    await createUseCase.execute({
      title: '学习 TypeScript',
      description: '类型系统',
      priority: Priority.LOW,
      dueDate: null,
      userId: 'user-1',
      tags: ['编程', 'TypeScript']
    });

    await createUseCase.execute({
      title: 'User2 Task',
      description: 'Other user task',
      priority: Priority.MEDIUM,
      dueDate: null,
      userId: 'user-2',
      tags: ['数学']
    });
  });

  describe('按标签筛选', () => {
    it('应返回包含指定标签的任务', async () => {
      const results = await filterUseCase.execute({
        tags: ['数学'],
        userId: 'user-1'
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('完成数学作业');
      expect(results[0].tags.some((t: { name: string }) => t.name === '数学')).toBe(true);
    });

    it('应使用 OR 语义筛选多个标签', async () => {
      const results = await filterUseCase.execute({
        tags: ['数学', '英语'],
        userId: 'user-1'
      });

      expect(results).toHaveLength(2);
      expect(results.map(r => r.title)).toContain('完成数学作业');
      expect(results.map(r => r.title)).toContain('完成英语作业');
    });

    it('应正确筛选标签名为"作业"的任务', async () => {
      const results = await filterUseCase.execute({
        tags: ['作业'],
        userId: 'user-1'
      });

      expect(results).toHaveLength(2);
    });

    it('应返回空数组当没有匹配标签', async () => {
      const results = await filterUseCase.execute({
        tags: ['不存在的标签'],
        userId: 'user-1'
      });

      expect(results).toHaveLength(0);
    });

    it('应返回空数组当标签参数为空', async () => {
      const results = await filterUseCase.execute({
        tags: [],
        userId: 'user-1'
      });

      expect(results).toHaveLength(0);
    });
  });

  describe('用户隔离', () => {
    it('应只返回指定用户的任务', async () => {
      const user1Results = await filterUseCase.execute({
        tags: ['数学'],
        userId: 'user-1'
      });

      const user2Results = await filterUseCase.execute({
        tags: ['数学'],
        userId: 'user-2'
      });

      expect(user1Results).toHaveLength(1);
      expect(user1Results[0].userId).toBe('user-1');

      expect(user2Results).toHaveLength(1);
      expect(user2Results[0].userId).toBe('user-2');
    });

    it('无 userId 时应返回所有匹配标签的任务', async () => {
      const results = await filterUseCase.execute({
        tags: ['数学']
      });

      expect(results).toHaveLength(2);
    });
  });

  describe('返回的 DTO', () => {
    it('应包含完整的标签信息', async () => {
      const results = await filterUseCase.execute({
        tags: ['编程'],
        userId: 'user-1'
      });

      expect(results).toHaveLength(1);
      expect(results[0].tags).toBeDefined();
      expect(results[0].tags.length).toBe(2);
      expect(results[0].tags[0]).toHaveProperty('name');
      expect(results[0].tags[0]).toHaveProperty('color');
    });
  });
});
