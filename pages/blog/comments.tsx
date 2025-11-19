import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

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
        <p>Loading...</p>
      </Layout>
    );
  }

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString();
  };

  const renderStatusTag = (status: CommentItem['status']) => {
    const colors: Record<CommentItem['status'], string> = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      spam: '#6b7280',
    };
    return (
      <span
        style={{
          padding: '0.2rem 0.65rem',
          borderRadius: '999px',
          backgroundColor: `${colors[status]}1A`,
          color: colors[status],
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Comment Moderation</h1>
          <p style={{ color: '#666' }}>Review and approve comments from your readers.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        {STATUS_FILTERS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              border: option.value === statusFilter ? 'none' : '1px solid #e5e7eb',
              backgroundColor: option.value === statusFilter ? '#111827' : '#fff',
              color: option.value === statusFilter ? '#fff' : '#374151',
              cursor: 'pointer',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filter by post slug"
          value={postSlugFilter}
          onChange={(e) => {
            setPagination((prev) => ({ ...prev, page: 1 }));
            setPostSlugFilter(e.target.value);
          }}
          style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            minWidth: '240px',
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '6px', color: '#b91c1c', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
          <p>No comments match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{comment.author.display_name || comment.author.username}</strong>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{formatDate(comment.created_at)}</div>
                </div>
                {renderStatusTag(comment.status)}
              </div>
              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                On article:{' '}
                <Link href={`/blog/${comment.post.slug}`} style={{ color: '#0070f3' }}>
                  {comment.post.title}
                </Link>
                {` (${comment.post.slug})`}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleModerate(comment.id, 'approved')}
                  disabled={actionLoading === comment.id}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {actionLoading === comment.id ? 'Updating...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleModerate(comment.id, 'rejected')}
                  disabled={actionLoading === comment.id}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleModerate(comment.id, 'spam')}
                  disabled={actionLoading === comment.id}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#6b7280',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Mark as Spam
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: pagination.page === 1 ? '#f3f4f6' : '#fff',
              cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ padding: '0.5rem 1rem' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor:
                pagination.page === pagination.totalPages ? '#f3f4f6' : '#fff',
              cursor:
                pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
}
