import { CreateTaskUseCase } from '../../application/usecase/CreateTaskUseCase.js';
import { UpdateTaskStatusUseCase } from '../../application/usecase/UpdateTaskStatusUseCase.js';
import { GetProgressReportUseCase } from '../../application/usecase/GetProgressReportUseCase.js';
import { FilterTasksByTagsUseCase } from '../../application/usecase/FilterTasksByTagsUseCase.js';
import { InMemoryTaskRepository } from '../../infrastructure/repository/InMemoryTaskRepository.js';
import { Priority } from '../../domain/valueobject/Priority.js';
import { TaskStatus } from '../../domain/valueobject/TaskStatus.js';

export class TaskCLI {
  private createTaskUseCase: CreateTaskUseCase;
  private updateTaskStatusUseCase: UpdateTaskStatusUseCase;
  private getProgressReportUseCase: GetProgressReportUseCase;
  private filterTasksByTagsUseCase: FilterTasksByTagsUseCase;
  private repository: InMemoryTaskRepository;

  constructor() {
    this.repository = new InMemoryTaskRepository();
    this.createTaskUseCase = new CreateTaskUseCase(this.repository);
    this.updateTaskStatusUseCase = new UpdateTaskStatusUseCase(this.repository);
    this.getProgressReportUseCase = new GetProgressReportUseCase(this.repository);
    this.filterTasksByTagsUseCase = new FilterTasksByTagsUseCase(this.repository);
  }

