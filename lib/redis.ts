import { Redis } from "@upstash/redis";

/**
 * Upstash Redis 客户端
 * 使用环境变量自动初始化
 */
export const redis = Redis.fromEnv();

/**
 * Redis 键命名辅助函数
 * 统一管理键名，避免冲突
 */
export const RedisKeys = {
  // 文章浏览次数：views:文章slug
  views: (slug: string) => `views:${slug}`,

  // 文章点赞数：likes:文章slug
  likes: (slug: string) => `likes:${slug}`,

  // 点赞用户集合：likes_users:文章slug
  likesUsers: (slug: string) => `likes_users:${slug}`,

  // 通用计数器
  counter: (name: string) => `counter:${name}`,
} as const;

/**
 * Redis 操作辅助函数
 */
export const RedisHelpers = {
  /**
   * 安全地增加计数（带错误处理）
   */
  async safeIncr(key: string): Promise<number | null> {
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error(`Redis INCR failed for key ${key}:`, error);
      return null;
    }
  },

  /**
   * 安全地减少计数（带错误处理）
   */
  async safeDecr(key: string): Promise<number | null> {
    try {
      return await redis.decr(key);
    } catch (error) {
      console.error(`Redis DECR failed for key ${key}:`, error);
      return null;
    }
  },

  /**
   * 安全地获取值（带错误处理）
   */
  async safeGet<T = string>(key: string): Promise<T | null> {
    try {
      return await redis.get<T>(key);
    } catch (error) {
      console.error(`Redis GET failed for key ${key}:`, error);
      return null;
    }
  },

  /**
   * 安全地设置值（带错误处理）
   */
  async safeSet(key: string, value: any, expirySeconds?: number): Promise<boolean> {
    try {
      if (expirySeconds) {
        await redis.setex(key, expirySeconds, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET failed for key ${key}:`, error);
      return false;
    }
  },
};

export default redis;
