import { createClient } from "@supabase/supabase-js";

/**
 * Supabase 客户端配置
 * 用于博客系统的数据库操作
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * TypeScript 类型定义
 * 基于 blog_schema.sql 中的数据库设计
 */

export interface Author {
  id: string; // UUID，引用 auth.users.id
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string; // UUID
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author: Author;
}

export interface Comment {
  id: string; // UUID
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  content: string;
  status: "pending" | "approved" | "rejected" | "spam";
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: Author;
}

/**
 * API 响应类型
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 数据库操作辅助函数
 */

/**
 * 获取已发布的文章列表
 */
export async function getPublishedPosts(
  limit: number = 10,
  offset: number = 0
): Promise<PostWithAuthor[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:authors(*)
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data as PostWithAuthor[];
}

/**
 * 根据 slug 获取文章详情
 */
export async function getPostBySlug(
  slug: string
): Promise<PostWithAuthor | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:authors(*)
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return data as PostWithAuthor;
}

/**
 * 获取文章的评论列表
 */
export async function getPostComments(
  postId: string
): Promise<CommentWithAuthor[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      author:authors(*)
    `
    )
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data as CommentWithAuthor[];
}

/**
 * 创建文章
 * 需要用户认证
 */
export async function createPost(post: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  status?: "draft" | "published";
}): Promise<Post | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...post,
      author_id: user.id,
      status: post.status || "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return null;
  }

  return data as Post;
}

/**
 * 更新文章
 * 仅文章作者可以更新
 */
export async function updatePost(
  postId: string,
  updates: Partial<Post>
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    console.error("Error updating post:", error);
    return null;
  }

  return data as Post;
}

/**
 * 发布文章
 */
export async function publishPost(postId: string): Promise<Post | null> {
  return updatePost(postId, {
    status: "published",
    published_at: new Date().toISOString(),
  });
}

/**
 * 创建评论
 * 需要用户认证
 */
export async function createComment(comment: {
  post_id: string;
  content: string;
  parent_comment_id?: string;
}): Promise<Comment | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      ...comment,
      author_id: user.id,
      status: "pending", // 默认待审核
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    return null;
  }

  return data as Comment;
}

/**
 * 审核评论
 * 仅文章作者可以审核
 */
export async function moderateComment(
  commentId: string,
  status: "approved" | "rejected" | "spam"
): Promise<Comment | null> {
  const { data, error } = await supabase
    .from("comments")
    .update({ status })
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    console.error("Error moderating comment:", error);
    return null;
  }

  return data as Comment;
}

/**
 * 增加文章浏览量
 * 使用 Supabase 函数（SECURITY DEFINER），可被匿名用户调用
 */
export async function incrementPostViewCount(slug: string): Promise<void> {
  const { error } = await supabase.rpc("increment_post_view_count", {
    post_slug: slug,
  });

  if (error) {
    console.error("Error incrementing view count:", error);
  }
}

export default supabase;
