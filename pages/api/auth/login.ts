/**
 * 用户登录 API
 * 使用邮箱和密码登录
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
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const supabase = createClient(req, res);

    // 登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    if (!data.user) {
      return res.status(500).json({ error: "Login failed" });
    }

    // 获取 author 信息
    const { data: author } = await supabase
      .from("authors")
      .select("id, username, display_name, bio, avatar_url")
      .eq("id", data.user.id)
      .single();

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email,
        author,
      },
      session: {
        access_token: data.session?.access_token,
        expires_at: data.session?.expires_at,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
