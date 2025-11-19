import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../contexts/AuthContext';

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
        <p>Loading...</p>
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
        <p style={{ color: 'red' }}>Error: {error || 'Post not found'}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Edit Post</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{ padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00' }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label htmlFor="slug" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Slug *
            </label>
            <input
              id="slug"
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              URL-friendly identifier (lowercase, numbers, and hyphens only)
            </small>
          </div>

          <div>
            <label htmlFor="excerpt" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Short description for preview
            </small>
          </div>

          <div>
            <label htmlFor="coverImageUrl" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Cover Image URL
            </label>
            <input
              id="coverImageUrl"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={15}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              HTML content is supported
            </small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Status
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus('draft')}
                />
                Draft
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus('published')}
                />
                Published
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  value="archived"
                  checked={status === 'archived'}
                  onChange={(e) => setStatus('archived')}
                />
                Archived
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: submitting ? '#ccc' : '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {submitting ? 'Updating...' : 'Update Post'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fff',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
