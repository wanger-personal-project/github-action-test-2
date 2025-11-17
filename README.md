# GitHub Actions 学习项目

一个用于学习 GitHub Actions 的 TypeScript 工具项目，包含字符串和数组处理工具，配置了完整的 CI/CD 流程。

## 项目特点

- ✅ **TypeScript 工具库**：包含实用的字符串和数组处理函数
- ✅ **单元测试**：使用 Vitest 进行测试，覆盖所有工具函数
- ✅ **代码规范**：使用 ESLint + TypeScript 严格检查
- ✅ **GitHub Actions CI**：自动运行 lint、测试、构建和自定义脚本
- ✅ **演示脚本**：展示所有工具函数的使用效果

## 项目结构

```
github-action-test-2/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI 配置
├── src/
│   ├── utils/
│   │   ├── string.ts           # 字符串处理工具（10+ 函数）
│   │   ├── array.ts            # 数组处理工具（12+ 函数）
│   │   └── index.ts            # 统一导出
│   └── demo.ts                 # 演示脚本
├── tests/
│   ├── string.test.ts          # 字符串工具测试
│   └── array.test.ts           # 数组工具测试
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.mjs
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发命令

```bash
# 运行演示脚本
npm run demo

# 运行测试
npm test

# 运行测试（watch 模式）
npm run test:watch

# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# TypeScript 类型检查
npm run typecheck

# 构建项目
npm run build
```

## 工具函数介绍

### 字符串工具 (`src/utils/string.ts`)

| 函数 | 说明 | 示例 |
|------|------|------|
| `toCamelCase` | 转换为驼峰命名 | `'hello-world'` → `'helloWorld'` |
| `toSnakeCase` | 转换为蛇形命名 | `'helloWorld'` → `'hello_world'` |
| `toKebabCase` | 转换为短横线命名 | `'helloWorld'` → `'hello-world'` |
| `capitalize` | 首字母大写 | `'hello'` → `'Hello'` |
| `truncate` | 截断字符串 | `truncate('hello world', 8)` → `'hello...'` |
| `template` | 模板字符串填充 | `template('Hi {name}', {name: 'Alice'})` |
| `generateUUID` | 生成 UUID v4 | `'550e8400-e29b-...'` |
| `reverse` | 反转字符串 | `'hello'` → `'olleh'` |
| `isPalindrome` | 判断是否为回文 | `'racecar'` → `true` |
| `countOccurrences` | 统计子串出现次数 | `countOccurrences('hello', 'l')` → `2` |

### 数组工具 (`src/utils/array.ts`)

| 函数 | 说明 | 示例 |
|------|------|------|
| `unique` | 数组去重 | `[1, 2, 2, 3]` → `[1, 2, 3]` |
| `chunk` | 数组分块 | `chunk([1,2,3,4,5], 2)` → `[[1,2], [3,4], [5]]` |
| `flatten` | 数组扁平化 | `[[1, 2], [3]]` → `[1, 2, 3]` |
| `shuffle` | 洗牌算法 | `[1, 2, 3]` → `[2, 3, 1]`（随机） |
| `groupBy` | 按属性分组 | 按年龄分组对象数组 |
| `intersection` | 数组交集 | `[1, 2, 3]` ∩ `[2, 3, 4]` → `[2, 3]` |
| `difference` | 数组差集 | `[1, 2, 3]` - `[2, 3]` → `[1]` |
| `sum` | 求和 | `[1, 2, 3, 4, 5]` → `15` |
| `average` | 求平均值 | `[1, 2, 3, 4, 5]` → `3` |
| `max` | 求最大值 | `[1, 5, 3, 9, 2]` → `9` |
| `min` | 求最小值 | `[1, 5, 3, 9, 2]` → `1` |
| `compact` | 移除假值 | `[0, 1, false, 2, '', 3]` → `[1, 2, 3]` |

## GitHub Actions CI 工作流

当你 `git push` 到 GitHub 时，会自动触发 3 个并行 job：

### Job 1: 🧪 Test & Lint
- ✅ ESLint 代码检查
- ✅ TypeScript 类型检查
- ✅ Vitest 单元测试

### Job 2: 🚀 Run Demo
- ✅ 运行 `demo.ts` 演示脚本
- ✅ 在 CI 日志中查看所有工具函数的运行效果

### Job 3: 🏗️ Build
- ✅ 编译 TypeScript
- ✅ 上传构建产物到 Artifacts

## GitHub Actions 配置说明

查看 `.github/workflows/ci.yml` 了解详细配置：

- **触发条件**：`push` 和 `pull_request` 到 `main` 或 `master` 分支
- **运行环境**：`ubuntu-latest`
- **Node.js 版本**：20
- **依赖缓存**：自动缓存 npm 依赖，加快构建速度

## 学习重点

这个项目覆盖了 GitHub Actions 的核心概念：

1. ✅ **Workflow**：`.github/workflows/ci.yml` 定义了完整的 CI 流程
2. ✅ **Event**：监听 `push` 和 `pull_request` 事件
3. ✅ **Job**：3 个 job（test、demo、build）展示并行和依赖关系
4. ✅ **Step**：每个 job 包含多个步骤，使用官方 actions 和自定义命令
5. ✅ **Action**：使用 `actions/checkout`、`actions/setup-node` 等

## 使用示例

```typescript
import { toCamelCase, chunk, average } from './src/utils/index.js';

// 字符串转换
const camelCase = toCamelCase('hello-world'); // 'helloWorld'

// 数组分块
const chunks = chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// 求平均值
const avg = average([1, 2, 3, 4, 5]); // 3
```

## 下一步学习建议

1. 尝试修改 `.github/workflows/ci.yml`，添加新的 step
2. 添加定时任务（`schedule` 触发器）
3. 尝试部署到 GitHub Pages 或其他平台
4. 探索 GitHub Actions Marketplace 中的其他 actions

## License

MIT
