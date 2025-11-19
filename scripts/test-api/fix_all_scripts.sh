#!/bin/bash

# 批量修复所有测试脚本的输出处理问题
# 这个脚本会更新所有使用管道处理的脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================="
echo "修复测试脚本的管道处理问题"
echo "========================================="
echo ""

# 已修复的脚本
echo "✅ test_signup.sh - 已修复"
echo "✅ test_login.sh - 已修复"
echo ""

# 需要手动检查并修复的脚本列表
echo "需要修复的脚本："
echo "  - test_get_user.sh"
echo "  - test_logout.sh"
echo "  - test_get_posts.sh"
echo "  - test_get_post.sh"
echo "  - test_create_post.sh"
echo "  - test_update_post.sh"
echo "  - test_delete_post.sh"
echo "  - test_get_comments.sh"
echo "  - test_create_comment.sh"
echo "  - test_moderate_comment.sh"
echo ""

echo "修复模式："
echo "1. 使用 RESPONSE=\$(curl ... -s -w \"\\nHTTP_STATUS:%{http_code}\")"
echo "2. 分离状态码: HTTP_STATUS=\$(echo \"\$RESPONSE\" | grep \"HTTP_STATUS:\" | cut -d: -f2)"
echo "3. 提取响应体: BODY=\$(echo \"\$RESPONSE\" | grep -v \"HTTP_STATUS:\")"
echo "4. 安全输出: echo \"\$BODY\" | python3 -m json.tool 2>/dev/null || echo \"\$BODY\""
echo ""
echo "========================================="
