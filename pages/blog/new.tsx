import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell } from '@/components/ui/page-shell';
import { Badge } from '@/components/ui/badge';

export default function NewPost() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!slug.match(/^[a-z0-9-]+$/)) {
      setError('Slug must contain only lowercase letters, numbers, and hyphens');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt: excerpt || null,
          cover_image_url: coverImageUrl || null,
          status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      const data = await response.json();
      if (data.post.status === 'published') {
        router.push(`/blog/${data.post.slug}`);
      } else {
        router.push(`/blog/edit/${data.post.slug}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageShell>
          <p className="text-muted-foreground">Loading...</p>
        </PageShell>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <PageShell className="space-y-6">
        <div className="flex flex-col gap-3">
          <Badge variant="outline" className="w-fit uppercase tracking-[0.3em] text-xs">
            Writing studio
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Compose a new article</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Draft, preview, and publish long-form essays with live view analytics and audience interactions.
          </p>
        </div>
        <Card className="border border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Story details</CardTitle>
            <CardDescription>Set the essentials of your post before publishing.</CardDescription>
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
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Designing delightful reading experiences"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="slug" className="text-sm font-medium text-muted-foreground">
                  Slug
                </label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="designing-reading-experiences"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only.
                </p>
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
                  placeholder="A short synopsis that appears in list views."
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
                  placeholder="https://images.unsplash.com/..."
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
                  rows={14}
                  className="font-mono"
                  placeholder="Write your story using Markdown or HTML snippets."
                  required
                />
                <p className="text-xs text-muted-foreground">HTML content is supported.</p>
              </div>
              <div className="grid gap-3">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex flex-wrap gap-3">
                  {['draft', 'published'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatus(option as 'draft' | 'published')}
                      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                        status === option
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {option === 'draft' ? 'Draft mode' : 'Publish immediately'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : status === 'draft' ? 'Save draft' : 'Publish now'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
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
