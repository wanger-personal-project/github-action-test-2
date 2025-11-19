/**
 * 获取文章列表 API
 * 支持分页和筛选
 * GET /api/posts?page=1&limit=10&status=published
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
    const {
      page = "1",
      limit = "10",
      status = "published",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 验证参数
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: "Invalid pagination parameters",
      });
    }

    // 构建查询
    let query = supabase
      .from("posts")
      .select(
        `
        *,
        author:authors(*)
      `,
        { count: "exact" }
      )
      .eq("status", status)
      .order("published_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    // Handle Supabase errors
    if (error) {
      // Log the error for debugging
      console.error("Supabase query error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });

      // For malformed errors (like paginating beyond data), return empty results
      // This is a known edge case in Supabase JS when using joins with .range()
      if (!error.code || error.message === '{"') {
        console.warn("Supabase returned malformed error, treating as empty result");
        return res.status(200).json({
          posts: [],
          pagination: {
            total: 0,
            page: pageNum,
            limit: limitNum,
            totalPages: 0,
          },
        });
      }

      // For real database errors, throw
      throw error;
    }

    return res.status(200).json({
      posts: data || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get posts error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      stack: error.stack,
      fullError: JSON.stringify(error, null, 2)
    });
    return res.status(500).json({
      error: "Internal server error",
      details: error.message || String(error),
      code: error.code || undefined
    });
  }
}
