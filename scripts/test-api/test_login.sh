#!/bin/bash

# 测试用户登录 API
# 用法: ./test_login.sh <email> <password>

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if [ $# -lt 2 ]; then
  echo "Usage: $0 <email> <password>"
  echo "Example: $0 user@example.com pass123"
  exit 1
fi

EMAIL="$1"
PASSWORD="$2"

echo "========================================="
echo "Testing Login API"
echo "========================================="
echo "Email: $EMAIL"
echo ""

# 保存 cookies 到文件
COOKIE_FILE="/tmp/supabase_session_$(echo $EMAIL | md5sum | cut -d' ' -f1).txt"

RESPONSE=$(curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" \
  -c "$COOKIE_FILE" \
  -s -w "\nHTTP_STATUS:%{http_code}")

# 分离响应体和状态码
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS:")

# 格式化输出
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_STATUS"

echo ""
echo "Session saved to: $COOKIE_FILE"
echo "========================================="
