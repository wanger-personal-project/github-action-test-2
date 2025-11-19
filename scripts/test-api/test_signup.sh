#!/bin/bash

# 测试用户注册 API
# 用法: ./test_signup.sh <email> <password> <username> [displayName]

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if [ $# -lt 3 ]; then
  echo "Usage: $0 <email> <password> <username> [displayName]"
  echo "Example: $0 user@example.com pass123 myusername 'My Name'"
  exit 1
fi

EMAIL="$1"
PASSWORD="$2"
USERNAME="$3"
DISPLAY_NAME="${4:-$USERNAME}"

echo "========================================="
echo "Testing Signup API"
echo "========================================="
echo "Email: $EMAIL"
echo "Username: $USERNAME"
echo "Display Name: $DISPLAY_NAME"
echo ""

RESPONSE=$(curl -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"username\": \"$USERNAME\",
    \"displayName\": \"$DISPLAY_NAME\"
  }" \
  -s -w "\nHTTP_STATUS:%{http_code}")

# 分离响应体和状态码
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS:")

# 格式化输出
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_STATUS"

echo ""
echo "========================================="
