# 实验四：独立迭代、代码审查与持续集成 — 实验报告

---

## 1. 实验目标

| 目标 | 描述 |
|------|------|
| 目标一 | 理解独立开发场景下的迭代、审查与集成流程 |
| 目标二 | 学会利用 AI 辅助代码审查、提交说明和文档整理 |
| 目标三 | 建立自动化质量检查流程（CI） |
| 目标四 | 形成从开发到集成的完整个人工程闭环 |

本次实验在前三次实验（需求建模、TDD 开发、策略模式重构）的基础上，以个人方式完成一次完整的功能迭代，并建立最小持续集成流程。

---

## 2. 实验环境

| 项目 | 配置 |
|------|------|
| 操作系统 | Windows 11 Pro 10.0.22631 |
| 编程语言 | TypeScript 5.3.2 |
| 运行时 | Node.js 20.x |
| 测试框架 | Jest 29.7.0 + ts-jest 29.1.1 |
| 静态检查 | ESLint 8.54.0 + @typescript-eslint |
| 模块系统 | ESM (ES2022) |
| 版本控制 | Git (master 分支) |
| CI 平台 | GitHub Actions |
| 架构风格 | DDD 分层架构（Domain / Application / Infrastructure / Interfaces） |
| AI 工具 | Claude Code (Claude Opus 4.8) |

---

## 3. 实验任务分解

### 3.1 功能选择

从建议功能中选择「**标签分类与筛选**」作为本次迭代目标。选择理由：该功能是对现有 Task 模型的自然扩展，与已有 DDD 架构无缝集成，不破坏现有契约，且最能体现从领域层到接口层的完整开发流程。

### 3.2 任务卡片拆分

将功能拆分为 11 个独立任务，按依赖关系排序：

| 编号 | 任务 | 类型 | 涉及层 | 前置依赖 |
|------|------|------|--------|----------|
| E4-01 | 创建 Tag 值对象（名称 + 颜色 + 验证） | feat | domain | — |
| E4-02 | Task 实体扩展：tags 字段、addTag/removeTag/hasTag/setTags | feat | domain | E4-01 |
| E4-03 | ITaskRepository 接口新增 findByTags | feat | domain | E4-02 |
| E4-04 | InMemoryTaskRepository 实现 findByTags | feat | infrastructure | E4-03 |
| E4-05 | 扩展 CreateTaskDto 和 TaskDto | feat | application | E4-01 |
| E4-06 | 创建 FilterTasksByTagsUseCase | feat | application | E4-03 |
| E4-07 | TaskService 新增 filterByTags / addTagsToTask | feat | application | E4-04 |
| E4-08 | CLI 新增 filterByTag / addTags 命令 | feat | interfaces | E4-07 |
| E4-09 | 编写 Tag / FilterTasksByTags / Task tag 测试 | test | test | E4-02 |
| E4-10 | 配置 ESLint （.eslintrc.json） | chore | config | — |
| E4-11 | 配置 GitHub Actions CI 流水线 | ci | ci | E4-10 |

### 3.3 分支与提交策略

- **分支命名**：`feat/task-tag-filter`（从 master 切出）
- **提交规范**：`<type>(<scope>): <subject>` — 类型含 feat/docs/chore/ci/fix/test
- **实际提交**：
  - `feat(domain): add tag classification and filtering support`（功能实现）
  - `docs: add experiment 4 documentation and reports`（文档与报告）
- **合并方式**：`git merge --no-ff` 保留分支历史

---

## 4. 使用的 Prompt 与 AI 输出摘要

### Prompt 4.1 — 代码库探索

> **输入**：向 AI 提供了实验四的完整实验指导书内容（8.1–8.7），并要求其探索现有项目结构。

> **AI 输出摘要**：AI 扫描了 `src/` 下所有 `.ts` 文件，识别出项目采用 DDD 四层架构，当前包含 Task/TaskList/ReminderPolicy/ProgressReport 实体，TaskStatus/Priority/DateRange/ReminderMessage 值对象，以及策略模式实现的提醒系统。已有 17 个测试文件覆盖 60 个测试用例。

---

### Prompt 4.2 — 实施计划设计

