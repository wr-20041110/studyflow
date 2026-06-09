# 代码异味评审报告

## 评审日期
2026-06-03

## 评审范围
StudyFlow 学习任务管理系统 - 领域层和应用层

## 1. 可扩展性问题

### 1.1 ReminderPolicy 功能缺失
**问题描述：**
- `ReminderPolicy` 实体已定义但未被实际使用
- 缺少不同提醒策略的抽象层
- 无法支持多种提醒场景（如到期前提醒、高优先级提醒、每日汇总提醒）

**影响：**
- 添加新的提醒类型需要修改现有代码
- 违反开闭原则（对扩展开放，对修改关闭）

### 1.2 ProgressReport 统计逻辑不灵活
**问题描述：**
- `GetProgressReportUseCase.calculateStatistics()` 方法硬编码了统计逻辑
- 如果需要按不同维度统计（如按优先级、按时间范围），需要修改此方法

**影响：**
- 新增统计口径需要修改现有代码
- 难以支持动态报表需求

### 1.3 TaskService 排序策略不灵活
**问题描述：**
- `listTasksByPriority()` 方法的排序逻辑硬编码
- 优先级顺序、排序规则固定，无法动态调整

**影响：**
- 无法支持自定义排序策略
- 添加新排序规则需要修改方法

---

## 2. 可测试性问题

### 2.1 ReminderPolicy 缺少实际逻辑测试
**问题描述：**
- `ReminderPolicy` 没有相应的测试文件
- 无法验证提醒策略的正确性

**影响：**
- 提醒功能无法进行单元测试
- 难以保证代码质量

### 2.2 业务逻辑与测试用例耦合
**问题描述：**
- 部分测试用例直接依赖特定业务规则
- 测试数据构造复杂

**影响：**
- 业务规则变更时需要大量修改测试
- 测试维护成本高

---

## 3. 违反单一职责原则

### 3.1 GetProgressReportUseCase 职责过多
**问题描述：**
- `GetProgressReportUseCase` 同时负责：
  1. 任务查询
  2. 统计计算
  3. 报告生成
  4. ID 生成

**影响：**
- 修改统计逻辑可能影响其他功能
- 难以单独测试各个职责

### 3.2 TaskService 职责分散
**问题描述：**
- `TaskService` 包含了业务规则验证、数据排序、进度统计等多种职责
- 方法之间耦合度较高

**影响：**
- 难以复用排序逻辑或统计逻辑
- 修改一个功能可能影响其他功能

---

## 4. 可以采用的重构方向

### 4.1 ReminderPolicy 重构（推荐）✨
**设计模式：** 策略模式（Strategy Pattern）

**重构方案：**
1. 定义 `IReminderStrategy` 接口
2. 实现具体策略：
   - `DeadlineReminderStrategy` - 到期前 1 天提醒
   - `HighPriorityReminderStrategy` - 高优先级任务即时提醒
   - `DailySummaryReminderStrategy` - 当日未完成任务汇总提醒
3. 创建 `ReminderService` 来协调策略执行
4. `ReminderPolicy` 作为策略的配置载体

**优势：**
- 新增提醒类型只需添加新策略类
- 符合开闭原则
- 易于测试和维护

### 4.2 ProgressReport 重构
**设计模式：** 模板方法模式（Template Method Pattern）

**重构方案：**
1. 定义抽象基类 `ReportGenerator`
2. 实现具体的报表生成器：
   - `StatusReportGenerator` - 按状态统计
   - `PriorityReportGenerator` - 按优先级统计
   - `DateRangeReportGenerator` - 按时间范围统计
3. 在应用层根据需求选择合适的生成器

**优势：**
- 统一报表生成流程
- 易于扩展新的报表类型

### 4.3 TaskService 排序逻辑重构
**设计模式：** 策略模式（Strategy Pattern）

**重构方案：**
1. 定义 `ITaskSortingStrategy` 接口
2. 实现具体排序策略：
   - `PrioritySortStrategy` - 按优先级排序
   - `DueDateSortStrategy` - 按到期日期排序
   - `CreationDateSortStrategy` - 按创建日期排序
3. 在 `listTasksByPriority` 方法中接受排序策略参数

**优势：**
- 排序逻辑可配置
- 易于添加新的排序规则

---

## 5. 推荐重构优先级

1. **优先级 1：ReminderPolicy 重构** ⭐⭐⭐
   - 符合实验要求的核心主题
   - 实现后可以提供实际的用户价值
   - 结构清晰，易于理解和学习设计模式

2. **优先级 2：ProgressReport 重构** ⭐⭐
   - 提升报表功能的可扩展性
   - 适合学习模板方法模式

3. **优先级 3：TaskService 排序逻辑重构** ⭐
   - 提升排序功能的灵活性
   - 相对简单，适合作为练习

---

## 6. 重构目标

本次实验将以 **ReminderPolicy 策略模式重构** 为主线，实现以下目标：

1. 引入策略模式，实现可扩展的提醒机制
2. 补齐缺失的测试用例
3. 在测试保护下进行安全重构
4. 生成重构前后对比文档
5. 验证重构后代码的可扩展性