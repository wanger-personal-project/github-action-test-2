import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

interface Author {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
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
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
      fetchComments();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${slug}`);
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
      const response = await fetch(`/api/comments/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_slug: slug, content: commentText }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      setCommentText('');
      fetchComments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) throw new Error('Failed to delete post');

      router.push('/');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <p style={{ color: 'red' }}>Error: {error || 'Post not found'}</p>
      </Layout>
    );
  }

  const isAuthor = user?.id === post.author_id;

  return (
    <Layout>
      <article style={{ maxWidth: '800px', margin: '0 auto' }}>
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '2rem' }}
          />
        )}

        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{post.title}</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', color: '#666', borderBottom: '1px solid #eaeaea', paddingBottom: '1rem' }}>
          <div>
            By <strong>{post.author.display_name}</strong> • {formatDate(post.published_at)} • {post.view_count} views
          </div>
          {isAuthor && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href={`/blog/edit/${post.slug}`} style={{ color: '#0070f3' }}>
                Edit
              </Link>
              <button
                onClick={handleDelete}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e00',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div
          style={{ lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '3rem', whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

        <section>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comments ({comments.length})</h2>

          {user ? (
            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem' }}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                required
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  resize: 'vertical'
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: submitting ? '#ccc' : '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <p style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '2rem' }}>
              Please <Link href="/auth/login" style={{ color: '#0070f3' }}>login</Link> to comment.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #eaeaea',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                  <strong>{comment.author.display_name}</strong>
                  <span>{formatDate(comment.created_at)}</span>
                </div>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{comment.content}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </section>
      </article>
    </Layout>
  );
}
