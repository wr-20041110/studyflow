/// <reference types="@types/jest" />

import { HighPriorityReminderStrategy } from '../../../../src/domain/strategy/HighPriorityReminderStrategy.js';
import { Task } from '../../../../src/domain/entity/Task.js';
import { Priority } from '../../../../src/domain/valueobject/Priority.js';
import { TaskStatus } from '../../../../src/domain/valueobject/TaskStatus.js';

describe('HighPriorityReminderStrategy', () => {
  describe('shouldTrigger', () => {
    it('对于高优先级且未完成的任务应触发提醒', () => {
      const task = Task.create('task-1', '紧急任务', '这是一个紧急任务', Priority.HIGH, new Date('2026-06-15'), 'user-1');
      const strategy = new HighPriorityReminderStrategy();
      const currentTime = new Date('2026-06-14');

      expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
    });

    it('对于高优先级但已完成的任务不应触发提醒', () => {
      const task = Task.create('task-1', '紧急任务', '这是一个紧急任务', Priority.HIGH, new Date('2026-06-15'), 'user-1');
      const strategy = new HighPriorityReminderStrategy();
      const currentTime = new Date('2026-06-14');

      task.markAsCompleted();

      expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
    });

    it('对于中优先级任务不应触发提醒', () => {
      const task = Task.create('task-1', '普通任务', '这是一个普通任务', Priority.MEDIUM, new Date('2026-06-15'), 'user-1');
      const strategy = new HighPriorityReminderStrategy();
      const currentTime = new Date('2026-06-14');

      expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
    });

    it('对于低优先级任务不应触发提醒', () => {
      const task = Task.create('task-1', '低优先级任务', '这是一个低优先级任务', Priority.LOW, new Date('2026-06-15'), 'user-1');
      const strategy = new HighPriorityReminderStrategy();
      const currentTime = new Date('2026-06-14');

      expect(strategy.shouldTrigger(task, currentTime)).toBe(false);
    });

    it('对于进行中的高优先级任务应触发提醒', () => {
      const task = Task.create('task-1', '进行中的高优先级任务', '进行中', Priority.HIGH, new Date('2026-06-15'), 'user-1');
      const strategy = new HighPriorityReminderStrategy();
      const currentTime = new Date('2026-06-14');

      task.updateStatus(TaskStatus.IN_PROGRESS);

      expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
    });

    it('时间参数不应影响判断结果', () => {
      const task = Task.create('task-1', '紧急任务', '紧急', Priority.HIGH, new Date('2026-06-15'), 'user-1');
      const strategy = new HighPriorityReminderStrategy();

      const time1 = new Date('2026-01-01');
      const time2 = new Date('2026-12-31');

      expect(strategy.shouldTrigger(task, time1)).toBe(true);
      expect(strategy.shouldTrigger(task, time2)).toBe(true);
    });

    it('对于有截止日期的高优先级任务应触发提醒', () => {
      const task = Task.create('task-1', '高优先级有截止日期', '高优先级', Priority.HIGH, new Date('2026-06-15'), 'user-1');
      const strategy = new HighPriorityReminderStrategy();
      const currentTime = new Date('2026-06-14');

      expect(strategy.shouldTrigger(task, currentTime)).toBe(true);
    });
  });

  describe('generateMessage', () => {
    it('应该生成包含任务标题和高优先级标识的提醒消息', () => {
      const strategy = new HighPriorityReminderStrategy();
      const task = Task.create('task-1', '完成项目报告', '必须在本周完成', Priority.HIGH, new Date('2026-06-15'), 'user-1');

      const message = strategy.generateMessage(task);

      expect(message).toContain('完成项目报告');
      expect(message).toContain('高优先级');
    });

    it('消息应包含警告表情符号', () => {
      const strategy = new HighPriorityReminderStrategy();
      const task = Task.create('task-1', '紧急任务', '紧急', Priority.HIGH, new Date('2026-06-15'), 'user-1');

      const message = strategy.generateMessage(task);

      expect(message).toContain('🚨');
    });
  });

  describe('getStrategyName', () => {
    it('应该返回正确的策略名称', () => {
      const strategy = new HighPriorityReminderStrategy();

      expect(strategy.getStrategyName()).toBe('HighPriorityReminderStrategy');
    });
  });
});