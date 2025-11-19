import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

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
        <p>Loading...</p>
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

  const renderStatusTag = (status: PostItem['status']) => {
    const colors: Record<PostItem['status'], string> = {
      draft: '#f59e0b',
      published: '#10b981',
      archived: '#6b7280',
    };
    return (
      <span
        style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          backgroundColor: `${colors[status]}1A`,
          color: colors[status],
          fontSize: '0.85rem',
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
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Posts</h1>
          <p style={{ color: '#666' }}>Manage drafts, published articles, and archives.</p>
        </div>
        <Link
          href="/blog/new"
          style={{
            alignSelf: 'flex-start',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
          }}
        >
          + New Post
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '6px', color: '#b91c1c', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
          <p style={{ marginBottom: '1rem' }}>No posts found for this filter.</p>
          <Link href="/blog/new" style={{ color: '#0070f3' }}>
            Create your first post
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{post.title}</h2>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{post.excerpt || 'No excerpt provided.'}</p>
                </div>
                {renderStatusTag(post.status)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#6b7280' }}>
                <span>Last updated: {formatDate(post.updated_at)}</span>
                <span>Views: {post.view_count}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  href={`/blog/edit/${post.slug}`}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    textDecoration: 'none',
                    color: '#111827',
                  }}
                >
                  Edit
                </Link>
                {post.status === 'published' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      textDecoration: 'none',
                      color: '#111827',
                    }}
                  >
                    View
                  </Link>
                )}
                {post.status !== 'published' && (
                  <button
                    onClick={() => mutatePostStatus(post.id, 'published')}
                    disabled={actionLoading === post.id}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {actionLoading === post.id ? 'Updating...' : 'Publish'}
                  </button>
                )}
                {post.status === 'published' && (
                  <button
                    onClick={() => mutatePostStatus(post.id, 'archived')}
                    disabled={actionLoading === post.id}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#f97316',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {actionLoading === post.id ? 'Updating...' : 'Archive'}
                  </button>
                )}
                {post.status === 'archived' && (
                  <button
                    onClick={() => mutatePostStatus(post.id, 'draft')}
                    disabled={actionLoading === post.id}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#6366f1',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {actionLoading === post.id ? 'Updating...' : 'Move to Draft'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={actionLoading === post.id}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #fee2e2',
                    backgroundColor: '#fff5f5',
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  {actionLoading === post.id ? 'Deleting...' : 'Delete'}
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
