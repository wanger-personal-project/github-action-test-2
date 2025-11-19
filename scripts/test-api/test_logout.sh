#!/bin/bash

# 测试用户登出 API
# 用法: ./test_logout.sh <cookie_file>

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <cookie_file>"
  echo "Example: $0 /tmp/supabase_session_xxx.txt"
  exit 1
fi

COOKIE_FILE="$1"

if [ ! -f "$COOKIE_FILE" ]; then
  echo "Error: Cookie file not found: $COOKIE_FILE"
  exit 1
fi

echo "========================================="
echo "Testing Logout API"
echo "========================================="
echo "Using session: $COOKIE_FILE"
echo ""

curl -X POST "$BASE_URL/api/auth/logout" \
  -b "$COOKIE_FILE" \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>/dev/null

echo ""
echo "Deleting session file: $COOKIE_FILE"
rm -f "$COOKIE_FILE"
echo "========================================="
