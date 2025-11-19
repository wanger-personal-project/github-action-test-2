import { NextApiRequest, NextApiResponse } from "next";
import { createClient, getCurrentUser } from "@/lib/supabase-api";

const DEFAULT_LIMIT = 10;

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

    const {
      page = "1",
      limit = String(DEFAULT_LIMIT),
      status = "pending",
      postSlug,
    } = req.query;

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(
      Math.max(parseInt(limit as string, 10) || DEFAULT_LIMIT, 1),
      50
    );
    const offset = (pageNum - 1) * limitNum;

    const supabase = createClient(req, res);

    let query = supabase
      .from("comments")
      .select(
        `
        *,
        author:authors(*),
        post:posts!inner(id, title, slug, author_id)
      `,
        { count: "exact" }
      )
      .eq("post.author_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (typeof status === "string" && status !== "all") {
      query = query.eq("status", status);
    }

    if (typeof postSlug === "string" && postSlug.trim().length > 0) {
      query = query.eq("post.slug", postSlug.trim());
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      comments: data || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error("Author comments fetch error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
