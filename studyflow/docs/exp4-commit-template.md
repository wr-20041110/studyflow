# 实验四 - 提交说明模板

## 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

## 字段定义

### type（提交类型）

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| feat | 新功能 | 新增标签功能、新增筛选用例 |
| fix | Bug 修复 | 修复测试日期过期问题 |
| refactor | 重构 | 提取公共方法、优化代码结构 |
| test | 测试 | 添加或修改测试用例 |
| docs | 文档 | 编写实验报告、更新 README |
| chore | 杂项 | 更新依赖、配置 ESLint |
| ci | CI/CD | 添加 GitHub Actions 流水线 |

### scope（影响范围）

| 范围 | 说明 |
|------|------|
| domain | 领域层：实体、值对象、仓储接口 |
| application | 应用层：用例、服务、DTO |
| infrastructure | 基础设施层：仓储实现、通知服务 |
| interfaces | 接口层：CLI、API 控制器 |
| config | 配置：ESLint、TypeScript、Jest |
| docs | 文档 |

### subject（标题）

- 使用祈使句（"add" 而非 "added"）
- 不超过 50 个字符
- 首字母小写
- 结尾不加句号

### body（正文）

- 解释改动的**动机**（为什么做）
- 说明改动的**内容**（做了什么）
- 描述**影响范围**（影响了哪些模块）

### footer（脚注）

- 可包含 `Co-Authored-By:`
- 可包含 `BREAKING CHANGE:`（如有破坏性变更）
- 可引用 Issue 编号

## 实际提交示例

### 示例 1：新功能
```
feat(domain): add tag classification and filtering support

- Tag value object with preset colors and validation
- Task entity extended with tags support
- ITaskRepository added findByTags query method
- FilterTasksByTagsUseCase for tag-based filtering
- TaskService filterByTags and addTagsToTask methods
- CLI commands for tag operations

Co-Authored-By: 王然 <student@example.com>
```

### 示例 2：配置变更
```
ci(config): add GitHub Actions CI pipeline

- CI workflow with checkout, setup-node, npm ci, lint, test, build
- ESLint configuration with TypeScript rules
- Updated lint script to use proper glob quoting
```

### 示例 3：Bug 修复
```
fix(test): update hardcoded test dates to future dates

- Replaced all 2026-05-XX dates with 2026-12-XX in test files
- Fixed ReminderService tests to use relative dates
- Ensured tests pass regardless of system clock
```
