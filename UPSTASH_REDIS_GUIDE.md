# Upstash Redis 使用指南

本项目使用 **Upstash Redis** 作为数据存储，提供文章浏览统计和点赞功能。本指南详细说明如何配置和使用。

## 📋 目录

- [什么是 Upstash Redis](#什么是-upstash-redis)
- [快速开始](#快速开始)
- [两个读写示例](#两个读写示例)
- [测试验证](#测试验证)
- [常见问题](#常见问题)

---

## 🎯 什么是 Upstash Redis？

**Upstash Redis** 是一个无服务器 Redis 服务，专为边缘和无服务器环境设计。

### 核心优势

- ✅ **无服务器** - 按需付费，自动扩展
- ✅ **Edge 优化** - 完美兼容 Vercel Edge Functions
- ✅ **全球分布** - 数据复制到全球多个区域
- ✅ **慷慨免费额度** - 个人项目完全够用
- ✅ **完整 Redis API** - 支持所有 Redis 命令

### 与 Vercel KV 的关系

- **Vercel KV** 实际上就是基于 Upstash Redis 的
- `@upstash/redis` 是 Upstash 官方 SDK
- `@vercel/kv` 是 Vercel 对 Upstash 的封装

**选择建议**：

- 使用 `@upstash/redis` 可以获得更多 Redis 原生功能
- 本项目使用 `@upstash/redis` ✅

---

## 🚀 快速开始

### 步骤 1：安装 SDK

```bash
npm install @upstash/redis
```

### 步骤 2：在 Vercel 创建 Redis 数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **Upstash Redis**
6. 填写配置：
   - **Database Name**: `blog-redis`
   - **Region**: 选择离你用户最近的区域
7. 点击 **Create**

### 步骤 3：获取环境变量

创建数据库后，Vercel 会自动添加环境变量。

**方式 A：通过 Vercel CLI（推荐）**

```bash
# 拉取环境变量到本地
vercel env pull .env.local
```

**方式 B：手动配置**

在 `.env.local` 文件中添加：

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXyour-token-here
```

### 步骤 4：初始化 Redis 客户端

已在 `lib/redis.ts` 中完成配置：

```typescript
import { Redis } from "@upstash/redis";

// 从环境变量自动初始化
export const redis = Redis.fromEnv();
```

完成！现在可以使用了 🎉

---

## 📚 两个读写示例

本项目提供了两个实用的读写示例，展示了 Upstash Redis 的核心功能。

### 示例 1：文章浏览统计 ⭐

**文件**: `pages/api/views/[slug].ts`

**功能**：

- 读取：获取文章浏览次数
- 写入：增加文章浏览次数

**使用的 Redis 命令**：

- `GET` - 读取计数
- `INCR` - 原子递增

#### 读操作示例（GET）

```typescript
// GET /api/views/first-post

// 从 Redis 读取浏览次数
const views = (await redis.get<number>(redisKey)) || 0;

// 返回结果
return NextResponse.json({
  slug: "first-post",
  views: 100,
  message: "这篇文章已被浏览 100 次",
});
```

**测试命令**：

```bash
# 获取文章浏览次数
curl https://jiaojiaoyuyu.com/api/views/first-post

# 响应示例
{
  "slug": "first-post",
  "views": 0,
  "message": "这篇文章还没有被浏览过"
}
```

#### 写操作示例（POST）

```typescript
// POST /api/views/first-post

// 使用 INCR 命令原子性地增加计数
// 优势：线程安全，避免并发问题
const newViews = await redis.incr(redisKey);

// 返回新的计数
return NextResponse.json({
  slug: "first-post",
  views: newViews,
  message: `浏览次数已更新为 ${newViews}`,
});
```

**测试命令**：

```bash
# 增加浏览次数
curl -X POST https://jiaojiaoyuyu.com/api/views/first-post

# 响应示例
{
  "slug": "first-post",
  "views": 1,
  "message": "浏览次数已更新为 1"
}

# 再次增加
curl -X POST https://jiaojiaoyuyu.com/api/views/first-post
# views 变为 2
```

**关键技术点**：

- ✅ 使用 `INCR` 命令保证原子性
- ✅ 添加缓存策略（60 秒）减少 Redis 调用
- ✅ 错误处理和降级策略

---

### 示例 2：文章点赞功能 ⭐⭐

**文件**: `pages/api/likes/[slug].ts`

**功能**：

- 读取：获取点赞数和用户点赞状态
- 写入：点赞/取消点赞（切换状态）

**使用的 Redis 命令**：

- `GET` - 读取点赞计数
- `INCR/DECR` - 增加/减少计数
- `SADD/SREM` - 添加/移除集合元素
- `SISMEMBER` - 检查元素是否在集合中
- `PIPELINE` - 批量执行命令

#### 读操作示例（GET）

```typescript
// GET /api/likes/first-post?userId=user123

// 使用 Pipeline 批量执行多个命令，提高性能
const pipeline = redis.pipeline();

// 1. 获取点赞总数
pipeline.get<number>(likesCountKey);

// 2. 检查用户是否已点赞
pipeline.sismember(likesUsersKey, userId);

const results = await pipeline.exec();

// 解析结果
const likesCount = (results[0] as number) || 0;
const userLiked = !!(results[1] as number);

return NextResponse.json({
  slug: "first-post",
  likes: 50,
  userLiked: true,
  message: "你已点赞，当前共 50 人点赞",
});
```

**测试命令**：

```bash
# 获取点赞信息
curl "https://jiaojiaoyuyu.com/api/likes/first-post?userId=user123"

# 响应示例
{
  "slug": "first-post",
  "likes": 0,
  "userLiked": false,
  "message": "当前共 0 人点赞"
}
```

#### 写操作示例（POST）

```typescript
// POST /api/likes/first-post?userId=user123

// 先检查用户是否已点赞
const alreadyLiked = await redis.sismember(likesUsersKey, userId);

if (alreadyLiked) {
  // 取消点赞：从集合中移除用户，减少计数
  const pipeline = redis.pipeline();
  pipeline.srem(likesUsersKey, userId);
  pipeline.decr(likesCountKey);
  await pipeline.exec();
} else {
  // 点赞：添加用户到集合，增加计数
  const pipeline = redis.pipeline();
  pipeline.sadd(likesUsersKey, userId);
  pipeline.incr(likesCountKey);
  await pipeline.exec();
}

return NextResponse.json({
  slug: "first-post",
  likes: newLikesCount,
  userLiked: !alreadyLiked,
  message: "点赞成功！",
});
```

**测试命令**：

```bash
# 第一次点赞
curl -X POST "https://jiaojiaoyuyu.com/api/likes/first-post?userId=user123"

# 响应
{
  "slug": "first-post",
  "likes": 1,
  "userLiked": true,
  "message": "点赞成功！当前共 1 人点赞"
}

# 再次点赞（取消）
curl -X POST "https://jiaojiaoyuyu.com/api/likes/first-post?userId=user123"

# 响应
{
  "slug": "first-post",
  "likes": 0,
  "userLiked": false,
  "message": "已取消点赞，当前共 0 人点赞"
}
```

**关键技术点**：

- ✅ 使用 **Redis Set** 存储点赞用户列表（防止重复）
- ✅ 使用 **Pipeline** 批量执行命令，减少网络往返
- ✅ 支持点赞/取消点赞切换
- ✅ 完整的错误处理

**数据结构**：

```
# 点赞计数（String）
likes:first-post = 50

# 点赞用户集合（Set）
likes_users:first-post = {"user123", "user456", "user789"}
```

---

## 🧪 测试验证

### 本地测试

1. **启动开发服务器**：

```bash
npm run dev
```

2. **测试浏览统计**：

```bash
# 查看浏览次数
curl https://jiaojiaoyuyu.com/api/views/test-post

# 增加浏览次数
curl -X POST https://jiaojiaoyuyu.com/api/views/test-post

# 再次查看（次数已增加）
curl https://jiaojiaoyuyu.com/api/views/test-post
```

3. **测试点赞功能**：

```bash
# 查看点赞状态
curl "https://jiaojiaoyuyu.com/api/likes/test-post?userId=alice"

# 点赞
curl -X POST "https://jiaojiaoyuyu.com/api/likes/test-post?userId=alice"

# 取消点赞
curl -X POST "https://jiaojiaoyuyu.com/api/likes/test-post?userId=alice"

# 多个用户点赞
curl -X POST "https://jiaojiaoyuyu.com/api/likes/test-post?userId=bob"
curl -X POST "https://jiaojiaoyuyu.com/api/likes/test-post?userId=charlie"

# 查看总点赞数
curl "https://jiaojiaoyuyu.com/api/likes/test-post?userId=alice"
```

### 验证数据持久化

```bash
# 1. 增加浏览次数
curl -X POST https://jiaojiaoyuyu.com/api/views/test-post

# 2. 重启开发服务器
# Ctrl+C 停止，然后 npm run dev 重启

# 3. 再次查看（数据仍然存在！）
curl https://jiaojiaoyuyu.com/api/views/test-post
# 返回：views: 1（没有丢失）
```

---

## 🔍 Redis 命令参考

### 常用命令

```typescript
import { redis } from "@/lib/redis";

// ===== 字符串操作 =====

// 设置值
await redis.set("key", "value");

// 获取值
const value = await redis.get("key");

// 递增（原子操作）
const newCount = await redis.incr("counter");

// 递减
const newCount = await redis.decr("counter");

// 设置带过期时间的值
await redis.setex("key", 3600, "value"); // 3600 秒后过期

// ===== 集合操作 =====

// 添加元素到集合
await redis.sadd("users", "alice", "bob");

// 移除集合元素
await redis.srem("users", "alice");

// 检查元素是否在集合中
const exists = await redis.sismember("users", "alice");

// 获取集合所有元素
const members = await redis.smembers("users");

// 获取集合大小
const count = await redis.scard("users");

// ===== Pipeline（批量操作）=====

const pipeline = redis.pipeline();
pipeline.get("key1");
pipeline.get("key2");
pipeline.incr("counter");
const results = await pipeline.exec();

// ===== 其他常用命令 =====

// 删除键
await redis.del("key");

// 检查键是否存在
const exists = await redis.exists("key");

// 设置过期时间
await redis.expire("key", 3600);

// 获取匹配的键
const keys = await redis.keys("views:*");
```

---

## 📊 性能优化建议

### 1. 使用 Pipeline 批量操作

```typescript
// ❌ 不好：多次网络往返
const views = await redis.get("views:post1");
const likes = await redis.get("likes:post1");
const userLiked = await redis.sismember("likes_users:post1", userId);

// ✅ 好：一次网络往返
const pipeline = redis.pipeline();
pipeline.get("views:post1");
pipeline.get("likes:post1");
pipeline.sismember("likes_users:post1", userId);
const [views, likes, userLiked] = await pipeline.exec();
```

### 2. 添加缓存策略

```typescript
return NextResponse.json(data, {
  headers: {
    // CDN 缓存 60 秒
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
  },
});
```

### 3. 使用原子操作

```typescript
// ✅ 好：原子操作，线程安全
await redis.incr("counter");

// ❌ 不好：有并发问题
const count = await redis.get("counter");
await redis.set("counter", count + 1);
```

---

## ❓ 常见问题

### Q1: 本地开发时连接失败？

**A**: 确保已配置环境变量：

```bash
# 方式 1：使用 Vercel CLI
vercel env pull .env.local

# 方式 2：手动创建 .env.local
cat .env.local.example > .env.local
# 然后填入实际的 URL 和 Token
```

### Q2: Edge Runtime 支持哪些 Redis 命令？

**A**: Upstash Redis 通过 HTTP REST API 工作，支持几乎所有 Redis 命令。完整列表见：
https://docs.upstash.com/redis/features/restapi#rest---redis-api-compatibility

### Q3: 如何在 Vercel Dashboard 查看 Redis 数据？

**A**:

1. Vercel Dashboard → Storage → 你的 Redis 数据库
2. 点击 **Data Browser**
3. 可以查看、编辑、删除键值

### Q4: 如何清空测试数据？

**A**:

```bash
# 方式 1：在 Vercel Dashboard 的 Data Browser 中手动删除

# 方式 2：创建一个清理脚本
# scripts/clear-redis.ts
import { redis } from "@/lib/redis";

async function clearTestData() {
  const keys = await redis.keys("views:*");
  if (keys.length > 0) {
    await redis.del(...keys);
  }
  console.log(`Cleared ${keys.length} keys`);
}

clearTestData();
```

### Q5: 免费额度够用吗？

**A**: 对于个人博客**完全够用**！

Upstash Redis 免费额度（通过 Vercel）：

- **10,000 命令/天**
- **256 MB 存储**
- **100 MB 带宽/天**

假设每天 1000 次访问：

- 浏览统计：2000 次命令（GET + POST）
- 点赞：额外 1000 次命令
- 总计：3000 次/天

**使用率仅 30%** ✅

---

## 🎯 最佳实践

### 1. 键命名规范

使用统一的键命名规范（已在 `lib/redis.ts` 中实现）：

```typescript
export const RedisKeys = {
  views: (slug: string) => `views:${slug}`,
  likes: (slug: string) => `likes:${slug}`,
  likesUsers: (slug: string) => `likes_users:${slug}`,
};
```

### 2. 错误处理

```typescript
try {
  const views = await redis.get(key);
  return NextResponse.json({ views });
} catch (error) {
  console.error("Redis error:", error);
  // 降级策略：返回默认值
  return NextResponse.json({ views: 0, cached: false });
}
```

### 3. 类型安全

```typescript
// ✅ 好：使用泛型指定类型
const views = await redis.get<number>("views:post1");

// ✅ 好：定义接口
interface LikesData {
  count: number;
  users: string[];
}
const data = await redis.get<LikesData>("likes:post1");
```

---

## 🔗 相关资源

- [Upstash Redis 官方文档](https://docs.upstash.com/redis)
- [Upstash Redis SDK for TypeScript](https://github.com/upstash/upstash-redis)
- [Vercel Storage 文档](https://vercel.com/docs/storage/vercel-kv)
- [Redis 命令参考](https://redis.io/commands/)

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 [Upstash 文档](https://docs.upstash.com)
2. 查看 [Upstash GitHub Discussions](https://github.com/upstash/issues/discussions)
3. 联系 Upstash 支持

---

**祝你使用愉快！🎉**
