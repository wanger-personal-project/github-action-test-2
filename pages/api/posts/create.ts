/**
 * 创建文章 API
 * 需要用户认证
 * POST /api/posts/create
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient, getCurrentUser } from "@/lib/supabase-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 验证用户登录
    const user = await getCurrentUser(req, res);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, slug, content, excerpt, cover_image_url, status } =
      req.body;

    // 验证必填字段
    if (!title || !slug || !content) {
      return res.status(400).json({
        error: "Title, slug, and content are required",
      });
    }

    // 验证 slug 格式（URL友好：小写字母、数字、连字符）
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        error:
          "Slug must contain only lowercase letters, numbers, and hyphens",
      });
    }

    // 验证 status
    const validStatuses = ["draft", "published", "archived"];
    const postStatus = status || "draft";
    if (!validStatuses.includes(postStatus)) {
      return res.status(400).json({
        error: "Invalid status. Must be draft, published, or archived",
      });
    }

    const supabase = createClient(req, res);

    // 检查 slug 是否已存在
    const { data: existingPost } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingPost) {
      return res.status(409).json({ error: "Slug already exists" });
    }

    // 创建文章
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title,
        slug,
        content,
        excerpt: excerpt || null,
        cover_image_url: cover_image_url || null,
        status: postStatus,
        published_at:
          postStatus === "published" ? new Date().toISOString() : null,
      })
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .single();

    if (error) {
      console.error("Error creating post:", error);
      throw error;
    }

    return res.status(201).json({
      message: "Post created successfully",
      post: data,
    });
  } catch (error: any) {
    console.error("Create post error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
