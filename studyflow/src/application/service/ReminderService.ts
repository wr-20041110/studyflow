import { ITaskRepository } from '../../domain/repository/ITaskRepository.js';
import { INotificationService } from '../../infrastructure/notification/ConsoleNotificationService.js';
import { IReminderStrategy } from '../../domain/strategy/IReminderStrategy.js';
import { ReminderContext } from '../../domain/service/ReminderContext.js';
import { ReminderPolicy, RepeatType } from '../../domain/entity/ReminderPolicy.js';

/**
 * 提醒服务接口
 */
export interface IReminderService {
  /**
   * 检查并触发提醒
   * @param userId 用户 ID
   * @param strategies 提醒策略列表
   * @returns 触发的提醒数量
   */
  checkReminders(userId: string, strategies: IReminderStrategy[]): Promise<number>;

  /**
   * 为任务创建到期提醒策略
   * @param taskId 任务 ID
   * @param daysBefore 到期前几天提醒
   * @returns 创建的提醒策略
   */
  createDeadlineReminder(taskId: string, daysBefore: number): ReminderPolicy;

  /**
   * 为任务创建每日汇总提醒策略
   * @param taskId 任务 ID
   * @param summaryTime 汇总时间
   * @returns 创建的提醒策略
   */
  createDailySummaryReminder(
    taskId: string,
    summaryTime?: { hour: number; minute: number }
  ): ReminderPolicy;

  /**
   * 批量发送提醒消息
   * @param messages 提醒消息列表
   */
  sendNotifications(messages: string[]): void;
}

/**
 * 提醒服务
 * 协调提醒策略的执行和通知的发送
 */
export class ReminderService implements IReminderService {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly notificationService: INotificationService
  ) {}

  /**
   * 检查并触发提醒
   * 遍历所有策略，检查每个任务是否需要提醒
   */
  async checkReminders(userId: string, strategies: IReminderStrategy[]): Promise<number> {
    const tasks = await this.taskRepository.findByUserId(userId);
    const currentTime = new Date();
    let reminderCount = 0;

    // 使用 Set 去重，避免同一任务同一时间被多个策略重复提醒
    const sentReminders = new Set<string>();

    for (const strategy of strategies) {
      const context = new ReminderContext(strategy);
      const tasksNeedingReminder = context.getTasksNeedingReminder(tasks, currentTime);

      for (const result of tasksNeedingReminder) {
        const reminderKey = `${result.taskId}-${strategy.getStrategyName()}`;

        // 避免重复发送
        if (!sentReminders.has(reminderKey)) {
          this.notificationService.sendNotification(result.message);
          sentReminders.add(reminderKey);
          reminderCount++;
        }
      }
    }

    return reminderCount;
  }

  /**
   * 为任务创建到期提醒策略
   */
  createDeadlineReminder(taskId: string, daysBefore: number): ReminderPolicy {
    const policyId = this.generateId();
    const message = `到期前 ${daysBefore} 天提醒`;

    return new ReminderPolicy(
      policyId,
      taskId,
      new Date(),
      RepeatType.ONCE,
      message
    );
  }

  /**
   * 为任务创建每日汇总提醒策略
   */
  createDailySummaryReminder(
    taskId: string,
    summaryTime: { hour: number; minute: number } = { hour: 9, minute: 0 }
  ): ReminderPolicy {
    const policyId = this.generateId();
    const timeStr = `${summaryTime.hour}:00`;
    const message = `每日 ${timeStr} 汇总提醒`;

    return new ReminderPolicy(
      policyId,
      taskId,
      new Date(),
      RepeatType.DAILY,
      message
    );
  }

  /**
   * 批量发送提醒消息
   */
  sendNotifications(messages: string[]): void {
    for (const message of messages) {
      this.notificationService.sendNotification(message);
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `reminder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}