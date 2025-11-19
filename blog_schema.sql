-- ================================
-- 博客系统数据库表结构设计（修正版）
-- 适用于 Supabase
-- ================================

-- ================================
-- 1. 作者表 (authors)
-- ================================
-- 重要：id 直接引用 auth.users(id)，确保 RLS 策略能正确工作
CREATE TABLE authors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 为作者表创建索引
CREATE INDEX idx_authors_username ON authors(username);

COMMENT ON TABLE authors IS '作者信息表，id 与 Supabase Auth 用户 ID 一致';
COMMENT ON COLUMN authors.id IS '用户 ID，引用 auth.users.id';

-- ================================
-- 2. 文章表 (posts)
-- ================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 为文章表创建索引
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);

-- 部分索引：仅为已发布文章建立索引，提高查询性能
CREATE INDEX idx_posts_published_at_desc
  ON posts (published_at DESC)
  WHERE status = 'published';

COMMENT ON TABLE posts IS '文章表';
COMMENT ON COLUMN posts.slug IS 'URL 友好的唯一标识符';
COMMENT ON COLUMN posts.status IS '文章状态：draft=草稿，published=已发布，archived=已归档';

-- ================================
-- 3. 评论表 (comments)
-- ================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 为评论表创建索引
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_status ON comments(status);

COMMENT ON TABLE comments IS '评论表，支持嵌套回复';
COMMENT ON COLUMN comments.parent_comment_id IS '父评论 ID，为空表示顶级评论';
COMMENT ON COLUMN comments.status IS '评论状态：pending=待审核，approved=已批准，rejected=已拒绝，spam=垃圾';

-- ================================
-- 自动更新 updated_at 字段的触发器
-- ================================

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为作者表添加触发器
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为文章表添加触发器
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为评论表添加触发器
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Row Level Security (RLS) 策略
-- ================================

-- 启用 RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ================================
-- 作者表 RLS 策略
-- ================================

-- 所有人可以查看作者信息
CREATE POLICY "Anyone can view authors" ON authors
  FOR SELECT
  USING (true);

-- 用户可以创建自己的作者信息（注册时）
CREATE POLICY "Users can insert own author profile" ON authors
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 只有作者本人可以更新自己的信息
CREATE POLICY "Authors can update own profile" ON authors
  FOR UPDATE
  USING (auth.uid() = id);

-- ================================
-- 文章表 RLS 策略
-- ================================

-- 所有人可以查看已发布的文章
CREATE POLICY "Anyone can view published posts" ON posts
  FOR SELECT
  USING (status = 'published');

-- 作者可以查看自己的所有文章（包括草稿）
CREATE POLICY "Authors can view own posts" ON posts
  FOR SELECT
  USING (auth.uid() = author_id);

-- 已认证用户可以插入文章（必须是自己的）
CREATE POLICY "Authors can insert own posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 作者可以更新自己的文章
CREATE POLICY "Authors can update own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = author_id);

-- 作者可以删除自己的文章
CREATE POLICY "Authors can delete own posts" ON posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- ================================
-- 评论表 RLS 策略
-- ================================

-- 所有人可以查看已批准的评论
CREATE POLICY "Anyone can view approved comments" ON comments
  FOR SELECT
  USING (status = 'approved');

-- 评论作者可以查看自己的所有评论（包括待审核的）
CREATE POLICY "Comment authors can view own comments" ON comments
  FOR SELECT
  USING (auth.uid() = author_id);

-- 文章作者可以查看自己文章下的所有评论（用于审核）
CREATE POLICY "Post authors can view all comments on own posts" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- 已认证用户可以插入评论
CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 评论作者可以更新自己的评论（建议前端只允许修改 content）
CREATE POLICY "Comment authors can update own comments" ON comments
  FOR UPDATE
  USING (auth.uid() = author_id);

-- 评论作者可以删除自己的评论
CREATE POLICY "Comment authors can delete own comments" ON comments
  FOR DELETE
  USING (auth.uid() = author_id);

-- 文章作者可以更新自己文章下的评论状态（用于审核）
CREATE POLICY "Post authors can moderate comments" ON comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- ================================
-- 辅助函数：安全增加浏览量
-- ================================

-- 创建一个函数用于增加文章浏览量，绕过 RLS
CREATE OR REPLACE FUNCTION increment_post_view_count(post_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- 使用定义者权限执行，可以绕过 RLS
AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE slug = post_slug AND status = 'published';
END;
$$;

COMMENT ON FUNCTION increment_post_view_count IS '安全地增加文章浏览量，可被匿名用户调用';

-- ================================
-- 示例数据插入说明
-- ================================

-- 注意：在 Supabase 中，authors 表的数据通常通过以下方式创建：
-- 1. 用户通过 Supabase Auth 注册
-- 2. 注册成功后，前端调用 INSERT 创建 authors 记录
-- 3. 或者使用 Database Trigger 在 auth.users 插入后自动创建

-- 示例：用户注册后创建 author 记录（在客户端执行）
-- INSERT INTO authors (id, username, display_name, bio)
-- VALUES (
--   auth.uid(),  -- 当前登录用户的 ID
--   'john_doe',
--   'John Doe',
--   '全栈开发者，热爱技术分享'
-- );

-- 示例：插入文章（需要先登录）
-- INSERT INTO posts (author_id, title, slug, content, excerpt, status, published_at)
-- VALUES (
--   auth.uid(),  -- 当前登录用户的 ID
--   'Supabase 入门指南',
--   'supabase-getting-started',
--   '这是一篇关于 Supabase 的入门教程...',
--   '学习如何使用 Supabase 构建应用',
--   'published',
--   now()
-- );

-- 示例：插入评论（需要先登录）
-- INSERT INTO comments (post_id, author_id, content)
-- VALUES (
--   (SELECT id FROM posts WHERE slug = 'supabase-getting-started'),
--   auth.uid(),  -- 当前登录用户的 ID
--   '非常实用的教程，感谢分享！'
-- );

-- 示例：增加文章浏览量（可以匿名调用）
-- SELECT increment_post_view_count('supabase-getting-started');

-- ================================
-- 可选：自动创建 author 记录的触发器
-- ================================

-- 当新用户注册时，自动在 authors 表中创建记录
-- 注意：这需要在 auth.users 表上创建触发器，通常在 Supabase Dashboard 的 SQL Editor 中执行

-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   INSERT INTO public.authors (id, username, display_name)
--   VALUES (
--     NEW.id,
--     COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
--     COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
--   );
--   RETURN NEW;
-- END;
-- $$;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();
