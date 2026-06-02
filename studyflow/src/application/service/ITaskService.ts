import { Task } from '../../domain/entity/Task.js';
import { Priority } from '../../domain/valueobject/Priority.js';

export interface CreateTaskCommand {
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date | null;
  userId: string;
}

export interface ProgressSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  completionRate: number;
}

export interface ITaskService {
  /**
   * 创建新任务
   * 前置条件：
   *   - title 非空且长度 <= 200
   *   - description 长度 <= 1000
   *   - userId 非空
   * 后置条件：
   *   - 返回新创建的Task对象
   *   - 任务状态为 NOT_STARTED
   *   - 任务有唯一的id
   *   - 保存到仓储
   * 异常条件：
   *   - 当 priority=HIGH 时 dueDate 必须非空
   *   - dueDate 不能是过去时间
   * 边界情况：
   *   - title 长度恰好为 200
   *   - description 为空字符串
   *   - dueDate 恰好为今天
   */
  createTask(input: CreateTaskCommand): Promise<Task>;

  /**
   * 完成任务
   * 前置条件：
   *   - taskId 非空
   *   - 任务存在且未被完成
   * 后置条件：
   *   - 任务状态变为 COMPLETED
   *   - updatedAt 时间被更新
   * 异常条件：
   *   - 任务不存在时抛出异常
   *   - 任务已完成时不抛出异常（幂等）
   * 边界情况：
   *   - 任务当前为 IN_PROGRESS 状态
   *   - 任务当前为 NOT_STARTED 状态
   */
  completeTask(taskId: string): Promise<Task>;

  /**
   * 按优先级列出任务
   * 前置条件：
   *   - userId 非空
   * 后置条件：
   *   - 返回该用户的所有任务
   *   - 按优先级排序：HIGH > MEDIUM > LOW
   *   - 同优先级内按到期时间升序排列
   * 异常条件：
   *   - 用户不存在时返回空数组
   * 边界情况：
   *   - 用户没有任务
   *   - 所有任务优先级相同
   *   - 任务没有到期时间（null dueDate 排在最后）
   */
  listTasksByPriority(userId: string): Promise<Task[]>;

  /**
   * 查询到期任务
   * 前置条件：
   *   - date 非空
   * 后置条件：
   *   - 返回所有未完成且到期时间在指定日期及之前的任务
   *   - 不包括已完成的任务
   * 异常条件：
   *   - 无
   * 边界情况：
   *   - 指定日期没有到期任务
   *   - 任务到期时间恰好为指定日期
   *   - 任务没有到期时间（不包含在结果中）
   */
  listDueTasks(date: Date): Promise<Task[]>;

  /**
   * 按用户统计任务完成情况
   * 前置条件：
   *   - userId 非空
   * 后置条件：
   *   - 返回该用户的任务统计摘要
   *   - 完成率 = 已完成任务数 / 总任务数
   * 异常条件：
   *   - 用户没有任务时返回全零统计
   * 边界情况：
   *   - 用户没有任务
   *   - 所有任务都已完成
   *   - 所有任务都未开始
   */
  getProgressByUser(userId: string): Promise<ProgressSummary>;
}