/**
 * 获取文章评论列表 API
 * GET /api/comments/[postSlug]
 */

import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { postSlug } = req.query;

    if (!postSlug || typeof postSlug !== "string") {
      return res.status(400).json({ error: "Post slug is required" });
    }

    // 先获取文章 ID
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", postSlug)
      .single();

    if (postError || !post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 获取已批准的评论
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .eq("post_id", post.id)
      .eq("status", "approved")
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      throw commentsError;
    }

    return res.status(200).json({
      comments: comments || [],
      total: comments?.length || 0,
    });
  } catch (error: any) {
    console.error("Get comments error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