  async createTask(
    title: string,
    description: string,
    priority: Priority,
    dueDate: Date | null,
    tags: string[] = []
  ): Promise<void> {
    try {
      const result = await this.createTaskUseCase.execute({
        userId: 'user-001',
        title,
        description,
        priority,
        dueDate,
        tags: tags.length > 0 ? tags : undefined
      });

      console.log(`✅ 任务创建成功！`);
      console.log(`   ID: ${result.id}`);
      console.log(`   标题: ${result.title}`);
      console.log(`   优先级: ${result.priority}`);
      console.log(`   状态: ${result.status}`);
      if (result.dueDate) {
        console.log(`   截止日期: ${result.dueDate.toLocaleDateString('zh-CN')}`);
      }
      if (result.tags && result.tags.length > 0) {
        console.log(`   标签: ${result.tags.map((t: any) => `#${t.name}`).join(', ')}`);
      }
    } catch (error) {
      console.error(`❌ 创建任务失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    try {
      const result = await this.updateTaskStatusUseCase.execute(taskId, status);

      if (result) {
        console.log(`✅ 任务状态更新成功！`);
        console.log(`   ID: ${result.id}`);
        console.log(`   标题: ${result.title}`);
        console.log(`   新状态: ${result.status}`);
      } else {
        console.log(`❌ 未找到任务: ${taskId}`);
      }
    } catch (error) {
      console.error(`❌ 更新状态失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async showProgressReport(userId: string): Promise<void> {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const report = await this.getProgressReportUseCase.execute(userId, startDate, endDate);
      const stats = report.getStatistics();

      console.log(`\n📊 学习进度统计 (${startDate.toLocaleDateString('zh-CN')} - ${endDate.toLocaleDateString('zh-CN')})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`   总任务数: ${stats.totalTasks}`);
      console.log(`   ✅ 已完成: ${stats.completedTasks}`);
      console.log(`   🔄 进行中: ${stats.inProgressTasks}`);
      console.log(`   ⏳ 未开始: ${stats.notStartedTasks}`);
      console.log(`   完成率: ${stats.completionRate.toFixed(1)}%`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    } catch (error) {
      console.error(`❌ 获取进度报告失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async listTasks(userId: string): Promise<void> {
    const tasks = await this.repository.findByUserId(userId);

    console.log(`\n📋 任务列表 (${tasks.length} 个任务)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    if (tasks.length === 0) {
      console.log(`   暂无任务`);
    } else {
      tasks.forEach((task, index) => {
        const statusIcon = this.getStatusIcon(task.getStatus());
        const priorityColor = this.getPriorityColor(task.getPriority());
        const dueDate = task.getDueDate();
        const dueDateStr = dueDate ? dueDate.toLocaleDateString('zh-CN') : '无';

        console.log(`${index + 1}. ${statusIcon} ${task.getTitle()}`);
        console.log(`   ID: ${task.id}`);
        console.log(`   优先级: ${priorityColor}${task.getPriority()}\x1b[0m`);
        console.log(`   截止日期: ${dueDateStr}`);
        const tags = task.getTags();
        if (tags && tags.length > 0) {
          console.log(`   标签: ${tags.map(t => `#${t.getName()}`).join(', ')}`);
        }
        console.log(`   创建时间: ${task.getCreatedAt().toLocaleString('zh-CN')}`);
        console.log(``);
      });
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  }

  private getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.NOT_STARTED:
        return '⏳';
      case TaskStatus.IN_PROGRESS:
        return '🔄';
      case TaskStatus.COMPLETED:
        return '✅';
    }
  }

  private getPriorityColor(priority: Priority): string {
    switch (priority) {
      case Priority.HIGH:
        return '\x1b[31m'; // 红色
      case Priority.MEDIUM:
        return '\x1b[33m'; // 黄色
      case Priority.LOW:
        return '\x1b[32m'; // 绿色
    }
  }

  async filterByTag(tagName: string): Promise<void> {
    try {
      const results = await this.filterTasksByTagsUseCase.execute({
        tags: [tagName],
        userId: 'user-001'
      });

      console.log(`\n🏷️  标签筛选结果: #${tagName} (${results.length} 个任务)`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      if (results.length === 0) {
        console.log(`   没有找到包含标签 "#${tagName}" 的任务`);
      } else {
        results.forEach((task, index) => {
          const statusIcon = this.getStatusIcon(task.status);
          console.log(`${index + 1}. ${statusIcon} ${task.title}`);
          console.log(`   ID: ${task.id}  优先级: ${task.priority}`);
          if (task.tags && task.tags.length > 0) {
            console.log(`   标签: ${task.tags.map(t => `#${t.name}`).join(', ')}`);
          }
          console.log('');
        });
      }
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    } catch (error) {
      console.error(`❌ 标签筛选失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async addTags(taskId: string, tagNames: string[]): Promise<void> {
    try {
      const task = await this.repository.findById(taskId);
      if (!task) {
        console.log(`❌ 未找到任务: ${taskId}`);
        return;
      }

      for (const name of tagNames) {
        const { Tag } = await import('../../domain/valueobject/Tag.js');
        task.addTag(new Tag(name.trim()));
      }
      await this.repository.save(task);

      console.log(`✅ 标签添加成功！`);
      console.log(`   任务: ${task.getTitle()}`);
      console.log(`   标签: ${task.getTags().map(t => `#${t.getName()}`).join(', ')}`);
    } catch (error) {
      console.error(`❌ 添加标签失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getRepository(): InMemoryTaskRepository {
    return this.repository;
  }
}

// CLI 入口
async function main() {
  const cli = new TaskCLI();
  const userId = 'user-001';

  console.log(`\n🎓 StudyFlow - 学习任务管理系统`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // 创建示例任务（带标签）
  await cli.createTask(
    '完成 TypeScript 课程第1章',
    '阅读文档并完成练习题',
    Priority.HIGH,
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
    ['编程', 'TypeScript']
  );

  await cli.createTask(
    '复习 JavaScript 闭包概念',
    '整理笔记并写一个示例',
    Priority.MEDIUM,
    null,
    ['编程', 'JavaScript']
  );

  await cli.createTask(
    '学习 React Hooks',
    '阅读官方文档并完成 Todo 示例',
    Priority.LOW,
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天后
    ['前端', 'React']
  );

  // 查看任务列表
  await cli.listTasks(userId);

  // 更新任务状态
  const tasks = await cli.getRepository().findByUserId(userId);
  if (tasks.length > 0) {
    await cli.updateTaskStatus(tasks[0].id, TaskStatus.IN_PROGRESS);
  }

  // 按标签筛选
  await cli.filterByTag('编程');

  // 再次查看任务列表
  await cli.listTasks(userId);

  // 查看进度统计
  await cli.showProgressReport(userId);
}

main().catch(console.error);