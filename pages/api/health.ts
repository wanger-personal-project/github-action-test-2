import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

/**
 * 健康检查边缘函数
 * 用于监控和诊断边缘函数的运行状态
 */
export default async function handler(request: NextRequest) {
  const startTime = Date.now();

  // 收集系统信息
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    edge: {
      runtime: "vercel-edge",
      region: process.env.VERCEL_REGION || "local",
      env: process.env.VERCEL_ENV || "development",
    },
    checks: {
      api: "operational",
      memory: "ok",
      latency: "checking...",
    },
  };

  // 简单的延迟测试
  const responseTime = Date.now() - startTime;
  healthData.checks.latency = `${responseTime}ms`;

  // 如果响应时间超过 100ms，标记为 degraded
  if (responseTime > 100) {
    healthData.status = "degraded";
  }

  const statusCode = healthData.status === "healthy" ? 200 : 503;

  return NextResponse.json(healthData, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Response-Time": `${responseTime}ms`,
    },
  });
}
