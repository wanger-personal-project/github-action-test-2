import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

// 简单的内存存储（仅用于演示，生产环境应使用 Vercel KV 或数据库）
// 注意：Edge Functions 的每个实例有独立的内存，所以这只是演示用途
const viewsStore = new Map<string, number>();

interface ViewsResponse {
  slug: string;
  views: number;
  message?: string;
}

/**
 * 文章浏览统计边缘函数
 * GET  /api/views/[slug] - 获取浏览次数
 * POST /api/views/[slug] - 增加浏览次数
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

  // GET - 获取浏览次数
  if (method === "GET") {
    const views = viewsStore.get(slug) || 0;

    const response: ViewsResponse = {
      slug,
      views,
      message: views === 0
        ? "这篇文章还没有被浏览过"
        : `这篇文章已被浏览 ${views} 次`,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  }

  // POST - 增加浏览次数
  if (method === "POST") {
    const currentViews = viewsStore.get(slug) || 0;
    const newViews = currentViews + 1;
    viewsStore.set(slug, newViews);

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
}
