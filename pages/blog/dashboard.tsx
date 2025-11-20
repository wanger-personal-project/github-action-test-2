import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageShell } from '@/components/ui/page-shell';
import { StatCard } from '@/components/ui/stat-card';

interface AuthorInfo {
  id: string;
  display_name: string;
  username: string;
}

interface PostItem {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  excerpt?: string;
  updated_at: string;
  published_at?: string;
  view_count: number;
  author: AuthorInfo;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];
const PAGE_SIZE = 10;

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/blog/dashboard')}`);
    }
  }, [authLoading, user, router]);

  const fetchPosts = useCallback(async (page: number, status: StatusFilter) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (status !== 'all') {
        params.append('status', status);
      }
      const response = await fetch(`/api/posts/author?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load posts');
      }
      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchPosts(pagination.page, statusFilter);
  }, [user, pagination.page, statusFilter, fetchPosts]);

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), pagination.totalPages || 1);
    setPagination((prev) => ({ ...prev, page: safePage }));
  };

  const handleStatusChange = (value: StatusFilter) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setStatusFilter(value);
  };

  const mutatePostStatus = async (postId: string, nextStatus: PostItem['status']) => {
    try {
      setActionLoading(postId);
      const response = await fetch('/api/posts/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, status: nextStatus }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update post');
      }
      await fetchPosts(pagination.page, statusFilter);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      setActionLoading(postId);
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete post');
      }
      await fetchPosts(pagination.page, statusFilter);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user) {
    return (
      <Layout>
        <PageShell>
          <p className="text-muted-foreground">Loading...</p>
        </PageShell>
      </Layout>
    );
  }

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const publishedCount = posts.filter((post) => post.status === 'published').length;
  const draftCount = posts.filter((post) => post.status === 'draft').length;
  const totalViews = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);

  return (
    <Layout>
      <PageShell className="space-y-8">
        <div className="rounded-3xl border border-border/40 bg-gradient-to-r from-white via-white to-muted/60 p-8 shadow-2xl shadow-muted/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Creator dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back, {user.author?.display_name || user.email}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Monitor your drafts, adjust live stories, and publish new work whenever inspiration hits.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/blog/new">Write a new story</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Published" value={publishedCount} description="Live posts" />
          <StatCard label="Drafts" value={draftCount} description="Ideas in progress" />
          <StatCard label="Total views" value={totalViews} description="Across all posts" />
        </div>

        <Card className="border border-border/70 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Your stories</CardTitle>
                <CardDescription>Filter and act on every article.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={option.value === statusFilter ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleStatusChange(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl border border-destructive/40 bg-red-50 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading posts…</div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
                No posts match this filter. Start a new story above.
              </div>
            ) : (
              <div className="grid gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="border border-border/60">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>{post.title}</CardTitle>
                        <CardDescription>{post.excerpt || 'No excerpt provided.'}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          post.status === 'published'
                            ? 'success'
                            : post.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {post.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                        <span>Last updated: {formatDate(post.updated_at)}</span>
                        <span>Views: {post.view_count}</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                          <Link href={`/blog/edit/${post.slug}`}>Edit</Link>
                        </Button>
                        {post.status === 'published' && (
                          <Button variant="secondary" asChild>
                            <Link href={`/blog/${post.slug}`}>View</Link>
                          </Button>
                        )}
                        {post.status !== 'published' && (
                          <Button
                            onClick={() => mutatePostStatus(post.id, 'published')}
                            disabled={actionLoading === post.id}
                          >
                            {actionLoading === post.id ? 'Updating…' : 'Publish'}
                          </Button>
                        )}
                        {post.status === 'published' && (
                          <Button
                            variant="secondary"
                            onClick={() => mutatePostStatus(post.id, 'archived')}
                            disabled={actionLoading === post.id}
                          >
                            {actionLoading === post.id ? 'Updating…' : 'Archive'}
                          </Button>
                        )}
                        {post.status === 'archived' && (
                          <Button
                            variant="secondary"
                            onClick={() => mutatePostStatus(post.id, 'draft')}
                            disabled={actionLoading === post.id}
                          >
                            {actionLoading === post.id ? 'Updating…' : 'Move to Draft'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(post.id)}
                          disabled={actionLoading === post.id}
                        >
                          {actionLoading === post.id ? 'Deleting…' : 'Delete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                <Button
                  variant="secondary"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PageShell>
    </Layout>
  );
}
