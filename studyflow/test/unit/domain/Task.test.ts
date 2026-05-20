import { Task } from '../../../src/domain/entity/Task.js';
import { TaskStatus } from '../../../src/domain/valueobject/TaskStatus.js';
import { Priority } from '../../../src/domain/valueobject/Priority.js';

describe('Task Entity', () => {
  describe('Create Task', () => {
    it('should create a task with NOT_STARTED status by default', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      expect(task.id).toBe('task-1');
      expect(task.getTitle()).toBe('完成 TypeScript 课程');
      expect(task.getDescription()).toBe('学习 TypeScript 基础语法');
      expect(task.getStatus()).toBe(TaskStatus.NOT_STARTED);
      expect(task.getPriority()).toBe(Priority.MEDIUM);
      expect(task.getDueDate()).toBeNull();
      expect(task.getUserId()).toBe('user-1');
      expect(task.getCreatedAt()).toBeInstanceOf(Date);
      expect(task.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create a task with a due date', () => {
      const dueDate = new Date('2026-05-27');
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.HIGH,
        dueDate,
        'user-1'
      );

      expect(task.getDueDate()).toEqual(dueDate);
    });

    it('should throw error when creating high priority task without due date', () => {
      expect(() => {
        Task.create(
          'task-1',
          '完成 TypeScript 课程',
          '学习 TypeScript 基础语法',
          Priority.HIGH,
          null,
          'user-1'
        );
      }).toThrow('High priority tasks must have a due date');
    });

    it('should throw error when due date is in the past', () => {
      const pastDate = new Date('2020-01-01');

      expect(() => {
        Task.create(
          'task-1',
          '完成 TypeScript 课程',
          '学习 TypeScript 基础语法',
          Priority.MEDIUM,
          pastDate,
          'user-1'
        );
      }).toThrow('Due date cannot be before creation date');
    });
  });

  describe('Update Task', () => {
    it('should update task title', async () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      await new Promise(resolve => setTimeout(resolve, 1));

      task.updateTitle('完成 TypeScript 课程第1章');

      expect(task.getTitle()).toBe('完成 TypeScript 课程第1章');
      expect(task.getUpdatedAt().getTime()).toBeGreaterThan(task.getCreatedAt().getTime());
    });

    it('should throw error when updating title of completed task', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      task.markAsCompleted();

      expect(() => {
        task.updateTitle('新标题');
      }).toThrow('Cannot update a completed task');
    });

    it('should update task description', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      task.updateDescription('学习 TypeScript 高级特性');

      expect(task.getDescription()).toBe('学习 TypeScript 高级特性');
    });

    it('should update task priority', () => {
      const dueDate = new Date('2026-05-27');
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        dueDate,
        'user-1'
      );

      task.updatePriority(Priority.HIGH);

      expect(task.getPriority()).toBe(Priority.HIGH);
    });

    it('should throw error when updating priority to HIGH without due date', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      expect(() => {
        task.updatePriority(Priority.HIGH);
      }).toThrow('High priority tasks must have a due date');
    });

    it('should update task due date', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      const dueDate = new Date('2026-05-27');
      task.updateDueDate(dueDate);

      expect(task.getDueDate()).toEqual(dueDate);
    });

    it('should throw error when updating due date to past', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      const pastDate = new Date('2020-01-01');

      expect(() => {
        task.updateDueDate(pastDate);
      }).toThrow('Due date cannot be before creation date');
    });
  });

  describe('Update Task Status', () => {
    it('should update task status from NOT_STARTED to IN_PROGRESS', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      task.updateStatus(TaskStatus.IN_PROGRESS);

      expect(task.getStatus()).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should update task status from IN_PROGRESS to COMPLETED', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      task.updateStatus(TaskStatus.IN_PROGRESS);
      task.updateStatus(TaskStatus.COMPLETED);

      expect(task.getStatus()).toBe(TaskStatus.COMPLETED);
    });

    it('should throw error when updating status of completed task', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      task.markAsCompleted();

      expect(() => {
        task.updateStatus(TaskStatus.IN_PROGRESS);
      }).toThrow('Cannot update status of a completed task');
    });
  });

  describe('Mark as Completed', () => {
    it('should mark task as completed', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      task.markAsCompleted();

      expect(task.getStatus()).toBe(TaskStatus.COMPLETED);
    });

    it('should not throw error when marking an already completed task', () => {
      const task = Task.create(
        'task-1',
        '完成 TypeScript 课程',
        '学习 TypeScript 基础语法',
        Priority.MEDIUM,
        null,
        'user-1'
      );

      task.markAsCompleted();

      expect(() => {
        task.markAsCompleted();
      }).not.toThrow();
    });
  });
});