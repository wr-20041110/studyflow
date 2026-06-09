import { IReminderStrategy } from './IReminderStrategy.js';
import { Task } from '../entity/Task.js';
import { TaskStatus } from '../valueobject/TaskStatus.js';

/**
 * 每日汇总提醒策略
 * 在每天指定时间汇总未完成的任务
 */
export class DailySummaryReminderStrategy implements IReminderStrategy {
  private readonly summaryTime: { hour: number; minute: number };

  /**
   * @param summaryTime 汇总时间，默认为上午 9:00
   */
  constructor(summaryTime: { hour: number; minute: number } = { hour: 9, minute: 0 }) {
    this.validateTime(summaryTime);
    this.summaryTime = summaryTime;
  }

  shouldTrigger(task: Task, currentTime: Date): boolean {
    // 检查是否为汇总时间
    if (!this.isSummaryTime(currentTime)) {
      return false;
    }

    // 检查任务状态
    return task.getStatus() !== TaskStatus.COMPLETED;
  }

  generateMessage(task: Task): string {
    return `📊 每日汇总：您有任务 "${task.getTitle()}" 尚未完成`;
  }

  getStrategyName(): string {
    return `DailySummaryReminderStrategy (${this.summaryTime.hour}:00)`;
  }

  private isSummaryTime(currentTime: Date): boolean {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    return hours === this.summaryTime.hour && minutes === this.summaryTime.minute;
  }

  private validateTime(time: { hour: number; minute: number }): void {
    if (time.hour < 0 || time.hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }
    if (time.minute < 0 || time.minute > 59) {
      throw new Error('Minute must be between 0 and 59');
    }
  }
}