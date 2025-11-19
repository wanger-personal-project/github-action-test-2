import { NextRequest, NextResponse } from "next/server";

// 声明为 Edge Runtime
export const config = {
  runtime: "edge",
};

/**
 * 访客信息边缘函数
 * 展示 Vercel Edge Functions 获取地理位置和请求信息的能力
 */
export default async function handler(request: NextRequest) {
  // 获取地理位置信息（Vercel 自动提供）
  const geo = {
    country: request.geo?.country || "Unknown",
    city: request.geo?.city || "Unknown",
    region: request.geo?.region || "Unknown",
    latitude: request.geo?.latitude || "Unknown",
    longitude: request.geo?.longitude || "Unknown",
  };

  // 获取请求信息
  const ip = request.ip || "Unknown";
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const referer = request.headers.get("referer") || "Direct";

  // 获取运行时信息
  const edgeInfo = {
    runtime: "edge",
    region: process.env.VERCEL_REGION || "local",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(
    {
      message: "Hello from Edge Functions! 🚀",
      visitor: {
        ip,
        userAgent,
        referer,
      },
      location: geo,
      edge: edgeInfo,
      tips: {
        zh: "这个 API 运行在全球边缘节点上，响应速度超快！",
        en: "This API runs on global edge nodes with ultra-low latency!",
      },
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Edge-Runtime": "vercel-edge",
      },
    }
  );
}
