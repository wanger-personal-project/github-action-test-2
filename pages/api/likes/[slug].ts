import { NextRequest, NextResponse } from "next/server";
import { redis, RedisKeys } from "@/lib/redis";

export const config = {
  runtime: "edge",
};

interface LikesResponse {
  slug: string;
  likes: number;
  userLiked: boolean;
  message?: string;
}

/**
 * 文章点赞功能边缘函数 - 使用 Upstash Redis
 * GET  /api/likes/[slug]?userId=xxx - 获取点赞数和用户点赞状态
 * POST /api/likes/[slug]?userId=xxx - 切换点赞状态（点赞/取消）
 *
 * 示例 2：复杂读写操作
 * - 使用 Redis Set 存储点赞用户列表（防止重复）
 * - 使用 Redis 计数器存储点赞总数
 * - 支持点赞/取消点赞的切换
 * - 使用 Pipeline 优化多个 Redis 命令的执行
 */
export default async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const slug = pathParts[pathParts.length - 1];

  // 从查询参数获取用户 ID（实际应用中应从认证 token 获取）
  const userId = url.searchParams.get("userId");

  if (!slug) {
    return NextResponse.json(
      { error: "Slug is required" },
      { status: 400 }
    );
  }

  const method = request.method;
  const likesCountKey = RedisKeys.likes(slug); // 点赞计数：likes:slug
  const likesUsersKey = RedisKeys.likesUsers(slug); // 点赞用户集合：likes_users:slug

  try {
    // GET - 获取点赞数和用户点赞状态（读操作示例）
    if (method === "GET") {
      // 使用 Pipeline 批量执行多个命令，提高性能
      const pipeline = redis.pipeline();

      // 1. 获取点赞总数
      pipeline.get<number>(likesCountKey);

      // 2. 如果提供了 userId，检查用户是否已点赞
      if (userId) {
        pipeline.sismember(likesUsersKey, userId);
      }

      const results = await pipeline.exec();

      // 解析结果
      const likesCount = (results[0] as number) || 0;
      const userLiked = userId ? !!(results[1] as number) : false;

      const response: LikesResponse = {
        slug,
        likes: likesCount,
        userLiked,
        message: userLiked
          ? `你已点赞，当前共 ${likesCount} 人点赞`
          : `当前共 ${likesCount} 人点赞`,
      };

      return NextResponse.json(response, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      });
    }

    // POST - 切换点赞状态（写操作示例）
    if (method === "POST") {
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required for POST request" },
          { status: 400 }
        );
      }

      // 先检查用户是否已点赞
      const alreadyLiked = await redis.sismember(likesUsersKey, userId);

      let newLikesCount: number;
      let userLiked: boolean;

      if (alreadyLiked) {
        // 取消点赞：从集合中移除用户，减少计数
        const pipeline = redis.pipeline();
        pipeline.srem(likesUsersKey, userId); // 从集合中移除
        pipeline.decr(likesCountKey); // 减少计数
        const results = await pipeline.exec();

        newLikesCount = Math.max((results[1] as number) || 0, 0); // 确保不为负数
        userLiked = false;
      } else {
        // 点赞：添加用户到集合，增加计数
        const pipeline = redis.pipeline();
        pipeline.sadd(likesUsersKey, userId); // 添加到集合
        pipeline.incr(likesCountKey); // 增加计数
        const results = await pipeline.exec();

        newLikesCount = (results[1] as number) || 1;
        userLiked = true;
      }

      const response: LikesResponse = {
        slug,
        likes: newLikesCount,
        userLiked,
        message: userLiked
          ? `点赞成功！当前共 ${newLikesCount} 人点赞`
          : `已取消点赞，当前共 ${newLikesCount} 人点赞`,
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

    // 降级策略
    return NextResponse.json(
      {
        error: "Failed to access likes counter",
        slug,
        likes: 0,
        userLiked: false,
        message: "暂时无法获取点赞信息",
      },
      { status: 500 }
    );
  }
}