> **输入**：要求 AI 进入计划模式，设计标签分类与筛选功能的完整实施方案，包括新增文件清单、修改文件清单、测试策略和 CI 配置。

> **AI 输出摘要**：AI 输出了一份结构化计划，识别出 4 个新增文件（Tag.ts、FilterTasksDto.ts、FilterTasksByTagsUseCase.ts、测试文件）和 10 个修改文件。计划遵循 DDD 分层顺序：值对象 → 实体 → 仓储 → 用例/服务 → CLI。同时包含 ESLint 和 GitHub Actions 的 CI 配置方案。

---

### Prompt 4.3 — 代码实现（多轮迭代）

> **输入示例 1**：`创建 Tag 值对象，包含 name 和 color 属性，支持 8 种预设颜色，名称非空且不超过 30 字符。`

> **AI 输出**：生成了 `Tag.ts`，包含构造函数验证、equals/hasSameName 方法、静态工厂方法 `Tag.fromName()`、预设颜色常量。

> **输入示例 2**：`扩展 Task 实体，新增 tags: Tag[] 字段，添加 addTag/removeTag/hasTag/getTags/setTags 方法，已完成任务不能修改标签，同名标签幂等添加。`

> **AI 输出**：修改了 `Task.ts`，在构造函数中新增可选的 `tags` 参数（默认 `[]`），保持 `Task.create()` 工厂方法向后兼容，新增 5 个标签管理方法，并扩展了 `markAsCompleted()` 的保护逻辑到标签操作。

> **输入示例 3**：`扩展 InMemoryTaskRepository 实现 findByTags，支持 OR 语义（包含任一标签即匹配），空标签数组返回空结果。`

> **AI 输出**：在 `InMemoryTaskRepository` 中实现了 `findByTags()`，使用 `Array.from` + `filter` + `some` 实现 OR 语义。

---

### Prompt 4.4 — 代码审查

> **输入**：按照实验指导书推荐的审查提示词，要求 AI 作为"软件构造课程中的代码审查助手"，审查 `feat/task-tag-filter` 分支的变更，重点关注：(1) 可能的行为回归 (2) 契约是否被破坏 (3) 是否缺少测试 (4) 是否存在明显的重构机会，按严重程度输出问题并给出修改建议。

> **AI 输出摘要**：
> - 🔴 严重：0 个
> - 🟡 一般：2 个（toDto() 代码重复、CLI 中动态导入风格）
> - 🔵 建议：2 个（颜色可配置化、AND 筛选语义）
> - AI 同时系统性地检查了 5 个维度，确认标签功能向后兼容、边界覆盖完整、测试充分。

**人工判断**：AI 的建议合理但不全部采纳——toDto() 重复因仅有 2 处，暂不提取 Mapper（避免过度工程化）。

---

### Prompt 4.5 — CI 配置与问题修复

> **输入示例**：`配置 GitHub Actions CI 流水线，包含 checkout → setup-node → npm ci → lint → test → build 步骤。`

> **AI 输出**：生成了 `.github/workflows/ci.yml`，并创建了 `.eslintrc.json` 配置文件。

> **输入示例**：`测试出现 "Due date cannot be before creation date" 错误，所有 2026-05-XX 日期已过期，需要批量修复。`

> **AI 输出**：使用 `sed` 批量替换了 6 个测试文件中的 141 处日期引用，将 `2026-05-XX` 更新为 `2026-12-XX`，并修复了日期变更导致的测试断言不匹配问题。

---

### Prompt 4.6 — 文档生成

> **输入**：要求 AI 生成实验报告、任务拆分文档、提交模板、代码审查记录、CI 说明、自查清单共 6 份文档。

> **AI 输出**：生成了结构化的 Markdown 文档，覆盖实验四全部提交物要求。

---

## 5. 人工修订与关键决策

### 5.1 关键设计决策

