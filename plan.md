# Next.js + Vercel + GitHub Actions 自动化部署完整计划

> 目标：实现本地 push → GitHub Actions → 自动部署到 Vercel 的完整工作流

## 技术栈概览

- **前端框架**：Nextra（Next.js 博客框架）
- **部署平台**：Vercel
- **CI/CD**：GitHub Actions
- **数据库**：Supabase（浏览量统计）
- **域名**：自定义域名

---

## 阶段 0：环境准备与检查清单

### 0.1 账号确认

- [x] Vercel 账号已注册
- [x] Supabase 账号已注册
- [x] 域名已购买
- [ ] GitHub 账号（确认有权限创建仓库）

### 0.2 开发工具

```bash
# 检查 Node.js 版本（建议 18+）
node -v

# 检查 npm/pnpm
npm -v
# 或
pnpm -v

# 检查 Git
git --version
```

### 0.3 需要准备的密钥

- [ ] Vercel Token（用于 GitHub Actions 部署）
- [ ] Vercel Project ID（项目标识）
- [ ] Vercel Org ID（组织标识）
- [ ] Supabase URL
- [ ] Supabase Anon Key

---

## 阶段 1：创建 Nextra 博客项目（预计 30 分钟）

### 1.1 初始化项目

```bash
# 创建新目录
mkdir my-nextra-blog
cd my-nextra-blog

# 使用 Nextra 官方模板（博客主题）
npx create-next-app@latest . --example https://github.com/shuding/nextra/tree/main/examples/blog
# 或者使用 pnpm
pnpm create next-app . --example https://github.com/shuding/nextra/tree/main/examples/blog
```

### 1.2 本地开发测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000 查看效果
```

**验证清单**：

- [x] 页面正常加载
- [x] 导航栏工作正常
- [x] Markdown 文章渲染正常
- [x] 代码高亮显示正常

### 1.3 自定义博客内容

创建或修改以下文件：

```
pages/
├── _meta.json          # 导航配置
├── index.mdx           # 首页
├── posts/
│   ├── _meta.json
│   ├── first-post.mdx  # 第一篇文章
│   └── second-post.mdx # 第二篇文章
└── about.mdx           # 关于页面
```

**示例文章内容**：

```mdx
---
title: 我的第一篇博客
date: 2025-01-18
---

# 我的第一篇博客

这是使用 Nextra 创建的第一篇文章。

## 功能特点

- Markdown 支持
- 代码高亮
- 自动部署
```

### 1.4 初始化 Git 仓库

```bash
# 初始化 Git
git init

# 创建 .gitignore（如果没有）
echo "node_modules/
.next/
out/
.env*.local
.vercel" > .gitignore

# 首次提交
git add .
git commit -m "feat: 初始化 Nextra 博客项目"

# 在 GitHub 上创建新仓库
# 然后关联远程仓库
git remote add origin https://github.com/your-username/my-nextra-blog.git
git branch -M main
git push -u origin main
```

**验证清单**：

- [x] 代码已推送到 GitHub
- [x] 仓库可以正常访问

---

## 阶段 2：Vercel 手动部署（预计 20 分钟）

> 先通过 Vercel 界面手动部署，确保项目配置正确

### 2.1 连接 GitHub 仓库

1. 登录 Vercel：https://vercel.com
2. 点击 **"Add New Project"**
3. 选择 **"Import Git Repository"**
4. 选择你刚创建的 `my-nextra-blog` 仓库
5. 点击 **"Import"**

### 2.2 配置项目设置

**Framework Preset**: Next.js（自动检测）

**Build Settings**:

- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`（或 `pnpm install`）

**环境变量**（暂时留空，后续添加）：

- 先不配置，部署成功后再添加

### 2.3 部署项目

1. 点击 **"Deploy"**
2. 等待构建完成（约 1-3 分钟）
3. 部署成功后，Vercel 会分配一个临时域名：
   - 示例：`my-nextra-blog-abc123.vercel.app`

**验证清单**：

- [ ] 部署成功（绿色 ✓）
- [ ] 可以通过 Vercel 域名访问博客
- [ ] 所有页面和链接工作正常

