#!/bin/bash

# 获取单篇文章详情 API
# 用法: ./test_get_post.sh <slug>

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <slug>"
  echo "Example: $0 my-first-post"
  exit 1
fi

SLUG="$1"

echo "========================================="
echo "Testing Get Post API"
echo "========================================="
echo "Slug: $SLUG"
echo ""

curl -X GET "$BASE_URL/api/posts/$SLUG" \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>/dev/null

echo ""
echo "========================================="