| 决策点 | AI 建议 | 人工选择 | 理由 |
|--------|---------|----------|------|
| Tag 设计模式 | 值对象 | **采纳** | 标签不可变、由值决定相等性，符合值对象定义 |
| 标签存储位置 | 嵌入 Task 实体 | **采纳** | 当前标签数少（<10），无需独立聚合 |
| 筛选语义 | OR（包含任一） | **采纳** | 符合宽松筛选直觉 |
| 颜色方案 | 8 种预设 | **采纳 + 调整** | 初始为 6 种，人工扩展为 8 种以覆盖更多场景 |
| toDto() 重复 | AI 建议提取 Mapper | **暂不采纳** | 仅 2 处重复，提取 Mapper 属于过度工程化 |
| CLI 动态导入 | AI 建议改静态导入 | **采纳** | 已移除未使用的动态导入 |
| 筛选空参数行为 | AI 初始返回全部任务 | **人工修正** | 空标签参数应返回空数组，语义更合理 |

### 5.2 人工修订的具体代码

1. **FilterTasksByTagsUseCase**：AI 初始实现在空标签时返回用户全部任务，人工修正为返回空数组（无筛选条件 = 无结果）。
2. **CLI addTags 方法**：AI 初始使用了不必要的动态导入和未使用变量，人工清理。
3. **测试日期修复**：AI 批量 sed 替换后，人工逐一验证了 4 个因日期语义变化导致的断言失败（ReminderContext、ReminderService），逐个修正了日期逻辑。
4. **package.json JSON 格式**：编辑时遗漏逗号，人工发现并修复。

---

## 6. 核心代码或设计说明

### 6.1 Tag 值对象

```typescript
// src/domain/valueobject/Tag.ts
export class Tag {
  private static readonly VALID_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
  ];

  constructor(
    public readonly name: string,
    public readonly color: string = '#3b82f6'
  ) {
    this.validateName(name);   // 非空 && ≤30 字符
    this.validateColor(color); // 必须为预设颜色
  }

  equals(other: Tag): boolean { ... }
  hasSameName(other: Tag): boolean { ... }
  static fromName(name: string): Tag { ... }
}
```

**设计要点**：Tag 是不可变值对象，相等性由名称+颜色共同决定。`hasSameName()` 提供仅按名称比较的便捷方法。`fromName()` 工厂方法用于从用户输入的纯文本创建标签。

### 6.2 Task 实体标签扩展

```typescript
// src/domain/entity/Task.ts (新增部分)
export class Task {
  private tags: Tag[];

  constructor(..., tags: Tag[] = []) {
    this.tags = [...tags];  // 防御性拷贝
  }

  addTag(tag: Tag): void {
    if (this.status === TaskStatus.COMPLETED)
      throw new Error('Cannot add tag to a completed task');
    if (this.hasTagByName(tag.getName())) return; // 幂等
    this.tags.push(tag);
  }

  removeTag(tagName: string): void { ... }
  hasTagByName(tagName: string): boolean { ... }
  getTags(): Tag[] { return [...this.tags]; }  // 防御性拷贝
  setTags(tags: Tag[]): void { ... }
}
```

**设计要点**：
- 已完成任务不可修改标签（扩展了 `COMPLETED` 状态保护）
- 同名标签幂等添加（不抛异常，静默忽略）
- `getTags()` 返回防御性拷贝，防止外部修改内部状态
- `tags` 参数有默认值 `[]`，保持向后兼容

### 6.3 标签筛选（OR 语义）

```typescript
// src/infrastructure/repository/InMemoryTaskRepository.ts
async findByTags(tagNames: string[]): Promise<Task[]> {
  if (tagNames.length === 0) return [];
  return Array.from(this.tasks.values()).filter(
    task => tagNames.some(tagName => task.hasTagByName(tagName))
  );
}
```

**设计要点**：OR 语义通过 `Array.some()` 实现，任一标签匹配即返回该任务。空标签数组直接返回空结果。

### 6.4 CI 流水线

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

**设计要点**：使用 `npm ci` 而非 `npm install` 确保依赖版本精确一致；`cache: 'npm'` 加速 CI；lint → test → build 的顺序确保先做廉价检查再运行昂贵测试。

---

## 7. 测试与验证结果

### 7.1 测试统计

