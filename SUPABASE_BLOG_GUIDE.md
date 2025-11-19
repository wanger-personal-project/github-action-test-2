# Supabase 博客系统完整集成指南

本指南展示如何使用 Supabase 构建一个完整的博客写作和管理系统，包括用户认证、文章管理、评论系统等功能。

## 📋 目录

- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [数据库设置](#数据库设置)
- [API 实现](#api-实现)
- [前端组件](#前端组件)
- [完整示例](#完整示例)

---

## 🎯 系统架构

### 功能模块

```
博客系统
├── 用户认证 (Supabase Auth)
├── 文章管理 (CRUD)
│   ├── 创建文章
│   ├── 编辑文章
│   ├── 发布/取消发布
│   └── 删除文章
├── 评论系统
│   ├── 发布评论
│   ├── 回复评论
│   └── 评论审核（文章作者）
└── 数据统计
    ├── 浏览量（Upstash Redis）✅ 已实现
    └── 点赞（Upstash Redis）✅ 已实现
```

### 技术栈

- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **缓存**: Upstash Redis（浏览/点赞）
- **框架**: Next.js + TypeScript
- **安全**: Row Level Security (RLS)

---

## 🚀 快速开始

### 步骤 1：安装依赖

```bash
# 安装最新的 Supabase 包
npm install @supabase/supabase-js @supabase/ssr

# 注意：@supabase/auth-helpers-nextjs 已弃用，使用 @supabase/ssr 替代
```

### 步骤 2：创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 **New Project**
3. 填写项目信息：
   - **Name**: `my-blog`
   - **Database Password**: 设置强密码
   - **Region**: 选择离用户最近的区域
4. 等待项目创建完成

### 步骤 3：获取 API 密钥

1. 进入项目 → **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`

### 步骤 4：配置环境变量

创建 `.env.local`：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Upstash Redis 配置（已有）
UPSTASH_REDIS_REST_URL=https://your-redis-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXyour-token-here
```

---

## 💾 数据库设置

### 执行 SQL 脚本

在 Supabase SQL Editor 中依次执行：

#### 1. 创建表结构

```bash
# 在 Supabase Dashboard
# SQL Editor → New Query → 粘贴 blog_schema.sql 内容 → Run
```

**`blog_schema.sql` 包含**：

- `authors` 表 - 作者信息
- `posts` 表 - 文章
- `comments` 表 - 评论
- RLS 策略
- 触发器

### 验证数据库

```sql
-- 检查表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- 应该看到：authors, posts, comments
```

---

## 🔧 API 实现

### 文章 API 示例

#### 获取文章列表

创建 `pages/api/posts/index.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase, PostWithAuthor } from "@/lib/supabase";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    // 获取已发布的文章
    const { data, error, count } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:authors(*)
      `,
        { count: "exact" }
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      posts: data as PostWithAuthor[],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
```

**测试**：

```bash
curl http://localhost:3000/api/posts?page=1&limit=10
```

#### 获取单篇文章

创建 `pages/api/posts/[slug].ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { incrementPostViewCount } from "@/lib/supabase";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const slug = url.pathname.split("/").pop();

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    // 获取文章详情
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 增加浏览量（使用 Supabase 函数）
    await incrementPostViewCount(slug);

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
```

**测试**：

```bash
curl http://localhost:3000/api/posts/my-first-post
```

#### 创建文章

创建 `pages/api/posts/create.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const { title, slug, content, excerpt, cover_image_url, status } = body;

    // 验证必填字段
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    // 创建文章
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title,
        slug,
        content,
        excerpt,
        cover_image_url,
        status: status || "draft",
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .single();

    if (error) {
      if (error.code === "23505") {
        // 唯一约束冲突
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { post: data, message: "Post created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
```

**测试**：

```bash
curl -X POST http://localhost:3000/api/posts/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的第一篇文章",
    "slug": "my-first-post",
    "content": "这是文章内容...",
    "excerpt": "这是摘要",
    "status": "draft"
  }'
```

### 评论 API 示例

#### 获取评论列表

创建 `pages/api/comments/[postSlug].ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const postSlug = url.pathname.split("/").pop();

  try {
    // 先获取文章 ID
    const { data: post } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", postSlug)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 获取已批准的评论
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .eq("post_id", post.id)
      .eq("status", "approved")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
```

**测试**：

```bash
curl http://localhost:3000/api/comments/my-first-post
```

#### 发布评论

创建 `pages/api/comments/create.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const { post_id, content, parent_comment_id } = body;

    if (!post_id || !content) {
      return NextResponse.json(
        { error: "post_id and content are required" },
        { status: 400 }
      );
    }

    // 创建评论
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id,
        author_id: user.id,
        content,
        parent_comment_id,
        status: "pending", // 默认待审核
      })
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        comment: data,
        message: "Comment submitted and awaiting approval",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
```

---

## 🎨 前端组件示例

### 文章列表组件

创建 `components/Blog/PostList.tsx`：

```typescript
import { useEffect, useState } from "react";
import { PostWithAuthor } from "@/lib/supabase";

export function PostList() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <article key={post.id} className="post-item">
          <h2>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </h2>
          <p>{post.excerpt}</p>
          <div className="post-meta">
            <span>By {post.author.display_name || post.author.username}</span>
            <span>{new Date(post.published_at!).toLocaleDateString()}</span>
            <span>{post.view_count} views</span>
          </div>
        </article>
      ))}
    </div>
  );
}
```

### 评论区组件

创建 `components/Blog/CommentSection.tsx`：

```typescript
import { useEffect, useState } from "react";
import { CommentWithAuthor } from "@/lib/supabase";

interface Props {
  postSlug: string;
}

export function CommentSection({ postSlug }: Props) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch(`/api/comments/${postSlug}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments));
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/comments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: postSlug,
        content: newComment,
      }),
    });

    if (response.ok) {
      setNewComment("");
      alert("Comment submitted for approval!");
    }
  };

  return (
    <div className="comments">
      <h3>Comments ({comments.length})</h3>

      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <strong>{comment.author.display_name}</strong>
          <p>{comment.content}</p>
          <small>{new Date(comment.created_at).toLocaleString()}</small>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
```

---

## 📝 完整使用流程

### 1. 用户注册和登录

```typescript
// 注册
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
});

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});

// 登出
await supabase.auth.signOut();
```

### 2. 创建作者记录

用户注册后需要创建作者记录：

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();

await supabase.from("authors").insert({
  id: user!.id,
  username: "john_doe",
  display_name: "John Doe",
  bio: "全栈开发者",
});
```

### 3. 发布文章

```bash
curl -X POST http://localhost:3000/api/posts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Supabase 入门指南",
    "slug": "supabase-guide",
    "content": "# 内容...",
    "status": "published"
  }'
```

### 4. 评论互动

```bash
# 发布评论
curl -X POST http://localhost:3000/api/comments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "post_id": "post-uuid",
    "content": "很棒的文章！"
  }'
```

---

## 🔒 安全特性

### Row Level Security (RLS)

已在 `blog_schema.sql` 中配置：

1. **文章**：

   - 所有人可以查看已发布的文章
   - 作者可以查看自己的所有文章（包括草稿）
   - 只有作者可以编辑/删除自己的文章

2. **评论**：
   - 所有人可以查看已批准的评论
   - 评论作者可以编辑/删除自己的评论
   - 文章作者可以审核评论

---

## 🧪 测试指南

### 本地测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 测试文章 API
curl http://localhost:3000/api/posts

# 3. 测试评论 API
curl http://localhost:3000/api/comments/test-post
```

## 🔗 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Row Level Security 教程](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase 示例](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
