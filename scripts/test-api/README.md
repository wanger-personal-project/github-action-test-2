# API 测试脚本使用指南

这些脚本用于测试 Supabase 博客系统的 API 接口。所有脚本都是原子化的，可以独立运行或组合使用。

## 📋 前置条件

1. 开发服务器必须运行在 `http://localhost:3000`
2. 确保已在 Supabase Dashboard 中**禁用邮箱验证**（开发/测试环境）：
   - 进入 Authentication → Providers → Email
   - 取消勾选 "Confirm email"
3. **⚠️ 重要：必须使用真实的邮箱域名**：
   - ✅ 正确：`testuser@gmail.com`, `demo@outlook.com`, `user@qq.com`
   - ❌ 错误：`test@example.com`, `user@test.com`, `demo@localhost`
   - Supabase 会验证邮箱域名的有效性，测试域名会被拒绝

## 🔐 认证相关脚本

### 1. 注册用户

```bash
./test_signup.sh <email> <password> <username> [displayName]
```

**示例**：

```bash
# ✅ 使用真实邮箱域名
./test_signup.sh wangyulue@gmail.com pass123456 testuser "Test User"

# ❌ 不要使用测试域名（会被 Supabase 拒绝）
# ./test_signup.sh testuser@example.com pass123456 testuser "Test User"
```

---

### 2. 用户登录

```bash
./test_login.sh <email> <password>
```

**示例**：

```bash
./test_login.sh testuserclaudecode@gmail.com pass123456
```

**说明**：

- 登录成功后会保存 session 到 `/tmp/supabase_session_<hash>.txt`
- 后续需要认证的操作都需要使用这个 session 文件

---

### 3. 获取当前用户信息

```bash
./test_get_user.sh <cookie_file>
```

**示例**：

```bash
./test_get_user.sh /tmp/supabase_session_abc123.txt
```

---

### 4. 用户登出

```bash
./test_logout.sh <cookie_file>
```

**示例**：

```bash
./test_logout.sh /tmp/supabase_session_abc123.txt
```

**说明**：

- 会自动删除 session 文件

---

## 📝 文章相关脚本

### 1. 获取文章列表

```bash
./test_get_posts.sh [page] [limit]
```

**示例**：

```bash
./test_get_posts.sh          # 默认 page=1, limit=10
./test_get_posts.sh 2 20     # 第2页，每页20条
```

---

### 2. 获取单篇文章

```bash
./test_get_post.sh <slug>
```

**示例**：

```bash
./test_get_post.sh my-first-post
```

---

### 3. 创建文章

```bash
./test_create_post.sh <cookie_file> <title> <slug> <content> [status]
```

**参数**：

- `status`: `draft` (默认) | `published` | `archived`

**示例**：

```bash
# 创建草稿
./test_create_post.sh /tmp/supabase_session_095832c7dfe751d53a98358a2e00fac6.txt \
  "My First Post" \
  "my-first-post" \
  "This is the content of my post." \
  "draft"

# 直接发布
./test_create_post.sh /tmp/supabase_session_095832c7dfe751d53a98358a2e00fac6.txt \
  "Published Post" \
  "published-post" \
  "This post is published immediately." \
  "published"
```

---

### 4. 更新文章

```bash
./test_update_post.sh <cookie_file> <post_id> <title> [content] [status]
```

**示例**：

```bash
# 只更新标题
./test_update_post.sh /tmp/supabase_session_095832c7dfe751d53a98358a2e00fac6.txt \
  "6125c6a0-0ea1-4646-bdc7-9db476c32c27" \
  "xxx Title"

# 更新标题和内容
./test_update_post.sh /tmp/supabase_session_095832c7dfe751d53a98358a2e00fac6.txt \
  "64ba86d3-5897-4a30-8f54-1d93e904c86f" \
  "xxx Title" \
  "xxxx" \
  "published"

# 发布草稿
./test_update_post.sh /tmp/session.txt \
  "abc-123-uuid" \
  "Final Title" \
  "Final content." \
  "published"
```

---

### 5. 删除文章

```bash
./test_delete_post.sh <cookie_file> <post_id>
```

**示例**：

```bash
./test_delete_post.sh /tmp/supabase_session_095832c7dfe751d53a98358a2e00fac6.txt \
  "6125c6a0-0ea1-4646-bdc7-9db476c32c27"
```

**说明**：

- 会提示确认，需要输入 `y` 确认删除
- 删除文章会级联删除所有评论

---

## 💬 评论相关脚本

### 1. 获取文章评论

```bash
./test_get_comments.sh <post_slug>
```

**示例**：

```bash
./test_get_comments.sh my-first-post
```

**说明**：

- 只返回已批准（`approved`）的评论

---

### 2. 创建评论

```bash
./test_create_comment.sh <cookie_file> <post_id> <content> [parent_comment_id]
```

**示例**：

```bash
# 发表新评论
./test_create_comment.sh /tmp/supabase_session_095832c7dfe751d53a98358a2e00fac6.txt \
  "64ba86d3-5897-4a30-8f54-1d93e904c86f" \
  "Great article! Thanks for sharing."

# 回复评论
./test_create_comment.sh /tmp/supabase_session_095832c7dfe751d53a98358a2e00fac6.txt \
  "64ba86d3-5897-4a30-8f54-1d93e904c86f" \
  "Thank you!" \
  "eef43c31-6efe-418b-bb84-b7e315c93149" \
```

