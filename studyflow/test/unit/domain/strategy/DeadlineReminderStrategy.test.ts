/// <reference types="@types/jest" />

import { DeadlineReminderStrategy } from '../../../../src/domain/strategy/DeadlineReminderStrategy.js';
import { Task } from '../../../../src/domain/entity/Task.js';
import { Priority } from '../../../../src/domain/valueobject/Priority.js';

describe('DeadlineReminderStrategy', () => {
  describe('构造函数', () => {
    it('应该创建默认为1天前提醒的策略', () => {
      const strategy = new DeadlineReminderStrategy();

      expect(strategy.getStrategyName()).toBe('DeadlineReminderStrategy (1天前提醒)');
    });

    it('应该创建指定天数前提醒的策略', () => {
      const strategy = new DeadlineReminderStrategy(3);

      expect(strategy.getStrategyName()).toBe('DeadlineReminderStrategy (3天前提醒)');
    });

    it('应该拒绝创建非正天数前提醒的策略', () => {
      expect(() => new DeadlineReminderStrategy(0)).toThrow('daysBeforeDeadline must be greater than 0');
      expect(() => new DeadlineReminderStrategy(-1)).toThrow('daysBeforeDeadline must be greater than 0');
    });
  });

  describe('shouldTrigger', () => {
    let task: Task;

    beforeEach(() => {
      const dueDate = new Date('2026-06-15T00:00:00Z');
      task = Task.create('task-1', '测试任务', '测试描述', Priority.MEDIUM, dueDate, 'user-1');
    });

    it('当任务恰好在指定天数前到期时应触发提醒', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const currentTime = new Date('2026-06-14T00:00:00Z'); // 1天后到期

      expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
    });

    it('当任务在2天后到期时应触发2天前提醒策略', () => {
      const strategy = new DeadlineReminderStrategy(2);
      const currentTime = new Date('2026-06-13T00:00:00Z'); // 2天后到期

      expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
    });

    it('当任务不在指定天数前到期时不应触发提醒', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const currentTime = new Date('2026-06-13T00:00:00Z'); // 2天后到期

      expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
    });

    it('对于没有截止日期的任务不应触发提醒', () => {
      const taskWithoutDueDate = Task.create('task-2', '无截止日期任务', '测试描述', Priority.LOW, null, 'user-1');
      const strategy = new DeadlineReminderStrategy(1);
      const currentTime = new Date('2026-06-14T00:00:00Z');

      expect(strategy.shouldTrigger(taskWithoutDueDate, currentTime)).toBe(false);
    });

    it('对于已完成的任务不应触发提醒', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const currentTime = new Date('2026-06-14T00:00:00Z');

      task.markAsCompleted();

      expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
    });

    it('当任务已过期时不应触发提醒', () => {
      const strategy = new DeadlineReminderStrategy(1);
      const currentTime = new Date('2026-06-16T00:00:00Z'); // 已过期

      expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
    });

    describe('边界值测试', () => {
      it('应该在到期当天（0天）不触发提醒', () => {
        const strategy = new DeadlineReminderStrategy(1);
        const currentTime = new Date('2026-06-15T00:00:00Z'); // 到期当天

        expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
      });

      it('应该正确处理小时级别的差异', () => {
        const strategy = new DeadlineReminderStrategy(1);
        const currentTime = new Date('2026-06-13T12:00:00Z'); // 1.5天后到期

        expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
      });
    });
  });

  describe('generateMessage', () => {
    it('应该生成包含任务标题和到期日期的提醒消息', () => {
      const strategy = new DeadlineReminderStrategy(2);
      const dueDate = new Date('2026-06-15T00:00:00Z');
      const task = Task.create('task-1', '完成 TypeScript 课程', '学习 TypeScript 基础', Priority.MEDIUM, dueDate, 'user-1');

      const message = strategy.generateMessage(task);

      expect(message).toContain('完成 TypeScript 课程');
      expect(message).toContain('2 天后到期');
      expect(message).toContain('2026/6/15');
    });

    it('应该生成包含默认天数的提醒消息', () => {
      const strategy = new DeadlineReminderStrategy();
      const dueDate = new Date('2026-06-15T00:00:00Z');
      const task = Task.create('task-1', '测试任务', '测试描述', Priority.MEDIUM, dueDate, 'user-1');

      const message = strategy.generateMessage(task);

      expect(message).toContain('1 天后到期');
    });
  });
});