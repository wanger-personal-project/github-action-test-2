#!/bin/bash

# 创建文章 API
# 用法: ./test_create_post.sh <cookie_file> <title> <slug> <content> [status]

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if [ $# -lt 4 ]; then
  echo "Usage: $0 <cookie_file> <title> <slug> <content> [status]"
  echo "Example: $0 /tmp/session.txt 'My Post' 'my-post' 'Content here' 'draft'"
  echo "Status: draft (default), published, archived"
  exit 1
fi

COOKIE_FILE="$1"
TITLE="$2"
SLUG="$3"
CONTENT="$4"
STATUS="${5:-draft}"

if [ ! -f "$COOKIE_FILE" ]; then
  echo "Error: Cookie file not found: $COOKIE_FILE"
  exit 1
fi

echo "========================================="
echo "Testing Create Post API"
echo "========================================="
echo "Title: $TITLE"
echo "Slug: $SLUG"
echo "Status: $STATUS"
echo "Using session: $COOKIE_FILE"
echo ""

curl -X POST "$BASE_URL/api/posts/create" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "{
    \"title\": \"$TITLE\",
    \"slug\": \"$SLUG\",
    \"content\": \"$CONTENT\",
    \"status\": \"$STATUS\"
  }" \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>/dev/null

echo ""
echo "========================================="
