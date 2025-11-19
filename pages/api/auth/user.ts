/**
 * 获取当前用户信息 API
 * 返回当前登录用户的信息和 author 信息
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient, getCurrentUser } from "@/lib/supabase-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await getCurrentUser(req, res);

    if (!user) {
      return res.status(401).json({
        error: "Not authenticated",
        user: null,
      });
    }

    const supabase = createClient(req, res);

    // 获取 author 信息
    const { data: author, error: authorError } = await supabase
      .from("authors")
      .select("id, username, display_name, bio, avatar_url, created_at")
      .eq("id", user.id)
      .single();

    if (authorError) {
      console.error("Error fetching author:", authorError);
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        author: author || null,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
