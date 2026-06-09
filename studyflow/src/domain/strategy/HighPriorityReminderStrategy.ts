import { IReminderStrategy } from './IReminderStrategy.js';
import { Task } from '../entity/Task.js';
import { Priority } from '../valueobject/Priority.js';
import { TaskStatus } from '../valueobject/TaskStatus.js';

/**
 * 高优先级任务即时提醒策略
 * 当任务为高优先级时立即触发提醒
 */
export class HighPriorityReminderStrategy implements IReminderStrategy {
  /**
   * 检查是否应该触发提醒
   * 高优先级且未完成的任务会触发提醒
   */
  shouldTrigger(task: Task, _currentTime: Date): boolean {
    return (
      task.getPriority() === Priority.HIGH &&
      task.getStatus() !== TaskStatus.COMPLETED
    );
  }

  generateMessage(task: Task): string {
    return `🚨 高优先级任务 "${task.getTitle()}" 需要您的注意！`;
  }

  getStrategyName(): string {
    return 'HighPriorityReminderStrategy';
  }
}