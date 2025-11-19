import { NextApiRequest, NextApiResponse } from "next";
import { createClient, getCurrentUser } from "@/lib/supabase-api";

/**
 * 获取作者自己的文章（草稿/已发布/归档）
 */
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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { slug } = req.query;
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Slug is required" });
    }

    const supabase = createClient(req, res);
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:authors(*)
      `
      )
      .eq("slug", slug)
      .eq("author_id", user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json({ post: data });
  } catch (error: any) {
    console.error("Author post fetch error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
