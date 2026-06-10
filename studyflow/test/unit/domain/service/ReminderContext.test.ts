/// <reference types="@types/jest" />

import { ReminderContext } from '../../../../src/domain/service/ReminderContext.js';
import { DeadlineReminderStrategy } from '../../../../src/domain/strategy/DeadlineReminderStrategy.js';
import { HighPriorityReminderStrategy } from '../../../../src/domain/strategy/HighPriorityReminderStrategy.js';
import { Task } from '../../../../src/domain/entity/Task.js';
import { Priority } from '../../../../src/domain/valueobject/Priority.js';

describe('ReminderContext', () => {
  describe('构造函数', () => {
    it('应该使用传入的策略创建上下文', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const context = new ReminderContext(strategy);

      expect(context.getCurrentStrategy()).toBe(strategy);
    });
  });

  describe('checkReminder', () => {
    it('应该返回需要提醒的任务结果', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const context = new ReminderContext(strategy);
      const dueDate = new Date('2026-06-20T00:00:00Z');
      const task = Task.create('task-1', '测试任务', '测试描述', Priority.MEDIUM, dueDate, 'user-1');
      const currentTime = new Date('2026-06-19T00:00:00Z');

      const result = context.checkReminder(task, currentTime);

      expect(result.shouldTrigger).toBe(true);
      expect(result.message).toContain('测试任务');
      expect(result.strategyName).toBe('DeadlineReminderStrategy (1天前提醒)');
      expect(result.taskId).toBe('task-1');
      expect(result.taskTitle).toBe('测试任务');
    });

    it('应该返回不需要提醒的任务结果', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const context = new ReminderContext(strategy);
      const dueDate = new Date('2026-06-20T00:00:00Z');
      const task = Task.create('task-1', '测试任务', '测试描述', Priority.MEDIUM, dueDate, 'user-1');
      const currentTime = new Date('2026-06-18T00:00:00Z');

      const result = context.checkReminder(task, currentTime);

      expect(result.shouldTrigger).toBe(false);
      expect(result.message).toBe('');
    });

    it('对于已完成的任务应返回不需要提醒', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const context = new ReminderContext(strategy);
      const dueDate = new Date('2026-06-20T00:00:00Z');
      const task = Task.create('task-1', '测试任务', '测试描述', Priority.MEDIUM, dueDate, 'user-1');
      const currentTime = new Date('2026-06-19T00:00:00Z');

      task.markAsCompleted();

      const result = context.checkReminder(task, currentTime);

      expect(result.shouldTrigger).toBe(false);
    });
  });

  describe('checkReminders', () => {
    it('应该批量检查多个任务的提醒', () => {
      const strategy = new HighPriorityReminderStrategy();
      const context = new ReminderContext(strategy);

      const highPriorityTask = Task.create('task-1', '高优先级任务', '紧急', Priority.HIGH, new Date('2026-06-20'), 'user-1');
      const lowPriorityTask = Task.create('task-2', '低优先级任务', '不紧急', Priority.LOW, new Date('2026-06-20'), 'user-1');

      const results = context.checkReminders([highPriorityTask, lowPriorityTask], new Date('2026-06-19'));

      expect(results).toHaveLength(2);
      expect(results[0].shouldTrigger).toBe(true);
      expect(results[1].shouldTrigger).toBe(false);
    });

    it('应该返回所有任务的检查结果', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const context = new ReminderContext(strategy);
      const currentTime = new Date('2026-06-19T00:00:00Z');

      const task1 = Task.create('task-1', '任务1', '描述1', Priority.MEDIUM, new Date('2026-06-20'), 'user-1');
      const task2 = Task.create('task-2', '任务2', '描述2', Priority.MEDIUM, new Date('2026-06-11'), 'user-1');

      const results = context.checkReminders([task1, task2], currentTime);

      expect(results).toHaveLength(2);
      expect(results[0].taskTitle).toBe('任务1');
      expect(results[1].taskTitle).toBe('任务2');
    });
  });

  describe('getTasksNeedingReminder', () => {
    it('应该只返回需要提醒的任务', () => {
      const strategy = new HighPriorityReminderStrategy();
      const context = new ReminderContext(strategy);

      const highPriorityTask = Task.create('task-1', '高优先级任务', '紧急', Priority.HIGH, new Date('2026-06-20'), 'user-1');
      const lowPriorityTask = Task.create('task-2', '低优先级任务', '不紧急', Priority.LOW, new Date('2026-06-20'), 'user-1');

      const results = context.getTasksNeedingReminder([highPriorityTask, lowPriorityTask], new Date('2026-06-19'));

      expect(results).toHaveLength(1);
      expect(results[0].taskId).toBe('task-1');
      expect(results[0].shouldTrigger).toBe(true);
    });

    it('应该返回空数组如果没有任务需要提醒', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const context = new ReminderContext(strategy);

      const task1 = Task.create('task-1', '任务1', '描述1', Priority.MEDIUM, new Date('2026-06-20'), 'user-1');
      const task2 = Task.create('task-2', '任务2', '描述2', Priority.MEDIUM, new Date('2026-06-15'), 'user-1');

      // currentTime = Jun 17: task1 due in 3 days (3 ≠ 1), task2 past → neither triggers
      const results = context.getTasksNeedingReminder([task1, task2], new Date('2026-06-17'));

      expect(results).toHaveLength(0);
    });

    it('应该正确处理多个需要提醒的任务', () => {
      const strategy = new HighPriorityReminderStrategy();
      const context = new ReminderContext(strategy);

      const highPriorityTask1 = Task.create('task-1', '高优先级任务1', '紧急1', Priority.HIGH, new Date('2026-06-20'), 'user-1');
      const highPriorityTask2 = Task.create('task-2', '高优先级任务2', '紧急2', Priority.HIGH, new Date('2026-06-11'), 'user-1');
      const lowPriorityTask = Task.create('task-3', '低优先级任务', '不紧急', Priority.LOW, new Date('2026-06-20'), 'user-1');

      const results = context.getTasksNeedingReminder([highPriorityTask1, highPriorityTask2, lowPriorityTask], new Date('2026-06-19'));

      expect(results).toHaveLength(2);
      expect(results.every((r: any) => r.shouldTrigger)).toBe(true);
    });
  });

  describe('setStrategy', () => {
    it('应该能够切换策略', () => {
      const strategy1 = new DeadlineReminderStrategy(1);
      const context = new ReminderContext(strategy1);

      expect(context.getCurrentStrategy()).toBe(strategy1);

      const strategy2 = new HighPriorityReminderStrategy();
      context.setStrategy(strategy2);

      expect(context.getCurrentStrategy()).toBe(strategy2);
    });

    it('切换策略后应使用新策略进行检查', () => {
      const strategy1 = new DeadlineReminderStrategy(1);
      const strategy2 = new HighPriorityReminderStrategy();
      const context = new ReminderContext(strategy1);

      const task = Task.create('task-1', '高优先级任务', '紧急', Priority.HIGH, new Date('2026-06-20'), 'user-1');
      // currentTime = Jun 17: 3 days before due → Deadline(1) won't trigger
      const currentTime = new Date('2026-06-17');

      // 使用第一种策略不会触发
      let result = context.checkReminder(task, currentTime);
      expect(result.shouldTrigger).toBe(false);

      // 切换策略
      context.setStrategy(strategy2);

      // 使用新策略会触发
      result = context.checkReminder(task, currentTime);
      expect(result.shouldTrigger).toBe(true);
    });
  });
});