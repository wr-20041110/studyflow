# 实验四 - 提交前自查清单

## 代码质量检查

- [x] TypeScript 编译通过 (`npm run build`)
- [x] ESLint 静态检查通过 (0 errors)
- [x] 所有单元测试通过 (190/190)
- [x] 新增代码有对应测试覆盖
- [x] 不破坏现有 API 契约
- [x] 无 console.log 调试代码残留
- [x] 无注释掉的代码
- [x] 导入路径使用 `.js` 扩展名（ESM 规范）

## 功能完整性检查

- [x] Tag 值对象：创建、验证、相等性判断
- [x] Task 实体：添加标签、移除标签、检查标签、批量设置
- [x] 已完成任务不能修改标签
- [x] 同名标签幂等添加
- [x] 仓库层：按标签查询（OR 语义）
- [x] 应用层：标签筛选用例、标签操作服务
- [x] CLI：filterByTag、addTags 命令
- [x] 创建任务时支持传入标签

## 业务规则检查

- [x] BR-01: 任务截止时间不能早于创建时间（未受影响）
- [x] BR-02: 已完成任务不能修改状态（已扩展到标签操作）
- [x] BR-03: 高优先级任务必须有截止日期（未受影响）

## 测试检查

- [x] Tag 值对象测试：10 个用例
- [x] Task 标签操作测试：9 个用例
- [x] Repository findByTags 测试：5 个用例
- [x] FilterTasksByTagsUseCase 测试：8 个用例
- [x] 集成测试覆盖标签场景

## CI 检查

- [x] GitHub Actions 工作流文件已创建
- [x] ESLint 配置文件已创建
- [x] CI 步骤：checkout → setup-node → npm ci → lint → test → build
- [x] CI 文件路径正确：`.github/workflows/ci.yml`

## 文档检查

- [x] 任务拆分文档（exp4-task-splitting.md）
- [x] 提交模板文档（exp4-commit-template.md）
- [x] 代码审查记录（exp4-code-review.md）
- [x] CI 配置说明（exp4-ci-explanation.md）
- [x] 自查清单（本文档）
- [x] 实验报告（exp4-report.md）

## 自查总结

本次迭代完成了标签分类与筛选功能的完整开发流程：
1. 功能拆分 → 2. 编码实现 → 3. 测试验证 → 4. 静态检查 → 5. AI 代码审查 → 6. CI 配置

所有检查项通过，代码质量符合要求，可以合并到主分支。
