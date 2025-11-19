/**
 * 测试 Supabase 连接的 API
 * 用于验证数据库配置是否正确
 */

import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 测试数据库连接 - 尝试查询 authors 表
    const { data: authors, error: authorsError } = await supabase
      .from("authors")
      .select("id, username")
      .limit(1);

    if (authorsError) {
      throw authorsError;
    }

    // 测试 posts 表
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, title, status")
      .limit(1);

    if (postsError) {
      throw postsError;
    }

    // 测试 comments 表
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("id, content, status")
      .limit(1);

    if (commentsError) {
      throw commentsError;
    }

    return res.status(200).json({
      success: true,
      message: "Supabase connection successful",
      tables: {
        authors: { connected: true, count: authors?.length || 0 },
        posts: { connected: true, count: posts?.length || 0 },
        comments: { connected: true, count: comments?.length || 0 },
      },
    });
  } catch (error: any) {
    console.error("Supabase connection error:", error);
    return res.status(500).json({
      success: false,
      message: "Supabase connection failed",
      error: error.message || "Unknown error",
    });
  }
}
