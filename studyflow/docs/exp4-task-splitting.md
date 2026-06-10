# 实验四 - 任务拆分与自查清单

## 1. 功能点拆分

本次迭代选择实现「**标签分类与筛选**」功能，将大功能拆分为以下任务卡片：

### 任务卡片

| 编号 | 任务 | 类型 | 范围 | 预估时间 | 状态 |
|------|------|------|------|----------|------|
| E4-01 | 创建 Tag 值对象 | feat | domain | 30min | ✅ 完成 |
| E4-02 | Task 实体扩展标签字段和方法 | feat | domain | 30min | ✅ 完成 |
| E4-03 | ITaskRepository 新增 findByTags | feat | domain | 15min | ✅ 完成 |
| E4-04 | InMemoryTaskRepository 实现 findByTags | feat | infrastructure | 20min | ✅ 完成 |
| E4-05 | 扩展 DTO (CreateTaskDto, TaskDto) | feat | application | 15min | ✅ 完成 |
| E4-06 | 创建 FilterTasksByTagsUseCase | feat | application | 30min | ✅ 完成 |
| E4-07 | TaskService 新增 filterByTags / addTagsToTask | feat | application | 30min | ✅ 完成 |
| E4-08 | CLI 新增 filterByTag / addTags 命令 | feat | interfaces | 30min | ✅ 完成 |
| E4-09 | 编写 Tag 和筛选用例单元测试 | test | test | 45min | ✅ 完成 |
| E4-10 | 配置 ESLint | chore | config | 15min | ✅ 完成 |
| E4-11 | 配置 CI Pipeline (GitHub Actions) | chore | ci | 30min | ✅ 完成 |

### 任务依赖关系

```
E4-01 (Tag VO) ──→ E4-02 (Task 扩展) ──→ E4-03 (Repository 接口)
                                              │
                    E4-05 (DTO) ←──────────────┤
                    E4-06 (UseCase) ←──────────┤
                    E4-07 (Service) ←──────────┤
                    E4-08 (CLI) ←──────────────┤
                    E4-09 (Tests) ←────────────┤
                    
E4-10 (ESLint) ────→ E4-11 (CI Pipeline)
```

## 2. 分支命名规范

```
feat/task-tag-filter    # 新功能开发
fix/reminder-null-check # Bug 修复
refactor/reminder-strategy # 重构
test/add-tag-coverage   # 测试补充
docs/exp4-report        # 文档编写
ci/add-github-actions   # CI 配置
```

规范说明：
- 前缀表示操作类型：feat / fix / refactor / test / docs / chore / ci
- 使用 kebab-case 命名
- 简洁描述改动内容
- 中英文均可，优先英文

## 3. 提交说明模板

```
<type>(<scope>): <subject>

<body>

<footer>
```

| 字段 | 说明 | 示例 |
|------|------|------|
| type | 提交类型 | feat, fix, refactor, test, docs, chore, ci |
| scope | 影响范围 | domain, application, infrastructure, interfaces, config |
| subject | 简短描述（≤50字符） | "add tag classification and filtering support" |
| body | 详细说明（可选） | 列出改动内容、动机和影响 |
| footer | 脚注（可选） | 关联 Issue: #123 |

示例：
```
feat(domain): add Tag value object with preset colors

- Tag class with name validation (non-empty, ≤30 chars)
- 8 preset colors for visual categorization
- equals() and hasSameName() comparison methods
- Tag.fromName() factory method

Co-Authored-By: 王然 <student@example.com>
```

## 4. 提交前自查清单

- [ ] 代码编译通过 (`npm run build`)
- [ ] 静态检查通过 (`npm run lint`)
- [ ] 所有测试通过 (`npm test`)
- [ ] 新增功能有对应测试
- [ ] 不破坏现有 API 契约
- [ ] 业务不变量未受破坏
- [ ] 无调试代码残留（console.log 等）
- [ ] 提交说明清晰说明动机和范围
- [ ] 分支命名符合规范