### 2.4 获取部署所需的密钥

#### 获取 Vercel Token

1. 访问：https://vercel.com/account/tokens
2. 点击 **"Create"**
3. Token Name: `GitHub Actions Deploy`
4. Scope: 选择 **"Full Access"**
5. 点击 **"Create Token"**
6. **立即复制并保存**（只显示一次！）

#### 获取 Project ID 和 Org ID

方法 1：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 在项目目录运行
vercel link

# 查看 .vercel/project.json
cat .vercel/project.json
```

方法 2：通过 Vercel 界面

1. 打开项目 Settings
2. Project ID 在 **Settings → General** 中
3. Org ID 在项目 URL 中：`vercel.com/{org-id}/{project-name}`

**保存以下信息**（下一步会用到）：

```
VERCEL_TOKEN=xxx
VERCEL_ORG_ID=xxx
VERCEL_PROJECT_ID=xxx
```

---

## 阶段 3：配置 GitHub Actions 自动部署（预计 40 分钟）

> 实现：push 到 main 分支 → 自动触发 GitHub Actions → 部署到 Vercel

### 3.1 配置 GitHub Secrets

1. 打开 GitHub 仓库
2. 进入 **Settings → Secrets and variables → Actions**
3. 点击 **"New repository secret"**
4. 添加以下 3 个 secrets：

| Name                | Value             |
| ------------------- | ----------------- |
| `VERCEL_TOKEN`      | 你的 Vercel Token |
| `VERCEL_ORG_ID`     | 你的 Org ID       |
| `VERCEL_PROJECT_ID` | 你的 Project ID   |

**验证**：

- [ ] 3 个 secrets 都已添加
- [ ] 名称拼写正确（区分大小写）

### 3.2 创建 GitHub Actions Workflow

在项目根目录创建：

```bash
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
```

编辑 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel

# 触发条件：每次 push 到 main 分支
on:
  push:
    branches: [main]
  # 可选：支持手动触发
  workflow_dispatch:

jobs:
  deploy:
    name: 🚀 Deploy to Vercel
    runs-on: ubuntu-latest

    steps:
      # 1. 检出代码
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      # 2. 设置 Node.js
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm" # 或 'pnpm'

      # 3. 安装依赖
      - name: 📚 Install dependencies
        run: npm ci
        # 如果使用 pnpm：
        # run: pnpm install --frozen-lockfile

      # 4. 构建项目
      - name: 🔨 Build
        run: npm run build

      # 5. 部署到 Vercel（生产环境）
      - name: 🚀 Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod" # 部署到生产环境

      # 6. 输出部署 URL
      - name: 📝 Show deployment URL
        if: success()
        run: echo "Deployment successful! Check Vercel dashboard for URL."
```

### 3.3 提交并推送

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: 添加 GitHub Actions 自动部署配置"
git push origin main
```

### 3.4 验证自动部署

1. 推送后，立即访问：
   - GitHub 仓库 → **Actions** 标签
2. 查看运行中的 workflow：
   - 名称：**Deploy to Vercel**
   - 状态：应该显示 🟡 进行中 → 🟢 成功
3. 点击进入查看详细日志

**验证清单**：

- [ ] GitHub Actions 成功触发
- [ ] Build 步骤成功
- [ ] Deploy 步骤成功
- [ ] Vercel 上可以看到新的部署记录

### 3.5 测试完整流程

**测试 1：修改内容**

```bash
# 修改首页内容
echo "## 测试自动部署

这是一次测试提交。" >> pages/index.mdx

git add .
git commit -m "test: 测试 GitHub Actions 自动部署"
git push origin main
```

**观察**：

- GitHub Actions 自动触发
- 约 2-5 分钟后部署完成
- Vercel 网站更新

**测试 2：添加新文章**

```bash
# 创建新文章
cat > pages/posts/auto-deploy-test.mdx << 'EOF'
---
title: GitHub Actions 自动部署测试
date: 2025-01-18
---

# 自动部署成功！

这篇文章是通过 GitHub Actions 自动部署的。
EOF

