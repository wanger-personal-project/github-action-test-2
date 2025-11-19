/**
 * 用户登出 API
 * 清除用户 session
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient(req, res);

    // 登出
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        error: "Failed to logout",
      });
    }

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
