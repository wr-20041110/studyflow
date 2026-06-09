import { IReminderStrategy } from '../strategy/IReminderStrategy.js';
import { Task } from '../entity/Task.js';

/**
 * 提醒上下文
 * 负责协调提醒策略的执行
 */
export class ReminderContext {
  private strategy: IReminderStrategy;

  constructor(strategy: IReminderStrategy) {
    this.strategy = strategy;
  }

  /**
   * 检查提醒并生成消息
   * @param task 待检查的任务
   * @param currentTime 当前时间
   * @returns 提醒检查结果
   */
  checkReminder(task: Task, currentTime: Date): ReminderResult {
    const shouldTrigger = this.strategy.shouldTrigger(task, currentTime);
    const message = shouldTrigger ? this.strategy.generateMessage(task) : '';

    return {
      shouldTrigger,
      message,
      strategyName: this.strategy.getStrategyName(),
      taskId: task.id,
      taskTitle: task.getTitle()
    };
  }

  /**
   * 批量检查多个任务的提醒
   * @param tasks 待检查的任务列表
   * @param currentTime 当前时间
   * @returns 提醒检查结果列表
   */
  checkReminders(tasks: Task[], currentTime: Date): ReminderResult[] {
    return tasks.map(task => this.checkReminder(task, currentTime));
  }

  /**
   * 获取需要提醒的任务
   * @param tasks 待检查的任务列表
   * @param currentTime 当前时间
   * @returns 需要提醒的任务列表
   */
  getTasksNeedingReminder(tasks: Task[], currentTime: Date): ReminderResult[] {
    return this.checkReminders(tasks, currentTime).filter(result => result.shouldTrigger);
  }

  /**
   * 切换提醒策略
   * @param strategy 新的策略
   */
  setStrategy(strategy: IReminderStrategy): void {
    this.strategy = strategy;
  }

  /**
   * 获取当前策略
   */
  getCurrentStrategy(): IReminderStrategy {
    return this.strategy;
  }
}

/**
 * 提醒检查结果
 */
export interface ReminderResult {
  /** 是否应该触发提醒 */
  shouldTrigger: boolean;
  /** 提醒消息内容 */
  message: string;
  /** 策略名称 */
  strategyName: string;
  /** 任务 ID */
  taskId: string;
  /** 任务标题 */
  taskTitle: string;
}