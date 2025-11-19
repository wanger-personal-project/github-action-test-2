/**
 * 删除文章 API
 * 需要用户认证和权限验证
 * DELETE /api/posts/delete
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient, getCurrentUser, checkPermission } from "@/lib/supabase-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 验证用户登录
    const user = await getCurrentUser(req, res);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.body;

    // 验证必填字段
    if (!id) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    // 验证权限（只有作者可以删除）
    const hasPermission = await checkPermission(req, res, "post", id);
    if (!hasPermission) {
      return res.status(403).json({
        error: "Forbidden: You can only delete your own posts",
      });
    }

    const supabase = createClient(req, res);

    // 删除文章（CASCADE 会自动删除相关评论）
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      throw error;
    }

    return res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete post error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
