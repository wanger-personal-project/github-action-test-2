import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { PageShell } from '@/components/ui/page-shell';

interface Author {
  id: string;
  username: string;
  display_name: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  published_at: string;
  view_count: number;
  author: Author;
  author_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: Author;
  author_id: string;
}

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const slugString = typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : '';
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);

  useEffect(() => {
    if (!slugString) return;
    const load = async () => {
      await Promise.all([fetchPost(), fetchComments(), recordView(), fetchViewCount(), fetchLikes()]);
    };
    load();
  }, [slugString]);

  useEffect(() => {
    if (slugString) fetchLikes();
  }, [slugString, user?.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${slugString}`);
      if (!response.ok) throw new Error('Post not found');
      const data = await response.json();
      setPost(data.post);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${slugString}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const recordView = async () => {
    try {
      await fetch(`/api/views/${slugString}`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to record view:', err);
    }
  };

  const fetchViewCount = async () => {
    try {
      const response = await fetch(`/api/views/${slugString}`);
      if (response.ok) {
        const data = await response.json();
        setViewCount(data.views);
      }
    } catch (err) {
      console.error('Failed to fetch views:', err);
    }
  };

  const fetchLikes = async () => {
    try {
      const query = user?.id ? `?userId=${user.id}` : '';
      const response = await fetch(`/api/likes/${slugString}${query}`);
      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likes);
        setUserLiked(data.userLiked);
      }
    } catch (err) {
      console.error('Failed to fetch likes:', err);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/blog/${slugString}`)}`);
      return;
    }
    try {
      setLikesLoading(true);
      const response = await fetch(`/api/likes/${slugString}?userId=${user.id}`, { method: 'POST' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update like');
      }
      const data = await response.json();
      setLikesCount(data.likes);
      setUserLiked(data.userLiked);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post?.id) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, content: commentText }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      setCommentText('');
      alert('Comment submitted! It will appear after the author approves it.');
      fetchComments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?') || !post?.id) return;
    try {
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id }),
      });
      if (!response.ok) throw new Error('Failed to delete post');
      router.push('/');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <Layout>
        <PageShell>
          <p className="text-muted-foreground">Loading…</p>
        </PageShell>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <PageShell>
          <p className="text-destructive">{error || 'Post not found'}</p>
        </PageShell>
      </Layout>
    );
  }

  const isAuthor = user?.id === post.author_id;

  return (
    <Layout>
      <article className="bg-white">
        {post.cover_image_url && (
          <div className="relative mb-8 h-[320px] w-full overflow-hidden rounded-b-3xl bg-muted">
            <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}
        <PageShell className="space-y-8">
          <div className="flex flex-col gap-4">
            <Badge variant="outline" className="w-fit uppercase tracking-[0.4em] text-xs">
              FlowPress Journal
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{post.author.display_name}</span>
              <span>•</span>
              <span>{formatDate(post.published_at)}</span>
              <span>•</span>
              <span>{viewCount ?? post.view_count} views</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={userLiked ? 'secondary' : 'outline'}
                onClick={toggleLike}
                disabled={likesLoading}
              >
                {userLiked ? `♥ Liked (${likesCount})` : `♡ Like (${likesCount})`}
              </Button>
              {!user && <span className="text-sm text-muted-foreground">Login to save your likes.</span>}
              {isAuthor && (
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/blog/edit/${post.slug}`}>Edit</Link>
                  </Button>
                  <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div
            className="prose max-w-none prose-headings:mb-4 prose-p:leading-relaxed prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Comments ({comments.length})</h2>
              {!user && (
                <p className="text-sm text-muted-foreground">
                  Please{' '}
                  <Link href="/auth/login" className="underline">
                    login
                  </Link>{' '}
                  to join the conversation.
                </p>
              )}
            </div>

            {user && (
              <Card className="border border-border/60">
                <CardContent className="space-y-3 p-6">
                  <p className="text-sm font-medium text-muted-foreground">Leave a reply</p>
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={5}
                      placeholder="Share your thoughts…"
                      required
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Posting…' : 'Post comment'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="border border-border/70">
                  <CardContent className="space-y-2 p-6">
                    <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground">
                      <strong className="text-foreground">{comment.author.display_name}</strong>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}

              {comments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No comments yet. Be the first to respond.
                </div>
              )}
            </div>
          </section>
        </PageShell>
      </article>
    </Layout>
  );
}
