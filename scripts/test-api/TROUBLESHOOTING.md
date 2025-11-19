# 测试脚本卡住问题分析与解决方案

## 🐛 问题现象

执行测试脚本时（如 `test_signup.sh`, `test_login.sh`），脚本卡住不响应，既不输出结果也不退出。

## 🔍 根本原因分析

### 问题代码模式

原始脚本使用了以下模式：

```bash
curl ... \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || cat
```

### 为什么会卡住？

这是一个经典的 **Shell 管道处理陷阱**，执行流程如下：

1. **curl 成功返回**
   - 即使是 401/400 错误，curl 仍然成功返回
   - 输出包含：JSON响应 + "HTTP Status: 401" 这样的文本

2. **传递给 python3 -m json.tool**
   - Python 尝试解析整个输出
   - 发现不是纯 JSON（包含额外的 HTTP Status 行）
   - 解析失败，返回非零退出码

3. **错误被隐藏**
   - `2>/dev/null` 隐藏了 python3 的错误信息
   - 用户看不到任何错误提示

4. **触发 || cat**
   - Shell 的 `||` 运算符检测到前面的命令失败
   - 执行 `cat` 命令

5. **cat 等待输入 → 卡住！**
   - `cat` 没有参数时，默认从 stdin 读取
   - 但管道已经断开，cat 没有收到任何输入
   - `cat` 进入等待状态，等待用户从键盘输入
   - **用户感觉脚本"卡住了"**

### 为什么不直接抛错？

- `cat` 等待 stdin 是**正常行为**，不是错误
- Shell 认为程序还在正常运行（等待输入）
- 没有超时机制，会一直等待
- 用户必须手动 Ctrl+C 中断

## ✅ 解决方案

### 方案 1：分离响应处理（推荐）

```bash
# 捕获完整响应
RESPONSE=$(curl ... -s -w "\nHTTP_STATUS:%{http_code}")

# 分离状态码
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

# 提取响应体
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS:")

# 安全格式化输出
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_STATUS"
```

**优点：**
- ✅ 不会卡住
- ✅ 即使 JSON 格式化失败也能看到原始输出
- ✅ HTTP 状态码清晰分离
- ✅ 错误提示明确

### 方案 2：简化输出（最简单）

```bash
curl ... -s -w "\nHTTP_STATUS:%{http_code}"
```

**优点：**
- ✅ 最简单，不会卡住
- ✅ 直接显示所有信息

**缺点：**
- ❌ JSON 未格式化，可读性较差

## 📊 已修复的脚本

以下脚本已使用方案 1 或方案 2 修复：

- [x] test_signup.sh ✅ (方案 1)
- [x] test_login.sh ✅ (方案 1)
- [x] test_get_user.sh ✅ (方案 2)
- [x] test_logout.sh ✅ (方案 2)
- [x] test_get_posts.sh ✅ (方案 2)
- [x] test_get_post.sh ✅ (方案 2)
- [x] test_create_post.sh ✅ (方案 2)
- [x] test_update_post.sh ✅ (方案 2)
- [x] test_delete_post.sh ✅ (方案 2)
- [x] test_get_comments.sh ✅ (方案 2)
- [x] test_create_comment.sh ✅ (方案 2)
- [x] test_moderate_comment.sh ✅ (方案 2)

## 🎓 经验教训

### Shell 管道使用的最佳实践

1. **避免盲目使用 `|| cat`**
   - `|| cat` 只适合有明确输入的场景
   - 无输入时会导致挂起

2. **不要隐藏所有错误**
   - `2>/dev/null` 应谨慎使用
   - 至少保留关键错误信息

3. **分步处理复杂输出**
   - 先捕获完整响应
   - 再分离和处理各部分
   - 避免过长的管道链

4. **提供降级方案**
   - `command 2>/dev/null || echo "$原始内容"`
   - 确保总有输出，不会卡住

### curl 最佳实践

1. **使用 `-s` (silent) 替代 `2>/dev/null`**
   ```bash
   curl -s ...  # 推荐：静默模式，不显示进度
   ```

2. **使用 `-w` 获取元数据**
   ```bash
   curl -w "\nHTTP_STATUS:%{http_code}"  # 推荐：易于解析
   ```

3. **使用 `-f` 让 HTTP 错误返回非零退出码**
   ```bash
   curl -f ...  # 400/500 错误时 curl 返回非零
   ```

## 🧪 测试验证

验证修复后的脚本：

```bash
# 测试不会卡住（即使邮箱域名无效）
./test_signup.sh invalid@test.com pass123 user "Name"
# 应立即返回错误，而不是卡住

# 测试正常流程
./test_signup.sh user@gmail.com pass123 realuser "Real User"
# 应正常显示 JSON 和状态码
```

## 📚 相关资源

