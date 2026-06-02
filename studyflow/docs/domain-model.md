# StudyFlow 领域模型文档

## 概述

StudyFlow 采用领域驱动设计（DDD），领域模型是系统的核心，封装了业务逻辑和业务规则。

---

## 核心概念

### 实体 vs 值对象

| 特性 | 实体 (Entity) | 值对象 (Value Object) |
|------|--------------|----------------------|
| 身份 | 有唯一标识，通过 ID 判别相等 | 无唯一标识，通过属性值判别相等 |
| 可变性 | 可变，属性可以改变 | 不可变，创建后不能修改 |
| 生命周期 | 有完整的生命周期 | 随所属实体存在而存在 |
| 示例 | User, Task, TaskList | TaskStatus, Priority, DateRange |

---

## 聚合与聚合根

### 聚合设计

```
┌─────────────────────────────────────────────────────────┐
│                    TaskList (聚合根)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Task 1    │  │   Task 2    │  │   Task 3    │ ... │
│  │  (实体)     │  │  (实体)     │  │  (实体)     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**TaskList 是聚合根**，负责维护其包含的 Task 实体的一致性。

**聚合规则**：
- 外部只能通过聚合根访问内部实体
- Task 不能独立被修改，必须通过 TaskList 操作
- 聚合内部所有操作必须保持业务规则一致性

---

## 实体详细说明

### 1. TaskList (聚合根)

**职责**：管理用户的任务集合，维护任务列表的一致性

**属性**：
| 属性名 | 类型 | 说明 |
|--------|------|------|
| id | string | 任务列表唯一标识 |
| userId | string | 所属用户ID |
| tasks | Task[] | 任务集合 |
| createdAt | DateTime | 创建时间 |

**方法**：
- `addTask(task: Task)`: 添加任务
- `removeTask(taskId: string)`: 删除任务
- `getTask(taskId: string)`: 获取任务
- `getAllTasks()`: 获取所有任务

**不变量**：
- 同一列表中任务ID必须唯一

---

### 2. Task (实体)

**职责**：表示一个学习任务，维护任务的生命周期和状态

**属性**：
| 属性名 | 类型 | 说明 | 值对象 |
|--------|------|------|--------|
| id | string | 任务唯一标识 | - |
| title | string | 任务标题 | - |
| description | string | 任务描述 | - |
| status | TaskStatus | 任务状态 | ✓ |
| priority | Priority | 优先级 | ✓ |
| dueDate | DateTime \| null | 截止日期 | - |
| createdAt | DateTime | 创建时间 | - |
| updatedAt | DateTime | 更新时间 | - |

**方法**：
- `updateStatus(status: TaskStatus)`: 更新任务状态
- `updatePriority(priority: Priority)`: 更新优先级
- `updateDescription(description: string)`: 更新描述
- `isOverdue()`: 判断是否逾期

**不变量**：
- 任务截止时间不能早于任务创建时间 (INV-01)
- 已完成任务不能再次被修改为未开始或进行中状态 (INV-02)
- 高优先级任务必须具有截止日期 (INV-03)

---

### 3. User (实体)

**职责**：表示系统的用户

**属性**：
| 属性名 | 类型 | 说明 |
|--------|------|------|
| id | string | 用户唯一标识 |
| name | string | 用户名称 |
| email | string | 用户邮箱 |
| createdAt | DateTime | 注册时间 |

**方法**：
- `updateProfile(name: string, email: string)`: 更新用户信息

---

### 4. ReminderPolicy (实体)

**职责**：管理任务的提醒策略

**属性**：
| 属性名 | 类型 | 说明 |
|--------|------|------|
| id | string | 策略唯一标识 |
| taskId | string | 关联的任务ID |
| reminderTime | DateTime | 提醒时间 |
| reminderMessage | ReminderMessage | 提醒消息内容 |
| isSent | boolean | 是否已发送 |

**方法**：
- `markAsSent()`: 标记为已发送
- `shouldTrigger()`: 判断是否应该触发提醒

---

### 5. ProgressReport (实体)

**职责**：表示一段时间内的学习进度报告

**属性**：
| 属性名 | 类型 | 说明 | 值对象 |
|--------|------|------|--------|
| reportId | string | 报告唯一标识 | - |
| userId | string | 所属用户ID | - |
| period | DateRange | 统计时间段 | ✓ |
| statistics | Statistics | 统计数据 | ✓ |
| generatedAt | DateTime | 生成时间 | - |

**方法**：
- `getCompletionRate()`: 获取完成率
- `getTaskCountByStatus(status: TaskStatus)`: 获取指定状态的任务数

---

## 值对象详细说明

### 1. TaskStatus (值对象)

**描述**：任务状态的不可变表示

**可能值**：
- `NOT_STARTED` - 未开始
- `IN_PROGRESS` - 进行中
- `COMPLETED` - 已完成

**方法**：
- `isCompleted()`: 判断是否已完成
- `canTransitionTo(targetStatus: TaskStatus)`: 判断是否可以转换到目标状态

**状态流转规则**：
```
NOT_START → IN_PROGRESS → COMPLETED
                           ↑
                          (不可逆)
