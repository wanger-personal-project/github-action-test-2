import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

/**
 * A/B 测试边缘函数
 * 演示如何在边缘节点进行用户分组和流量分割
 */
export default async function handler(request: NextRequest) {
  // 获取或生成用户 ID
  let userId = request.cookies.get("ab_user_id")?.value;

  if (!userId) {
    userId = crypto.randomUUID();
  }

  // 简单的 A/B 分组逻辑（基于 UUID 的哈希值，50/50 分割）
  // 将 UUID 的前 8 个字符转换为数字，然后判断奇偶性
  const hashValue = parseInt(userId.replace(/-/g, "").substring(0, 8), 16);
  const isGroupA = hashValue % 2 === 0;
  const group = isGroupA ? "A" : "B";

  console.log("hello world", userId, group);
  // 获取当前分组的统计信息（这里只是演示，实际应该使用数据库）
  const experimentInfo = {
    name: "首页布局测试xxxx",
    description: isGroupA
      ? "你被分配到 A 组 - 传统布局"
      : "你被分配到 B 组 - 新版布局",
    group,
    userId,
    features: isGroupA
      ? ["经典导航栏", "标准侧边栏", "传统颜色方案"]
      : ["现代导航栏", "动态侧边栏", "新颜色方案"],
    timestamp: new Date().toISOString(),
  };

  // 创建响应并设置 cookie
  const response = NextResponse.json(
    {
      success: true,
      experiment: experimentInfo,
      tips: {
        zh: "刷新页面时，你会保持在同一个组中（通过 cookie）",
        en: "You'll stay in the same group when refreshing (via cookie)",
      },
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );

  // 设置 cookie（30 天有效期）
  response.cookies.set("ab_user_id", userId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 天
    path: "/",
    sameSite: "lax",
  });

  response.cookies.set("ab_group", group, {
    httpOnly: false, // 允许客户端 JavaScript 读取
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
