/**
 * 创建评论 API
 * 需要用户认证
 * POST /api/comments/create
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

    const { post_id, content, parent_comment_id } = req.body;

    // 验证必填字段
    if (!post_id || !content) {
      return res.status(400).json({
        error: "Post ID and content are required",
      });
    }

    // 验证内容长度
    if (content.length < 1 || content.length > 5000) {
      return res.status(400).json({
        error: "Comment must be between 1 and 5000 characters",
      });
    }

    const supabase = createClient(req, res);

    // 验证文章是否存在
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, status")
      .eq("id", post_id)
      .single();

    if (postError || !post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 只能在已发布的文章下评论
    if (post.status !== "published") {
      return res.status(403).json({
        error: "Cannot comment on unpublished posts",
      });
    }

    // 如果是回复评论，验证父评论是否存在
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from("comments")
        .select("id, post_id")
        .eq("id", parent_comment_id)
        .single();

      if (parentError || !parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }

      if (parentComment.post_id !== post_id) {
        return res.status(400).json({
          error: "Parent comment does not belong to this post",
        });
      }
    }

    // 创建评论
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id,
        author_id: user.id,
        content,
        parent_comment_id: parent_comment_id || null,
        status: "pending", // 默认待审核
      })
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      throw error;
    }

    return res.status(201).json({
      message:
        "Comment submitted successfully and is awaiting approval from the post author",
      comment: data,
    });
  } catch (error: any) {
    console.error("Create comment error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
