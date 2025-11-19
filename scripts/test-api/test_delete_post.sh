#!/bin/bash

# 删除文章 API
# 用法: ./test_delete_post.sh <cookie_file> <post_id>

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if [ $# -lt 2 ]; then
  echo "Usage: $0 <cookie_file> <post_id>"
  echo "Example: $0 /tmp/session.txt 'abc-123-uuid'"
  exit 1
fi

COOKIE_FILE="$1"
POST_ID="$2"

if [ ! -f "$COOKIE_FILE" ]; then
  echo "Error: Cookie file not found: $COOKIE_FILE"
  exit 1
fi

echo "========================================="
echo "Testing Delete Post API"
echo "========================================="
echo "Post ID: $POST_ID"
echo "Using session: $COOKIE_FILE"
echo ""
echo "⚠️  WARNING: This will permanently delete the post!"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

curl -X DELETE "$BASE_URL/api/posts/delete" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "{\"id\": \"$POST_ID\"}" \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>/dev/null

echo ""
echo "========================================="
