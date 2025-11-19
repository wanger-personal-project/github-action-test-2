/**
 * 用户注册 API
 * 创建用户账号并自动创建对应的 author 记录
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient, createAdminClient } from "@/lib/supabase-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, username, displayName } = req.body;

    // 验证必填字段
    if (!email || !password || !username) {
      return res.status(400).json({
        error: "Email, password, and username are required",
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // 验证用户名格式（字母、数字、下划线，3-50字符）
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error:
          "Username must be 3-50 characters and contain only letters, numbers, and underscores",
      });
    }

    const supabase = createClient(req, res);

    // 检查用户名是否已存在
    const { data: existingAuthor } = await supabase
      .from("authors")
      .select("username")
      .eq("username", username)
      .single();

    if (existingAuthor) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // 注册用户
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      return res.status(400).json({
        error: signUpError.message || "Failed to create account",
      });
    }

    if (!authData.user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    // 使用管理员客户端创建 author 记录（绕过 RLS）
    const adminClient = createAdminClient();
    const { error: authorError } = await adminClient.from("authors").insert({
      id: authData.user.id,
      username,
      display_name: displayName || username,
      bio: null,
      avatar_url: null,
    });

    if (authorError) {
      console.error("Error creating author:", authorError);
      // 注意：用户已创建但 author 记录失败
      // 在生产环境中，可能需要事务处理或清理
      return res.status(500).json({
        error: "Account created but profile setup failed. Please contact support.",
      });
    }

    return res.status(201).json({
      message: "Account created successfully. Please check your email to verify your account.",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