git add .
git commit -m "post: 添加测试文章"
git push origin main
```

**验证清单**：

- [ ] 每次 push 都触发部署
- [ ] 部署成功率 100%
- [ ] 网站内容及时更新

---

## 阶段 4：集成 Supabase 浏览量统计（预计 1 小时）

> 实现文章浏览量统计和显示

### 4.1 Supabase 数据库设置

#### 登录 Supabase 并创建项目

1. 访问：https://app.supabase.com
2. 创建新项目（如果还没有）：
   - Organization: 选择或创建
   - Project Name: `nextra-blog`
   - Database Password: 设置强密码
   - Region: 选择最近的区域

#### 创建 views 表

在 Supabase SQL Editor 中执行：

```sql
-- 创建浏览量统计表
CREATE TABLE page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,           -- 文章路径（如 /posts/first-post）
  views INTEGER DEFAULT 0,             -- 浏览次数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX idx_page_views_slug ON page_views(slug);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_page_views_updated_at
    BEFORE UPDATE ON page_views
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### 设置 Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取浏览量
CREATE POLICY "Allow public read access"
ON page_views FOR SELECT
TO public
USING (true);

-- 允许所有人增加浏览量（后续会改为 API 调用）
CREATE POLICY "Allow public insert/update"
ON page_views FOR ALL
TO public
USING (true)
WITH CHECK (true);
```

### 4.2 获取 Supabase 密钥

1. 在 Supabase 项目中，进入 **Settings → API**
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGci...`

### 4.3 配置环境变量

#### 本地开发环境

创建 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**重要**：确保 `.env.local` 在 `.gitignore` 中

#### Vercel 生产环境

1. 打开 Vercel 项目 → **Settings → Environment Variables**
2. 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Environments**: 选择 **Production, Preview, Development**

### 4.4 安装 Supabase 客户端

```bash
npm install @supabase/supabase-js
```

### 4.5 创建 Supabase 客户端

