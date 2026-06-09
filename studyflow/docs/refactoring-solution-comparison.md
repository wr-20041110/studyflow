# 提醒功能重构方案对比

## 重构目标
将 `ReminderPolicy` 重构为可扩展的提醒策略机制，支持：
1. 到期前 1 天提醒
2. 高优先级任务即时提醒
3. 当日未完成任务汇总提醒

---

## 方案 A：低改动、快速落地

### 设计思路
在现有 `ReminderPolicy` 实体基础上，添加枚举类型来区分提醒策略，并通过 `if-else` 逻辑实现不同的提醒行为。

### 核心代码结构

```typescript
// 扩展现有的 ReminderType 枚举
export enum ReminderType {
  DEADLINE = 'DEADLINE',      // 到期前提醒
  HIGH_PRIORITY = 'HIGH_PRIORITY',  // 高优先级提醒
  DAILY_SUMMARY = 'DAILY_SUMMARY'   // 每日汇总
}

// 修改 ReminderPolicy 添加类型字段
export class ReminderPolicy {
  constructor(
    public readonly id: string,
    private readonly taskId: string,
    private remindTime: Date,
    private reminderType: ReminderType,  // 新增字段
    // ... 其他字段
  ) {}

  // 添加触发逻辑
  shouldTrigger(task: Task, currentTime: Date): boolean {
    if (!this.isActive) return false;

    switch (this.reminderType) {
      case ReminderType.DEADLINE:
        return this.checkDeadlineReminder(task, currentTime);
      case ReminderType.HIGH_PRIORITY:
        return this.checkHighPriorityReminder(task, currentTime);
      case ReminderType.DAILY_SUMMARY:
        return this.checkDailySummaryReminder(task, currentTime);
      default:
        return false;
    }
  }

  private checkDeadlineReminder(task: Task, currentTime: Date): boolean {
    const dueDate = task.getDueDate();
    if (!dueDate) return false;
    const daysUntilDue = Math.ceil((dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 1 && daysUntilDue > 0;
  }

  private checkHighPriorityReminder(task: Task, currentTime: Date): boolean {
    return task.getPriority() === Priority.HIGH;
  }

  private checkDailySummaryReminder(task: Task, currentTime: Date): boolean {
    // 每日汇总在指定时间触发
    return this.isSummaryTime(currentTime);
  }

  private isSummaryTime(currentTime: Date): boolean {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return hours === 9 && minutes === 0;  // 上午9点
  }
}
```

### 新增文件
- `ReminderType` 枚举（可在 ReminderPolicy.ts 中定义）
- 扩展 `ReminderPolicy.ts`

### 修改文件
- `src/domain/entity/ReminderPolicy.ts` - 添加 `ReminderType` 字段和 `shouldTrigger` 方法

### 优势
1. ✅ 改动最小，只需修改一个文件
2. ✅ 快速实现，适合时间紧迫的情况
3. ✅ 保持现有结构，学习成本低
4. ✅ 向后兼容，不影响现有功能

### 劣势
1. ❌ 每添加新策略需要修改 `ReminderPolicy` 类
2. ❌ 违反开闭原则
3. ❌ `if-else` 分支会随着策略增多而变长
4. ❌ 单元测试困难，需要 mock 整个 Policy 对象
5. ❌ 策略逻辑与 Policy 实体耦合

### 对现有功能影响范围
- 🔴 **低影响** - 只影响 `ReminderPolicy` 实体
- 🟡 **中等影响** - 如果其他代码依赖 `ReminderPolicy`，需要更新构造函数调用

### 测试迁移难度
- 🟢 **简单** - 测试用例可直接迁移，主要测试 `shouldTrigger` 方法的不同分支

### 是否符合当前项目规模
- ✅ **符合** - 对于小型项目，这种简单方式足够

---

## 方案 B：策略模式（推荐）✨

### 设计思路
引入策略模式，定义策略接口，将每种提醒策略封装成独立的类，通过策略上下文来协调执行。

### 核心代码结构