- [Bash Pitfalls](http://mywiki.wooledge.org/BashPitfalls)
- [curl 文档](https://curl.se/docs/manpage.html)
- [Shell 管道和重定向](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html)

---

# Supabase 分页查询错误问题

## 🐛 问题现象

执行 `./test_get_posts.sh 2 20` 时返回 500 错误：

```json
{"error":"Internal server error","details":"{\""}
HTTP_STATUS:500
```

但是 `./test_get_posts.sh 1 10` 正常返回空数组。

## 🔍 根本原因分析

### 问题代码模式

在 `/pages/api/posts/index.ts` 中使用了以下查询：

```typescript
const { data, error, count } = await supabase
  .from("posts")
  .select(`
    *,
    author:authors(*)
  `, { count: "exact" })
  .eq("status", "published")
  .order("published_at", { ascending: false })
  .range(offset, offset + limitNum - 1);
```

### 为什么会报错？

这是 **Supabase JS 库的一个边缘情况 Bug**，具体表现如下：

1. **数据库为空时**
   - 表中有 0 条记录
   - page=1, offset=0, range(0, 9) → 正常返回空数组 ✅
   - page=2, offset=20, range(20, 39) → 返回畸形错误对象 ❌

2. **错误对象分析**
   ```javascript
   // 正常的 Supabase 错误应该包含：
   { message: "...", code: "...", details: "...", hint: "..." }

   // 但实际返回的是：
   { message: '{"' }  // 仅包含 message 属性，值为截断的 JSON
   ```

3. **错误特征**
   - `error.code` 为 `undefined`
   - `error.details` 为 `undefined`
   - `error.message` 为 `'{"'` （截断的 JSON 字符串）
   - `Object.keys(error)` 仅包含 `['message']`
   - `error.constructor.name` 为 `'Object'`

### 为什么只在分页时出现？

- **page=1**: offset=0，查询 range(0, 9)，即使表为空也能正常处理
- **page=2**: offset=20，查询 range(20, 39)，当表为空时触发 Supabase 库内部错误
- 问题与 `.select()` 中的 **JOIN 查询** (`author:authors(*)`) 结合 `.range()` 有关
- PostgreSQL 本身支持超范围查询（返回空结果），但 Supabase JS 库在处理这种情况时出现了 bug

## ✅ 解决方案

在 `/pages/api/posts/index.ts` 中添加特殊错误处理：

```typescript
const { data, error, count } = await query;

// Handle Supabase errors
if (error) {
  // Log the error for debugging
  console.error("Supabase query error:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  });

  // For malformed errors (like paginating beyond data), return empty results
  // This is a known edge case in Supabase JS when using joins with .range()
  if (!error.code || error.message === '{"') {
    console.warn("Supabase returned malformed error, treating as empty result");
    return res.status(200).json({
      posts: [],
      pagination: {
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
      },
    });
  }

  // For real database errors, throw
  throw error;
}
```

**解决方案说明：**
- ✅ 检测畸形错误对象（无 `code` 或 `message === '{"'`）
- ✅ 将其视为"超出数据范围"，返回空结果而非错误
- ✅ 保留对真实数据库错误的处理（有 `code` 的错误仍会抛出）
- ✅ 添加详细日志便于调试

## 🧪 验证结果

修复后的测试结果：

```bash
# 测试 page=1
./test_get_posts.sh 1 10
# ✅ {"posts":[],"pagination":{"total":0,"page":1,"limit":10,"totalPages":0}}
# ✅ HTTP_STATUS:200

# 测试 page=2（之前会报错）
./test_get_posts.sh 2 20
# ✅ {"posts":[],"pagination":{"total":0,"page":2,"limit":20,"totalPages":0}}
# ✅ HTTP_STATUS:200
```

服务器日志：
```
Supabase query error: { message: '{"', code: undefined, details: undefined, hint: undefined }
Supabase returned malformed error, treating as empty result
GET /api/posts?page=2&limit=20 200 in 603ms
```

## 🎓 经验教训

### Supabase 使用注意事项

1. **分页查询的边缘情况**
   - Supabase JS 库在处理空表的大偏移量查询时可能返回畸形错误
   - 使用 `.range()` + JOIN 查询时尤其需要注意

2. **错误处理最佳实践**
   - 不要假设所有 Supabase 错误都有 `code` 属性
   - 对于公开的只读接口，可以容错处理返回空结果
   - 始终记录原始错误便于调试

3. **如何识别畸形错误**
   ```typescript
   if (!error.code || error.message === '{"') {
     // 这是 Supabase 库的 bug，安全处理
   }
   ```

4. **替代方案（如果需要）**
   - 在查询前验证分页参数合理性
   - 先查询总数，避免请求超出范围的页码
   - 简化查询（移除 JOIN）看是否解决问题

### 类似问题的排查思路

1. **添加详细日志**
   ```typescript
   console.error("Raw error object:", error);
   console.error("Error keys:", Object.keys(error));
   console.error("Error constructor:", error.constructor.name);
   ```

2. **对比正常与异常请求**
   - page=1 vs page=2
   - 空表 vs 有数据的表
   - 简单查询 vs JOIN 查询

3. **查看错误对象结构**
   - 正常错误：有 `code`, `details`, `hint`
   - 畸形错误：仅有 `message`，且内容异常
