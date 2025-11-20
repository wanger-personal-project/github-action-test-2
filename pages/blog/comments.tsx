import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageShell } from '@/components/ui/page-shell';
import { Textarea } from '@/components/ui/textarea';

interface CommentItem {
  id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  author: {
    id: string;
    display_name: string;
    username: string;
  };
  post: {
    id: string;
    slug: string;
    title: string;
  };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_FILTERS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Spam', value: 'spam' },
  { label: 'All', value: 'all' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];
const PAGE_SIZE = 10;

export default function CommentsModeration() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [postSlugFilter, setPostSlugFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/blog/comments')}`);
    }
  }, [authLoading, user, router]);

  const fetchComments = useCallback(
    async (page: number, status: StatusFilter, slug: string) => {
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
        if (slug.trim()) {
          params.append('postSlug', slug.trim());
        }
        const response = await fetch(`/api/comments/manage?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to load comments');
        }
        const data = await response.json();
        setComments(data.comments);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!user) return;
    fetchComments(pagination.page, statusFilter, postSlugFilter);
  }, [user, pagination.page, statusFilter, postSlugFilter, fetchComments]);

  const handleStatusChange = (value: StatusFilter) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setStatusFilter(value);
  };

  const handlePageChange = (nextPage: number) => {
    const safe = Math.min(Math.max(1, nextPage), pagination.totalPages || 1);
    setPagination((prev) => ({ ...prev, page: safe }));
  };

  const handleModerate = async (commentId: string, nextStatus: CommentItem['status']) => {
    try {
      setActionLoading(commentId);
      const response = await fetch('/api/comments/moderate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId, status: nextStatus }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update comment');
      }
      await fetchComments(pagination.page, statusFilter, postSlugFilter);
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
          <p className="text-muted-foreground">Loading…</p>
        </PageShell>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageShell className="space-y-8">
        <div className="rounded-3xl border border-border/40 bg-gradient-to-r from-white via-white to-muted/50 p-8 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Comments</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Keep the conversation high quality</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Approve insightful replies, reject noise, and flag spam across all of your stories.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <label className="text-xs font-medium text-muted-foreground">Filter by slug</label>
              <Textarea
                value={postSlugFilter}
                onChange={(e) => {
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setPostSlugFilter(e.target.value);
                }}
                rows={1}
                className="mt-2 h-10 resize-none"
                placeholder="mcp-verification-article"
              />
            </div>
          </div>
        </div>

        <Card className="border border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Reviews queue</CardTitle>
            <CardDescription>Select a status bucket to process feedback faster.</CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
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
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl border border-destructive/30 bg-red-50 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading comments…</div>
            ) : comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
                No comments match your filters.
              </div>
            ) : (
              <div className="grid gap-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="border border-border/60">
                    <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">{comment.author.display_name}</CardTitle>
                        <CardDescription>{new Date(comment.created_at).toLocaleString()}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          comment.status === 'approved'
                            ? 'success'
                            : comment.status === 'pending'
                            ? 'secondary'
                            : comment.status === 'rejected'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {comment.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="rounded-2xl bg-muted p-4 text-sm text-foreground">
                        {comment.content}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
                        <span>
                          On article:{' '}
                          <Link href={`/blog/${comment.post.slug}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                            {comment.post.title}
                          </Link>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleModerate(comment.id, 'approved')}
                            disabled={actionLoading === comment.id}
                          >
                            {actionLoading === comment.id ? 'Updating…' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleModerate(comment.id, 'rejected')}
                            disabled={actionLoading === comment.id}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerate(comment.id, 'spam')}
                            disabled={actionLoading === comment.id}
                          >
                            Mark spam
                          </Button>
                        </div>
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