```

---

### 2. Priority (值对象)

**描述**：任务优先级的不可变表示

**可能值**：
- `HIGH` - 高
- `MEDIUM` - 中
- `LOW` - 低

**方法**：
- `requiresDueDate()`: 判断是否要求截止日期
- `getWeight(): number`: 获取优先级权重 (HIGH=3, MEDIUM=2, LOW=1)

---

### 3. DateRange (值对象)

**描述**：日期范围的不可变表示

**属性**：
| 属性名 | 类型 | 说明 |
|--------|------|------|
| startDate | DateTime | 开始日期 |
| endDate | DateTime | 结束日期 |

**方法**：
- `contains(date: DateTime): boolean`: 判断日期是否在范围内
- `duration(): number`: 计算天数差
- `isValid(): boolean`: 判断日期范围是否有效（结束日期不早于开始日期）

**不变量**：
- 结束日期不能早于开始日期

---

### 4. ReminderMessage (值对象)

**描述**：提醒消息的不可变表示

**属性**：
| 属性名 | 类型 | 说明 |
|--------|------|------|
| content | string | 消息内容 |
| type | string | 消息类型 (INFO, WARNING, URGENT) |

**方法**：
- `format(): string`: 格式化消息文本

---

### 5. Statistics (值对象)

**描述**：统计数据集合

**属性**：
| 属性名 | 类型 | 说明 |
|--------|------|------|
| totalTasks | number | 总任务数 |
| completedTasks | number | 已完成任务数 |
| inProgressTasks | number | 进行中任务数 |
| notStartedTasks | number | 未开始任务数 |

**方法**：
- `completionRate(): number`: 计算完成率百分比
- `isValid(): boolean`: 验证统计数据是否一致

---

## 实体关系图

```
┌──────────┐
│   User   │
└─────┬────┘
      │ 1
      │
      │ *
┌─────▼──────────────────────────────────────────────────┐
│                  TaskList (聚合根)                     │
│  ┌────────────────────────────────────────────────┐   │
│  │                    Task 1                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────┐  │   │
│  │  │TaskStatus  │  │ Priority   │  │DateRange│  │   │
│  │  │(值对象)    │  │ (值对象)   │  │(值对象) │  │   │
│  │  └────────────┘  └────────────┘  └─────────┘  │   │
│  └────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────┐   │
│  │                    Task 2                      │   │
│  │  ┌────────────┐  ┌────────────┐               │   │
│  │  │TaskStatus  │  │ Priority   │               │   │
│  │  └────────────┘  └────────────┘               │   │
│  └────────────────────────────────────────────────┘   │
│                      ...                              │
└───────────────────────────────────────────────────────┘
      │ *
      │
      │ 1
