# StudyFlow 学习任务管理系统

一个面向个人学习者的任务管理与学习进度跟踪系统，采用领域驱动设计（DDD）分层架构。

## 功能特性

- 创建和管理学习任务
- 设置任务优先级（高、中、低）
- 设置任务提醒时间
- 更新任务状态（未开始、进行中、已完成）
- 查看学习进度统计

## 技术栈

- 语言：TypeScript
- 架构：DDD（领域驱动设计）
- 测试框架：Jest

## 项目结构

```
src/
├── domain/                    # 领域层：核心业务逻辑和模型
│   ├── entity/                # 实体
│   ├── valueobject/           # 值对象
│   ├── repository/            # 仓储接口
│   ├── service/               # 领域服务
│   └── invariant/             # 不变量验证
├── application/               # 应用层：用例编排
│   ├── dto/                   # 数据传输对象
│   ├── service/               # 应用服务
│   └── usecase/               # 用例
├── infrastructure/            # 基础设施层：技术实现
│   ├── repository/            # 仓储实现
│   ├── persistence/           # 持久化
│   └── notification/          # 通知服务
└── interfaces/                # 接口层：对外接口
    ├── cli/                   # 命令行界面
    └── api/                   # API接口（预留）
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 编译项目

```bash
npm run build
```

### 运行 CLI

```bash
npm start
```

### 运行测试

```bash
npm test
```

### 测试覆盖率

```bash
npm test -- --coverage
```

当前测试覆盖情况：
- 测试套件：9 个全部通过
- 测试用例：60 个全部通过
- 总体覆盖率：47.57%
- 核心模块覆盖率：
  - Task 实体：97.95%
  - TaskList 实体：100%
  - 所有值对象：100%
  - InMemoryTaskRepository：100%

## 领域模型

### 核心实体

- **User**：用户
- **Task**：学习任务
- **TaskList**：任务列表
- **ReminderPolicy**：提醒策略
- **ProgressReport**：进度报告

### 值对象

- **TaskStatus**：任务状态（未开始、进行中、已完成）
- **Priority**：优先级（高、中、低）
- **DateRange**：日期范围
- **ReminderMessage**：提醒消息

## 业务规则（不变量）

1. 任务截止时间不能早于任务创建时间
2. 已完成任务不能再次被修改为未开始或进行中状态
3. 高优先级任务必须具有截止日期

## 文档

- [架构文档](docs/architecture.md) - DDD 分层架构说明
- [API 文档](docs/api.md) - RESTful API 接口文档
- [Prompt 记录表](docs/Prompt记录表.md) - Vibe Coding 协作过程记录

## 许可证

MIT