import { NextRequest, NextResponse } from "next/server";
import { redis, RedisKeys } from "@/lib/redis";

export const config = {
  runtime: "edge",
};

interface ViewsResponse {
  slug: string;
  views: number;
  message?: string;
}

/**
 * 文章浏览统计边缘函数 - 使用 Upstash Redis
 * GET  /api/views/[slug] - 获取浏览次数
 * POST /api/views/[slug] - 增加浏览次数
 *
 * 示例 1：读操作 (GET)
 * - 从 Redis 读取指定文章的浏览次数
 * - 如果文章从未被浏览，返回 0
 * - 添加缓存策略优化性能
 */
export default async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const slug = pathParts[pathParts.length - 1];

  if (!slug) {
    return NextResponse.json(
      { error: "Slug is required" },
      { status: 400 }
    );
  }

  const method = request.method;
  const redisKey = RedisKeys.views(slug);

  try {
    // GET - 获取浏览次数（读操作示例）
    if (method === "GET") {
      // 从 Redis 读取浏览次数
      const views = (await redis.get<number>(redisKey)) || 0;

      const response: ViewsResponse = {
        slug,
        views,
        message:
          views === 0
            ? "这篇文章还没有被浏览过"
            : `这篇文章已被浏览 ${views} 次`,
      };

      return NextResponse.json(response, {
        headers: {
          // 缓存 60 秒，减少 Redis 读取次数
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      });
    }

    // POST - 增加浏览次数（写操作示例）
    if (method === "POST") {
      // 使用 INCR 命令原子性地增加计数
      // 优势：线程安全，避免并发问题
      const newViews = await redis.incr(redisKey);

      const response: ViewsResponse = {
        slug,
        views: newViews,
        message: `浏览次数已更新为 ${newViews}`,
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache",
        },
      });
    }

    // 不支持的方法
    return NextResponse.json(
      { error: `Method ${method} not allowed` },
      {
        status: 405,
        headers: {
          Allow: "GET, POST",
        },
      }
    );
  } catch (error) {
    console.error(`Redis operation failed for ${slug}:`, error);

    // 降级策略：返回错误但不影响用户体验
    return NextResponse.json(
      {
        error: "Failed to access view counter",
        slug,
        views: 0,
        message: "暂时无法获取浏览次数",
      },
      { status: 500 }
    );
  }
}
