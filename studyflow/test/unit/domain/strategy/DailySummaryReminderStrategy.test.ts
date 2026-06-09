/// <reference types="@types/jest" />

import { DailySummaryReminderStrategy } from '../../../../src/domain/strategy/DailySummaryReminderStrategy.js';
import { Task } from '../../../../src/domain/entity/Task.js';
import { Priority } from '../../../../src/domain/valueobject/Priority.js';
import { TaskStatus } from '../../../../src/domain/valueobject/TaskStatus.js';

describe('DailySummaryReminderStrategy', () => {
  describe('构造函数', () => {
    it('应该创建默认为9:00汇总的策略', () => {
      const strategy = new DailySummaryReminderStrategy();

      expect(strategy.getStrategyName()).toBe('DailySummaryReminderStrategy (9:00)');
    });

    it('应该创建指定时间的汇总策略', () => {
      const strategy = new DailySummaryReminderStrategy({ hour: 18, minute: 30 });

      expect(strategy.getStrategyName()).toBe('DailySummaryReminderStrategy (18:00)');
    });

    it('应该拒绝创建无效小时数的策略', () => {
      expect(() => new DailySummaryReminderStrategy({ hour: -1, minute: 0 })).toThrow('Hour must be between 0 and 23');
      expect(() => new DailySummaryReminderStrategy({ hour: 24, minute: 0 })).toThrow('Hour must be between 0 and 23');
    });

    it('应该拒绝创建无效分钟数的策略', () => {
      expect(() => new DailySummaryReminderStrategy({ hour: 9, minute: -1 })).toThrow('Minute must be between 0 and 59');
      expect(() => new DailySummaryReminderStrategy({ hour: 9, minute: 60 })).toThrow('Minute must be between 0 and 59');
    });
  });

  describe('shouldTrigger', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create('task-1', '测试任务', '测试描述', Priority.MEDIUM, new Date('2026-06-12'), 'user-1');
    });

    it('在指定汇总时间应对未完成任务触发提醒', () => {
      const strategy = new DailySummaryReminderStrategy({ hour: 9, minute: 0 });
      const currentTime = new Date('2026-06-11T09:00:00');

      expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
    });

    it('在指定汇总时间应对进行中的任务触发提醒', () => {
      const strategy = new DailySummaryReminderStrategy({ hour: 18, minute: 0 });
      const currentTime = new Date('2026-06-11T18:00:00');

      task.updateStatus(TaskStatus.IN_PROGRESS);

      expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
    });

    it('在非汇总时间不应触发提醒', () => {
      const strategy = new DailySummaryReminderStrategy({ hour: 9, minute: 0 });
      const currentTime = new Date('2026-06-11T08:59:00');

      expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
    });

    it('对于已完成的任务不应触发提醒', () => {
      const strategy = new DailySummaryReminderStrategy({ hour: 9, minute: 0 });
      const currentTime = new Date('2026-06-11T09:00:00');

      task.markAsCompleted();

      expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
    });

    it('应该正确处理不同日期的同一时间', () => {
      const strategy = new DailySummaryReminderStrategy({ hour: 9, minute: 0 });
      const time1 = new Date('2026-06-11T09:00:00');
      const time2 = new Date('2026-06-12T09:00:00');
      const time3 = new Date('2026-06-13T09:00:00');

      expect(strategy.shouldTrigger(task, time1)).toBe(true);
      expect(strategy.shouldTrigger(task, time2)).toBe(true);
      expect(strategy.shouldTrigger(task, time3)).toBe(true);
    });

    describe('边界值测试', () => {
      it('应该正确处理汇总时间的前一分钟', () => {
        const strategy = new DailySummaryReminderStrategy({ hour: 9, minute: 0 });
        const currentTime = new Date('2026-06-10T09:00:00');
        currentTime.setMinutes(59);

        expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
      });

      it('应该正确处理汇总时间的后一分钟', () => {
        const strategy = new DailySummaryReminderStrategy({ hour: 9, minute: 0 });
        const currentTime = new Date('2026-06-10T09:00:00');
        currentTime.setMinutes(1);

        expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
      });

      it('应该正确处理边界时间点（23:59）', () => {
        const strategy = new DailySummaryReminderStrategy({ hour: 23, minute: 59 });
        const currentTime = new Date('2026-06-10T23:59:00');

        expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
      });

      it('应该正确处理边界时间点（00:00）', () => {
        const strategy = new DailySummaryReminderStrategy({ hour: 0, minute: 0 });
        const currentTime = new Date('2026-06-11T00:00:00');

        expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
      });
    });
  });

  describe('generateMessage', () => {
    it('应该生成包含任务标题的汇总消息', () => {
      const strategy = new DailySummaryReminderStrategy();
      const task = Task.create('task-1', '完成 TypeScript 课程', '学习 TypeScript', Priority.MEDIUM, new Date('2026-06-10'), 'user-1');

      const message = strategy.generateMessage(task);

      expect(message).toContain('完成 TypeScript 课程');
    });

    it('消息应包含每日汇总标识', () => {
      const strategy = new DailySummaryReminderStrategy();
      const task = Task.create('task-1', '测试任务', '测试', Priority.MEDIUM, new Date('2026-06-10'), 'user-1');

      const message = strategy.generateMessage(task);

      expect(message).toContain('每日汇总');
    });
  });
});