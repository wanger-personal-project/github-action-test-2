/**
 * 审核评论 API
 * 只有文章作者可以审核
 * PUT /api/comments/moderate
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient, getCurrentUser } from "@/lib/supabase-api";

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

    const { comment_id, status } = req.body;

    // 验证必填字段
    if (!comment_id || !status) {
      return res.status(400).json({
        error: "Comment ID and status are required",
      });
    }

    // 验证状态值
    const validStatuses = ["approved", "rejected", "spam"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be approved, rejected, or spam",
      });
    }

    const supabase = createClient(req, res);

    // 获取评论信息（包括关联的文章）
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select(
        `
        *,
        post:posts(id, author_id)
      `
      )
      .eq("id", comment_id)
      .single();

    if (commentError || !comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // 验证权限：只有文章作者可以审核评论
    if (comment.post.author_id !== user.id) {
      return res.status(403).json({
        error: "Forbidden: Only the post author can moderate comments",
      });
    }

    // 更新评论状态
    const { data, error } = await supabase
      .from("comments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", comment_id)
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .single();

    if (error) {
      console.error("Error moderating comment:", error);
      throw error;
    }

    return res.status(200).json({
      message: `Comment ${status} successfully`,
      comment: data,
    });
  } catch (error: any) {
    console.error("Moderate comment error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
