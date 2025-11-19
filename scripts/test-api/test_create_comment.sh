#!/bin/bash

# 创建评论 API
# 用法: ./test_create_comment.sh <cookie_file> <post_id> <content> [parent_comment_id]

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if [ $# -lt 3 ]; then
  echo "Usage: $0 <cookie_file> <post_id> <content> [parent_comment_id]"
  echo "Example: $0 /tmp/session.txt 'abc-123-uuid' 'Great post!'"
  echo "Example with reply: $0 /tmp/session.txt 'post-id' 'Thanks!' 'parent-comment-id'"
  exit 1
fi

COOKIE_FILE="$1"
POST_ID="$2"
CONTENT="$3"
PARENT_COMMENT_ID="${4:-}"

if [ ! -f "$COOKIE_FILE" ]; then
  echo "Error: Cookie file not found: $COOKIE_FILE"
  exit 1
fi

echo "========================================="
echo "Testing Create Comment API"
echo "========================================="
echo "Post ID: $POST_ID"
echo "Content: $CONTENT"
[ -n "$PARENT_COMMENT_ID" ] && echo "Parent Comment: $PARENT_COMMENT_ID"
echo "Using session: $COOKIE_FILE"
echo ""

# 构建 JSON
JSON="{\"post_id\": \"$POST_ID\", \"content\": \"$CONTENT\""
[ -n "$PARENT_COMMENT_ID" ] && JSON="$JSON, \"parent_comment_id\": \"$PARENT_COMMENT_ID\""
JSON="$JSON}"

curl -X POST "$BASE_URL/api/comments/create" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "$JSON" \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>/dev/null

echo ""
echo "========================================="
