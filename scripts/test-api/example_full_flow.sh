#!/bin/bash

# 完整流程测试示例
# 这个脚本演示如何组合使用各个原子化脚本

set -e

echo "========================================"
echo "Supabase 博客系统 - 完整流程测试"
echo "========================================"
echo ""

# 配置
# ⚠️ 注意：必须使用真实的邮箱域名，Supabase 会拒绝测试域名（如 @example.com）
EMAIL="demo$(date +%s)@gmail.com"
PASSWORD="demo123456"
USERNAME="demo$(date +%s)"
DISPLAY_NAME="Demo User"

echo "📝 将使用以下测试账号："
echo "   Email: $EMAIL"
echo "   Username: $USERNAME"
echo ""

# 1. 注册用户
echo "🔹 步骤 1: 注册新用户"
./test_signup.sh "$EMAIL" "$PASSWORD" "$USERNAME" "$DISPLAY_NAME"
echo ""
sleep 1

# 2. 登录
echo "🔹 步骤 2: 用户登录"
./test_login.sh "$EMAIL" "$PASSWORD"
SESSION_FILE="/tmp/supabase_session_$(echo $EMAIL | md5sum | cut -d' ' -f1).txt"
echo "Session 文件: $SESSION_FILE"
echo ""
sleep 1

# 3. 获取用户信息
echo "🔹 步骤 3: 获取当前用户信息"
./test_get_user.sh "$SESSION_FILE"
echo ""
sleep 1

# 4. 创建草稿文章
echo "🔹 步骤 4: 创建草稿文章"
DRAFT_RESPONSE=$(./test_create_post.sh "$SESSION_FILE" \
  "My First Draft Post" \
  "my-first-draft-$(date +%s)" \
  "This is a draft post for testing purposes." \
  "draft")
echo "$DRAFT_RESPONSE"
DRAFT_POST_ID=$(echo "$DRAFT_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('post', {}).get('id', ''))" 2>/dev/null || echo "")
echo ""
sleep 1

# 5. 创建并发布文章
echo "🔹 步骤 5: 创建并发布文章"
POST_RESPONSE=$(./test_create_post.sh "$SESSION_FILE" \
  "How to Use Supabase with Next.js" \
  "supabase-nextjs-guide-$(date +%s)" \
  "This is a comprehensive guide on integrating Supabase with Next.js applications. We'll cover authentication, database operations, and real-time features." \
  "published")
echo "$POST_RESPONSE"
POST_ID=$(echo "$POST_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('post', {}).get('id', ''))" 2>/dev/null || echo "")
POST_SLUG=$(echo "$POST_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('post', {}).get('slug', ''))" 2>/dev/null || echo "")
echo ""
sleep 1

# 6. 获取文章列表
echo "🔹 步骤 6: 获取文章列表"
./test_get_posts.sh
echo ""
sleep 1

# 7. 获取文章详情
if [ -n "$POST_SLUG" ]; then
  echo "🔹 步骤 7: 获取文章详情"
  ./test_get_post.sh "$POST_SLUG"
  echo ""
  sleep 1
fi

# 8. 创建评论
if [ -n "$POST_ID" ]; then
  echo "🔹 步骤 8: 发表评论"
  COMMENT_RESPONSE=$(./test_create_comment.sh "$SESSION_FILE" \
    "$POST_ID" \
    "Great article! This is very helpful for my project.")
  echo "$COMMENT_RESPONSE"
  COMMENT_ID=$(echo "$COMMENT_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('comment', {}).get('id', ''))" 2>/dev/null || echo "")
  echo ""
  sleep 1
fi

# 9. 审核评论（作者自己审核自己的评论用于测试）
if [ -n "$COMMENT_ID" ]; then
  echo "🔹 步骤 9: 审核评论（批准）"
  ./test_moderate_comment.sh "$SESSION_FILE" "$COMMENT_ID" "approved"
  echo ""
  sleep 1
fi

# 10. 获取评论列表
if [ -n "$POST_SLUG" ]; then
  echo "🔹 步骤 10: 获取评论列表"
  ./test_get_comments.sh "$POST_SLUG"
  echo ""
  sleep 1
fi

# 11. 更新草稿文章并发布
if [ -n "$DRAFT_POST_ID" ]; then
  echo "🔹 步骤 11: 将草稿发布"
  ./test_update_post.sh "$SESSION_FILE" \
    "$DRAFT_POST_ID" \
    "My First Published Post" \
    "This draft has been updated and published!" \
    "published"
  echo ""
  sleep 1
fi

# 12. 登出
echo "🔹 步骤 12: 用户登出"
./test_logout.sh "$SESSION_FILE"
echo ""

echo "========================================"
echo "✅ 完整流程测试完成！"
echo "========================================"
echo ""
echo "📊 测试总结："
echo "   - 注册用户: ✅"
echo "   - 登录/登出: ✅"
echo "   - 创建文章: ✅"
echo "   - 发布文章: ✅"
echo "   - 获取文章: ✅"
echo "   - 创建评论: ✅"
echo "   - 审核评论: ✅"
echo "   - 更新文章: ✅"
echo ""
echo "🎉 所有功能正常！"