**说明**：

- 新评论默认状态为 `pending`（待审核）
- 只有文章作者可以审核评论

---

### 3. 审核评论

```bash
./test_moderate_comment.sh <cookie_file> <comment_id> <status>
```

**参数**：

- `status`: `approved` | `rejected` | `spam`

**示例**：

```bash
# 批准评论
./test_moderate_comment.sh /tmp/session.txt \
  "comment-uuid" \
  "approved"

# 拒绝评论
./test_moderate_comment.sh /tmp/session.txt \
  "comment-uuid" \
  "rejected"

# 标记为垃圾评论
./test_moderate_comment.sh /tmp/session.txt \
  "comment-uuid" \
  "spam"
```

**说明**：

- 只有文章作者可以审核该文章的评论
- 其他用户尝试审核会返回 403 错误

---

## 🧪 完整测试流程示例

### 场景 1：创建用户并发布文章

```bash
# 1. 注册新用户
./test_signup.sh author@example.com pass123 authoruser "Author Name"

# 2. 登录（记住返回的 session 文件路径）
./test_login.sh author@example.com pass123
# 假设 session 保存在 /tmp/supabase_session_abc.txt

# 3. 创建并发布文章
./test_create_post.sh /tmp/supabase_session_abc.txt \
  "How to Use Supabase" \
  "how-to-use-supabase" \
  "Supabase is an amazing backend-as-a-service..." \
  "published"
# 记录返回的 post.id

# 4. 查看文章列表
./test_get_posts.sh

# 5. 查看文章详情
./test_get_post.sh how-to-use-supabase
```

---

### 场景 2：用户互动（评论和审核）

```bash
# 1. 读者登录
./test_login.sh reader@example.com pass123
# 假设 session: /tmp/supabase_session_def.txt

# 2. 读者发表评论（使用 post_id）
./test_create_comment.sh /tmp/supabase_session_def.txt \
  "post-uuid-here" \
  "Excellent tutorial! Very helpful."
# 记录返回的 comment.id

# 3. 作者登录
./test_login.sh author@example.com pass123
# 假设 session: /tmp/supabase_session_abc.txt

# 4. 作者审核评论
./test_moderate_comment.sh /tmp/supabase_session_abc.txt \
  "comment-uuid-here" \
  "approved"

# 5. 查看已批准的评论
./test_get_comments.sh how-to-use-supabase
```

---

### 场景 3：更新和删除

```bash
# 1. 作者登录
./test_login.sh author@example.com pass123

# 2. 更新文章
./test_update_post.sh /tmp/supabase_session_abc.txt \
  "post-uuid" \
  "Updated: How to Use Supabase" \
  "Updated content with more details..."

# 3. 删除文章
./test_delete_post.sh /tmp/supabase_session_abc.txt "post-uuid"
```

---

## ⚙️ 环境变量

可以通过环境变量自定义 API 地址：

```bash
export API_BASE_URL=https://your-domain.com
./test_get_posts.sh
```

默认值：`http://localhost:3000`

---

## 📌 注意事项

1. **Session 管理**：

   - Session 文件保存在 `/tmp/` 目录
   - 文件名格式：`supabase_session_<email_hash>.txt`
   - 登出后会自动删除

2. **权限控制**：

   - 创建/更新/删除文章：需要认证，且只能操作自己的文章
   - 创建评论：需要认证
   - 审核评论：需要认证，且只能审核自己文章的评论

3. **邮箱验证**：

   - 开发环境建议禁用 Supabase 邮箱验证
   - 否则注册后无法立即登录

4. **错误处理**：
   - 脚本会显示 HTTP 状态码
   - 401: 未登录
   - 403: 无权限
   - 404: 资源不存在
   - 500: 服务器错误

---

## 🐛 故障排除

### 问题：注册失败 "Email address is invalid"

**原因**：使用了测试邮箱域名（如 @example.com）
**解决**：使用真实的邮箱域名（如 @gmail.com, @outlook.com）

### 问题：登录失败 "Invalid email or password"

**原因**：邮箱未验证
**解决**：

1. 在 Supabase Dashboard 禁用邮箱验证
2. 或手动在 Authentication → Users 中确认用户邮箱

### 问题：脚本执行卡住没有响应

**原因**：邮箱域名无效导致 API 返回异常
**解决**：

1. 确保使用真实的邮箱域名
2. 检查服务器日志（开发服务器输出）查看具体错误

### 问题：创建文章失败 403

**原因**：用户未登录或 session 过期
**解决**：重新登录获取新的 session

### 问题：无法审核评论 403

**原因**：不是文章作者
**解决**：使用文章作者的账号登录

---

## 📁 脚本清单

```
scripts/test-api/
├── README.md                    # 本文档
├── test_signup.sh               # 注册用户
├── test_login.sh                # 用户登录
├── test_get_user.sh             # 获取用户信息
├── test_logout.sh               # 用户登出
├── test_get_posts.sh            # 获取文章列表
├── test_get_post.sh             # 获取单篇文章
├── test_create_post.sh          # 创建文章
├── test_update_post.sh          # 更新文章
├── test_delete_post.sh          # 删除文章
├── test_get_comments.sh         # 获取评论列表
├── test_create_comment.sh       # 创建评论
└── test_moderate_comment.sh     # 审核评论
```
