# 我的 Nextra 技术博客

基于 Next.js 和 Nextra 构建的个人技术博客，支持自动化部署到 Vercel。

## 功能特性

- ✅ **Nextra** - 强大的静态站点生成器
- ✅ **Markdown/MDX** - 支持 Markdown 和 MDX 格式
- ✅ **代码高亮** - 内置语法高亮
- ✅ **暗黑模式** - 自动暗黑模式切换
- ✅ **响应式设计** - 移动端友好
- ✅ **SEO 优化** - 自动生成 meta 标签
- ✅ **GitHub Actions** - 自动化 CI/CD
- ✅ **Vercel Edge Functions** - 全球边缘节点函数 🆕
- 🚧 **Supabase 集成** - 浏览量统计（开发中）
- 🚧 **自定义域名** - 计划中

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看博客。

### 3. 构建生产版本

```bash
npm run build
npm run start
```

## 项目结构

```
my-nextra-blog/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions 配置（待更新）
├── pages/
│   ├── api/                    # Edge Functions API 🆕
│   │   ├── visitor-info.ts     # 访客信息
│   │   ├── views/
│   │   │   └── [slug].ts       # 文章浏览统计
│   │   ├── ab-test.ts          # A/B 测试
│   │   └── health.ts           # 健康检查
│   ├── _app.tsx                # Next.js App 配置
│   ├── _meta.json              # 导航配置
│   ├── index.mdx               # 首页
│   ├── edge-demo.mdx           # Edge Functions 演示页面 🆕
│   ├── posts/
│   │   ├── _meta.json          # 文章列表配置
│   │   ├── first-post.mdx      # 示例文章 1
│   │   └── github-actions-learning.mdx  # 示例文章 2
│   └── about.mdx               # 关于页面
├── middleware.ts               # 全局边缘中间件 🆕
├── vercel.json                 # Vercel 配置 🆕
├── .env.local.example          # 环境变量示例 🆕
├── public/                      # 静态资源
├── next.config.mjs             # Next.js 配置
├── theme.config.tsx            # Nextra 主题配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 项目依赖
├── plan.md                     # 详细开发计划
└── README.md                   # 本文件
```

## 开发指南

### 添加新文章

1. 在 `pages/posts/` 目录下创建新的 `.mdx` 文件：

```bash
touch pages/posts/my-new-post.mdx
```

2. 添加 frontmatter 和内容：

```mdx
---
title: 文章标题
date: 2025/01/18
description: 文章描述
tag: 标签1, 标签2
author: 作者名
---

# 文章标题

文章内容...
```

3. 更新 `pages/posts/_meta.json`：

```json
{
  "my-new-post": "文章标题",
  "github-actions-learning": "GitHub Actions 学习笔记",
  "first-post": "我的第一篇博客"
}
```

### 自定义主题

编辑 `theme.config.tsx` 来自定义博客主题：

```tsx
export default {
  footer: <p>© 2025 我的技术博客</p>,
  head: ({ title, meta }) => (
    // 自定义 <head> 内容
  ),
  darkMode: true,
  navs: [
    // 自定义导航链接
  ]
}
```

## Vercel Edge Functions 体验 🚀

项目已集成 Vercel Edge Functions，提供全球边缘节点的超低延迟 API 服务。

### 什么是 Edge Functions？

Edge Functions 运行在离用户最近的边缘节点上，提供：
- ⚡ **超低延迟** - 毫秒级响应（< 1ms 冷启动）
- 🌍 **全球分布** - 自动在离用户最近的位置执行
- 📍 **地理位置** - 自动获取访客的国家、城市等信息
- 🔒 **安全可靠** - 自动扩展，无需管理服务器

### 可用的 API 端点

#### 1. 访客信息 API
```bash
GET /api/visitor-info
```
获取访客的地理位置、IP 地址、User Agent 等信息。

**示例**:
```bash
curl http://localhost:3000/api/visitor-info
```

**响应**:
```json
{
  "message": "Hello from Edge Functions! 🚀",
  "visitor": {
    "ip": "123.45.67.89",
    "userAgent": "Mozilla/5.0...",
    "referer": "Direct"
  },
  "location": {
    "country": "CN",
    "city": "Beijing",
    "region": "Beijing"
  },
  "edge": {
    "runtime": "edge",
    "region": "hkg1",
    "timestamp": "2025-01-19T..."
  }
}
```