创建 `lib/supabase.ts`：

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 类型定义
export interface PageView {
  id: string;
  slug: string;
  views: number;
  created_at: string;
  updated_at: string;
}
```

### 4.6 创建浏览量 API

创建 `pages/api/views/[slug].ts`：

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const slug = req.query.slug as string;

  if (!slug) {
    return res.status(400).json({ error: "Slug is required" });
  }

  try {
    if (req.method === "GET") {
      // 获取浏览量
      const { data, error } = await supabase
        .from("page_views")
        .select("views")
        .eq("slug", slug)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return res.status(200).json({ views: data?.views || 0 });
    }

    if (req.method === "POST") {
      // 增加浏览量
      const { data: existing } = await supabase
        .from("page_views")
        .select("views")
        .eq("slug", slug)
        .single();

      if (existing) {
        // 更新
        const { data, error } = await supabase
          .from("page_views")
          .update({ views: existing.views + 1 })
          .eq("slug", slug)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ views: data.views });
      } else {
        // 插入
        const { data, error } = await supabase
          .from("page_views")
          .insert({ slug, views: 1 })
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ views: data.views });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

### 4.7 创建浏览量组件

创建 `components/ViewCounter.tsx`：

```typescript
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function ViewCounter() {
  const [views, setViews] = useState<number>(0);
  const router = useRouter();
  const slug = router.asPath;

  useEffect(() => {
    // 获取浏览量
    fetch(`/api/views/${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => setViews(data.views));

    // 增加浏览量
    fetch(`/api/views/${encodeURIComponent(slug)}`, {
      method: "POST",
    });
  }, [slug]);

  return (
    <span className="text-gray-500 text-sm">
      👁️ {views > 0 ? `${views} views` : "Loading..."}
    </span>
  );
}
```

### 4.8 在文章中显示浏览量

修改你的文章模板或布局，添加：

```tsx
import { ViewCounter } from "../components/ViewCounter";

// 在文章元信息处添加
<div className="post-meta">
  <span>{date}</span>
  <ViewCounter />
</div>;
```

### 4.9 测试浏览量功能

```bash
# 本地测试
npm run dev

# 访问文章页面
# 刷新页面，观察浏览量是否增加
```

**验证清单**：

- [ ] 首次访问显示 1 views
- [ ] 刷新页面，数字递增
- [ ] Supabase 数据库中有对应记录

### 4.10 部署更新

```bash
git add .
git commit -m "feat: 集成 Supabase 浏览量统计"
git push origin main
```

等待 GitHub Actions 自动部署完成。

---

## 阶段 5：配置自定义域名（预计 30 分钟）

### 5.1 在 Vercel 添加域名

1. 打开 Vercel 项目 → **Settings → Domains**
2. 点击 **"Add"**
3. 输入你的域名，例如：
   - `blog.yourdomain.com`（推荐：子域名）
   - 或 `yourdomain.com`（根域名）
4. 点击 **"Add"**

### 5.2 配置 DNS 记录

Vercel 会给出 DNS 配置指引。

#### 如果是子域名（推荐）

在你的域名提供商（如阿里云、腾讯云、Cloudflare）添加 CNAME 记录：

| Type  | Name | Value                |
| ----- | ---- | -------------------- |
| CNAME | blog | cname.vercel-dns.com |

#### 如果是根域名

添加 A 记录：

| Type | Name | Value       |
| ---- | ---- | ----------- |
| A    | @    | 76.76.21.21 |

### 5.3 等待 DNS 传播

- 时间：通常 5 分钟 - 48 小时
- 验证：Vercel 界面会显示验证状态
- SSL 证书：Vercel 自动申请并配置（Let's Encrypt）

### 5.4 验证域名

**验证清单**：

- [ ] DNS 记录添加正确
- [ ] Vercel 显示 ✅ Valid Configuration
- [ ] 可以通过自定义域名访问博客
- [ ] HTTPS 自动启用（绿色锁图标）

### 5.5 可选：域名重定向

如果同时配置了多个域名，可以设置重定向：

1. Vercel → **Settings → Domains**
2. 点击域名旁边的 ⋯ → **Redirect to Another Domain**
3. 例如：`www.yourdomain.com` → `yourdomain.com`

---

## 阶段 6：完整测试与优化（预计 1 小时）

### 6.1 端到端测试流程

**测试场景 1：内容更新流程**

```bash
# 1. 创建新文章
cat > pages/posts/final-test.mdx << 'EOF'
---
title: 完整流程测试
date: 2025-01-18
---

# 测试完整自动化流程

- ✅ 本地编写
- ✅ Git push
- ✅ GitHub Actions 自动部署
- ✅ Vercel 自动更新
- ✅ 自定义域名访问
- ✅ 浏览量统计正常
EOF

# 2. 提交并推送
git add .
git commit -m "test: 完整流程端到端测试"
git push origin main

# 3. 观察
# - GitHub Actions 运行状态
# - Vercel 部署日志
# - 网站更新时间
```

**测试场景 2：多次快速更新**

```bash
# 连续 3 次提交，观察部署队列
echo "\n## Update 1" >> pages/index.mdx
git add . && git commit -m "test: update 1" && git push

echo "\n## Update 2" >> pages/index.mdx
git add . && git commit -m "test: update 2" && git push

echo "\n## Update 3" >> pages/index.mdx
git add . && git commit -m "test: update 3" && git push
```

**观察**：

- Vercel 如何处理多个部署请求
- 是否有部署队列
- 最终网站内容是否正确

### 6.2 性能检查

**Lighthouse 测试**：

1. 打开 Chrome DevTools
2. 切换到 **Lighthouse** 标签
3. 选择 **Performance + SEO + Best Practices + Accessibility**
4. 点击 **"Generate report"**

**目标分数**：

- Performance: > 90
- SEO: > 90
- Accessibility: > 90
- Best Practices: > 90

**常见优化**：

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ["your-image-cdn.com"],
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
};
```

### 6.3 监控和日志

**设置 Vercel 部署通知**：

1. Vercel 项目 → **Settings → Git**
2. 启用 **Comments on Pull Requests**
3. 启用 **Deployment Protection**（可选）

**GitHub Actions 失败通知**：

在 `.github/workflows/deploy.yml` 添加：

```yaml
jobs:
  deploy:
    # ... 现有配置 ...

    # 添加失败通知（可选）
    - name: 📧 Notify on failure
      if: failure()
      run: |
        echo "Deployment failed! Check logs at ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

### 6.4 SEO 优化

在 `next.config.js` 或页面中添加 meta 信息：

```typescript
// pages/_app.tsx
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>我的技术博客</title>
        <meta name="description" content="记录技术成长的博客" />
        <meta property="og:title" content="我的技术博客" />
        <meta property="og:description" content="记录技术成长的博客" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
```

### 6.5 备份和回滚

**创建 Git 标签**（重要版本）：

```bash
# 标记稳定版本
git tag -a v1.0.0 -m "First stable release"
git push origin v1.0.0
```

**Vercel 回滚**：

1. Vercel Dashboard → **Deployments**
2. 找到之前的成功部署
3. 点击 ⋯ → **Promote to Production**

---

## 阶段 7：常见问题与解决方案

### 问题 1：GitHub Actions 部署失败

**症状**：Actions 显示红色 ❌

**排查步骤**：

```bash
# 1. 检查 secrets 是否配置正确
# GitHub → Settings → Secrets → 确认 3 个 secrets 存在

# 2. 检查 Vercel Token 是否有效
# Vercel → Account Settings → Tokens → 确认 token 未过期

# 3. 查看详细日志
# GitHub Actions → 点击失败的 workflow → 查看具体错误
```

### 问题 2：Supabase 连接失败

**症状**：浏览量不显示或报错

**排查步骤**：

```bash
# 1. 检查环境变量
# Vercel → Settings → Environment Variables
# 确认变量名正确且值有效

# 2. 检查 Supabase RLS 策略
# Supabase → Authentication → Policies
# 确认允许匿名访问

# 3. 本地测试
NEXT_PUBLIC_SUPABASE_URL=xxx NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx npm run dev
```

### 问题 3：域名无法访问

**症状**：DNS_PROBE_FINISHED_NXDOMAIN

**排查步骤**：

```bash
# 1. 检查 DNS 记录
# 使用在线工具：https://dnschecker.org

# 2. 检查 Vercel 配置
# Vercel → Domains → 查看状态

# 3. 等待 DNS 传播（最多 48 小时）
```

### 问题 4：构建缓慢

**优化方案**：

```yaml
# .github/workflows/deploy.yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: "npm" # 启用依赖缓存

- name: Cache Next.js build
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ${{ github.workspace }}/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}
```

---

## 快速参考

### 常用命令

```bash
# 本地开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# Git 工作流
git add .
git commit -m "feat: xxx"
git push origin main  # 触发自动部署

# Vercel CLI
vercel                # 部署到预览环境
vercel --prod         # 部署到生产环境
vercel logs           # 查看日志
```

### 关键 URL

- **GitHub 仓库**: `https://github.com/your-username/my-nextra-blog`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://app.supabase.com`
- **生产环境**: `https://yourdomain.com`

---

## 下一步扩展（可选）

- [ ] 添加评论系统（Giscus / Utterances）
- [ ] 集成分析工具（Google Analytics / Vercel Analytics）
- [ ] RSS 订阅
- [ ] 搜索功能
- [ ] 暗黑模式
- [ ] 多语言支持
- [ ] 部署预览环境（dev 分支）

---

## 时间估算总结

| 阶段               | 预计时间 | 累计时间 |
| ------------------ | -------- | -------- |
| 阶段 0：环境准备   | 10 分钟  | 10 分钟  |
| 阶段 1：创建项目   | 30 分钟  | 40 分钟  |
| 阶段 2：手动部署   | 20 分钟  | 1 小时   |
| 阶段 3：自动部署   | 40 分钟  | 1.5 小时 |
| 阶段 4：Supabase   | 1 小时   | 2.5 小时 |
| 阶段 5：自定义域名 | 30 分钟  | 3 小时   |
| 阶段 6：测试优化   | 1 小时   | 4 小时   |

**总计**：约 4 小时完成整个流程

---

**祝你部署顺利！🎉**

如果遇到问题，可以：

- 查看 GitHub Actions 日志
- 查看 Vercel 部署日志
- 查看 Supabase 日志
- 参考官方文档
