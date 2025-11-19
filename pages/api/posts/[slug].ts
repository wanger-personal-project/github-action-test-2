/**
 * 获取单篇文章详情 API
 * 自动增加浏览量
 * GET /api/posts/[slug]
 */

import { NextApiRequest, NextApiResponse } from "next";
import { supabase, incrementPostViewCount } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Slug is required" });
    }

    // 获取文章详情
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 异步增加浏览量（不等待结果，避免阻塞响应）
    incrementPostViewCount(slug).catch((err) =>
      console.error("Failed to increment view count:", err)
    );

    return res.status(200).json({ post: data });
  } catch (error: any) {
    console.error("Get post error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