#### 2. 文章浏览统计 API
```bash
GET /api/views/[slug]     # 获取浏览次数
POST /api/views/[slug]    # 增加浏览次数
```

**示例**:
```bash
# 获取浏览次数
curl http://localhost:3000/api/views/first-post

# 增加浏览次数
curl -X POST http://localhost:3000/api/views/first-post
```

#### 3. A/B 测试 API
```bash
GET /api/ab-test
```
演示用户分组和流量分割，自动通过 cookie 持久化用户组别。

**示例**:
```bash
curl -c cookies.txt http://localhost:3000/api/ab-test
```

#### 4. 健康检查 API
```bash
GET /api/health
```
监控边缘函数的运行状态和响应延迟。

**示例**:
```bash
curl http://localhost:3000/api/health
```

### 边缘中间件

全局中间件 `middleware.ts` 会在所有请求之前运行，自动添加：

- **安全响应头**: X-Frame-Options, X-XSS-Protection 等
- **地理位置信息**: X-Visitor-Country, X-Visitor-City
- **欢迎信息**: 根据访客国家/地区显示不同的欢迎语

**查看响应头**:
```bash
curl -I http://localhost:3000 | grep X-
```

### 演示页面

访问 `/edge-demo` 查看完整的 Edge Functions 演示和使用说明：

```
http://localhost:3000/edge-demo
```

### 本地测试

1. 启动开发服务器：
```bash
npm run dev
```

2. 测试各个 API：
```bash
# 访客信息
curl http://localhost:3000/api/visitor-info

# 文章统计
curl http://localhost:3000/api/views/test-article
curl -X POST http://localhost:3000/api/views/test-article

# A/B 测试
curl http://localhost:3000/api/ab-test

# 健康检查
curl http://localhost:3000/api/health

# 查看响应头
curl -I http://localhost:3000
```

### 技术细节

所有边缘函数都声明为 Edge Runtime：

```typescript
export const config = {
  runtime: "edge",  // 使用边缘运行时
};
```

**特点**:
- 基于 Web 标准 API（fetch、Request、Response）
- 不支持 Node.js API（使用 Web Crypto API 替代）
- 执行时间限制：30 秒
- 内存限制：128MB

### 部署到 Vercel

部署到 Vercel 后，Edge Functions 会自动在全球边缘节点上运行：

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 自动部署并启用边缘函数

部署后可以看到：
- 真实的全球边缘节点位置
- 不同地区的访客获得不同的欢迎信息
- 超低延迟响应（通常 < 50ms）

## 部署

### 部署到 Vercel（推荐）

#### 方式 1：通过 Vercel Dashboard

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Import Project"
3. 连接 GitHub 仓库
4. Vercel 会自动检测 Next.js 项目并部署

#### 方式 2：通过 GitHub Actions（自动部署）

参考 `plan.md` 文件中的阶段 3 配置 GitHub Actions 自动部署。

### 部署到其他平台

- **Netlify**: 支持 Next.js，需要配置 `netlify.toml`
- **Cloudflare Pages**: 支持 Next.js，需要配置构建命令
- **自托管**: 使用 `npm run build && npm run start`

## 下一步计划

按照 `plan.md` 文件继续完成：

- [x] **阶段 1**: 创建 Nextra 博客项目 ✅
- [ ] **阶段 2**: Vercel 手动部署
- [ ] **阶段 3**: GitHub Actions 自动部署
- [ ] **阶段 4**: Supabase 浏览量统计
- [ ] **阶段 5**: 自定义域名
- [ ] **阶段 6**: 测试与优化

查看 [plan.md](./plan.md) 了解详细的开发计划。

## 技术栈

- **框架**: [Next.js](https://nextjs.org/) 14
- **博客引擎**: [Nextra](https://nextra.site/) 3
- **语言**: TypeScript
- **部署**: [Vercel](https://vercel.com/)
- **CI/CD**: GitHub Actions
- **数据库**: [Supabase](https://supabase.com/)（计划）

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 代码检查
npm run lint             # 运行 ESLint
```

## 学习资源

- [Nextra 官方文档](https://nextra.site/)
- [Next.js 官方文档](https://nextjs.org/docs)
- [MDX 文档](https://mdxjs.com/)
- [Vercel 文档](https://vercel.com/docs)

## License

MIT

---

**Happy Blogging! 🎉**
