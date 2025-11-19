/**
 * Supabase 服务端客户端（使用 @supabase/ssr）
 * 用于服务端渲染和 API 路由中的认证
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 创建服务端 Supabase 客户端
 * 用于 App Router 的 Server Components 和 API Routes
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 在某些服务端上下文中设置 cookie 可能失败
            // 可以安全忽略此错误
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // 可以安全忽略
          }
        },
      },
    }
  );
}

/**
 * 获取当前认证用户
 * 用于服务端组件
 */
export async function getCurrentUser() {
  const supabase = createClient();

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
 * 验证用户是否已登录
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * 检查用户是否有权限访问某个资源
 */
export async function checkPermission(
  resourceType: "post" | "comment",
  resourceId: string
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) return false;

  const supabase = createClient();

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
