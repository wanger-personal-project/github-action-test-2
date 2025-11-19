# Next.js + Vercel + GitHub Actions 自动化部署完整计划

> 目标：实现本地 push → GitHub Actions → 自动部署到 Vercel 的完整工作流

## 技术栈概览

- **前端框架**：Nextra（Next.js 博客框架）
- **部署平台**：Vercel
- **CI/CD**：GitHub Actions
- **数据库**：Supabase（浏览量统计）
- **域名**：自定义域名

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

## 阶段 7：常见问题与解决方案

### 问题 1：Supabase 连接失败

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

```
