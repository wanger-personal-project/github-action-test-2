#!/bin/bash

# 通用函数：格式化 API 响应
# 用法: format_response "$response"
format_response() {
  local response="$1"

  # 分离 HTTP 状态码和响应体
  local http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
  local body=$(echo "$response" | grep -v "HTTP_STATUS:")

  # 尝试格式化 JSON，失败则原样输出
  if [ -n "$body" ]; then
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
  fi

  # 输出状态码
  if [ -n "$http_status" ]; then
    echo ""
    echo "HTTP Status: $http_status"
  fi
}

# 导出函数供其他脚本使用
export -f format_response
