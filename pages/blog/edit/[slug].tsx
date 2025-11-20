import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell } from '@/components/ui/page-shell';


interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  status: string;
  author_id: string;
}

export default function EditPost() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { slug } = router.query;
  const slugString = typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : '';

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slugString && user) {
      fetchPost();
    }
  }, [slugString, user]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/author/${slugString}`);
      if (!response.ok) throw new Error('Post not found');

      const data = await response.json();
      const postData = data.post;
      setPost(postData);
      setTitle(postData.title);
      setNewSlug(postData.slug);
      setContent(postData.content);
      setExcerpt(postData.excerpt || '');
      setCoverImageUrl(postData.cover_image_url || '');
      setStatus(postData.status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!post) {
      setError('Post not loaded yet');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/posts/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: post?.id,
          title,
          slug: newSlug,
          content,
          excerpt: excerpt || null,
          cover_image_url: coverImageUrl || null,
          status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update post');
      }

      const data = await response.json();
      if (data.post.status === 'published') {
        router.push(`/blog/${data.post.slug}`);
      } else {
        // 仍是草稿，留在编辑页并刷新内容
        setPost(data.post);
        setStatus(data.post.status);
        setNewSlug(data.post.slug);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <PageShell>
          <p className="text-muted-foreground">Loading...</p>
        </PageShell>
      </Layout>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (error || !post) {
    return (
      <Layout>
        <PageShell>
          <div className="rounded-xl border border-destructive/30 bg-red-50 px-4 py-3 text-sm text-destructive">
            {error || 'Post not found'}
          </div>
        </PageShell>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageShell className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Edit mode</p>
          <h1 className="text-3xl font-semibold tracking-tight">Refine your story</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Update content, change cover art, or adjust publishing state. All changes save instantly on publish.
          </p>
        </div>
        <Card className="border border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Article metadata</CardTitle>
            <CardDescription>Keep the core details accurate so your readers can discover it.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl border border-destructive/40 bg-red-50 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium text-muted-foreground">
                  Title
                </label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="slug" className="text-sm font-medium text-muted-foreground">
                  Slug
                </label>
                <Input
                  id="slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only.</p>
              </div>
              <div className="grid gap-2">
                <label htmlFor="excerpt" className="text-sm font-medium text-muted-foreground">
                  Excerpt
                </label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="coverImage" className="text-sm font-medium text-muted-foreground">
                  Cover image URL
                </label>
                <Input
                  id="coverImage"
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium text-muted-foreground">
                  Body
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="font-mono"
                  required
                />
              </div>
              <div className="grid gap-3">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex flex-wrap gap-3">
                  {['draft', 'published', 'archived'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatus(option as typeof status)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                        status === option
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {option === 'draft'
                        ? 'Draft'
                        : option === 'published'
                        ? 'Published'
                        : 'Archived'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving changes...' : 'Update post'}
                </Button>
                <Button variant="secondary" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </PageShell>
    </Layout>
  );
}
