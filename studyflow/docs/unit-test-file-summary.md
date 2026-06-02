# TaskService 单元测试文件说明

## 文件位置
`studyflow/test/unit/application/TaskService.test.ts`

## 文件结构概览

```typescript
/// <reference types="@types/jest" />
import { jest } from '@jest/globals';

// 导入被测试的类和相关依赖
import { TaskService } from '../../../src/application/service/TaskService.js';
import { ITaskRepository } from '../../../src/domain/repository/ITaskRepository.js';
import { Task } from '../../../src/domain/entity/Task.js';
import { Priority } from '../../../src/domain/valueobject/Priority.js';
import { TaskStatus } from '../../../src/domain/valueobject/TaskStatus.js';
import { CreateTaskCommand } from '../../../src/application/service/ITaskService.js';

// 测试套件结构
describe('TaskService - createTask', () => { ... });
describe('TaskService - completeTask', () => { ... });
describe('TaskService - listTasksByPriority', () => { ... });
describe('TaskService - listDueTasks', () => { ... });
describe('TaskService - getProgressByUser', () => { ... });
```

## 测试套件详细说明

### 1. createTask 测试套件（13个测试）

#### 1.1 正常路径测试（3个）
```typescript
describe('正常路径测试', () => {
  test('应成功创建低优先级任务（有到期时间）', async () => { ... });
  test('应成功创建中优先级任务（有到期时间）', async () => { ... });
  test('应成功创建高优先级任务（有到期时间）', async () => { ... });
});
```

**测试内容**：
- 验证不同优先级的任务创建
- 检查返回的任务对象属性
- 验证任务状态为NOT_STARTED
- 验证仓储的save方法被调用

#### 1.2 边界值测试（5个）
```typescript
describe('边界值测试', () => {
  test('应允许title长度恰好为200', async () => { ... });
  test('应拒绝title长度为201', async () => { ... });
  test('应允许description长度恰好为1000', async () => { ... });
  test('应拒绝description长度为1001', async () => { ... });
  test('应允许description为空字符串', async () => { ... });
});
```

**测试内容**：
- 验证title最大长度限制（200字符）
- 验证description最大长度限制（1000字符）
- 验证允许空description
- 验证超过长度限制时抛出异常

#### 1.3 非法输入测试（3个）
```typescript
describe('非法输入测试', () => {
  test('应拒绝title为空字符串', async () => { ... });
  test('应拒绝title为null', async () => { ... });
  test('应拒绝userId为空字符串', async () => { ... });
});
```

**测试内容**：
- 验证空title被拒绝
- 验证null title被拒绝
- 验证空userId被拒绝

#### 1.4 业务规则测试（2个）
```typescript
describe('业务规则测试', () => {
  test('高优先级任务必须有到期时间（无到期时间应失败）', async () => { ... });
  test('高优先级任务的到期时间不能是过去', async () => { ... });
});
```

**测试内容**：
- 验证高优先级任务必须有到期时间
- 验证到期时间不能是过去时间

---

### 2. completeTask 测试套件（5个测试）

#### 2.1 正常路径测试（2个）
```typescript
describe('正常路径测试', () => {
  test('应成功完成NOT_STARTED状态的任务', async () => { ... });
  test('应成功完成IN_PROGRESS状态的任务', async () => { ... });
});
```

**测试内容**：
- 验证NOT_STARTED任务可以完成
- 验证IN_PROGRESS任务可以完成
- 验证markAsCompleted方法被调用
- 验证save方法被调用

#### 2.2 边界值测试（1个）
```typescript
describe('边界值测试', () => {
  test('重复完成已完成的任务应幂等', async () => { ... });
});
```

**测试内容**：
- 验证重复完成已完成的任务不会出错（幂等性）

#### 2.3 非法输入测试（1个）
```typescript
describe('非法输入测试', () => {
  test('完成不存在的任务应抛出异常', async () => { ... });
});
```

**测试内容**：
- 验证完成不存在的任务时抛出异常

#### 2.4 业务规则测试（1个）
这个测试套件中的"正常路径测试"已经涵盖了业务规则

---

### 3. listTasksByPriority 测试套件（5个测试）