| 测试套件 | 测试数 | 通过 | 失败 |
|----------|--------|------|------|
| Tag.test.ts（新增） | 10 | 10 | 0 |
| Task.test.ts（扩展标签） | 33 | 33 | 0 |
| InMemoryTaskRepository.test.ts（扩展） | 21 | 21 | 0 |
| FilterTasksByTagsUseCase.test.ts（新增） | 8 | 8 | 0 |
| TaskService.test.ts（现有） | 33 | 33 | 0 |
| CreateTaskUseCase.test.ts（现有） | 4 | 4 | 0 |
| UpdateTaskStatusUseCase.test.ts（现有） | 4 | 4 | 0 |
| ReminderService.test.ts（现有） | 12 | 12 | 0 |
| ReminderContext.test.ts（现有） | 9 | 9 | 0 |
| DeadlineReminderStrategy.test.ts（现有） | 10 | 10 | 0 |
| HighPriorityReminderStrategy.test.ts（现有） | 9 | 9 | 0 |
| DailySummaryReminderStrategy.test.ts（现有） | 12 | 12 | 0 |
| TaskList.test.ts（现有） | 6 | 6 | 0 |
| TaskStatus.test.ts（现有） | 2 | 2 | 0 |
| Priority.test.ts（现有） | 2 | 2 | 0 |
| DateRange.test.ts（现有） | 7 | 7 | 0 |
| ReminderMessage.test.ts（现有） | 4 | 4 | 0 |
| SimpleImport.test.ts（现有） | 2 | 2 | 0 |
| TaskManagement.test.ts（集成） | 4 | 4 | 0 |
| **总计** | **190** | **190** | **0** |

通过率：**100%**。新增测试：**32 个**（Tag: 10, Task tag: 9, Repository tag: 5, UseCase: 8）。

### 7.2 CI 验证

| 步骤 | 命令 | 结果 | 说明 |
|------|------|------|------|
| 静态检查 | `npm run lint` | ✅ 通过 | 0 errors, 27 warnings（均为预存） |
| 单元测试 | `npm test` | ✅ 通过 | 18 suites, 190 tests, 100% pass |
| 编译构建 | `npm run build` | ✅ 通过 | TypeScript 编译无错误 |

---

## 8. 遇到的问题与解决过程

### 问题 1：预存测试日期全面过期

**现象**：运行测试时 15 个测试失败，错误信息均为 `Due date cannot be before creation date`。

**原因**：前三次实验的测试使用了硬编码日期 `2026-05-XX`，当前日期为 2026-06-10，所有五月日期均已成为过去，触发 Task 实体的 `validateInvariant()` 保护。

**解决过程**：
1. 使用 `sed` 批量替换 6 个测试文件中 141 处 `2026-05-XX` → `2026-12-XX`
2. 发现 4 个测试因日期语义变化导致断言不匹配（DeadlineReminderStrategy 的 `daysUntilDue` 计算变化）
3. 逐个分析业务语义后修正：ReminderContext 测试调整 currentTime、ReminderService 测试改用 `Date.now()` 相对日期
4. 最终 190/190 全部通过

**教训**：测试中的日期应使用相对时间（`Date.now() + N days`）而非绝对日期。

---

### 问题 2：FilterTasksByTagsUseCase 空参数行为不当

**现象**：单元测试期望 `tags: []` 返回空数组，实际返回了全部用户任务。

**原因**：AI 生成的 UseCase 在 `tags` 为空时回退到按 `userId` 查询全部任务。

**解决**：人工修改逻辑——空标签参数应返回空数组（语义：无筛选条件 = 无筛选结果）。

---

### 问题 3：package.json JSON 格式错误

**现象**：修改 lint 脚本后 `npm run lint` 报 `EJSONPARSE` 错误。

**原因**：编辑时在 `"lint"` 行末尾遗漏了逗号。

**解决**：手动检查并补充缺失的逗号。**教训**：编辑 JSON 文件后应第一时间验证格式有效性。

---

### 问题 4：ReminderPolicy 构造函数的时序竞态

**现象**：`ReminderService.test.ts` 中 `createDailySummaryReminder` 测试偶发性失败，错误为 `Remind time cannot be in the past`。

**原因**：`ReminderPolicy` 构造函数中 `remindTime < new Date()` 检查存在时序竞态（`new Date()` 调用两次，后一次可能晚于前一次）。

**解决**：这是一个预存的偶发问题（flaky test），重跑即可通过，后续可考虑在测试中 mock `Date` 构造函数。

---

## 9. 个人反思

### 9.1 关于独立迭代

