/**
 * 更新文章 API
 * 需要用户认证和权限验证
 * PUT /api/posts/update
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient, getCurrentUser, checkPermission } from "@/lib/supabase-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 验证用户登录
    const user = await getCurrentUser(req, res);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id, title, slug, content, excerpt, cover_image_url, status } =
      req.body;

    // 验证必填字段
    if (!id) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    // 验证权限（只有作者可以更新）
    const hasPermission = await checkPermission(req, res, "post", id);
    if (!hasPermission) {
      return res.status(403).json({
        error: "Forbidden: You can only update your own posts",
      });
    }

    const supabase = createClient(req, res);

    // 构建更新对象（只更新提供的字段）
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (title) updates.title = title;
    if (slug) {
      // 验证 slug 格式
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({
          error:
            "Slug must contain only lowercase letters, numbers, and hyphens",
        });
      }

      // 检查新 slug 是否与其他文章冲突
      const { data: existingPost } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (existingPost) {
        return res.status(409).json({ error: "Slug already exists" });
      }

      updates.slug = slug;
    }
    if (content) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;

    // 处理状态更新
    if (status) {
      const validStatuses = ["draft", "published", "archived"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status. Must be draft, published, or archived",
        });
      }
      updates.status = status;

      // 如果从草稿发布，设置发布时间
      const { data: currentPost } = await supabase
        .from("posts")
        .select("status, published_at")
        .eq("id", id)
        .single();

      if (
        status === "published" &&
        currentPost?.status === "draft" &&
        !currentPost?.published_at
      ) {
        updates.published_at = new Date().toISOString();
      }
    }

    // 更新文章
    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .single();

    if (error) {
      console.error("Error updating post:", error);
      throw error;
    }

    return res.status(200).json({
      message: "Post updated successfully",
      post: data,
    });
  } catch (error: any) {
    console.error("Update post error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
