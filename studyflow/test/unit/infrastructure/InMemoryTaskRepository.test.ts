import { InMemoryTaskRepository } from '../../../src/infrastructure/repository/InMemoryTaskRepository.js';
import { Task } from '../../../src/domain/entity/Task.js';
import { TaskStatus } from '../../../src/domain/valueobject/TaskStatus.js';
import { Priority } from '../../../src/domain/valueobject/Priority.js';
import { Tag } from '../../../src/domain/valueobject/Tag.js';

describe('InMemoryTaskRepository', () => {
  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  it('should save a task', async () => {
    const task = Task.create(
      'task-1',
      '完成 TypeScript 课程',
      '学习 TypeScript 基础语法',
      Priority.MEDIUM,
      null,
      'user-1'
    );

    await repository.save(task);

    const found = await repository.findById('task-1');
    expect(found).not.toBeNull();
    expect(found?.getTitle()).toBe('完成 TypeScript 课程');
  });

  it('should find task by id', async () => {
    const task = Task.create(
      'task-1',
      '完成 TypeScript 课程',
      '学习 TypeScript 基础语法',
      Priority.MEDIUM,
      null,
      'user-1'
    );

    await repository.save(task);

    const found = await repository.findById('task-1');
    expect(found).not.toBeNull();
    expect(found?.getTitle()).toBe('完成 TypeScript 课程');
  });

  it('should return null when task not found', async () => {
    const found = await repository.findById('non-existent');
    expect(found).toBeNull();
  });

  it('should find tasks by user id', async () => {
    const dueDate = new Date('2026-12-27');
    const task1 = Task.create('task-1', '任务1', '描述1', Priority.MEDIUM, null, 'user-1');
    const task2 = Task.create('task-2', '任务2', '描述2', Priority.HIGH, dueDate, 'user-1');
    const task3 = Task.create('task-3', '任务3', '描述3', Priority.LOW, null, 'user-2');

    await repository.save(task1);
    await repository.save(task2);
    await repository.save(task3);

    const tasks = await repository.findByUserId('user-1');

    expect(tasks.length).toBe(2);
    expect(tasks.some(t => t.id === 'task-1')).toBe(true);
    expect(tasks.some(t => t.id === 'task-2')).toBe(true);
  });

  it('should delete a task', async () => {
    const task = Task.create(
      'task-1',
      '完成 TypeScript 课程',
      '学习 TypeScript 基础语法',
      Priority.MEDIUM,
      null,
      'user-1'
    );

    await repository.save(task);
    await repository.delete('task-1');

    const found = await repository.findById('task-1');
    expect(found).toBeNull();
  });

  it('should find tasks by status', async () => {
    const dueDate = new Date('2026-12-27');
    const task1 = Task.create('task-1', '任务1', '描述1', Priority.MEDIUM, null, 'user-1');
    const task2 = Task.create('task-2', '任务2', '描述2', Priority.HIGH, dueDate, 'user-1');
    const task3 = Task.create('task-3', '任务3', '描述3', Priority.LOW, null, 'user-1');

    task1.updateStatus(TaskStatus.IN_PROGRESS);
    task2.updateStatus(TaskStatus.IN_PROGRESS);
    task3.markAsCompleted();

    await repository.save(task1);
    await repository.save(task2);
    await repository.save(task3);

    const tasks = await repository.findByStatus(TaskStatus.IN_PROGRESS);

    expect(tasks.length).toBe(2);
  });

  it('should find tasks by priority', async () => {
    const dueDate = new Date('2026-12-27');
    const task1 = Task.create('task-1', '任务1', '描述1', Priority.HIGH, dueDate, 'user-1');
    const task2 = Task.create('task-2', '任务2', '描述2', Priority.HIGH, dueDate, 'user-1');
    const task3 = Task.create('task-3', '任务3', '描述3', Priority.LOW, null, 'user-1');

    await repository.save(task1);
    await repository.save(task2);
    await repository.save(task3);

    const tasks = await repository.findByPriority(Priority.HIGH);

    expect(tasks.length).toBe(2);
  });

  it('should find tasks by user id and status', async () => {
    const dueDate = new Date('2026-12-27');
    const task1 = Task.create('task-1', '任务1', '描述1', Priority.MEDIUM, null, 'user-1');
    const task2 = Task.create('task-2', '任务2', '描述2', Priority.HIGH, dueDate, 'user-1');
    const task3 = Task.create('task-3', '任务3', '描述3', Priority.LOW, null, 'user-2');

    task1.updateStatus(TaskStatus.IN_PROGRESS);
    task2.markAsCompleted();

    await repository.save(task1);
    await repository.save(task2);
    await repository.save(task3);

    const tasks = await repository.findByUserIdAndStatus('user-1', TaskStatus.IN_PROGRESS);

    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('task-1');
  });

  it('should clear all tasks', async () => {
    const dueDate = new Date('2026-12-27');
    const task1 = Task.create('task-1', '任务1', '描述1', Priority.MEDIUM, null, 'user-1');
    const task2 = Task.create('task-2', '任务2', '描述2', Priority.HIGH, dueDate, 'user-1');

    await repository.save(task1);
    await repository.save(task2);

    repository.clear();

    expect(repository.size()).toBe(0);
  });

  it('should return correct task count', async () => {
    const dueDate = new Date('2026-12-27');
    const task1 = Task.create('task-1', '任务1', '描述1', Priority.MEDIUM, null, 'user-1');
    const task2 = Task.create('task-2', '任务2', '描述2', Priority.HIGH, dueDate, 'user-1');

    expect(repository.size()).toBe(0);

    await repository.save(task1);
    expect(repository.size()).toBe(1);

    await repository.save(task2);
    expect(repository.size()).toBe(2);
  });

  describe('findByTags', () => {
    it('should find tasks by single tag', async () => {
      const dueDate = new Date('2026-06-15');
      const task1 = Task.create('task-1', '数学作业', '描述', Priority.HIGH, dueDate, 'user-1', [Tag.fromName('数学')]);
      const task2 = Task.create('task-2', '英语作业', '描述', Priority.MEDIUM, null, 'user-1', [Tag.fromName('英语')]);

      await repository.save(task1);
      await repository.save(task2);

      const result = await repository.findByTags(['数学']);
      expect(result.length).toBe(1);
      expect(result[0].getTitle()).toBe('数学作业');
    });

    it('should find tasks by multiple tags (OR semantics)', async () => {
      const dueDate = new Date('2026-06-15');
      const task1 = Task.create('task-1', '数学作业', '描述', Priority.HIGH, dueDate, 'user-1', [Tag.fromName('数学')]);
      const task2 = Task.create('task-2', '英语作业', '描述', Priority.MEDIUM, null, 'user-1', [Tag.fromName('英语')]);
      const task3 = Task.create('task-3', '物理作业', '描述', Priority.LOW, null, 'user-1', [Tag.fromName('物理')]);

      await repository.save(task1);
      await repository.save(task2);
      await repository.save(task3);

      const result = await repository.findByTags(['数学', '英语']);
      expect(result.length).toBe(2);
    });

    it('should return empty array for empty tag list', async () => {
      const result = await repository.findByTags([]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when no tasks match tags', async () => {
      const dueDate = new Date('2026-06-15');
      const task1 = Task.create('task-1', '数学作业', '描述', Priority.HIGH, dueDate, 'user-1', [Tag.fromName('数学')]);
      await repository.save(task1);

      const result = await repository.findByTags(['不存在的标签']);
      expect(result).toHaveLength(0);
    });

    it('should match task with multiple tags', async () => {
      const dueDate = new Date('2026-06-15');
      const task1 = Task.create('task-1', '编程作业', '描述', Priority.HIGH, dueDate, 'user-1', [
        Tag.fromName('编程'),
        Tag.fromName('TypeScript')
      ]);
      await repository.save(task1);

      const result = await repository.findByTags(['TypeScript']);
      expect(result.length).toBe(1);
      expect(result[0].hasTagByName('TypeScript')).toBe(true);
      expect(result[0].hasTagByName('编程')).toBe(true);
    });
  });
});