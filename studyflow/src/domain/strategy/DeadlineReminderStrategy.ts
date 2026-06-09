import { IReminderStrategy } from './IReminderStrategy.js';
import { Task } from '../entity/Task.js';
import { TaskStatus } from '../valueobject/TaskStatus.js';

/**
 * 到期前提醒策略
 * 在任务到期前指定天数触发提醒
 */
export class DeadlineReminderStrategy implements IReminderStrategy {
  private readonly daysBeforeDeadline: number;

  /**
   * @param daysBeforeDeadline 到期前几天提醒，默认为 1 天
   */
  constructor(daysBeforeDeadline: number = 1) {
    if (daysBeforeDeadline <= 0) {
      throw new Error('daysBeforeDeadline must be greater than 0');
    }
    this.daysBeforeDeadline = daysBeforeDeadline;
  }

  shouldTrigger(task: Task, currentTime: Date): boolean {
    const dueDate = task.getDueDate();
    if (!dueDate) {
      return false;
    }

    // 已完成任务不需要提醒
    if (task.getStatus() === TaskStatus.COMPLETED) {
      return false;
    }

    // 计算距离到期的天数
    const daysUntilDue = this.calculateDaysUntilDue(dueDate, currentTime);

    // 恰好在指定天数前时触发
    return daysUntilDue === this.daysBeforeDeadline;
  }

  generateMessage(task: Task): string {
    const dueDate = task.getDueDate();
    const dueDateStr = dueDate ? dueDate.toLocaleDateString('zh-CN') : '未知日期';

    return `📅 任务 "${task.getTitle()}" 将在 ${this.daysBeforeDeadline} 天后到期（${dueDateStr}），请及时完成！`;
  }

  getStrategyName(): string {
    return `DeadlineReminderStrategy (${this.daysBeforeDeadline}天前提醒)`;
  }

  private calculateDaysUntilDue(dueDate: Date, currentTime: Date): number {
    const dueTime = dueDate.getTime();
    const currentTimeMs = currentTime.getTime();
    const diffMs = dueTime - currentTimeMs;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}