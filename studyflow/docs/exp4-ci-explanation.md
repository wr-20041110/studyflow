# 实验四 - CI 配置说明

## CI 流水线结构

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - checkout        # 拉取代码
      - setup-node      # 安装 Node.js 20
      - npm ci          # 安装依赖（精确版本）
      - npm run lint    # 静态检查
      - npm run test    # 单元测试
      - npm run build   # 编译检查
```

## 各步骤的必要性分析

### 1. Checkout
**为什么必要**：拉取仓库代码是后续所有步骤的前提。没有代码，后续步骤无法执行。

**拦截问题**：
- 工作流配置错误（如 checkout 版本不存在）
- 仓库访问权限问题

### 2. Setup Node.js
**为什么必要**：指定 Node.js 版本，保证 CI 环境与开发环境一致。使用 `cache: 'npm'` 加速依赖安装。

**拦截问题**：
- Node.js 版本不匹配导致的语法或 API 不兼容
- 缺少运行环境

### 3. npm ci
**为什么必要**：
- `npm ci` 严格按 `package-lock.json` 安装，确保 CI 环境与本地完全一致
- 比 `npm install` 更快（跳过依赖解析）
- 若 `package-lock.json` 与 `package.json` 不一致会报错

**拦截问题**：
- 忘记更新 `package-lock.json`
- 依赖版本漂移（dependencies drift）
- `node_modules` 中残留旧版本文件

### 4. npm run lint（静态检查）
**为什么必要**：
- 在运行前捕获代码风格和潜在错误
- ESLint 配合 TypeScript 规则可检测类型使用不当
- 零运行时开销的代码质量保障

**拦截问题**：
- 未使用的变量（unused vars）
- 不当使用 `any` 类型
- 代码风格不一致
- 潜在的运行时错误（如 null 引用）

### 5. npm run test（单元测试）
**为什么必要**：
- 验证代码逻辑正确性
- 确保新代码不破坏现有功能（回归测试）
- 190 个测试覆盖核心域逻辑、应用层、基础设施层

**拦截问题**：
- 逻辑错误（业务不变量被破坏）
- 边界条件未处理
- 接口契约被破坏
- 异常路径未正确处理

### 6. npm run build（编译检查）
**为什么必要**：
- TypeScript 类型检查，确保类型系统完整性
- 确保生成的 JavaScript 代码可运行
- 验证模块导入路径正确

**拦截问题**：
- 类型不匹配
- 导入路径错误
- 接口实现不完整
- `tsconfig.json` 配置问题

## 质量保障分层

### CI 能拦截的问题
| 类别 | 具体问题 | 拦截环节 |
|------|----------|----------|
| 编译错误 | 类型不匹配、缺失导入 | build (tsc) |
| 测试失败 | 契约破坏、逻辑错误 | test (jest) |
| 依赖问题 | lock file 不一致 | npm ci |
| 代码质量 | 风格警告、潜在 bug | lint (eslint) |
| 环境问题 | Node.js 版本错误 | setup-node |

### 需要人工评审的问题
| 类别 | 说明 |
|------|------|
| 架构设计 | DDD 分层是否合理、依赖方向是否正确 |
| 业务逻辑 | 不变量是否符合业务需求 |
| 代码可读性 | 命名、注释、结构是否清晰 |
| 性能 | 算法复杂度、内存使用 |
| 安全性 | 输入验证、权限控制 |
| 测试质量 | 测试是否覆盖核心场景、边界是否合理 |

## CI 运行结果

执行 `npm run lint` → `npm test` → `npm run build` 全链路：

```
✅ npm run lint  → 0 errors, 29 warnings (pre-existing)
✅ npm test      → 190 passed, 0 failed
✅ npm run build → TypeScript compilation OK
```
