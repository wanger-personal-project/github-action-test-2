#!/bin/bash

# 获取文章评论列表 API
# 用法: ./test_get_comments.sh <post_slug>

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <post_slug>"
  echo "Example: $0 my-first-post"
  exit 1
fi

POST_SLUG="$1"

echo "========================================="
echo "Testing Get Comments API"
echo "========================================="
echo "Post Slug: $POST_SLUG"
echo ""

curl -X GET "$BASE_URL/api/comments/$POST_SLUG" \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>/dev/null

echo ""
echo "========================================="