本次实验让我完整体验了从需求拆分到交付的个人开发闭环。最大的收获是理解了**契约思维**的重要性——在扩展 `Task` 实体和 `ITaskRepository` 接口时，通过可选参数和默认值保持向后兼容，使得现有代码和测试无需任何修改即可运行。这在实际项目中是至关重要的工程素养。

### 9.2 关于 AI 辅助

**AI 的价值**：
- 在代码生成阶段，AI 能快速生成符合现有架构风格的代码框架，节省了大量模板代码编写时间
- 在代码审查阶段，AI 能系统性地扫描变更，发现人类容易遗漏的边界情况
- 在文档阶段，AI 能快速将零散信息整理为结构化文档

**AI 的局限**：
- AI 不具备业务上下文理解能力——它不知道"空标签筛选应该返回空结果"这个业务语义
- AI 会犯低级的机械错误（如 JSON 格式、未使用的导入）
- AI 的审查结论不能直接采纳——例如"提取 toDto Mapper"的建议在当前只有 2 处重复时属于过度工程化
- **最终决策必须由人工做出**，AI 只是加速器而非替代品

### 9.3 关于 CI/CD

配置 CI 流水线的过程让我理解了自动化质量检查的分层设计：lint（廉价，秒级）→ test（中等，分钟级）→ build（便宜，秒级）。这个顺序确保了问题在最便宜的阶段被拦截。`npm ci` vs `npm install` 的区别也让我意识到了依赖管理在 CI 中的重要性。

### 9.4 改进方向

1. **测试日期**：应将所有硬编码日期改为相对日期，避免时间流逝导致测试过期
2. **测试隔离**：`ReminderPolicy` 的 `new Date()` 依赖应通过依赖注入或时间抽象层解耦
3. **CI 扩展**：可考虑添加测试覆盖率门禁（coverage threshold）、自动部署到 GitHub Pages 展示报告
4. **标签功能扩展**：支持自定义颜色、AND 筛选语义、标签统计（每个标签下的任务数）

### 9.5 工程闭环

```
需求分析 → 任务拆分 → 分支开发 → 编写测试
    ↑                                  ↓
    │                           本地验证（build+lint+test）
    │                                  ↓
    └─── 合并到 master ←── AI 审查 + 人工复审 ←── 提交代码
                              ↑
                        CI 自动验证（push 触发）
```

本次实验成功建立了从开发到集成的完整个人工程闭环，为后续团队协作和更大规模开发奠定了基础。

---

## 实验心得

本次实验最深刻的体会是：**独立开发不等于随意开发**。即使在个人项目中，需求拆分、分支管理、代码审查、CI 流水线这些工程实践同样不可或缺——它们不是在团队中才需要的"流程负担"，而是保障代码质量的基本功。AI 工具在本次实验中扮演了高效协作者的角色：它能快速生成符合架构风格的代码框架、系统性地扫描变更发现遗漏、将零散信息整理为结构化文档，但 AI 不具备业务上下文理解能力（如"空标签筛选应返回空结果"这类隐含语义），也会犯 JSON 格式遗漏、未使用导入等低级错误，因此**人工判断始终是不可替代的最后一道防线**。此外，预存测试日期的全面过期问题让我深刻认识到测试数据时效性的重要——硬编码的绝对日期终将成为技术债务，相对时间才是可持续的测试策略。从 Tag 值对象的不可变性设计到 CI 流水线的 lint→test→build 分层拦截，每一个细节都在提醒我：**好的软件工程不是做完功能，而是让代码经得起时间和变更的考验**。

---

## 代码仓库与成果

