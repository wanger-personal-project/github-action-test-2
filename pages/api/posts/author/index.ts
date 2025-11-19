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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page = "1", limit = "10", status = "all" } = req.query;
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 10, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const supabase = createClient(req, res);

    let query = supabase
      .from("posts")
      .select(
        `
        *,
        author:authors(*)
      `,
        { count: "exact" }
      )
      .eq("author_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (typeof status === "string" && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      posts: data || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error("Author posts list error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
