import { Task } from '../entity/Task.js';

/**
 * 提醒策略接口
 * 定义了所有提醒策略必须实现的方法
 */
export interface IReminderStrategy {
  /**
   * 检查是否应该触发提醒
   * @param task 待检查的任务
   * @param currentTime 当前时间
   * @returns 是否应该触发提醒
   */
  shouldTrigger(task: Task, currentTime: Date): boolean;

  /**
   * 生成提醒消息
   * @param task 任务对象
   * @returns 提醒消息内容
   */
  generateMessage(task: Task): string;

  /**
   * 获取策略名称（用于日志和调试）
   */
  getStrategyName(): string;
}