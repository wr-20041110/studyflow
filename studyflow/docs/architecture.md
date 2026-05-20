# StudyFlow 架构文档

## 概述

StudyFlow 采用领域驱动设计（DDD）的分层架构，将系统划分为四层：领域层、应用层、基础设施层和接口层。

## 分层架构

### 1. 领域层 (Domain Layer)

领域层是系统的核心，封装了核心业务逻辑和领域模型。

#### 实体 (Entity)

- **User**: 用户
- **Task**: 学习任务
- **TaskList**: 任务列表
- **ReminderPolicy**: 提醒策略
- **ProgressReport**: 进度报告

#### 值对象 (Value Object)

- **TaskStatus**: 任务状态枚举（未开始、进行中、已完成）
- **Priority**: 优先级枚举（高、中、低）
- **DateRange**: 日期范围
- **ReminderMessage**: 提醒消息

#### 仓储接口 (Repository Interface)

领域层定义仓储接口，由基础设施层实现：

- **ITaskRepository**: 任务仓储接口

#### 领域服务 (Domain Service)

- **TaskDomainService**: 任务领域服务，提供任务验证和状态转换验证

#### 不变量验证 (Invariant)

- **TaskInvariant**: 任务不变量验证器

### 2. 应用层 (Application Layer)

应用层负责用例编排，协调领域对象完成业务功能。

#### 数据传输对象 (DTO)

- **CreateTaskDto**: 创建任务DTO
- **UpdateTaskDto**: 更新任务DTO
- **TaskDto**: 任务DTO

#### 用例 (Use Case)

- **CreateTaskUseCase**: 创建任务用例
- **UpdateTaskStatusUseCase**: 更新任务状态用例
- **GetProgressReportUseCase**: 获取进度报告用例

### 3. 基础设施层 (Infrastructure Layer)

基础设施层提供技术支撑，实现领域层定义的接口。

#### 仓储实现

- **InMemoryTaskRepository**: 内存任务仓储

#### 持久化

- **LocalStorageAdapter**: 本地存储适配器

#### 通知服务

- **ConsoleNotificationService**: 控制台通知服务

### 4. 接口层 (Interfaces Layer)

接口层负责对外提供接口，接收请求并返回响应。

#### CLI

- **TaskCLI**: 命令行界面

#### API (预留)

- **TaskController**: 任务控制器

## 依赖关系

```
Interfaces ───> Application ───> Domain
                           ↑
                       Infrastructure
```

- **领域层**: 不依赖任何其他层，完全独立
- **应用层**: 依赖领域层
- **基础设施层**: 实现领域层定义的接口，依赖领域层
- **接口层**: 依赖应用层

## 设计原则

1. **依赖倒置原则**: 高层模块不依赖低层模块，都依赖于抽象
2. **单一职责原则**: 每个类/模块只有一个改变的理由
3. **开闭原则**: 对扩展开放，对修改关闭
4. **接口隔离原则**: 使用多个专门的接口，而不是单一的总接口

## 业务规则（不变量）

| 编号 | 描述 |
|------|------|
| INV-01 | 任务截止时间不能早于任务创建时间 |
| INV-02 | 已完成任务不能再次被修改为未开始或进行中状态 |
| INV-03 | 高优先级任务必须具有截止日期 |

## 状态流转

```
未开始 ──────> 进行中 ──────> 已完成
   ↑                              │
   └──────────────────────────────┘
          (不可逆)
```