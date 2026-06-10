/// <reference types="@types/jest" />
import { jest } from '@jest/globals';

import { ReminderService } from '../../../../src/application/service/ReminderService.js';
import { IReminderService } from '../../../../src/application/service/ReminderService.js';
import { ITaskRepository } from '../../../../src/domain/repository/ITaskRepository.js';
import { INotificationService } from '../../../../src/infrastructure/notification/ConsoleNotificationService.js';
import { DeadlineReminderStrategy } from '../../../../src/domain/strategy/DeadlineReminderStrategy.js';
import { HighPriorityReminderStrategy } from '../../../../src/domain/strategy/HighPriorityReminderStrategy.js';
import { Task } from '../../../../src/domain/entity/Task.js';
import { Priority } from '../../../../src/domain/valueobject/Priority.js';

describe('ReminderService', () => {
  let reminderService: ReminderService;
  let mockRepository: jest.Mocked<ITaskRepository>;
  let mockNotificationService: jest.Mocked<INotificationService>;

  beforeEach(() => {
    mockNotificationService = {
      sendNotification: jest.fn(),
    } as unknown as jest.Mocked<INotificationService>;

    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      findByStatus: jest.fn(),
      findByPriority: jest.fn(),
      findByUserIdAndStatus: jest.fn(),
    } as unknown as jest.Mocked<ITaskRepository>;

    reminderService = new ReminderService(mockRepository, mockNotificationService);
  });

  describe('checkReminders', () => {
    it('应该检查所有策略并发送提醒', async () => {
      const strategy1 = new HighPriorityReminderStrategy();
      const strategy2 = new DeadlineReminderStrategy(1);

      const highPriorityTask = Task.create('task-1', '高优先级任务', '紧急', Priority.HIGH, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'user-1');
      const deadlineTask = Task.create('task-2', '到期任务', '将到期', Priority.MEDIUM, new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 'user-1');

      mockRepository.findByUserId.mockResolvedValue([highPriorityTask, deadlineTask]);

      const count = await reminderService.checkReminders('user-1', [strategy1, strategy2]);

      expect(count).toBe(2);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('如果没有任务需要提醒应返回0', async () => {
      const strategy = new DeadlineReminderStrategy(1);
      const task = Task.create('task-1', '普通任务', '不紧急', Priority.LOW, new Date('2026-06-20'), 'user-1');

      mockRepository.findByUserId.mockResolvedValue([task]);

      const count = await reminderService.checkReminders('user-1', [strategy]);

      expect(count).toBe(0);
      expect(mockNotificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('应避免同一任务被同一策略重复提醒', async () => {
      const strategy = new HighPriorityReminderStrategy();
      const task = Task.create('task-1', '高优先级任务', '紧急', Priority.HIGH, new Date('2026-06-20'), 'user-1');

      mockRepository.findByUserId.mockResolvedValue([task]);

      const count = await reminderService.checkReminders('user-1', [strategy, strategy]);

      expect(count).toBe(1);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(1);
    });

    it('对于不同策略应分别检查任务', async () => {
      // 创建测试任务：HIGH 优先级 + 1 天后到期 → 两个策略都应触发
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const task = Task.create('task-1', '高优先级即将到期任务', '紧急且将到期', Priority.HIGH, tomorrow, 'user-1');

      mockRepository.findByUserId.mockResolvedValue([task]);

      // 设置提醒策略
      const strategies = [
        new HighPriorityReminderStrategy(),
        new DeadlineReminderStrategy(1)
      ];

      // 执行提醒检查
      const count = await reminderService.checkReminders('user-1', strategies);

      // 验证结果
      expect(count).toBe(2); // 两个策略都触发
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('已完成的任务不应触发提醒', async () => {
      const strategy = new HighPriorityReminderStrategy();
      const task = Task.create('task-1', '已完成的高优先级任务', '已完成', Priority.HIGH, new Date('2026-06-20'), 'user-1');

      task.markAsCompleted();
      mockRepository.findByUserId.mockResolvedValue([task]);

      const count = await reminderService.checkReminders('user-1', [strategy]);

      expect(count).toBe(0);
      expect(mockNotificationService.sendNotification).not.toHaveBeenCalled();
    });
  });

  describe('createDeadlineReminder', () => {
    it('应该创建到期提醒策略', () => {
      const policy = reminderService.createDeadlineReminder('task-1', 3);

      expect(policy).toBeDefined();
      expect(policy.getTaskId()).toBe('task-1');
      expect(policy.getRepeatType()).toBe('ONCE');
      expect(policy.getMessage()).toContain('到期前 3 天提醒');
    });

    it('应该生成唯一的策略 ID', () => {
      const policy1 = reminderService.createDeadlineReminder('task-1', 1);
      const policy2 = reminderService.createDeadlineReminder('task-2', 1);

      expect(policy1.id).not.toBe(policy2.id);
    });
  });

  describe('createDailySummaryReminder', () => {
    it('应该使用默认时间创建每日汇总提醒策略', () => {
      const policy = reminderService.createDailySummaryReminder('task-1');

      expect(policy).toBeDefined();
      expect(policy.getTaskId()).toBe('task-1');
      expect(policy.getRepeatType()).toBe('DAILY');
      expect(policy.getMessage()).toContain('每日 9:00');
    });

    it('应该使用指定时间创建每日汇总提醒策略', () => {
      const policy = reminderService.createDailySummaryReminder('task-1', { hour: 18, minute: 30 });

      expect(policy).toBeDefined();
      expect(policy.getMessage()).toContain('每日 18:00');
    });
  });

  describe('sendNotifications', () => {
    it('应该批量发送多条提醒消息', () => {
      const messages = [
        '📅 任务 1 即将到期',
        '🚨 高优先级任务 2 需要关注',
        '📊 每日汇总提醒'
      ];

      reminderService.sendNotifications(messages);

      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(3);
      messages.forEach((msg, i) => {
        expect(mockNotificationService.sendNotification).toHaveBeenNthCalledWith(i + 1, msg);
      });
    });

    it('空消息列表不应调用通知服务', () => {
      reminderService.sendNotifications([]);

      expect(mockNotificationService.sendNotification).not.toHaveBeenCalled();
    });
  });

  describe('集成测试 - 完整流程', () => {
    it('应该正确处理到期前提醒和高优先级提醒', async () => {
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // 创建测试任务
      const task1 = Task.create('task-1', '高优先级任务', '紧急', Priority.HIGH, nextWeek, 'user-1');
      const task2 = Task.create('task-2', '即将到期任务', '将到期', Priority.MEDIUM, tomorrow, 'user-1');
      const task3 = Task.create('task-3', '普通任务', '不紧急', Priority.LOW, nextWeek, 'user-1');

      mockRepository.findByUserId.mockResolvedValue([task1, task2, task3]);

      // 设置提醒策略
      const strategies = [
        new HighPriorityReminderStrategy(),
        new DeadlineReminderStrategy(1)
      ];

      // 执行提醒检查
      const count = await reminderService.checkReminders('user-1', strategies);

      // 验证结果
      expect(count).toBe(2); // task1 (高优先级) 和 task2 (到期前 1 天)
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(2);

      const calls = mockNotificationService.sendNotification.mock.calls;
      const messages = calls.map((call: any) => call[0]);

      expect(messages.some((m: string) => m.includes('高优先级任务'))).toBe(true);
      expect(messages.some((m: string) => m.includes('即将到期任务'))).toBe(true);

      jest.restoreAllMocks();
    });
  });
});