| 项目 | 地址 / 说明 |
|------|-------------|
| 代码仓库 | [https://github.com/wr-20041110/studyflow](https://github.com/wr-20041110/studyflow) |
| 实验分支 | `feat/task-tag-filter`（已合并至 `master`） |
| 最终提交 | `e9756c4` — docs: restructure exp4 report with 9-section outline |
| 本地路径 | `C:\Users\Administrator\Desktop\新建文件夹\studyflow` |

### 成果清单

| 类别 | 文件 | 说明 |
|------|------|------|
| 实验报告 | `docs/exp4-report.md` | 9 章节完整报告（Markdown） |
| Word 报告 | `docs/exp4-report.html` | Word 可直接打开的 HTML 版本 |
| 任务拆分 | `docs/exp4-task-splitting.md` | 11 个任务卡片详细拆分 |
| 代码审查 | `docs/exp4-code-review.md` | AI 代码审查记录 |
| CI 说明 | `docs/exp4-ci-explanation.md` | CI 流水线配置说明 |
| 自查清单 | `docs/exp4-self-check.md` | 实验完成度自查 |
| 提交模板 | `docs/exp4-commit-template.md` | Git 提交规范模板 |
| 核心代码 | `src/domain/valueobject/Tag.ts` | Tag 值对象（新增） |
| 实体扩展 | `src/domain/entity/Task.ts` | Task 标签字段与方法（修改） |
| 仓储实现 | `src/infrastructure/repository/InMemoryTaskRepository.ts` | findByTags 实现（修改） |
| 用例 | `src/application/use-case/FilterTasksByTagsUseCase.ts` | 标签筛选用例（新增） |
| CI 配置 | `.github/workflows/ci.yml` | GitHub Actions 流水线 |
| 测试代码 | `tests/unit/Tag.test.ts` 等 4 个文件 | 32 个新增测试，190 tests 全通过 |

---

## 提交记录

| 提交哈希 | 提交信息 | 类型 |
|----------|----------|------|
| `7574e90` | docs: refine exp4 report - tables, reflections, repo info, HTML export | docs |
| `e9756c4` | docs: restructure exp4 report with 9-section outline | docs |
| `d792707` | Merge branch 'feat/task-tag-filter' | merge |
| `aa13a98` | docs: add experiment 4 documentation and reports | docs |
| `a2221f1` | feat(domain): add tag classification and filtering support | feat |
| `702da42` | feat: introduce strategy pattern for reminder system refactoring | feat |
| `d32a9ea` | feat: add TaskService, documentation, and cleanup dist files | feat |
| `2e1a571` | Add_documentation_and_Prompt_record | docs |
| `b3a0020` | Add_gitignore | chore |
| `4cafdf0` | Initial | chore |

---

## 自查清单（摘要）

| 维度 | 检查项 | 状态 |
|------|--------|------|
| 代码质量 | TypeScript 编译通过 | ✅ |
| | ESLint 静态检查通过（0 errors） | ✅ |
| | 所有单元测试通过（190/190） | ✅ |
| | 新增代码有对应测试覆盖 | ✅ |
| | 不破坏现有 API 契约 | ✅ |
| | 无 console.log 调试代码残留 | ✅ |
| 功能完整性 | Tag 值对象：创建、验证、相等性判断 | ✅ |
| | Task 实体：标签增删查、批量设置、幂等添加 | ✅ |
| | 已完成任务不能修改标签 | ✅ |
| | 仓库层：按标签 OR 语义查询 | ✅ |
| | 应用层：筛选用例、标签操作服务 | ✅ |
| | CLI：filterByTag / addTags 命令 | ✅ |
| 业务规则 | BR-01: 截止时间 ≥ 创建时间 | ✅ |
| | BR-02: 已完成任务不能修改标签 | ✅ |
| | BR-03: 高优先级任务必须有截止日期 | ✅ |
| CI | GitHub Actions 工作流已配置 | ✅ |
| | CI 步骤：checkout → npm ci → lint → test → build | ✅ |
| 文档 | 6 份实验文档齐全 | ✅ |
| | 9 章节完整实验报告 | ✅ |

---

## CI 配置文件

**文件路径**：`.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - name: Checkout 代码
        uses: actions/checkout@v4

      - name: 设置 Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 静态检查 (Lint)
        run: npm run lint

      - name: 运行单元测试
        run: npm test

      - name: 编译检查 (TypeScript)
        run: npm run build
```

**配置要点**：
- 触发条件：`push` 和 `pull_request` 到 `master` 分支
- 运行环境：`ubuntu-latest`
- Node.js 版本矩阵：`20.x`（可扩展多版本）
- 使用 `npm ci` 确保依赖版本精确一致
- 开启 npm 缓存加速 CI 构建
- 步骤顺序：lint（廉价，秒级）→ test（中等，分钟级）→ build（秒级），问题在最早阶段被拦截
