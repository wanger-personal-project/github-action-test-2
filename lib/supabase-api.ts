/**
 * Supabase 服务端客户端（用于 Pages Router API Routes）
 * 基于 @supabase/ssr 的 Pages Router 适配
 */

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * 为 Pages Router API Routes 创建 Supabase 客户端
 * 使用 req/res 对象处理 cookies
 */
export function createClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: any) {
          res.setHeader("Set-Cookie", `${name}=${value}; Path=/; ${options.httpOnly ? "HttpOnly;" : ""} ${options.secure ? "Secure;" : ""} SameSite=Lax`);
        },
        remove(name: string, options: any) {
          res.setHeader("Set-Cookie", `${name}=; Path=/; Max-Age=0`);
        },
      },
    }
  );
}

/**
 * 获取当前认证用户（API Routes 版本）
 */
export async function getCurrentUser(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(req, res);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

/**
 * 验证用户是否已登录（API Routes 版本）
 */
export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const user = await getCurrentUser(req, res);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * 检查用户是否有权限访问某个资源（API Routes 版本）
 */
export async function checkPermission(
  req: NextApiRequest,
  res: NextApiResponse,
  resourceType: "post" | "comment",
  resourceId: string
): Promise<boolean> {
  const user = await getCurrentUser(req, res);

  if (!user) return false;

  const supabase = createClient(req, res);

  if (resourceType === "post") {
    const { data } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", resourceId)
      .single();

    return data?.author_id === user.id;
  }

  if (resourceType === "comment") {
    const { data } = await supabase
      .from("comments")
      .select("author_id")
      .eq("id", resourceId)
      .single();

    return data?.author_id === user.id;
  }

  return false;
}

/**
 * 创建管理员客户端（使用 Service Role Key，绕过 RLS）
 * ⚠️ 仅在服务端使用，不要暴露给客户端
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
