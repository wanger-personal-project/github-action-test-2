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
│   ├── _app.tsx                # Next.js App 配置
│   ├── _meta.json              # 导航配置
│   ├── index.mdx               # 首页
│   ├── posts/
│   │   ├── _meta.json          # 文章列表配置
│   │   ├── first-post.mdx      # 示例文章 1
│   │   └── github-actions-learning.mdx  # 示例文章 2
│   └── about.mdx               # 关于页面
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