┌─────▼────────────────────┐
│   ReminderPolicy         │
│  ┌──────────────────┐    │
│  │ReminderMessage   │    │
│  │ (值对象)         │    │
│  └──────────────────┘    │
└──────────────────────────┘

      │ *
      │
      │ 1
┌─────▼────────────────────┐
│   ProgressReport         │
│  ┌──────────────────┐    │
│  │   DateRange      │    │
│  │   Statistics     │    │
│  │  (值对象)        │    │
│  └──────────────────┘    │
└──────────────────────────┘
```

---

## 领域服务

### TaskDomainService

**职责**：处理涉及多个聚合根的复杂业务逻辑

**方法**：
- `validateTaskCreation(task: Task, taskList: TaskList): boolean`: 验证任务创建是否合法
- `canUpdateTaskStatus(task: Task, newStatus: TaskStatus): boolean`: 验证状态转换是否合法
- `validatePriorityChange(task: Task, newPriority: Priority): boolean`: 验证优先级修改是否合法

---

## 仓储接口

### ITaskRepository

```typescript
interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
  delete(id: string): Promise<void>;
}
```

---

## 不变量汇总

| 编号 | 描述 | 适用对象 | 触发场景 |
|------|------|----------|----------|
| INV-01 | 任务截止时间不能早于任务创建时间 | Task | 创建任务、更新截止日期 |
| INV-02 | 已完成任务不能再次被修改为未开始或进行中状态 | Task | 更新任务状态 |
| INV-03 | 高优先级任务必须具有截止日期 | Task | 创建高优先级任务、设置高优先级 |
| INV-04 | 同一列表中任务ID必须唯一 | TaskList | 添加任务 |
| INV-05 | DateRange 的结束日期不能早于开始日期 | DateRange | 创建日期范围 |
| INV-06 | Statistics 的总数等于各状态任务数之和 | Statistics | 生成统计 |

---

## 核心场景建模

### 场景 1: 创建学习任务

```
用户 → CreateTaskUseCase
         │
         ├─→ 创建 Task 实体
         │   └─→ 设置 TaskStatus (NOT_STARTED)
         │   └─→ 设置 Priority
         │   └─→ 验证 INV-01, INV-03
         │
         ├─→ TaskList.addTask(task)
         │   └─→ 验证 INV-04
         │
         └─→ ITaskRepository.save(task)
```

---

### 场景 2: 更新任务状态

```
用户 → UpdateTaskStatusUseCase
         │
         ├─→ ITaskRepository.findById(taskId)
         │
         ├─→ TaskDomainService.canUpdateTaskStatus()
         │   └─→ 验证 INV-02
         │
         ├─→ task.updateStatus(newStatus)
         │
         └─→ ITaskRepository.save(task)
```

---

### 场景 3: 生成进度报告

```
用户 → GetProgressReportUseCase
         │
         ├─→ ITaskRepository.findByUserId(userId)
         │
         ├─→ 创建 DateRange(startDate, endDate)
         │   └─→ 验证 INV-05
         │
         ├─→ 创建 Statistics
         │   └─→ 验证 INV-06
         │
         └─→ 创建 ProgressReport
```

---

## 领域事件（扩展）

### 可扩展的领域事件

| 事件名称 | 触发时机 | 携带数据 |
|----------|----------|----------|
| TaskCreated | 任务创建成功 | taskId, userId, createdAt |
| TaskStatusChanged | 任务状态改变 | taskId, oldStatus, newStatus |
| TaskOverdue | 任务逾期 | taskId, dueDate |
| ProgressReportGenerated | 进度报告生成 | reportId, userId, completionRate |

---

## 建模总结

1. **TaskList 是聚合根**：统一管理任务集合，维护一致性
2. **任务状态不可逆**：完成后不能回退，确保进度统计准确
3. **优先级约束**：高优先级任务必须有截止日期
4. **值对象不可变**：TaskStatus、Priority 等一旦创建不能修改
5. **业务规则封装**：所有不变量都在领域层 enforced

---

*此文档描述了 StudyFlow 的领域模型，作为开发和维护的参考依据*