#### 3.1 正常路径测试（2个）
```typescript
describe('正常路径测试', () => {
  test('应按优先级排序返回用户的任务（HIGH > MEDIUM > LOW）', async () => { ... });
  test('应正确处理没有到期时间的任务（排在同优先级最后）', async () => { ... });
});
```

**测试内容**：
- 验证优先级排序顺序：HIGH > MEDIUM > LOW
- 验证同优先级内按到期时间排序
- 验证null dueDate任务排在最后

#### 3.2 边界值测试（2个）
```typescript
describe('边界值测试', () => {
  test('用户没有任务应返回空数组', async () => { ... });
  test('所有任务优先级相同应按到期时间排序', async () => { ... });
});
```

**测试内容**：
- 验证没有任务时返回空数组
- 验证相同优先级时按到期时间排序

---

### 4. listDueTasks 测试套件（5个测试）

#### 4.1 正常路径测试（1个）
```typescript
describe('正常路径测试', () => {
  test('应返回指定日期之前到期的未完成任务', async () => { ... });
});
```

**测试内容**：
- 验证返回到期时间在指定日期及之前的未完成任务
- 验证包含NOT_STARTED和IN_PROGRESS状态的任务

#### 4.2 边界值测试（2个）
```typescript
describe('边界值测试', () => {
  test('指定日期没有到期任务应返回空数组', async () => { ... });
  test('任务到期时间恰好为指定日期应包含在结果中', async () => { ... });
});
```

**测试内容**：
- 验证没有到期任务时返回空数组
- 验证到期时间恰好为指定日期的任务被包含

#### 4.3 业务规则测试（2个）
```typescript
describe('业务规则测试', () => {
  test('不应包含已完成的任务', async () => { ... });
  test('不应包含没有到期时间的任务', async () => { ... });
});
```

**测试内容**：
- 验证不包含COMPLETED状态的任务
- 验证不包含null dueDate的任务

---

### 5. getProgressByUser 测试套件（5个测试）

#### 5.1 正常路径测试（2个）
```typescript
describe('正常路径测试', () => {
  test('应正确统计用户的任务完成情况', async () => { ... });
  test('应正确计算只有一种状态任务的统计', async () => { ... });
});
```

**测试内容**：
- 验证正确计算总数、已完成、进行中、未开始
- 验证完成率计算正确
- 验证只有一种状态时的统计

#### 5.2 边界值测试（3个）
```typescript
describe('边界值测试', () => {
  test('用户没有任务应返回全零统计', async () => { ... });
  test('所有任务都已完成应计算正确', async () => { ... });
  test('所有任务都未开始应计算正确', async () => { ... });
});
```

**测试内容**：
- 验证没有任务时返回全零统计
- 验证所有任务都完成时的统计
- 验证所有任务都未开始时的统计

#### 5.3 业务规则测试（1个）
```typescript
describe('业务规则测试', () => {
  test('完成率计算应正确（已完成/总数）', async () => { ... });
});
```

**测试内容**：
- 验证完成率 = 已完成任务数 / 总任务数
- 验证小数精度的处理

---

## Mock 设置模式

### 标准Mock设置
```typescript
beforeEach(() => {
  mockRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    delete: jest.fn(),
    findByStatus: jest.fn(),
    findByPriority: jest.fn(),
    findByUserIdAndStatus: jest.fn(),
  } as unknown as jest.Mocked<ITaskRepository>;

  taskService = new TaskService(mockRepository);
});
```

### 动态Mock设置
```typescript
// 根据参数返回不同结果
mockRepository.findByStatus.mockImplementation((status: TaskStatus) => {
  if (status === TaskStatus.NOT_STARTED) return Promise.resolve([task]);
  return Promise.resolve([]);
});
```

### 固定返回值设置
```typescript
// @ts-expect-error
mockRepository.findByStatus.mockResolvedValue([task]);
```

---

## 测试运行结果

```bash
Test Suites: 1 passed, 1 total
Tests:       33 passed, 33 total
Snapshots:   0 total
Time:        1.012 s
```

---

## 测试特点

1. **命名规范**：所有测试使用中文命名，清晰反映业务语义
2. **全面覆盖**：覆盖了正常路径、边界条件、异常输入和业务规则
3. **独立性**：每个测试使用beforeEach重置mock，保证测试独立
4. **可读性**：使用describe嵌套结构，逻辑清晰
5. **TDD实践**：遵循先写测试，再实现的原则