```typescript
// 1. 策略接口
// src/domain/strategy/IReminderStrategy.ts
export interface IReminderStrategy {
  shouldTrigger(task: Task, currentTime: Date): boolean;
  generateMessage(task: Task): string;
}

// 2. 具体策略实现
// src/domain/strategy/DeadlineReminderStrategy.ts
export class DeadlineReminderStrategy implements IReminderStrategy {
  private readonly daysBeforeDeadline: number;

  constructor(daysBeforeDeadline: number = 1) {
    this.daysBeforeDeadline = daysBeforeDeadline;
  }

  shouldTrigger(task: Task, currentTime: Date): boolean {
    const dueDate = task.getDueDate();
    if (!dueDate) return false;

    const daysUntilDue = Math.ceil((dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue === this.daysBeforeDeadline;
  }

  generateMessage(task: Task): string {
    return `📅 任务 "${task.getTitle()}" 将在 ${this.daysBeforeDeadline} 天后到期，请及时完成！`;
  }
}

// src/domain/strategy/HighPriorityReminderStrategy.ts
export class HighPriorityReminderStrategy implements IReminderStrategy {
  shouldTrigger(task: Task, _currentTime: Date): boolean {
    return task.getPriority() === Priority.HIGH && task.getStatus() !== TaskStatus.COMPLETED;
  }

  generateMessage(task: Task): string {
    return `🚨 高优先级任务 "${task.getTitle()}" 需要您的注意！`;
  }
}

// src/domain/strategy/DailySummaryReminderStrategy.ts
export class DailySummaryReminderStrategy implements IReminderStrategy {
  private readonly summaryTime: { hour: number; minute: number };

  constructor(summaryTime: { hour: number; minute: number } = { hour: 9, minute: 0 }) {
    this.summaryTime = summaryTime;
  }

  shouldTrigger(task: Task, currentTime: Date): boolean {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // 检查是否为汇总时间
    if (hours !== this.summaryTime.hour || minutes !== this.summaryTime.minute) {
      return false;
    }

    // 检查任务状态
    return task.getStatus() !== TaskStatus.COMPLETED;
  }

  generateMessage(task: Task): string {
    return `📊 每日汇总：您有 "${task.getTitle()}" 尚未完成`;
  }
}

// 3. 上下文类
// src/domain/service/ReminderContext.ts
export class ReminderContext {
  constructor(private readonly strategy: IReminderStrategy) {}

  checkReminder(task: Task, currentTime: Date): { shouldTrigger: boolean; message: string } {
    const shouldTrigger = this.strategy.shouldTrigger(task, currentTime);
    const message = shouldTrigger ? this.strategy.generateMessage(task) : '';
    return { shouldTrigger, message };
  }

  setStrategy(strategy: IReminderStrategy): void {
    this.strategy = strategy;
  }
}

// 4. 提醒服务
// src/application/service/ReminderService.ts
export class ReminderService {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly notificationService: INotificationService
  ) {}

  async checkReminders(userId: string, strategies: IReminderStrategy[]): Promise<void> {
    const tasks = await this.taskRepository.findByUserId(userId);
    const currentTime = new Date();

    for (const strategy of strategies) {
      const context = new ReminderContext(strategy);

      for (const task of tasks) {
        const { shouldTrigger, message } = context.checkReminder(task, currentTime);

        if (shouldTrigger) {
          this.notificationService.sendNotification(message);
        }
      }
    }
  }

  async createDeadlineReminder(taskId: string, daysBefore: number): Promise<ReminderPolicy> {
    const policy = new ReminderPolicy(
      this.generateId(),
      taskId,
      new Date(),
      RepeatType.ONCE,
      `到期前 ${daysBefore} 天提醒`
    );
    return policy;
  }
}
```

### 新增文件
- `src/domain/strategy/IReminderStrategy.ts` - 策略接口
- `src/domain/strategy/DeadlineReminderStrategy.ts` - 到期提醒策略
- `src/domain/strategy/HighPriorityReminderStrategy.ts` - 高优先级提醒策略
- `src/domain/strategy/DailySummaryReminderStrategy.ts` - 每日汇总提醒策略
- `src/domain/service/ReminderContext.ts` - 策略上下文
- `src/application/service/ReminderService.ts` - 提醒应用服务
- `test/unit/domain/strategy/*` - 策略单元测试
- `test/unit/application/service/ReminderService.test.ts` - 提醒服务测试

### 修改文件
- `src/domain/entity/ReminderPolicy.ts` - 保持不变，作为配置载体
- `src/application/service/ITaskService.ts` - 可选：添加提醒相关方法

### 优势
1. ✅ 符合开闭原则 - 添加新策略无需修改现有代码
2. ✅ 符合单一职责原则 - 每个策略类只负责一种提醒逻辑
3. ✅ 易于扩展 - 新增策略只需实现接口
4. ✅ 易于测试 - 每个策略可独立单元测试
5. ✅ 策略可组合 - 可同时使用多个策略
6. ✅ 运行时可切换策略 - 通过 `ReminderContext.setStrategy()`

### 劣势
1. ❌ 新增文件较多，初期工作量大
2. ❌ 需要理解设计模式概念
3. ❌ 对于极简单场景可能过度设计

### 对现有功能影响范围
- 🟢 **低影响** - 不修改现有实体和用例
- 🟢 **零破坏** - 纯新增功能，向后兼容

### 测试迁移难度
- 🟢 **简单** - 新功能有独立测试
- 🟢 **高质量** - 每个策略可独立测试，测试覆盖率高

### 是否符合当前项目规模
- ✅ **符合** - 对于需要扩展性和可维护性的项目，策略模式是最佳选择

---

## 方案对比总结

| 维度 | 方案 A (if-else) | 方案 B (策略模式) |
|------|------------------|-------------------|
| 改动量 | 小 | 中等 |
| 实现速度 | 快 | 中等 |
| 扩展性 | 差 | 优秀 |
| 可维护性 | 一般 | 优秀 |
| 测试难度 | 中等 | 简单 |
| 符合设计原则 | 否 | 是 |
| 学习曲线 | 低 | 中等 |
| 新增文件数 | 0-1 | 6-8 |
| 修改文件数 | 1 | 0-1 |

---

## 最终选择：方案 B（策略模式）

### 选择理由

1. **符合实验目标**
   - 实验三的核心目标就是学习设计模式应用
   - 策略模式是本次实验推荐的实践主题

2. **项目长期发展需要**
   - StudyFlow 作为学习任务管理系统，未来可能需要更多类型的提醒
   - 策略模式为未来扩展提供了清晰的基础

3. **教育价值**
   - 策略模式是经典的软件设计模式
   - 实现过程可以深入理解开闭原则、单一职责原则

4. **代码质量**
   - 职责清晰，易于理解和维护
   - 测试覆盖率高，代码质量有保障

5. **影响范围可控**
   - 纯新增功能，不破坏现有代码
   - 测试保护下进行，风险低

### 预期收益

1. **扩展性提升** - 新增提醒类型只需添加新策略类
2. **可维护性提升** - 每个策略独立，修改互不影响
3. **可测试性提升** - 策略可独立单元测试
4. **代码复用** - 策略可在不同场景复用

### 实施计划

1. 补齐 ReminderPolicy 的测试用例
2. 创建策略接口和具体策略实现
3. 创建 ReminderContext 上下文类
4. 创建 ReminderService 应用服务
5. 为新代码编写完整的单元测试
6. 集成到 CLI 中，提供实际使用示例
7. 编写重构说明文档

---